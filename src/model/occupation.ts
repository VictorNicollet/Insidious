// Each agent has a current (outward) occupation, but can have skills

import { ByLocationKind } from './locations';
import { Resources, zero } from './resources';

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

export const recruitCost : ByOccupation<Resources> = {
    Farmer: zero,
    Smith: zero,
    Hunter: zero,
    Merchant: { gold: 10, touch: 0 },
    Mercenary: { gold: 10, touch: 0 },
    Criminal: { gold: 5, touch: 0 },
    Mage: { gold: 50, touch: 0 },
    Noble: { gold: 100, touch: 0 }
}

// The total experience needed to reach a level. One unit of XP equals
// one day of staying undercover. 
export const lvlxp = (function() {
    // We express the number of NEW experience points needed to GAIN ONE LEVEL,
    // and then cumulative-sum these into the number of TOTAL experience points
    // needed to REACH LEVEL X.
    const additional = [
        /* Lv.0 */    0,
        /* Lv.1 */    7, 
        /* Lv.2 */   14, 
        /* Lv.3 */   14, // Lv.3 is easier to reach than the rest
        /* Lv.4 */   45, 
        /* Lv.5 */   90,
        /* Lv.6 */  180,  
        /* Lv.7 */  360,
        /* Lv.8 */  720,
        /* Lv.9 */ 1440,
        /* Nope */ Number.POSITIVE_INFINITY
    ]
    for (let i = 1; i <= 9; ++i) additional[i] += additional[i-1];
    return additional;
}());

// For each location kind, give the ease of finding an agent of 
// each occupation (0 = impossible, 1 = hard, 3 = normal, 5 = easy)
export const presenceByLocationKind : ByLocationKind<ByOccupation<number>> = {
    ruins: {
        Merchant: 1, 
        Farmer: 2,
        Smith: 2,
        Hunter: 1,
        Mercenary: 2,
        Criminal: 2,
        Mage: 0,
        Noble: 0
    },
    town: {
        Merchant: 3,
        Farmer: 5,
        Smith: 3,
        Hunter: 3,
        Mercenary: 2,
        Criminal: 2,
        Mage: 0,
        Noble: 0 
    },
    workcamp: {
        Merchant: 3,
        Farmer: 3,
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
        Smith: 4,
        Hunter: 2,
        Mercenary: 4,
        Criminal: 4,
        Mage: 1,
        Noble: 1
    },
    fortress: {
        Merchant: 2,
        Farmer: 2,
        Smith: 5,
        Hunter: 3,
        Mercenary: 5,
        Criminal: 2,
        Mage: 1,
        Noble: 1
    },
    academy: {
        Merchant: 1,
        Farmer: 1,
        Smith: 2,
        Hunter: 1,
        Mercenary: 2,
        Criminal: 2,
        Mage: 4,
        Noble: 0
    }
}