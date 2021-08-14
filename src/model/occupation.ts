// Each agent has a current (outward) occupation, but can have skills

import { ByLocationKind } from './locations';

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

// For each location kind, give the ease of finding an agent of 
// each occupation (0 = impossible, 1 = hard, 3 = normal, 5 = easy)
export const presenceByLocationKind : ByLocationKind<ByOccupation<number>> = {
    ruins: {
        Merchant: 3, 
        Farmer: 4,
        Smith: 4,
        Hunter: 3,
        Mercenary: 4,
        Criminal: 4,
        Mage: 0,
        Noble: 0
    },
    town: {
        Merchant: 4,
        Farmer: 5,
        Smith: 4,
        Hunter: 4,
        Mercenary: 3,
        Criminal: 3,
        Mage: 0,
        Noble: 0 
    },
    workcamp: {
        Merchant: 3,
        Farmer: 5,
        Smith: 5,
        Hunter: 3,
        Mercenary: 3,
        Criminal: 3,
        Mage: 0,
        Noble: 0
    },
    city: {
        Merchant: 4,
        Farmer: 5,
        Smith: 5,
        Hunter: 2,
        Mercenary: 4,
        Criminal: 4,
        Mage: 1,
        Noble: 1
    },
    fortress: {
        Merchant: 3,
        Farmer: 4,
        Smith: 4,
        Hunter: 4,
        Mercenary: 5,
        Criminal: 2,
        Mage: 1,
        Noble: 1
    },
    academy: {
        Merchant: 1,
        Farmer: 2,
        Smith: 1,
        Hunter: 1,
        Mercenary: 1,
        Criminal: 2,
        Mage: 4,
        Noble: 0
    }
}