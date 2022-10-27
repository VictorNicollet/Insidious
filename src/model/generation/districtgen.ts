import type { ByLocationKind, LocationKind } from "../locations"
import { DistrictKind, District, ByDistrictKind } from "../districts"
import { randomDistrict } from "./namegen"
import type { LocationName } from "../names"

// For every location kind, we generate a list of districts by 
// moving forward through a kind-list. For each district, we 
// roll the probability for the current kind. If successful, we use 
// it and advance in the list. If failed, we advance in the list 
// and try again. Once the last element of the list is reached, 
// we just stay there. 

type KindRoll = [DistrictKind, number] 
type KindList = readonly KindRoll[]

const locationDistricts : ByLocationKind<KindList> = {
    town: [
        ["residential", 1],
        ["residential", 0.75],
        ["temple", 0.25],
        ["lumber", 0.25],
        ["ironworks", 0.25],
        ["mine", 0.25],
        ["residential", 1]
    ],
    city: [
        ["residential", 1],
        ["commercial", 1],
        ["castle", 1],
        ["residential", 0.5],
        ["commercial", 0.5], 
        ["ironworks", 0.25],
        ["barracks", 0.25],
        ["docks", 1],
        ["temple", 1],
        ["residential", 0.5],
        ["commercial", 0.5], 
        ["ironworks", 0.25],
        ["temple", 0.25],
        ["residential", 1]
    ],
    fortress: [
        ["castle", 1],
        ["barracks", 1],
        ["ironworks", 0.75],
        ["barracks", 0.75],
        ["temple", 0.25],
        ["barracks", 0.25],
        ["docks", 0.25],
        ["barracks", 1]
    ],
    ruins: [
        ["ruins", 1],
        ["residential", 0.75],
        ["ruins", 0.75],
        ["temple", 0.1],
        ["lumber", 0.1],
        ["mine", 0.1],
        ["residential", 0.75],
        ["ruins", 1],
    ],
    mine: [
        ["residential", 1],
        ["mine", 1],
        ["temple", 0.1],
        ["ironworks", 0.1],
        ["residential", 0.5],
        ["mine", 1]
    ],
    lumber: [
        ["residential", 1],
        ["lumber", 1],
        ["temple", 0.1],
        ["ironworks", 0.1],
        ["residential", 0.5],
        ["lumber", 1]
    ],
    iron: [
        ["residential", 1],
        ["ironworks", 1],
        ["temple", 0.1],
        ["mine", 0.5],
        ["residential", 0.5],
        ["ironworks", 1]
    ],
    academy: [
        ["academy", 1],
        ["residential", 0.5],
        ["temple", 0.5],
        ["residential", 0.5],
        ["academy", 0.5],
        ["ruins", 0.25],
        ["residential", 0.5],
        ["academy", 1]
    ]
}

// Population weight factor for each district kind
const factorOfKind : ByDistrictKind<number> = {
    academy: 1,
    barracks: 1,
    residential: 2,
    commercial: 1,
    castle: 0.2,
    docks: 0.2, 
    ironworks: 0.3,
    lumber: 0.3, 
    mine: 0.3, 
    ruins: 0.1, 
    temple: 0.1
}

export function makeDistricts(
    nextDistrictId: number,
    population: number,
    locationName: LocationName,
    locationKind: LocationKind,
): readonly District[] {

    // Invoke nextKind() to produce a new district kind
    const stepsList = locationDistricts[locationKind];
    let step = 0;
    function nextKind(): DistrictKind {
        while (true) {
            if (step == stepsList.length - 1) 
                return stepsList[step][0];
            
            let [kind, prob] = stepsList[step++];
            if (prob < Math.random()) continue;

            return kind;
        }
    }

    // The number of districts is determined by the population
    const districtCount = 
        population < 800 ? 3 :
        population < 1000 ? 4 :
        population < 2500 ? 5 : 
        population < 5000 ? 6 : 
        population < 7500 ? 7 : 
        population < 10000 ? 8 : 
        population < 20000 ? 9 : 
        population < 40000 ? 10 : 
        population < 60000 ? 11 : 
        population < 80000 ? 12 : 
        population < 100000 ? 13 : 
        population < 150000 ? 14 : 15; 

    const districtKinds : {kind: DistrictKind, factor: number}[] = [];
    let factorSum = 0
    while (districtKinds.length < districtCount)
    {
        const kind = nextKind();
        const factor = factorOfKind[kind] * (0.9 + 0.2 * Math.random());
        factorSum += factor;
        districtKinds.push({kind, factor})
    }

    // Create districts, assigning population based on factor
    const districts = districtKinds.map(({kind, factor}, i) => 
        District.create(
            nextDistrictId + i,
            kind,
            Math.round(factor / factorSum * population),
            randomDistrict(locationName, kind)));

    return districts;
}