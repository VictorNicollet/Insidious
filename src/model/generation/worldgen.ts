import { World } from "../world"
import { randomLocation } from './namegen';
import { Cell, Grid, grid32 } from 'model/grid';

// Produces a set of random location coordinates such that
//  1. locations form a connected graph with edges of distance=3
//     between pairs of locations
//  2. no two locations are closer to one another than distance=3
//  3. all locations fit in the provided grid
// The returned set contains up to 'max' locations
function randomCoords(grid: Grid, max: number): Cell[] {
    
    const returned : Cell[] = [];

    // We eliminate cells from the grid once they are at distance<3
    // from a selected location, so that we don't bother picking 
    // them. The 'eliminated' contains:
    //  - 0 if the cell is not within distance<3 of a location
    //  - 1 if the cell is a selected location.
    //  - 2..4 equal to one plus the distance to the closest location to
    //    that cell. 
    const eliminated = new Uint8Array(grid.count)

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

    // Pick a random cell anywhere on the grid (except on the very
    // borders). 
    const first = grid.cell(
        1 + Math.floor(Math.random() * (grid.side-2)),
        1 + Math.floor(Math.random() * (grid.side-2)));
    
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

        returned.push(next);
        relax(next, 1);
    }

    return returned;
}

export function generate() : World {
    const world = new World();

    for (let coords of randomCoords(grid32, 80))
    {
        const location = world.newLocation(randomLocation(), coords);
    }

    console.log("Locations: %d", world.locations().length)

    return world;
}