import type { Grid } from "../model/grid"
import type { CellKind, WorldMap } from '../model/map'
import { World } from 'model/world';

export type MapView = {
    readonly grid : Grid
    readonly cells : readonly CellKind[]
    
    // If this cell is occupied by a location, the index of that location
    // in the world's 'seenLocations' array
    readonly locations : readonly (number|undefined)[]
    
    // 0 if not visible, 1 if in fog, > 1 if visible.
    readonly vision : Uint32Array
}

export function map(w: World, m: WorldMap): MapView {

    const locations : (number|undefined)[] = [];
    while (locations.length < m.grid.count) locations.push(undefined);
    let worldLocations = w.seenLocations;
    for (let i = 0; i < worldLocations.length; ++i)
        locations[worldLocations[i].cell] = i;

    return {
        grid: m.grid,
        cells: [...m.cells],
        locations,
        vision: new Uint32Array(m.vision)
    }
}