import { obj, Pack } from "./serialize"

export type ResourcesOf<T> = {
    gold: T
    touch: T
}

export type Resources = ResourcesOf<number>

export const zero = { gold: 0, touch: 0 }

export function pack_resourcesOf<T>(pack: Pack<T>) : Pack<ResourcesOf<T>> {
    return obj({
        gold: pack,
        touch: pack
    });
}