import { Agent } from "./agents";
import * as CR from "./cult/recruit";
import * as CP from "./cult/pretense";
import { build, float, Pack, string } from "./serialize"
import * as P from "./population"
import type { World } from "./world"

export class Cult {
    
    public readonly world: World

    constructor(
        public name : string,
        public pretense : CP.Pretense,
        public recruitment : CR.Recruitment,
        public exposure : number
    ) {
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
        this.world.refresh();
    }

    public setPretense(p: CP.Pretense) {
        this.pretense = p;
        this.world.refresh();
    }

    // Perform daily updates
    public daily() {

        // Helper to contain the proportion of the population in a given 
        // caste for a single location
        const noncultcasteratio = new Float32Array(P.nbCastes);

        // Helper to contain the caste-specific recruitment power for 
        // a single location.
        const casterecruitpower = new Float32Array(P.nbCastes);

        // Index agents with the "priest" order by their location,
        // for easy access. 
        // TODO: this does not change from step to step, so it could
        // be cached in the location.
        const priestsByLocation : (Agent[]|undefined)[] = [];
        for (const agent of this.world.agents())
        {
            if (agent.order.kind !== "priest-work") continue;
            if (!agent.location) continue;
            
            const array = priestsByLocation[agent.location.id];
            if (array)
                array.push(agent);
            else
                priestsByLocation[agent.location.id] = [agent];
        }

        const population = this.world.population.count;
        const cultratio  = this.world.population.cult;

        let hasRecruited = false;

        // Each location is treated separately.
        for (const location of this.world.locations()) {

            const totalpop     = location.population;
            const totalcult    = location.cultpop;
            const totalnoncult = totalpop - totalcult;
            const priests      = priestsByLocation[location.id];

            const off = location.id * P.stride;

            // Do we need to process this location at all ? 
            // ============================================

            let hasCult = !!priests;
            if (!hasCult && this.recruitment.priestRequired) continue;

            for (let i = 0; i < P.stride && !hasCult; ++i)
                hasCult = cultratio[off + i] != 0;

            if (!hasCult) continue;

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

            // Compute recruiting power for the location
            // =========================================

            // The recruit power is computed caste-by-caste, but there
            // is a generic component that contributes to all castes which
            // is computed separately and added to the caste-specific value
            // at the end.

            let genericRecruitingPower = 0;
            casterecruitpower.fill(0);
            
            if (priests) {
                for (const priest of priests) {
                    const priestRecruitPower = 
                        // Base recruitment power for priests
                        CR.basePriestMult *
                        // Priests use their contact skill for recruiting
                        (1 + priest.stats.contacts.value/100) *
                        // Apply all the recruitment effects from policies
                        (1 + this.recruitment.priestEffect);
                    
                    genericRecruitingPower += priestRecruitPower;
                    
                    const caste = P.casteOfOccupation[priest.occupation];
                    casterecruitpower[caste] += priestRecruitPower;
                }
            }

            for (let c = 0; c < P.nbCastes; ++c) {
                for (let w = 0; w < P.nbWealths; ++w) {
                    const seg  = off + c * P.nbWealths + w;
                    const cult = cultratio[seg] * population[seg];
                    const memberRecruitPower = 
                        // Base recruitment power for members
                        CR.baseMemberMult *
                        // Each member contributes separately
                        cult *
                        // Apply all the recruitment effects from policies
                        (1 + this.recruitment.memberEffect);

                    genericRecruitingPower += memberRecruitPower;
                    casterecruitpower[c] += memberRecruitPower;
                }
            }

            genericRecruitingPower += 
                this.exposure * 
                (1 + this.recruitment.exposureEffect);

            let totalRecruitingPower = 0;
            for (let caste = 0; caste < P.nbCastes; ++caste) {
                totalRecruitingPower += 
                    (casterecruitpower[caste] = 
                        (casterecruitpower[caste] + genericRecruitingPower)
                            * noncultcasteratio[caste]);
            }

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
