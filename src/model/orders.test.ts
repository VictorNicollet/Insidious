import * as O from './orders'

test("Undercover has one day", () =>
    expect(O.daysRemaining(O.undercover)).toBe(1));

test("Clean division: 12/3 = 4", () =>
    expect(O.daysRemaining({
        kind: "undercover",
        difficulty: { value: 12, reasons: [] },
        speed: { value: 3, reasons: [] },
        accumulated: 0
    })).toBe(4));

test("Remainder: (12-4)/3 = 3", () =>
    expect(O.daysRemaining({
        kind: "undercover",
        difficulty: { value: 12, reasons: [] },
        speed: { value: 3, reasons: [] },
        accumulated: 4
    })).toBe(3));