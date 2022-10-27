// Population is categorized by caste, within each district of a location

import { Location, ByLocationKind } from './locations'
import { ByOccupation, presenceByLocationKind, occupations } from './occupation'
import { objmap } from '../objmap'
import { build, float32array } from './serialize'
import { District } from './districts'

// CASTES ====================================================================

export const laborers  = 0
export const artisans  = 1
export const criminals = 2
export const fighters  = 3
export const bourgeois = 4
export const mystics   = 5
export const gentry    = 6

export const nbCastes  = 7

export function casteName(caste: number) {
    return caste == laborers ? "laborers" : 
           caste == artisans ? "artisans" : 
           caste == criminals ? "criminals" : 
           caste == fighters ? "fighters" : 
           caste == bourgeois ? "bourgeois" : 
           caste == mystics ? "mystics" : "gentry";
}

// Associate a caste with each occupation
export const casteOfOccupation : ByOccupation<number> = {
    Criminal: criminals,
    Farmer: laborers,
    Hunter: laborers,
    Smith: artisans,
    Mercenary: fighters,
    Merchant: bourgeois,
    Mage: mystics,
    Noble: gentry
}

// The stride (number of population segments in a district). 
// The segment for a given caste in a district is at index: 
//   district * stride + caste
export const stride    = 7

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

// Keeps track of the population of the entire game world, location by location,
// both count and properties.
export class Population {
    
    public readonly cultTotal : number

    constructor(
        // The number of people in each caste, for all districts
        public readonly count : Float32Array,
        // The proportion of cult members in each segment (0..1)
        public readonly cult : Float32Array,
        // All locations in the world, used to update their population fields        
        public readonly locations: readonly Location[],
        // All districts in the world, used to update their population fields
        public readonly districts: readonly District[])
    {
        this.cultTotal = 0;
        for (let seg = 0; seg < this.cult.length; ++seg)
            this.cultTotal += Math.floor(this.cult[seg] * this.count[seg]);
    }

    static create(locations: readonly Location[], districts: readonly District[]) {
        const nb = districts.length * stride;
        const count = new Float32Array(nb);
        const cult = new Float32Array(nb);

        for (let seg = 0; seg < nb; ++seg) {
            const district = districts[Math.floor(seg/stride)];
            const location = district.location;
            const caste = seg % stride;
            const casteMult  = casteByLocationKind[location.kind][caste];
            count[seg] = Math.floor(district.population * casteMult);
        }

        return new Population(count, cult, locations, districts);
    }

    public segname(seg: number) {
        const dis = Math.floor(seg / stride);
        const caste = seg % stride;

        return this.districts[dis].name.short + " (" + this.districts[dis].location.name.short + ") " +
            casteName(caste);
    }

    public print() {
        const c = this.count;
        for (let d = 0; d < this.districts.length; ++d) {
            const o = d * stride;
            const byCaste = {
                "laborers": c[o + laborers],
                "artisans": c[o + artisans],
                "criminals": c[o + criminals],
                "fighters": c[o + fighters],
                "bourgeois": c[o + bourgeois],
                "mystics": c[o + mystics],
                "gentry": c[o + gentry],
            }
            console.log("%s (%s) -> %s (%s): %d (%d) = %o", 
                this.districts[d].location.name.short,
                this.districts[d].location.kind,
                this.districts[d].name.short, 
                this.districts[d].kind, 
                this.districts[d].population,
                this.districts[d].cultpop,
                byCaste);
        }
    }

    // Perform weekly computations
    public weekly() { }

    // Refresh the location-stored properties for a location
    public refreshAll() {
        const {count,cult} = this;
        let districtPop = 0;
        let districtCultPop = 0;
        let locationPop = 0;
        let locationCultPop = 0;
        for (let seg = 0; seg < count.length; ++seg) {
            districtPop += Math.floor(count[seg])
            districtCultPop += Math.floor(count[seg] * cult[seg]);
            if ((seg % stride) == stride - 1) {
                
                const district = this.districts[Math.floor(seg/stride)];
                district.population = districtPop;
                district.cultpop = districtCultPop;
                
                locationPop += districtPop;
                locationCultPop += districtCultPop;
                
                districtPop = 0;
                districtCultPop = 0;
                
                if (district.id + 1 == this.districts.length ||
                    this.districts[district.id + 1].location.id != district.location.id)
                {
                    const location = district.location;
                
                    location.population = locationPop;
                    location.cultpop = locationCultPop;
                
                    locationPop = 0;
                    locationCultPop = 0;
                }
            }
        }
    }
}

export function pack_population(
    locations: readonly Location[], 
    districts: readonly District[]) 
{
    return build<Population>()
        .pass("count", float32array)
        .pass("cult", float32array)
        .call((count, cult) => 
            new Population(count, cult, locations, districts));
}
