export type ResourcesOf<T> = {
    gold: T
    touch: T
}

export type Resources = ResourcesOf<number>

