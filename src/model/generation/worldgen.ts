import { World } from "../world"
import { Location, ByLocationKind } from "../locations"
import {  randomPerson } from './namegen';
import { Cell, grid32 } from '../grid';
import * as Map from '../map';
import { RandomBag } from './randombag';
import { Occupation, occupations, byOccupation, ByOccupation, presenceByLocationKind } from '../occupation';
import { objmap } from '../../objmap';
import * as Intro from "../../sagas/intro"

// Produces a set of random location coordinates such that
//  1. locations form a connected graph with edges of distance=3
//     between pairs of locations
//  2. no two locations are closer to one another than distance=3
//  3. all locations fit in the provided grid
//
// The returned set contains up to 'max' locations
//
// At the same time, this alters the provided map to set the 
// tiles to either ocean or plains, such that: 
//  1. the returned locations all end on a plains.
//  2. all cells which can be reached from the boundaries without
//     being adjacent to a returned location become ocean
//  3. some cells adjacent to a returned location randomly
//     become ocean as well.
function randomCoords(map: Map.WorldMap, max: number): Cell[] {
    
    const grid = map.grid;
    const returned : Cell[] = [];

    // We eliminate cells from the grid once they are at distance<3
    // from a selected location, so that we don't bother picking 
    // them. The 'eliminated' contains:
    //  - 0 if the cell is not within distance<3 of a location
    //  - 1 if the cell is a selected location.
    //  - 2..4 equal to one plus the distance to the closest location to
    //    that cell. 
    const eliminated = new Uint8Array(map.grid.count)

    // Cells at distance exactly 3 (i.e. eliminated[c] == 4) from 
    // the nearest location. 
    const candidates : Cell[] = []

    // Dijkstra-like relaxation: if the new distance is shorter than
    // the old one, propagate. 
    function relax(cell: Cell, distPlus1: number) {
        const old = eliminated[cell];
        if (old != 0 && old <= distPlus1) return;
        eliminated[cell] = distPlus1;
        if (distPlus1 == 4) 
            candidates.push(cell);
        else
            for (let adj of grid.adjacent(cell)) relax(adj, distPlus1+1)
    }

    // Pick a random cell more or less in the middle of the grid
    const first = grid.cell(
        4 + Math.floor(Math.random() * (grid.side-8)),
        4 + Math.floor(Math.random() * (grid.side-8)));
    
    returned.push(first);
    relax(first, 1);

    // As long as we have candidates, consume them.
    while (candidates.length > 0 && returned.length < max) {
        
        // Remove a candidate at random from the array.
        const rand = Math.floor(Math.random() * candidates.length);
        const next = candidates[rand];
        candidates[rand] = candidates[candidates.length - 1];
        candidates.pop();

        // Candidate may have been eliminated while it was in the list.
        if (eliminated[next] != 4) continue;

        // Candidate should not be too close to map boundary
        if (grid.adjacent(next).length != 6) continue;

        returned.push(next);
        relax(next, 1);
    }

    // Now, flood-fill the map by setting `eliminated` to 42 
    // (indicating ocean filling) and 43 (indicating that an 
    // ocean filling will be picked randomly in a subsequent pass).
    const flood : Cell[] = []
    for (let n = 0; n < grid.side; ++n) {
        flood.push(grid.cell(n, 0), 
                   grid.cell(0, n), 
                   grid.cell(n, grid.side-1),
                   grid.cell(grid.side-1, n))
    }

    let next : Cell|undefined;
    while ((next = flood.pop()) !== undefined) {
        const old = eliminated[next];
        if (old == 42 || old == 43) continue; // Already visited
        if (old == 1) continue; // Is a picked location
        if (old == 2) { eliminated[next] = 43; continue; }
        eliminated[next] = 42;
        for (let adj of grid.adjacent(next)) flood.push(adj);
    }

    // Use the flood-filled values to set ocean/none appropriately
    for (let cell = 0; cell < grid.count; ++cell)
    {
        const value = eliminated[cell];
        map.cells[cell] = (value == 42 || value == 43 && Math.random() < 0.5)
            ? Map.ocean
            : Map.none;
    }            

    return returned;
}

const tinyBag = new RandomBag<Map.CellKind>(Map.tinyLocationCells);
const smallBag = new RandomBag<Map.CellKind>(Map.smallLocationCells);
const mediumBag = new RandomBag<Map.CellKind>(Map.mediumLocationCells);
const largeBag = new RandomBag<Map.CellKind>(Map.largeLocationCells);
const hugeBag = new RandomBag<Map.CellKind>(Map.hugeLocationCells);

const mountainsBag = new RandomBag<Map.CellKind>(
    [Map.mountain, Map.forest, Map.hills, Map.moor, Map.plains], 
    [          15,          3,         1,        1,          1])

const hillsBag = new RandomBag<Map.CellKind>(
    [Map.hills, Map.forest, Map.mountain, Map.plains, Map.moor], 
    [       10,          3,            3,          3,        1])

const forestBag = new RandomBag<Map.CellKind>(
    [Map.forest, Map.hills, Map.mountain, Map.plains, Map.marsh], 
    [        10,         1,            1,          1,         1])

const cityBag = new RandomBag<Map.CellKind>(
    [Map.farm, Map.plains],
    [       5,          1])

const villageBag = new RandomBag<Map.CellKind>(
    [Map.farm, Map.forest, Map.plains],
    [       1,          1,          1]);

const marshBag = new RandomBag<Map.CellKind>(
    [Map.marsh, Map.plains], 
    [        4,          1])

const oceanBag = new RandomBag<Map.CellKind>([Map.ocean])

const plainsBag = new RandomBag<Map.CellKind>(
    [Map.plains, Map.moor, Map.marsh, Map.mountain, Map.forest],
    [        10,        5,         1,            1,          1]);

// Generate terrain tiles, using the locations to provide believable
// surroundings to each of them.
function generateTiles(map: Map.WorldMap, locations: {population: number, cell: Cell}[]) {
    const {grid, cells} = map;

    // Start by mapping cells to locations.
    const popByCell = new Uint32Array(grid.count);
    for (let loc of locations) popByCell[loc.cell] = loc.population;

    // First traversal: convert locations and their surroundings
    let usedByKindId : number[] = [];
    for (let cell = 0; cell < grid.count; ++cell)
    {
        const population = popByCell[cell];
        if (!population) continue;
        
        const locBag = population < 900 ? tinyBag : 
                        population < 1200 ? smallBag : 
                        population < 8000 ? mediumBag :
                        population < 75000 ? largeBag : 
                        hugeBag;
                        
        let kind = locBag.pick()
 
        // Re-roll if we have already reached the maximum count 
        // for a given kind.
        while ((usedByKindId[kind.id] || 0) >= kind.maxCount) kind = locBag.pick();
        usedByKindId[kind.id] = (usedByKindId[kind.id] || 0) + 1;
 
        cells[cell] = kind;

        // Surround the city with the appropriate terrain
        const bag = kind.is(Map.mountainMine, Map.castleD, Map.fortA, Map.fortB)
                    ? mountainsBag : 
                    kind.is(Map.hillsMine, Map.villageUnder)
                    ? hillsBag : 
                    kind.is(Map.castleA, Map.castleB, Map.castleC, Map.castleE)
                    ? cityBag : 
                    kind.is(Map.village, Map.villageSmall)
                    ? villageBag :
                    kind.is(Map.graveyard)
                    ? marshBag : 
                      forestBag;

        for (let adj of grid.adjacent(cell)) 
            if (cells[adj] != Map.ocean) cells[adj] = bag.pick();
    }

    // Second traversal: fill 'none' locations based on surroundings
    for (let cell = 0; cell < grid.count; ++cell) {
        if (cells[cell] !== Map.none) continue;
        // Pick a random adjacent, non-"none" tile kind
        const adjacent = grid.adjacent(cell)
            .map(adj => cells[adj])
            .filter(adj => adj !== Map.none)
        const adj = new RandomBag<Map.CellKind>(adjacent).pick();
        const bag = adj === Map.mountain ? mountainsBag : 
                    adj === Map.ocean ? oceanBag :
                    adj === Map.forest ? forestBag : 
                    adj === Map.marsh ? marshBag : 
                    adj === Map.hills ? hillsBag :
                    adj === Map.farm ? villageBag :
                    plainsBag; 
        cells[cell] = bag.pick();
    }
}

// Given the current baseline (which decreases exponentially 
// as new locations are generated), produce a population 
// count for a location.
function popFromBaseline(popBaseline: number) {
    const exponent = 
        ( popBaseline 
        + 5 * Math.random() 
        + 5 * Math.random()
        + 10 ) / 5;
    
    let pop = Math.floor(Math.pow(10, exponent));
    if (pop > 150000) pop = 150000 + (pop % 10000);
    return pop;
}

const occupationBagsByLocation : ByLocationKind<RandomBag<Occupation>> = 
    objmap(presenceByLocationKind, presence => 
        new RandomBag<Occupation>(
            occupations, 
            // Bend probabilities a bit, to concentrate on the really
            // likely ones. 
            occupations.map(o => Math.pow(presence[o], 2))));
    
function initialOccupationAndLevels(
    location: Location
): [Occupation, ByOccupation<number>] {
    
    const bag = occupationBagsByLocation[location.kind];
    const occupation = bag.pick();

    // Level of initial agent is always 3 in main occupation
    const levels = byOccupation(0);
    levels[occupation] = 3;

    return [occupation, levels];
}

export function generate() : World {
    
    const map = Map.WorldMap.create(grid32);

    // Generate all future locations on the map
    const futureLocations : { population: number, cell: Cell }[] = [];
    let popBaseline = 12;
    for (let cell of randomCoords(map, 80))
    {
        futureLocations.push({
            population: popFromBaseline(popBaseline),
            cell
        });
        popBaseline *= 0.8;
    }

    // Generate tiles compatible with locations
    generateTiles(map, futureLocations);

    // Create the world with the initial locations
    const world = World.create(futureLocations, map);

    // Generate an agent in the last location
    const locs = world.locations();
    const last = locs[locs.length - 1];
    last.information = 4;
    world.seenLocations.push(last)
    const [occupation, levels] = initialOccupationAndLevels(last);
    const agent = world.newAgent(randomPerson(), last, occupation, levels);
    
    // Initial saga !
    const intro = Intro.saga(agent, last)
    intro.run(world);
    world.addSaga(intro);

    // Initial gold equals a week's worth of income
    world.resources.gold = Math.floor(7 * agent.stats.idleIncome.value);

    return world;
}