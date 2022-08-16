import { Agent } from "./agents";
import * as CR from "./cult/recruit";
import * as CP from "./cult/pretense";
import { build, float, Pack, string } from "./serialize"
import * as P from "./population"
import type { World } from "./world"
import type { Location } from "./locations"
import { Explained, explain } from "./explainable";

export class Cult {
    
    public readonly world: World

    public priestRecruitEffect : Explained
    public memberRecruitEffect : Explained
    public exposureRecruitEffect : Explained
    
    // Helper to contain the caste-specific recruitment power for 
    // a single location.
    private noncultcasteratio : Float32Array

    constructor(
        public name : string,
        public pretense : CP.Pretense,
        public recruitment : CR.Recruitment,
        public exposure : number
    ) {
        this.noncultcasteratio = new Float32Array(P.nbCastes);
        this.priestRecruitEffect = 
            this.memberRecruitEffect = 
            this.exposureRecruitEffect = explain([])

        this.refreshEffects();

        // We cheat by injecting the world reference later, when
        // this instance is added to the world
        // (because Cult and World are mutually recursive)
        this.world = undefined as any
    }

    static create(name: string) {
        return new Cult(name, CP.pretenses[0], CR.modes[0], 0)
    }

    public setRecruitment(r: CR.Recruitment) {
        this.recruitment = r;
        this.refreshEffects();
        this.world.refresh();
    }

    public setPretense(p: CP.Pretense) {
        this.pretense = p;
        this.refreshEffects();
        this.world.refresh();
    }

    private refreshEffects() {
        let priestEffect = [];
        let memberEffect = [];
        let exposureEffect = [];

        const r = this.recruitment;
        if (r.priestEffect) 
            priestEffect.push({why: r.name, contrib: r.priestEffect});
        if (r.memberEffect)
            memberEffect.push({why: r.name, contrib: r.memberEffect});
        if (r.exposureEffect)
            exposureEffect.push({why: r.name, contrib: r.exposureEffect});

        this.priestRecruitEffect = explain(priestEffect);
        this.memberRecruitEffect = explain(memberEffect);
        this.exposureRecruitEffect = explain(exposureEffect);
    }

    public recruitEffect(location: Location) : CR.RecruitEffect {
        const noncultcasteratio = this.noncultcasteratio;

        const population = this.world.population.count;
        const cultratio  = this.world.population.cult;

        const totalpop     = location.population;
        const totalcult    = location.cultpop;
        const totalnoncult = totalpop - totalcult;
        const priests      = this.world.agents().filter(agent => 
            agent.order.kind === "priest-work" && 
            agent.location && 
            agent.location.id === location.id);

        const off = location.id * P.stride;

        // Compute caste distribution of non-cult population
        // =================================================

        for (let c = 0; c < P.nbCastes; ++c) {
            let noncult = 0;
            for (let w = 0; w < P.nbWealths; ++w) {
                const seg = off + c * P.nbWealths + w;
                noncult += (1 - cultratio[seg]) * population[seg];
            }
            noncultcasteratio[c] = noncult / totalnoncult;
        }

        // Compute recruitment power from priests
        // ======================================

        // The recruit power is computed caste-by-caste, but there
        // is a generic component that contributes to all castes which
        // is computed separately and added to the caste-specific value
        // at the end.
        const castePower = new Float32Array(P.nbCastes);
        let genericRecruitingPower = 0;

        const needPriest = this.recruitment.priestRequired && !priests.length;
        let priestBasePower = 0;

        for (const priest of priests) {

            const caste = P.casteOfOccupation[priest.occupation];

            // The total contribution of this priest is decomposed
            // into two components: 
            // 1. generic (segment-independent) recruitment power
            const myGenericPower = 
                // Base recruitment power for priests
                CR.basePriestMult *
                // Priests use their contact skill for recruiting
                (1 + priest.stats.contacts.value/100);
            // 2. this power is doubled for the specific caste
            const myCastePower = myGenericPower * noncultcasteratio[caste];

            priestBasePower += myGenericPower + myCastePower;

            // Unlike the base power, when computing the per-caste final 
            // power, we pre-multiply by the bonuses.
            const bonuses = 1 + this.priestRecruitEffect.value;
            genericRecruitingPower += myGenericPower * bonuses;
            castePower[caste/P.nbWealths] += myCastePower * bonuses;
        }

        // Compute recruitment power from members
        // ======================================

        let memberBasePower = 0;

        for (let caste = 0; caste < P.nbCastes; ++caste) {
            for (let w = 0; w < P.nbWealths; ++w) {
                const seg  = off + caste * P.nbWealths + w;
                const cult = cultratio[seg] * population[seg];

                // The total contribution of this population segment is 
                // decomposed into two components: 
                // 1. generic (segment-independent) recruitment power
                const ourGenericPower = 
                    // Base recruitment power for members
                    CR.baseMemberMult *
                    // Each member contributes separately
                    cult;
                // 2. this power is doubled for the specific caste
                const ourCastePower = ourGenericPower * noncultcasteratio[caste];
                
                memberBasePower += ourGenericPower + ourCastePower;
                    
                // Unlike the base power, when computing the per-caste final 
                // power, we pre-multiply by the bonuses.
                const bonuses = (1 + this.memberRecruitEffect.value);
                genericRecruitingPower += ourGenericPower * bonuses;
                castePower[caste] += ourGenericPower * bonuses;
            }
        }

        // Compute recruitment power from exposure
        // =======================================

        const exposureBasePower = this.exposure * CR.baseExposureMult;

        genericRecruitingPower += 
            exposureBasePower * (1 + this.exposureRecruitEffect.value);

        // Combine all recruitment powers into array
        // =========================================

        let totalPower = 0;
        for (let caste = 0; caste < P.nbCastes; ++caste) {
            totalPower += 
                (castePower[caste] += genericRecruitingPower * noncultcasteratio[caste]);
        }

        return {
            totalPower,
            castePower,
            priestPower: explain(this.priestRecruitEffect.reasons, priestBasePower),
            memberPower: explain(this.memberRecruitEffect.reasons, memberBasePower),
            exposurePower: explain(this.exposureRecruitEffect.reasons, exposureBasePower),
            needPriest,
            difficulty: explain([], CR.baseRecruit)
        }
    }

    // Perform daily updates
    public daily() {

        let hasRecruited = false;

        const population        = this.world.population.count;
        const cultratio         = this.world.population.cult;
        const noncultcasteratio = this.noncultcasteratio;

        // Each location is treated separately.
        for (const location of this.world.locations()) {

            const effects      = location.recruit;
            
            if (!effects) continue;
            if (effects.needPriest) continue;
            if (effects.totalPower == 0) continue;

            const totalpop     = location.population;
            const totalcult    = location.cultpop;
            const totalnoncult = totalpop - totalcult;

            const off = location.id * P.stride;

            for (let c = 0; c < P.nbCastes; ++c) {
                let noncult = 0;
                for (let w = 0; w < P.nbWealths; ++w) {
                    const seg = off + c * P.nbWealths + w;
                    noncult += (1 - cultratio[seg]) * population[seg];
                }
                noncultcasteratio[c] = noncult / totalnoncult;
            }

            const totalRecruitingPower = effects.totalPower;
            const casterecruitpower = effects.castePower;

            // At this point, 'totalRecruitingPower' is the sum of all 
            // individual recruiting powers for all castes (with each caste's
            // power being weighted by the ratio of its non-cult population out
            // of the total non-cult population of the location).

            console.log("Recruiting power in %o: %f (%d cult, %d non-cult)", 
                location.name.short, totalRecruitingPower, totalcult, totalnoncult);

            // Roll the dice to pick the number of members to recruit.
            // =======================================================

            const sureRecruited = Math.floor(totalRecruitingPower / CR.baseRecruit);
            const randomRecruited = 
                ((totalRecruitingPower - CR.baseRecruit * sureRecruited)
                    > Math.random() * CR.baseRecruit)
                ? 1 : 0;
            const totalRecruited = sureRecruited + randomRecruited;

            for (let i = 0; i < totalRecruited; ++i) {

                // Pick the caste weighted by recruiting power
                let roll = Math.random() * totalRecruitingPower;
                let caste = 0;
                while (roll >= 0 && caste < casterecruitpower.length) 
                    roll -= casterecruitpower[caste++];
                if (caste-- >= P.nbCastes)
                    continue;
                
                // Pick the wealth with the highest non-cult pop
                let totalNonCultPop = 0;
                for (let w = 0; w < P.nbWealths; ++w) {
                    const seg = off + caste * P.nbWealths + w;
                    totalNonCultPop += population[seg] * (1 - cultratio[seg]);
                }

                if (totalNonCultPop < 1)
                    continue;

                roll = Math.random() * totalNonCultPop;
                for (let w = 0; w < P.nbWealths; ++w) {
                    const seg = off + caste * P.nbWealths + w;
                    roll -= population[seg] * (1 - cultratio[seg]);
                    if (roll < 0) {
                        console.log("Joins cult: %s", this.world.population.segname(seg));
                        cultratio[seg] = Math.min(1, cultratio[seg] + 1 / population[seg]);
                        break;
                    }
                }

                hasRecruited = true;
            }
        }

        if (hasRecruited)
            this.world.population.refreshAll();
    }
}

export const pack_cult : Pack<Cult> = build<Cult>()
    .pass("name", string)
    .pass("pretense", CP.pack_pretense)
    .pass("recruitment", CR.pack_recruitment)
    .pass("exposure", float)
    .call((name, pretense, recruitment, exposure) => 
        new Cult(name, pretense, recruitment, exposure));
