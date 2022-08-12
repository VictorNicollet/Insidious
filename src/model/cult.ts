import * as R from "./cult/recruit";
import { build, Pack, string } from "./serialize"
import type { World } from "./world"

export class Cult {
    
    public readonly world: World

    constructor(
        public name : string,
        public recruitment : R.Recruitment
    ) {
        // We cheat by injecting the world reference later, when
        // this instance is added to the world
        // (because Cult and World are mutually recursive)
        this.world = undefined as any
    }

    static create(name: string) {
        return new Cult(name, R.modes[0])
    }

    public setRecruitment(r: R.Recruitment) {
        this.recruitment = r;
        this.world.refresh();
    }
}

export const pack_cult : Pack<Cult> = build<Cult>()
    .pass("name", string)
    .pass("recruitment", R.pack_recruitment)
    .call((name, recruitment) => new Cult(name, recruitment));
