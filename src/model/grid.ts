export type Coords = { x: number, y: number }

// Number of cells on each side of the grid.
export const side = 32;

// True if the hexagonal coordinates c correspond to a row 
// of cells that is shifted right. This corresponds to odd
// values of 'y'.
export function shifted(c: Coords) {
    return !!(c.y % 2);
}

// Returns a predicate that tests whether a coordinate is valid on a
// square grid with coordinates from [0,0] to [side-1, side-1].
export function valid(side: number) {
    return function(c: Coords) {
        return c.x >= 0 && c.x < side && c.y >= 0 && c.y < side;
    }
}

// The array of cells adjacent to a given cell, on a square 
// grid with coordinates from [0,0] to [side-1, side-1].
export function adjacent(c: Coords, side: number): Coords[] {
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
    const shift = shifted(c) ? 1 : -1;
    return [
        {x:c.x-1,y:c.y},
        {x:c.x,y:c.y-1},
        {x:c.x,y:c.y+1},
        {x:c.x+1,y:c.y},
        {x:c.x+shift,y:c.y-1},
        {x:c.x+shift,y:c.y+1}
    ].filter(valid(side))
}