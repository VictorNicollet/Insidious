import type { World } from "./world"
import { LocationName } from "./names"
import { Cell } from "./grid"

export class Location {

    constructor(
        public readonly world : World,
        public readonly name: LocationName,
        public readonly cell: Cell,
        // Population count, fractional in order to support
        // slow growth over several turns (only display the floor)
        public population : number) {}
}