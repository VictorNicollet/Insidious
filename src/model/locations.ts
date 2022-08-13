import type { World } from "./world"
import { LocationName, pack_locationName } from "./names"
import type { Cell } from "./grid"
import * as M from './map'
import { randomLocation } from './generation/namegen'
import { Pack, build, int7, enm } from './serialize'

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
    
    constructor(
        public readonly cellkind: M.CellKind,
        // Position of this location in the "all locations" array
        // inside the World.
        public readonly id : number,
        public readonly cell: Cell,    
        public readonly name : LocationName,
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
    }

    static create(
        cellkind: M.CellKind,
        id: number,
        cell: Cell,
        population: number) : Location
    {
        return new Location(
            cellkind,
            id, 
            cell, 
            randomLocation(locationKindOfCellKind(cellkind)),
            population,
            0,
            0)
    }
}

export const pack_location : Pack<Location> = build<Location>()
    .pass("cellkind", M.pack_cellKind)
    .pass("id", int7)
    .pass("cell", int7)
    .pass("name", pack_locationName)
    .pass("population", int7)
    .pass("cultpop", int7)
    .pass("information", int7)
    .call((cellkind, id, cell, name, population, cultpop, information) => 
        new Location(cellkind, id, cell, name, population, cultpop, information));

export function pack_locationRef(locations: readonly Location[]) : Pack<Location> {
    return build<Location>()
        .pass("id", int7)
        .call(id => locations[id]);
}