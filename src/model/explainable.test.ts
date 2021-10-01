import * as E from "./explainable"

test("empty", () => 
    expect(E.explain([])).toEqual({
        value: 0,
        reasons: []
    }))

test("empty(multiplier)", () =>
    expect(E.explain([], 2)).toEqual({
        value: 2,
        reasons: [],
        multiplier: 2
    }))

test("empty(minimum)", () => 
    expect(E.explain([], 1, 2)).toEqual({
        value: 2,
        reasons: [],
        multiplier: 1
    }))

test("single", () => {
    const reason = { why: "A", contrib: 5 };
    expect(E.explain([reason])).toEqual({
        value: 5,
        reasons: [reason]
    })
});

test("single(multiplier)", () => {
    const reason = { why: "A", contrib: -0.5 };
    expect(E.explain([reason], 2)).toEqual({
        value: 1,
        reasons: [reason],
        multiplier: 2
    })
})

test("single(minimum)", () => {
    const reason = { why: "A", contrib: -2 };
    expect(E.explain([reason], 1, 0)).toEqual({
        value: 0,
        reasons: [reason],
        multiplier: 1
    })
})

test("undefined", () => {
    const reason = { why: "A", contrib: 5 };
    expect(E.explain([undefined,reason])).toEqual({
        value: 5,
        reasons: [reason]
    })
});

test("undefined(multiplier)", () => {
    const reason = { why: "A", contrib: -0.5 };
    expect(E.explain([reason,undefined], 2)).toEqual({
        value: 1,
        reasons: [reason],
        multiplier: 2
    })
})

test("undefined(minimum)", () => {
    const reason = { why: "A", contrib: -2 };
    expect(E.explain([undefined,reason,undefined], 1, 0)).toEqual({
        value: 0,
        reasons: [reason],
        multiplier: 1
    })
})

test("double", () => {
    const a = { why: "A", contrib: 5 };
    const b = { why: "A", contrib: -3 };
    expect(E.explain([a,b])).toEqual({
        value: 2,
        reasons: [a,b]
    })
});

test("double(multiplier)", () => {
    const a = { why: "A", contrib: -0.5 };
    const b = { why: "B", contrib: 1 }
    expect(E.explain([b,a], 2)).toEqual({
        value: 3,
        reasons: [b,a],
        multiplier: 2
    })
})

test("double(minimum)", () => {
    const a = { why: "A", contrib: -2 };
    const b = { why: "B", contrib: 1 }
    expect(E.explain([a,b], 1, 0)).toEqual({
        value: 0,
        reasons: [a,b],
        multiplier: 1
    })
})

test("dedup", () => 
    expect(E.dedup([
        { why: "A", contrib: 1 },
        { why: "C", contrib: 3 },
        { why: "B", contrib: 2 },
        { why: "A", contrib: 4 },
        { why: "C", contrib: 5 },
        { why: "A", contrib: 6 }
    ])).toEqual([
        { why: "A", contrib: 1 + 4 + 6 },
        { why: "C", contrib: 3 + 5 },
        { why: "B", contrib: 2 }
    ]))