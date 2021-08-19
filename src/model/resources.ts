export type ResourcesOf<T> = {
    gold: T
    touch: T
}

export type Resources = ResourcesOf<number>

export const zero = { gold: 0, touch: 0 }