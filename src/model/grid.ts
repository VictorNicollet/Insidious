import { Pack, build, int7 } from './serialize'

// Number of cells on each side of the grid.
export const side = 32;

// A cell inside a grid.
export type Cell = number

// True if a cell lies on an odd row (and thus should be shifted right)
export function odd(cell: Cell): boolean { return !!(cell % 2) }

// Convert a cell to cube coordinates (which are easier to handle
// for computing distances).
export function cubeCoords(c: Cell, side: number): [number,number,number] {
    // Offset coordinates, odd-right
    const oy = c % side;
    const ox = Math.floor(c/side);
    // Cube coordinates
    const cx = ox - Math.floor(oy/2);
    const cz = oy
    const cy = -cx-cz
    return [cx,cy,cz]
}

// A hexagonal grid of dimensions side x side
// Used to uniquely map (x,y) to integers in 0..side²-1, which 
// allows map data to be stored in an array instead of a 
// dictionary. Odd cell numbers are always on odd-y rows.
// The side is expected to be an even number.
export class Grid {

    // The number of cells in this grid. Cells are numbered
    // from 0 to count-1
    public readonly count : number
    
    // For each cell, its list of adjacent cells, pre-computed
    private readonly adjacents : readonly (readonly Cell[])[]

    constructor(public readonly side : number) {
        this.count = side*side;

        // Compute 'adjacents'
        const adjacents : (readonly Cell[])[] = [];
        this.adjacents = adjacents;
        for (let x = 0; x < side; ++x) {
            for (let y = 0; y < side; ++y) {
                // When shifted
                //
                //     x  | x+1 
                //   \y-1/ \y-1/
                //    \ /   \ /
                // x-1 |  x  | x+1
                //  y  |  y  |  y
                //    / \   / \
                //   / x \ /x+1\
                //    y+1 | y+1
                //
                // When not shifted
                // 
                //    x-1 |  x 
                //   \y-1/ \y-1/
                //    \ /   \ /
                // x-1 |  x  | x+1
                //  y  |  y  |  y
                //    / \   / \
                //   /x-1\ / x \
                //    y+1 | y+1
                // 
                // Notice how only two cells differ.
                const shift = !!(y % 2) ? 1 : -1;
                adjacents.push([
                    tryCell(x-1, y),
                    tryCell(x, y-1),
                    tryCell(x, y+1),
                    tryCell(x+1, y),
                    tryCell(x+shift,y-1),
                    tryCell(x+shift,y+1)
                ].filter(cell => cell >= 0));
            }
        }

        function tryCell(x: number, y: number) {
            if (x < 0 || x >= side || y < 0 || y >= side) return -1;
            return y + x * side;
        }
    }

    // Converts valid coordinates to a cell. 
    public cell(x:number, y:number): Cell { return y + x * this.side; }

    // Inverse of 'cell'
    public uncell(cell: Cell): [number,number] {
        return [Math.floor(cell / this.side), cell % this.side]
    }

    // The cells adjacent to a given cell.
    public adjacent(cell: Cell): readonly Cell[] { return this.adjacents[cell] }

    // The distance between two cells, in a straight line.
    public distance(a: Cell, b: Cell) {
        const [ax,ay,az] = cubeCoords(a, this.side)
        const [bx,by,bz] = cubeCoords(b, this.side)
        return (Math.abs(ax - bx) + Math.abs(ay - by) + Math.abs(az - bz)) / 2;
    }
}

export const grid32 = new Grid(32);

export const pack_grid : Pack<Grid> = build<Grid>()
    .pass('side', int7)
    .call(side => side == 32 ? grid32 : new Grid(side));
