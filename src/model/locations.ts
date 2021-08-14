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
        const cellKind = world.map.cells[cell];
        this.kind = cellKind === M.castleA ||
                    cellKind === M.castleB ||
                    cellKind === M.castleC ||
                    cellKind === M.castleD ||
                    cellKind === M.castleE
                    ? "city" : 
                    cellKind === M.mountainMine ||
                    cellKind === M.hillsMine ||
                    cellKind === M.foresterA ||
                    cellKind === M.foresterB ||
                    cellKind === M.smithy
                    ? "workcamp" : 
                    cellKind === M.fortA ||
                    cellKind === M.fortB 
                    ? "fortress" :
                    cellKind === M.academy
                    ? "academy" : 
                    cellKind === M.village ||
                    cellKind === M.villageUnder ||
                    cellKind === M.villageSmall ||
                    cellKind === M.inn
                    ? "town" : "ruins";
    }
}