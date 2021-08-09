import type { World } from "./world"
import { LocationName } from "./names"
import { Cell } from "./grid"

export class Location {

    constructor(
        private readonly world : World,
        public name: LocationName,
        public readonly cell: Cell) {}

    // For each age, in years, the number of inhabitants of that age
    private readonly ages : number[]
}