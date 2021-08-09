import * as G from "./grid"

test("0,0 is not shifted", () => 
    expect(G.odd(G.grid32.cell(0,0))).toBe(false))

test("1,0 is not shifted", () => 
    expect(G.odd(G.grid32.cell(1,0))).toBe(false))

test("0,1 is shifted", () => 
    expect(G.odd(G.grid32.cell(0,1))).toBe(true))

test("5,3 is shifted", () => 
    expect(G.odd(G.grid32.cell(5,3))).toBe(true))

test("0,0 on single-cell grid has no adjacents", () => {
    const grid = new G.Grid(1);
    expect(grid.adjacent(grid.cell(0,0))).toEqual([])
});

test("0,0 has two adjacents", () => {
    const grid = G.grid32;
    expect(grid.adjacent(grid.cell(0,0))).toEqual([
        grid.cell(0,1),
        grid.cell(1,0)
    ])
})

test("1,0 has four adjacents", () => {
    const grid = G.grid32;
    expect(grid.adjacent(grid.cell(1,0))).toEqual([
        grid.cell(0,0),
        grid.cell(1,1),
        grid.cell(2,0),
        grid.cell(0,1)
    ])
})

test("0,1 has five adjacents", () => {
    const grid = G.grid32;
    expect(grid.adjacent(grid.cell(0,1))).toEqual([
        grid.cell(0,0),
        grid.cell(0,2),
        grid.cell(1,1),
        grid.cell(1,0),
        grid.cell(1,2)
    ])
})

test("1,1 has six adjacents", () => {
    const grid = G.grid32;
    expect(grid.adjacent(grid.cell(1,1))).toEqual([
        grid.cell(0,1),
        grid.cell(1,0),
        grid.cell(1,2),
        grid.cell(2,1),
        grid.cell(2,0),
        grid.cell(2,2)
    ])
})

test("0,0 at distance 1 from 0,1", () => {
    const grid = G.grid32;
    expect(grid.distance(grid.cell(0,0), grid.cell(0,1))).toBe(1)
})

test("0,0 at distance 2 from 0,2", () => {
    const grid = G.grid32;
    expect(grid.distance(grid.cell(0,0), grid.cell(0,2))).toBe(2)
})

test("0,0 at distance 3 from 2,2", () => {
    const grid = G.grid32;
    expect(grid.distance(grid.cell(0,0), grid.cell(2,2))).toBe(3)
})