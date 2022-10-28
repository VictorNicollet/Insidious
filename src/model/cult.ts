import * as CR from "./cult/recruit";
import * as CP from "./cult/pretense";
import { build, float, Pack, string } from "./serialize"
import * as P from "./population"
import type { World } from "./world"
import { Explained, explain } from "./explainable";
import { District } from "./districts";

export class Cult {

    public readonly world: World

    public priestRecruitEffect: Explained
    public memberRecruitEffect: Explained
    public exposureRecruitEffect: Explained

    // Helpers reused between calls to recruitEffect()
    private nonCultCasteRatio: Float32Array
    private priestRecruitPower: Float32Array
    private memberRecruitPower: Float32Array

    constructor(
        public name: string,
        public pretense: CP.Pretense,
        public recruitment: CR.Recruitment,
        public exposure: number
    ) {
        this.nonCultCasteRatio = new Float32Array(P.nbCastes);
        this.priestRecruitPower = new Float32Array(P.nbCastes);
        this.memberRecruitPower = new Float32Array(P.nbCastes);
        this.priestRecruitEffect =
            this.memberRecruitEffect =
            this.exposureRecruitEffect = explain([])

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

    // Refresh all effects of the cult policies, then refresh anything that might 
    // depend on them. 
    public refreshEffects() {

        // Effect refresh 
        // ==============

        let priestEffect = [];
        let memberEffect = [];
        let exposureEffect = [];

        const r = this.recruitment;
        if (r.priestEffect)
            priestEffect.push({ why: r.name, contrib: r.priestEffect });
        if (r.memberEffect)
            memberEffect.push({ why: r.name, contrib: r.memberEffect });
        if (r.exposureEffect)
            exposureEffect.push({ why: r.name, contrib: r.exposureEffect });

        this.priestRecruitEffect = explain(priestEffect);
        this.memberRecruitEffect = explain(memberEffect);
        this.exposureRecruitEffect = explain(exposureEffect);

        // Dependency refresh
        // ==================

        for (const location of this.world.locations())
            location.refresh();
    }

    public recruitEffect(district: District): CR.RecruitEffect {

        const nonCultCasteRatio = this.nonCultCasteRatio;
        const priestRecruitPower = this.priestRecruitPower;
        const memberRecruitPower = this.memberRecruitPower;

        const population = this.world.population.count;
        const cultpop = this.world.population.cult;

        const totalpop = district.population;
        const totalcult = district.cultpop;
        const totalnoncult = totalpop - totalcult;
        const priests = this.world.agents().filter(agent =>
            agent.order.kind === "priest-work" &&
            agent.district &&
            agent.district.id === district.id);

        const off = district.id * P.stride;

        // Compute caste distribution of non-cult population
        // =================================================

        for (let c = 0; c < P.nbCastes; ++c) {
            let noncult = population[off + c] - cultpop[off + c];
            nonCultCasteRatio[c] = noncult / totalnoncult;
        }

        // Compute recruitment power from priests
        // ======================================

        const needPriest = this.recruitment.priestRequired && !priests.length;

        CR.priestsRecruit(priests, nonCultCasteRatio, priestRecruitPower);

        const priestRecruitBonus = 1 + this.priestRecruitEffect.value;

        // Sum the base (non-bonus) power, and apply the multiplier to the actual power.
        let priestBasePower = 0;
        for (let caste = 0; caste < priestRecruitPower.length; ++caste) {
            const power = priestRecruitPower[caste];
            priestBasePower += power;
            priestRecruitPower[caste] = power * priestRecruitBonus;
        }

        // Compute recruitment power from members
        // ======================================

        const locoff = district.location.districts[0].id * P.stride;
        const loccount = district.location.districts.length * P.stride;

        CR.membersRecruit(
            cultpop.subarray(locoff, locoff + loccount),
            nonCultCasteRatio,
            memberRecruitPower);

        const memberRecruitBonus = 1 + this.memberRecruitEffect.value;

        // Sum the base (non-bonus) power, and apply the multiplier to the actual power.
        let memberBasePower = 0;
        for (let caste = 0; caste < memberRecruitPower.length; ++caste) {
            const power = memberRecruitPower[caste];
            memberBasePower += power;
            memberRecruitPower[caste] = power * memberRecruitBonus;
        }

        // Compute recruitment power from exposure
        // =======================================

        const exposureBasePower = this.exposure * CR.baseExposureMult;

        const genericRecruitPower =
            exposureBasePower * (1 + this.exposureRecruitEffect.value);

        // Combine all recruitment powers into array
        // =========================================

        const castePower = new Float32Array(P.nbCastes);

        let totalPower = 0;
        for (let caste = 0; caste < P.nbCastes; ++caste) {
            totalPower += (castePower[caste] =
                genericRecruitPower * nonCultCasteRatio[caste] +
                memberRecruitPower[caste] +
                priestRecruitPower[caste]);
        }

        const nonCultRatio = (district.population + 1 - district.cultpop) / (district.population + 1);
        const baseDifficulty = CR.baseRecruit / (nonCultRatio * nonCultRatio);

        return {
            totalPower,
            castePower,
            priestPower: explain(this.priestRecruitEffect.reasons, priestBasePower),
            memberPower: explain(this.memberRecruitEffect.reasons, memberBasePower),
            exposurePower: explain(this.exposureRecruitEffect.reasons, exposureBasePower),
            needPriest,
            difficulty: explain([], baseDifficulty)
        }
    }

    // Perform daily updates
    public daily() {

        let hasRecruited = false;

        const population = this.world.population.count;
        const cultratio = this.world.population.cult;
        const noncultcasteratio = this.nonCultCasteRatio;

        // Each district is treated separately.
        for (const location of this.world.locations()) {

            // Run a first pass to compute all the effects in the
            // location (since the district's recruitment effects depend
            // on other districts, we want these to be computed before
            // we start applying recruitment changes)
            for (const district of location.districts)
                district.recruit;

            let locationHasRecruited = false;

            for (const district of location.districts) {

                const effects = district.recruit;

                if (!effects) continue;
                if (effects.needPriest) continue;
                if (effects.totalPower == 0) continue;

                const totalpop = district.population;
                const totalcult = district.cultpop;
                const totalnoncult = totalpop - totalcult;

                const off = district.id * P.stride;
                const dcult = cultratio.subarray(off, off + P.stride);
                const dpopulation = population.subarray(off, off + P.stride);

                for (let c = 0; c < P.nbCastes; ++c) {
                    let noncult = dpopulation[c] - dcult[c];
                    noncultcasteratio[c] = noncult / totalnoncult;
                }

                const totalRecruitingPower = effects.totalPower;
                const casterecruitpower = effects.castePower;
                const difficulty = effects.difficulty.value;

                // At this point, 'totalRecruitingPower' is the sum of all 
                // individual recruiting powers for all castes (with each caste's
                // power being weighted by the ratio of its non-cult population out
                // of the total non-cult population of the location).

                console.log("Recruiting power in %o (%o): %f (%d cult, %d non-cult)",
                    location.name.short, district.name.short, totalRecruitingPower, totalcult, totalnoncult);

                // Roll the dice to pick the number of members to recruit.
                // =======================================================

                const sureRecruited = Math.floor(totalRecruitingPower / difficulty);
                const randomRecruited =
                    ((totalRecruitingPower - difficulty * sureRecruited)
                        > Math.random() * difficulty)
                        ? 1 : 0;
                const totalRecruited = sureRecruited + randomRecruited;

                for (let i = 0; i < totalRecruited; ++i) {

                    // Pick the caste weighted by recruiting power. This: 
                    //  1. picks a roll between 0 and the sum of casterecruitpower[]
                    //  2. finds the smallest 'caste' such that sum(casterecruitpower[..caste]) is
                    //     greater than the roll
                    //  3. subtracts 1 to get the caste that went from below to above the roll
                    let roll = Math.random() * totalRecruitingPower;
                    let caste = 0;
                    while (roll >= 0 && caste < casterecruitpower.length)
                        roll -= casterecruitpower[caste++];
                    caste--;

                    if (dpopulation[caste] <= dcult[caste])
                        continue;

                    console.log("Joins cult: %s (%o)", this.world.population.segname(off + caste), casterecruitpower);

                    dcult[caste]++;

                    locationHasRecruited = true;
                }
            }

            if (locationHasRecruited) {
                hasRecruited = true;

                // Recruitment has likely changed further recruitment stats
                // for all districts in the location. 
                location.refresh();
            }
        }

        if (hasRecruited)
            this.world.population.refreshAll();
    }
}

export const pack_cult: Pack<Cult> = build<Cult>()
    .pass("name", string)
    .pass("pretense", CP.pack_pretense)
    .pass("recruitment", CR.pack_recruitment)
    .pass("exposure", float)
    .call((name, pretense, recruitment, exposure) =>
        new Cult(name, pretense, recruitment, exposure));
