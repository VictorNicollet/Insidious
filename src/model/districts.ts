import type { Location } from "./locations"
import { build, enm, int7, obj, Pack } from "./serialize"
import { DistrictName, pack_districtName } from "./names"
import { RecruitEffect } from "./cult/recruit"

export type ByDistrictKind<T> = {
    residential: T,
    commercial: T,
    barracks: T,
    ironworks: T,
    lumber: T,
    castle: T,
    academy: T,
    docks: T,
    temple: T,
    ruins: T,
    mine: T
}

export function pack_byDistrictKind<T>(pack: Pack<T>): Pack<ByDistrictKind<T>> {
    return obj<ByDistrictKind<T>>({
        residential: pack,
        commercial: pack,
        barracks: pack,
        ironworks: pack,
        lumber: pack,
        castle: pack,
        academy: pack,
        docks: pack,
        temple: pack,
        ruins: pack,
        mine: pack
    })
}

export type DistrictKind = keyof(ByDistrictKind<boolean>)

export const districtKinds : readonly DistrictKind[] = [
    "residential",
    "commercial",
    "barracks",
    "ironworks",
    "lumber",
    "castle",
    "academy",
    "docks",
    "temple",
    "ruins",
    "mine"
]

export const pack_districtKind = enm<DistrictKind>(districtKinds);

export class District {

    public readonly location : Location

    // Recruitment stats, computed lazily when first accessed.
    private _recruit : RecruitEffect|undefined
    
    public constructor(
        // Unique identifier of this district
        public readonly id: number,
        // Kind of district
        public readonly kind : DistrictKind,
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
        kind: DistrictKind,
        population: number,
        name: DistrictName) 
    {
        return new District(
            id,
            kind,
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
    .pass("kind", pack_districtKind)
    .pass("name", pack_districtName)
    .pass("population", int7)
    .pass("cultpop", int7)
    .call((id, kind, name, population, cultpop) =>
        new District(id, kind, name, population, cultpop));