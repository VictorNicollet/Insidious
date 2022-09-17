import type { World } from "./world"
import { District, pack_district } from "./districts"
import { LocationName, pack_locationName } from "./names"
import type { Cell } from "./grid"
import * as M from './map'
import { randomDistrict, randomLocation } from './generation/namegen'
import { Pack, build, int7, array } from './serialize'
import type { RecruitEffect } from "./cult/recruit"

export type ByLocationKind<T> = {
    ruins: T
    town: T
    workcamp: T
    city: T
    fortress: T
    academy: T
}

export type LocationKind = keyof(ByLocationKind<boolean>)

function locationKindOfCellKind(ck: M.CellKind): LocationKind {
    return ck.is(M.castleA, M.castleB, M.castleC, M.castleE) ? "city" : 
           ck.is(M.mountainMine, M.hillsMine, M.foresterA, M.foresterB, M.smithy) ? "workcamp" : 
           ck.is(M.castleD, M.fortA, M.fortB) ? "fortress" :
           ck.is(M.academy) ? "academy" : 
           ck.is(M.village, M.villageUnder, M.villageSmall, M.inn) ? "town" : "ruins";
}

export class Location {

    public readonly kind : LocationKind
    public readonly world : World

    // Recruitment stats, computed lazily when first accessed.
    private _recruit : RecruitEffect|undefined
    
    constructor(
        public readonly cellkind: M.CellKind,
        // Position of this location in the "all locations" array
        // inside the World.
        public readonly id : number,
        public readonly cell: Cell,    
        public readonly name : LocationName,
        public readonly districts : readonly District[],
        // Population count, integer, cached from the population system
        public population : number,
        // Cult member population, integer, cached from the population system
        public cultpop : number,
        // Integer, the sum of 'gather information' scores of this location. 
        public information : number
    ) {
        this.kind = locationKindOfCellKind(this.cellkind);
        
        // We cheat by injecting the world reference later, when
        // this instances is added to the world
        // (because Locations and World are mutually recursive)
        this.world = undefined as any

        // Inject references to self into the districts
        for (const district of this.districts)
            (district as { location: Location }).location = this;
    }

    static create(
        cellkind: M.CellKind,
        id: number,
        nextDistrictId: number,
        cell: Cell,
        population: number) : Location
    {
        const locationKind = locationKindOfCellKind(cellkind);

        // Population is distributed by taking a random 
        // fraction of the not-already assigned population and
        // building a district out of it, until the remaining population
        // is smaller than the district threshold.
        let remainingPopulation = population;
        let realPopulation = 0
        const popThreshold = 500;
        const minDistrictSize = 25;
        const districts : District[] = []
        while (districts.length < 3 || 
               remainingPopulation > popThreshold && districts.length < 10)
        {
            // Fraction in 20%..80%
            const fraction = 0.2 + Math.random() * 0.6;
            // Don't allow districts smaller than 25
            const inNewDistrict = Math.max(minDistrictSize, Math.floor(remainingPopulation * fraction));
            remainingPopulation = Math.max(minDistrictSize, remainingPopulation - inNewDistrict);

            districts.push(District.create(
                nextDistrictId + districts.length,
                inNewDistrict,
                randomDistrict(locationKind)));

            realPopulation += inNewDistrict;
        }

        districts.push(District.create(
            nextDistrictId + districts.length,
            remainingPopulation,
            randomDistrict(locationKind)));

        realPopulation += remainingPopulation;

        return new Location(
            cellkind,
            id, 
            cell, 
            randomLocation(locationKind),
            districts,
            population,
            0,
            0)
    }

    // Recruitment stats for this location
    get recruit() : RecruitEffect|undefined {
        if (this._recruit) return this._recruit;
        const cult = this.world.cult;
        if (!cult) return undefined;
        return this._recruit = cult.recruitEffect(this);
    }

    // Reset all caches (because of a dependency change)
    public refresh() {
        this._recruit = undefined;
    }
}

export const pack_location : Pack<Location> = build<Location>()
    .pass("cellkind", M.pack_cellKind)
    .pass("id", int7)
    .pass("cell", int7)
    .pass("name", pack_locationName)
    .pass("districts", array(pack_district))
    .pass("population", int7)
    .pass("cultpop", int7)
    .pass("information", int7)
    .call((cellkind, id, cell, name, districts, population, cultpop, information) => 
        new Location(cellkind, id, cell, name, districts, population, cultpop, information));

export function pack_locationRef(locations: readonly Location[]) : Pack<Location> {
    return build<Location>()
        .pass("id", int7)
        .call(id => locations[id]);
}