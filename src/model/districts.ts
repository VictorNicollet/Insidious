import type { Location } from "./locations"
import { build, int7, Pack } from "./serialize"
import { DistrictName, pack_districtName } from "./names"
import { RecruitEffect } from "./cult/recruit"

export class District {

    public readonly location : Location

    // Recruitment stats, computed lazily when first accessed.
    private _recruit : RecruitEffect|undefined
    
    public constructor(
        // Unique identifier of this district
        public readonly id: number,
        // Name of this district
        public readonly name : DistrictName,
        // Population of this district, integer, cached from the population system
        public population : number,
        // Cult member population, integer, cached from the population system
        public cultpop : number,
    ) {
        // We cheat by adding the location reference later, when the 
        // district is added to the location.
        this.location = undefined as any
    }

    static create(
        id: number,
        population: number,
        name: DistrictName) 
    {
        return new District(
            id,
            name, 
            population,
            0);    
    }

    // Recruitment stats for this district
    get recruit() : RecruitEffect|undefined {
        if (this._recruit) return this._recruit;
        const cult = this.location.world.cult;
        if (!cult) return undefined;
        return this._recruit = cult.recruitEffect(this);
    }
    
    // Reset all caches (because of a dependency change)
    public refresh() {
        this._recruit = undefined;
    }
}

export const pack_district : Pack<District> = build<District>()
    .pass("id", int7)
    .pass("name", pack_districtName)
    .pass("population", int7)
    .pass("cultpop", int7)
    .call((id, name, population, cultpop) =>
        new District(id, name, population, cultpop));