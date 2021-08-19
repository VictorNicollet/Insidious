import type { World } from "./world"
import type { LocationName } from "./names"
import type { Cell } from "./grid"
import * as M from './map'
import { randomLocation } from './generation/namegen'

export type ByLocationKind<T> = {
    ruins: T
    town: T
    workcamp: T
    city: T
    fortress: T
    academy: T
}

export type LocationKind = keyof(ByLocationKind<boolean>)

export class Location {

    public readonly kind : LocationKind
    public readonly name : LocationName

    // The sum of 'gather information' scores of this location. 
    public information : number
    
    constructor(
        // Position of this location in the "all locations" array
        // inside the World.
        public readonly id : number,
        public readonly world : World,
        public readonly cell: Cell,    
        // Population count, integer, cached from the population system
        public population : number
    ) {
        const ck = world.map.cells[cell];
        this.kind = 
            ck.is(M.castleA, M.castleB, M.castleC, M.castleE) ? "city" : 
            ck.is(M.mountainMine, M.hillsMine, M.foresterA, M.foresterB, M.smithy) ? "workcamp" : 
            ck.is(M.castleD, M.fortA, M.fortB) ? "fortress" :
            ck.is(M.academy) ? "academy" : 
            ck.is(M.village, M.villageUnder, M.villageSmall, M.inn) ? "town" : "ruins";
        this.name = randomLocation(this.kind);
        this.information = 0;
    }
}