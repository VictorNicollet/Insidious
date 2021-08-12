// Each agent has a current (outward) occupation, but can have skills
// (and levels) in more than once occupation.
export type Occupation = keyof(ByOccupation<number>)
export type ByOccupation<T> = {
    Merchant: T
    Farmer: T
    Artisan: T
    Hunter: T
    Mercenary: T
    Criminal: T
    Arcanist: T
    Noble: T
}

export function byOccupation<T>(value: T): ByOccupation<T> {
    return { 
        Merchant: value,
        Farmer: value,
        Artisan: value,
        Hunter: value,
        Mercenary: value,
        Criminal: value,
        Arcanist: value,
        Noble: value
    }
}

export const occupations : readonly Occupation[] = [ 
    "Merchant",
    "Farmer",
    "Artisan",
    "Hunter",
    "Mercenary",
    "Criminal",
    "Arcanist",
    "Noble" ];