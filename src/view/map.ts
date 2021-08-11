import type { Grid } from "../model/grid"
import type { CellKind, WorldMap } from '../model/map'

export type MapView = {
    readonly grid : Grid
    readonly cells : readonly CellKind[]
    readonly locations : readonly (number|undefined)[]
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
        locations
    }
}