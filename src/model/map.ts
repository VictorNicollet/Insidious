import type { Grid } from './grid'
import type { World } from './world'

// The type of a cell on the map.
export type CellAspect = "plains" | "ocean" | "mountain" | "castle"
export class CellKind {
    constructor(
        public readonly id: number,
        public readonly aspect: CellAspect) {}
}

export const ocean = new CellKind(0, "ocean")
export const plains = new CellKind(1, "plains")
export const mountain = new CellKind(2, "mountain")
export const castle = new CellKind(3, "castle")

export class WorldMap { 
    public readonly cells: CellKind[]
    constructor(
        public readonly grid : Grid,
        public readonly world : World
    ) {
        const cells : CellKind[] = []
        while (cells.length < grid.count) cells.push(ocean);
        this.cells = cells;
    }
}
