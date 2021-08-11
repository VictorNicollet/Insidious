import { World } from "../world"
import { randomLocation, randomPerson } from './namegen';
import { Cell, grid32 } from 'model/grid';
import { WorldMap, ocean, plains, castle } from 'model/map';

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
function randomCoords(map: WorldMap, max: number): Cell[] {
    
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

    // Use the flood-filled values to set ocean/plains appropriately
    for (let cell = 0; cell < grid.count; ++cell)
    {
        const value = eliminated[cell];
        map.cells[cell] = (value == 42 || value == 43 && Math.random() < 0.5)
            ? ocean
            : plains;
    }            

    return returned;
}

// Given a number of persons-of-interest, give a location population
// that would support this number.
export function popByInterest(interest: number) {
    const exponent = (interest + 10 + 5 * Math.random()) / 5;
    return Math.max(5 + 2 * interest, Math.pow(10, exponent));
}

export function generate() : World {
    
    const world = new World(grid32);
    const map = world.map;

    let interestBaseline = 12;
    for (let coords of randomCoords(map, 80))
    {
        const location = world.newLocation(randomLocation(), coords);
        map.cells[coords] = castle;

        // Persons of interest
        const interest = Math.max(2, Math.floor(interestBaseline + 5 * Math.random()))
        for (let i = 0; i < interest; ++i) 
            world.newAgent(randomPerson(), location);
        
        location.population = popByInterest(interest);
        interestBaseline *= 0.8;
    }

    return world;
}