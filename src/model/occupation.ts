// Each agent has a current (outward) occupation, but can have skills
// (and levels) in more than one occupation.
export type Occupation = keyof(ByOccupation<number>)
export type ByOccupation<T> = {
    Merchant: T
    Farmer: T
    Smith: T
    Hunter: T
    Mercenary: T
    Criminal: T
    Mage: T
    Noble: T
}

export function byOccupation<T>(value: T): ByOccupation<T> {
    return { 
        Merchant: value,
        Farmer: value,
        Smith: value,
        Hunter: value,
        Mercenary: value,
        Criminal: value,
        Mage: value,
        Noble: value
    }
}

export const occupations : readonly Occupation[] = [ 
    "Merchant",
    "Farmer",
    "Smith",
    "Hunter",
    "Mercenary",
    "Criminal",
    "Mage",
    "Noble" ];