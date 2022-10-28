import type { World } from "./world"
import { District, pack_district } from "./districts"
import { LocationName, pack_locationName } from "./names"
import type { Cell } from "./grid"
import * as M from './map'
import { randomDistrict, randomLocation } from './generation/namegen'
import { Pack, build, int7, array } from './serialize'
import { makeDistricts } from "./generation/districtgen"

export type ByLocationKind<T> = {
    ruins: T
    town: T
    mine: T
    iron: T,
    lumber: T,
    city: T
    fortress: T
    academy: T
}

export type LocationKind = keyof(ByLocationKind<boolean>)

function locationKindOfCellKind(ck: M.CellKind): LocationKind {
    return ck.is(M.castleA, M.castleB, M.castleC, M.castleE) ? "city" : 
           ck.is(M.mountainMine, M.hillsMine) ? "mine" :
           ck.is(M.foresterA, M.foresterB) ? "lumber" : 
           ck.is(M.smithy) ? "iron" : 
           ck.is(M.castleD, M.fortA, M.fortB) ? "fortress" :
           ck.is(M.academy) ? "academy" : 
           ck.is(M.village, M.villageUnder, M.villageSmall, M.inn) ? "town" : "ruins";
}

export class Location {

    public readonly kind : LocationKind
    public readonly world : World

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
        const locationName = randomLocation(locationKind);
        const districts = makeDistricts(
            nextDistrictId, 
            population, 
            locationName,
            locationKind);

        return new Location(
            cellkind,
            id, 
            cell, 
            locationName,
            districts,
            population,
            0,
            0)
    }

    // Reset all caches (because of a dependency change)
    public refresh() {
        for (const d of this.districts) d.refresh();
    }

    // Return the district with the most agents (the first one, if
    // tie-breaker).
    public districtWithMostAgents() : District {
        // TODO: use an index, somehow
        // We optimize to avoid allocation if there are zero agents in 
        // the location, or if all agents are in the same district
        let first = -1
        let firstCount = 0
        let others : Uint32Array | undefined 
        for (const agent of this.world.agents()) {
            
            const district = agent.district;
            if (!district) continue;
            if (district.location.id != this.id) continue;
            
            const id = district.id - this.districts[0].id;
            if (first < 0) first = id;

            if (first == id) {
                ++firstCount;
            } else {
                if (typeof others === "undefined") 
                    others = new Uint32Array(this.districts.length);
                others[id]++;
            }
        }

        if (typeof others === "undefined") 
            return this.districts[first < 0 ? 0 : first];

        others[first] = firstCount;
        let best = 0;
        for (let i = 1; i < others.length; ++i)
            if (others[i] > others[best]) 
                best = i;

        return this.districts[best];
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