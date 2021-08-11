import { World } from "../world"
import { Location } from "../locations"
import { randomLocation, randomPerson } from './namegen';
import { Cell, grid32 } from 'model/grid';
import * as Map from 'model/map';
import { RandomBag } from './randombag';

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

    while (flood.length > 0) {
        const next = flood.pop();
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
    [Map.farm, Map.village],
    [       2,           1])

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
function generateTiles(map: Map.WorldMap) {
    const {grid, cells} = map;
    const locations = map.world.locations();

    // Start by mapping cells to locations.
    const locByCell : (Location|undefined)[] = [];
    while (locByCell.length < grid.count) locByCell.push(undefined);
    for (let loc of map.world.locations()) locByCell[loc.cell] = loc;

    // First traversal: convert locations and their surroundings
    let usedByKindId : number[] = [];
    for (let cell = 0; cell < grid.count; ++cell)
    {
        const loc = locByCell[cell];
        if (typeof loc == "undefined") continue;
        
        const locBag = loc.population < 900 ? tinyBag : 
                        loc.population < 1200 ? smallBag : 
                        loc.population < 8000 ? mediumBag : 
                        largeBag;
                        
        let kind = locBag.pick()
 
        // Re-roll if we have already reached the maximum count 
        // for a given kind.
        while ((usedByKindId[kind.id] || 0) >= kind.maxCount) kind = locBag.pick();
        usedByKindId[kind.id] = (usedByKindId[kind.id] || 0) + 1;
 
        cells[cell] = kind;

        // Surround the city with the appropriate terrain
        const bag = kind === Map.mountainMine || 
                    kind === Map.castleD ||
                    kind === Map.fortA ||
                    kind === Map.fortB 
                    ? mountainsBag : 
                    kind === Map.hillsMine ||
                    kind === Map.villageUnder
                    ? hillsBag : 
                    kind === Map.castleA ||
                    kind === Map.castleB || 
                    kind === Map.castleC ||
                    kind === Map.castleE 
                    ? cityBag : 
                    kind === Map.village ||
                    kind === Map.villageSmall
                    ? villageBag :
                    kind === Map.graveyard 
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
                    adj === Map.farm || adj === Map.villageUnder ? villageBag :
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
    return Math.pow(10, exponent);
}

export function generate() : World {
    
    const world = new World(grid32);
    const map = world.map;

    // Generate all locations on the map
    let popBaseline = 12;
    for (let coords of randomCoords(map, 80))
    {
        world.newLocation(
            randomLocation(), 
            coords, 
            popFromBaseline(popBaseline));
        popBaseline *= 0.8;
    }

    // Generate tiles compatible with locations
    generateTiles(map);

    // Generate an agent in the last location
    const locs = world.locations();
    const last = locs[locs.length - 1];
    world.newAgent(randomPerson(), last);

    return world;
}