import * as N from './numbers'

test("integer(0)", () =>
    expect(N.integer(0)).toBe("0"))

test("integer(10)", () => 
    expect(N.integer(10)).toBe("10"))

test("integer(1234)", () => 
    expect(N.integer(1234)).toBe("1 234"))