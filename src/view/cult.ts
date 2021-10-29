import { World } from "../model/world";
import { Cult } from "../model/cult";

export type CultView = {
    readonly name : string
    // The original model object. Mutable, so don't use it, or its properties,
    // for anything around memoization !
    readonly cult: Cult
}

export function cult(w: World): CultView|undefined {
    const cult = w.cult;
    if (!cult) return undefined;

    return {
        name: cult.name,
        cult
    };
}