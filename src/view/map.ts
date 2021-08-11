import type { Grid } from "../model/grid"
import type { CellKind, WorldMap } from '../model/map'

export type MapView = {
    readonly grid : Grid
    readonly cells : readonly CellKind[]
    readonly locations : readonly (number|undefined)[]
    
    // 0 if not visible, 1 if in fog, > 1 if visible.
    readonly vision : Uint32Array
}

export function map(m: WorldMap): MapView {

    const locations : (number|undefined)[] = [];
    while (locations.length < m.grid.count) locations.push(undefined);
    let worldLocations = m.world.locations();
    for (let i = 0; i < worldLocations.length; ++i)
        locations[worldLocations[i].cell] = i;

    return {
        grid: m.grid,
        cells: [...m.cells],
        locations,
        vision: new Uint32Array(m.vision)
    }
}