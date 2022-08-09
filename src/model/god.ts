import { obj, Pack, string } from "./serialize"

export type God = {
    readonly name: string
    readonly aspect: string
    readonly color: string
    readonly nature: string
    readonly epithetA: string
    readonly epithetB: string
    readonly epithetC: string
    readonly verb: string
    readonly one: string
    readonly title: string
}

export const sample : God = {
    name: "Azathoth",
    aspect: "madness",
    color: "blue",
    nature: "god",
    epithetA: "mad",
    epithetB: "sleeping",
    epithetC: "tentacled",
    verb: "sleeps",
    one: "one",
    title: "lord"
}

export const pack_god : Pack<God> = obj<God>({
    name: string,
    aspect: string,
    color: string,
    nature: string,
    epithetA: string,
    epithetB: string,
    epithetC: string,
    verb: string,
    one: string,
    title: string
});