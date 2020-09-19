import * as T from "./time"

test("time(0, 0).hour is 0", () =>
    expect(new T.Time(0, 0).hour).toBe(0));

test("time(0, 10).hour is 10", () => 
    expect(new T.Time(0, 10).hour).toBe(10))

test("time(0, 0).day is 0", () => 
    expect(new T.Time(0, 0).day).toBe(0))

test("time(10, 0).day is 10", () => 
    expect(new T.Time(10, 0).day).toBe(10));

test("time(0, 24) throws", () =>
    expect(() => new T.Time(0, 24)).toThrow("Hour: 24"));

test("time(0, -1) throws", () => 
    expect(() => new T.Time(0, -1)).toThrow("Hour: -1"));

test("time(0, 0) equals time(0, 0)", () => {
    const a = new T.Time(0, 0);
    const b = new T.Time(0, 0);
    expect(a.equals(b)).toBe(true)
});

test("time(0, 0) does not equal time(0, 1)", () => {
    const a = new T.Time(0, 0);
    const b = new T.Time(0, 1);
    expect(a.equals(b)).toBe(false)
});

test("time(0, 0) does not equals time(1, 0)", () => {
    const a = new T.Time(0, 0);
    const b = new T.Time(1, 0);
    expect(a.equals(b)).toBe(false)
});

test("time(0, 0) is before time(1, 0)", () => {
    const a = new T.Time(0, 0);
    const b = new T.Time(1, 0);
    expect(a.isStrictlyBefore(b)).toBe(true)
});

test("time(0, 0) is before time(0, 1)", () => {
    const a = new T.Time(0, 0);
    const b = new T.Time(0, 1);
    expect(a.isStrictlyBefore(b)).toBe(true)
});

test("time(1, 0) is not before time(0, 1)", () => {
    const a = new T.Time(1, 0);
    const b = new T.Time(0, 1);
    expect(a.isStrictlyBefore(b)).toBe(false)
});

test("time(1, 1) is not before time(1, 1)", () => {
    const a = new T.Time(1, 1);
    const b = new T.Time(1, 1);
    expect(a.isStrictlyBefore(b)).toBe(false)
});

test("time(1, 0) is after time(0, 0)", () => {
    const a = new T.Time(1, 0);
    const b = new T.Time(0, 0);
    expect(a.isStrictlyAfter(b)).toBe(true)
});

test("time(1, 0) is after time(0, 1)", () => {
    const a = new T.Time(1, 0);
    const b = new T.Time(0, 1);
    expect(a.isStrictlyAfter(b)).toBe(true)
});

test("time(0, 1) is after time(0, 0)", () => {
    const a = new T.Time(0, 1);
    const b = new T.Time(0, 0);
    expect(a.isStrictlyAfter(b)).toBe(true)
});

test("time(0, 1) is not after time(1, 0)", () => {
    const a = new T.Time(0, 1);
    const b = new T.Time(1, 0);
    expect(a.isStrictlyAfter(b)).toBe(false)
});

test("time(1, 1) is not after time(1, 1)", () => {
    const a = new T.Time(1, 1);
    const b = new T.Time(1, 1);
    expect(a.isStrictlyAfter(b)).toBe(false)
});

test("time(0, 0) is 1153-08-13", () => {
    const [y, m, d] = new T.Time(0, 0).date;
    expect(y).toBe(1153)
    expect(m).toBe(8)
    expect(d).toBe(13)
});

test("time(0, 0).addHours(10) is time(0, 10)", () => 
    expect(new T.Time(0, 0).addHours(10).equals(new T.Time(0, 10)))
        .toBe(true));

test("time(0, 20).addHours(10) is time(1, 6)", () => 
    expect(new T.Time(0, 20).addHours(10).equals(new T.Time(1, 6)))
        .toBe(true));
        
test("time(0, 20).addHours(34) is time(2, 6)", () => 
    expect(new T.Time(0, 20).addHours(34).equals(new T.Time(2, 6)))
        .toBe(true));
        
test("time(0, 20).addHours(-1) throws", () => 
    expect(() => new T.Time(0, 20).addHours(-1))
        .toThrow("Negative hours: -1"));

test("time(0, 0).addDays(10) is time(10, 0)", () =>
    expect(new T.Time(0, 0).addDays(10).equals(new T.Time(10, 0)))
        .toBe(true));

test("time(0, 13).addDays(10) is time(10, 13)", () =>
    expect(new T.Time(0, 13).addDays(10).equals(new T.Time(10, 13)))
        .toBe(true));
  
test("time(20, 0).addDays(-1) throws", () => 
    expect(() => new T.Time(20, 0).addDays(-1))
        .toThrow("Negative days: -1"));
