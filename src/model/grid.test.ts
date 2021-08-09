import * as G from "./grid"

test("0,0 is not shifted", () =>
    expect(G.shifted({x:0,y:0})).toBe(false))

test("1,0 is not shifted", () =>
    expect(G.shifted({x:1,y:0})).toBe(false))

test("0,1 is shifted", () =>
    expect(G.shifted({x:0,y:1})).toBe(true))

test("5,3 is shifted", () =>
    expect(G.shifted({x:5,y:3})).toBe(true))

test("2,-2 is not shifted", () =>
    expect(G.shifted({x:2,y:-2})).toBe(false))

test("10,-3 is shifted", () =>
    expect(G.shifted({x:10,y:-3})).toBe(true))

test("0,0 on single-cell grid has no adjacents", () =>
    expect(G.adjacent({x:0,y:0}, 1)).toEqual([]));

test("0,0 has two adjacents", () => 
    expect(G.adjacent({x:0,y:0}, 10)).toEqual([
        {x:0,y:1},
        {x:1,y:0}
    ]))

test("1,0 has four adjacents", () => 
    expect(G.adjacent({x:1,y:0}, 10)).toEqual([
        {x:0,y:0},
        {x:1,y:1},
        {x:2,y:0},
        {x:0,y:1}
    ]))

test("0,1 has five adjacents", () => 
    expect(G.adjacent({x:0,y:1}, 10)).toEqual([
        {x:0,y:0},
        {x:0,y:2},
        {x:1,y:1},
        {x:1,y:0},
        {x:1,y:2}
    ]))

test("1,1 has six adjacents", () => 
    expect(G.adjacent({x:1,y:1}, 10)).toEqual([
        {x:0,y:1},
        {x:1,y:0},
        {x:1,y:2},
        {x:2,y:1},
        {x:2,y:0},
        {x:2,y:2}
    ]))

test("-1,0 not valid", () =>
    expect(G.valid(10)({x:-1,y:0})).toBe(false));

test("0,0 is valid", () => 
    expect(G.valid(10)({x:0,y:0})).toBe(true));

test("0,-1 is not valid", () =>
    expect(G.valid(10)({x:0,y:-1})).toBe(false));

test("0,10 is valid on grid size 20", () =>
    expect(G.valid(20)({x:0,y:10})).toBe(true));
    
test("0,10 is not valid on grid size 10", () =>
    expect(G.valid(10)({x:0,y:10})).toBe(false));

test("10,0 is valid on grid size 20", () =>
    expect(G.valid(20)({x:10,y:0})).toBe(true));
    
test("10,0 is not valid on grid size 10", () =>
    expect(G.valid(10)({x:10,y:0})).toBe(false));