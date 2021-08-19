import * as O from './orders'

test("Undercover has one day", () =>
    expect(O.daysRemaining(O.undercover)).toBe(1));

test("No progress: 12 = 12", () =>
    expect(O.daysRemaining({
        kind: "undercover",
        difficulty: { value: 12, reasons: [] },
        exposure: { value: 1, reasons: [] },
        progress: 0
    })).toBe(12));

test("Remainder: 12-4 = 8", () =>
    expect(O.daysRemaining({
        kind: "undercover",
        difficulty: { value: 12, reasons: [] },
        exposure: { value: 3, reasons: [] },
        progress: 4
    })).toBe(8));