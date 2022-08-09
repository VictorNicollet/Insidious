import { build, Pack, string } from "./serialize"
import type { World } from "./world"

export class Cult {
    
    public readonly world: World

    constructor(
        public name : string
    ) {
        // We cheat by injecting the world reference later, when
        // this instance is added to the world
        // (because Cult and World are mutually recursive)
        this.world = undefined as any
    }
}

export const pack_cult : Pack<Cult> = build<Cult>()
    .pass("name", string)
    .call((name) => new Cult(name));
