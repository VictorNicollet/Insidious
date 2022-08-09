// Population is categorized by caste and wealth. 

import { Location, ByLocationKind } from './locations'
import { ByOccupation, presenceByLocationKind, occupations } from './occupation'
import { objmap } from '../objmap'
import { build, float32array, option } from './serialize'

// WEALTH ====================================================================

export const destitute = 0
export const poor      = 1
export const middle    = 2
export const wealthy   = 3

// CASTES ====================================================================

export const laborers  = 0
export const artisans  = 4
export const criminals = 8
export const fighters  = 12
export const bourgeois = 16
export const mystics   = 20
export const gentry    = 24

// Associate a caste with each occupation
const casteOfOccupation : ByOccupation<number> = {
    Criminal: criminals,
    Farmer: laborers,
    Hunter: laborers,
    Smith: artisans,
    Mercenary: fighters,
    Merchant: bourgeois,
    Mage: mystics,
    Noble: gentry
}

// The stride (number of population segments in a location). 
// The segment for a given caste and wealth in a location is at index: 
//   (location * stride) + wealth + caste
export const stride    = 28

// For every location kind, a population distribution as fractions of the total.
// Example: 
//   casteByLocationKind["city"][artisans] = xx%
const casteByLocationKind : ByLocationKind<Float32Array> = objmap(presenceByLocationKind, presence => 
    {
        let shift = 1; // Shift values slightly so that we don't have the exact same 
                       // fractions for every caste.
        let total = 0;
        const byOccupation = new Float32Array(stride);
        for (let occupation of occupations) {
            const ease = presence[occupation];
            const portion = ease * ease * ease * (1 + 1 / shift);
            total += portion;
            const caste = casteOfOccupation[occupation]; 
            byOccupation[caste] += portion;
            ++shift;
        }
    
        for (let i = 0; i < byOccupation.length; ++i) 
            byOccupation[i] /= total;
    
        return byOccupation;
    })

const wealthByCaste = new Float32Array([
    // Laborers
    0.9, 0.09, 0.1, 0,
    // Artisans
    0.4, 0.5, 0.09, 0.01,
    // Criminals
    0.5, 0.4, 0.08, 0.02,
    // Fighters
    0.6, 0.3, 0.1, 0,
    // Bourgeois
    0.01, 0.2, 0.5, 0.29,
    // Mystics
    0, 0.1, 0.6, 0.3,
    // Gentry
    0, 0.05, 0.3, 0.65
])

// Keeps track of the population of the entire game world, location by location,
// both count and properties.
export class Population {
    
    constructor(
        // The number of people in each caste/wealth segment, for all locations
        public readonly count : Float32Array,
        // The optimism level (from -1 to 1) for each segment.
        public readonly optimism : Float32Array,
        // All locations in the world, used to update the location's population fields        
        public readonly locations: readonly Location[])
    {}

    static create(locations: readonly Location[]) {
        const nb = locations.length * stride;
        const count = new Float32Array(nb);
        const optimism = new Float32Array(nb);

        for (let seg = 0; seg < nb; ++seg) {
            const location = locations[Math.floor(seg/stride)];
            const s = seg % stride;
            const caste = s - (s % 4);
            const casteMult  = casteByLocationKind[location.kind][caste];
            const wealthMult = wealthByCaste[s];
            count[seg] = location.population * casteMult * wealthMult;
        }

        return new Population(count, optimism, locations);
    }

    private print() {
        const c = this.count;
        for (let l = 0; l < this.locations.length; ++l) {
            const o = l * stride;
            function wealthSum(caste: number) {
                return Math.floor(c[o + caste] + c[o + caste + 1] + c[o + caste + 2] + c[o + caste + 3])
            }
            const byCaste = {
                "laborers": wealthSum(laborers),
                "artisans": wealthSum(artisans),
                "criminals": wealthSum(criminals),
                "fighters": wealthSum(fighters),
                "bourgeois": wealthSum(bourgeois),
                "mystics": wealthSum(mystics),
                "gentry": wealthSum(gentry),
            }
            function casteSum(wealth: number) {
                let sum = 0;
                for (let i = 0; i < stride; i += 4) sum += c[o + i + wealth]
                return Math.floor(sum)
            }
            const byWealth = {
                "destitute": casteSum(destitute),
                "poor": casteSum(poor),
                "middle": casteSum(middle),
                "wealthy": casteSum(wealthy)
            }
            console.log("%s (%s): %d = %o %o", 
                this.locations[l].name.short, 
                this.locations[l].kind, 
                this.locations[l].population,
                byCaste,
                byWealth);
        }
    }

    // Perform weekly computations
    public weekly() {
        const {count,optimism} = this;

        // Population increase.
        for (let seg = 0; seg < count.length; ++seg) {
            const current = count[seg];
            if (current < 10) continue;
            const fertility = 1 + (1 + optimism[seg]) / 100;
            count[seg] = current * fertility;
        }

        // Count the population for each location
        let pop = 0;
        for (let seg = 0; seg < count.length; ++seg) {
            pop += Math.floor(count[seg])
            if ((seg % stride) == stride - 1) {
                const location = this.locations[Math.floor(seg/stride)];
                location.population = pop;
                pop = 0;
            }
        }
    }
}

export function pack_population(locations: readonly Location[]) {
    return build<Population>()
        .pass("count", float32array)
        .pass("optimism", float32array)
        .call((count, optimism) => 
            new Population(count, optimism, locations));    
}