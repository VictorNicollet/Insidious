import * as L from "./lazy"

test("lazy returns correct result", () =>
    expect(new L.Lazy(() => 1337).value).toBe(1337));

test("lazy does not eval function if not accessed", () => 
{
    let called = false;
    new L.Lazy(() => { called = true; });
    expect(called).toBe(false);
})

test("lazy evals function once if accessed", () => 
{
    let incr = 0;
    const lazy = new L.Lazy(() => incr++);
    expect(lazy.value).toBe(0);
    expect(lazy.value).toBe(0);
    expect(incr).toBe(1);
})