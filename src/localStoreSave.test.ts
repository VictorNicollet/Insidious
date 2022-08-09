import { lzwDecode, lzwEncode } from "./localStoreSave";

test("Empty", () => 
    expect(lzwEncode(new Uint8Array(0))).toBe("0;"));

test("0 0 0 0 0 0", () => 
    expect(lzwEncode(new Uint8Array([0, 0, 0, 0, 0, 0]))).toBe("6;\u0000\u0000\u0100\u0000\u0000"));

test("0 1 0 1 0 1", () => 
    expect(lzwEncode(new Uint8Array([0, 1, 0, 1, 0, 1]))).toBe("6;\u0000\u0001\u0100\u0000\u0001"));
    
test("0 1 0 1 1 0 1 1", () => 
    expect(lzwEncode(new Uint8Array([0, 1, 0, 1, 1, 0, 1, 1]))).toBe("8;\u0000\u0001\u0100\u0001\u0101"));

function encodeDecode(a: Uint8Array) {
    const b = lzwDecode(lzwEncode(a));
    expect([...b]).toEqual([...a]);
}

test("full Empty", () => encodeDecode(new Uint8Array(0)));
test("full 0 0 0 0 0 0", () => encodeDecode(new Uint8Array([0, 0, 0, 0, 0, 0])));
test("full 0 1 0 1 0 1", () => encodeDecode(new Uint8Array([0, 1, 0, 1, 0, 1])));
test("full 0 1 0 1 1 0 1 1", () => encodeDecode(new Uint8Array([0, 1, 0, 1, 1, 0, 1, 1])));
test("full complex", () => encodeDecode(new Uint8Array([0, 1, 25, 1, 1, 64, 1, 256])));