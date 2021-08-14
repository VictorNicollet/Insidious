import type { World } from "./world"
import { LocationName } from "./names"
import { Cell } from "./grid"
import * as M from './map'

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

    constructor(
        public readonly world : World,
        public readonly name: LocationName,
        public readonly cell: Cell,    
        // Population count, fractional in order to support
        // slow growth over several turns (only display the floor)
        public population : number
    ) {
        const ck = world.map.cells[cell];
        this.kind = 
            ck.is(M.castleA, M.castleB, M.castleC, M.castleD, M.castleE) ? "city" : 
            ck.is(M.mountainMine, M.hillsMine, M.foresterA, M.foresterB, M.smithy) ? "workcamp" : 
            ck.is(M.fortA, M.fortB) ? "fortress" :
            ck.is(M.academy) ? "academy" : 
            ck.is(M.village, M.villageUnder, M.villageSmall, M.inn) ? "town" : "ruins";
    }
}