import type { World } from "./world"

export class Cult {
    constructor(
        public readonly world: World,
        public name : string
    ) {
    }
}