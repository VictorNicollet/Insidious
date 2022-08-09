// Execution mode of jest doesn't expose TextEncoder/TextDecoder by default...
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

import * as S from "./serialize"

function writeAndRead<T>(value: T, pack: S.Pack<T>): T {
    const writer = new S.Writer();
    pack[0](writer, value);
    return pack[1](new S.Reader(writer.toArray()));
}

function check<T>(value: T, pack: S.Pack<T>): void {
    const result = writeAndRead(value, pack);
    expect(result).toEqual(value);
}

test("int7(0)", () => check(0, S.int7));
test("int7(1)", () => check(1, S.int7));
test("int7(127)", () => check(127, S.int7));
test("int7(128)", () => check(128, S.int7));
test("int7(256)", () => check(256, S.int7));
test("int7(65536)", () => check(65536, S.int7));

test("float(0)", () => check(0, S.float));
test("float(1)", () => check(1, S.float));

test("float(3.5)", () => check(3.5, S.float));
test("float(-0.5)", () => check(-0.5, S.float));

test("boolean(false)", () => check(false, S.boolean));
test("boolean(true)", () => check(true, S.boolean));

test("string('')", () => check('', S.string));
test("string('hello')", () => check('hello', S.string));
test("string('é€')", () => check('é€', S.string));
test("string('🟥')", () => check('🟥', S.string));

test("array(string)([])", () => check([], S.array(S.string)));
test("array(string)([''])", () => check([''], S.array(S.string)));
test("array(string)(['hello'])", () => check(['hello'], S.array(S.string)));
test("array(string)(['é€'])", () => check(['é€'], S.array(S.string)));
test("array(string)(['🟥'])", () => check(['🟥'], S.array(S.string)));
test("array(string)(['', ''])", () => check(['', ''], S.array(S.string)));
test("array(string)(['hello', 'world'])", () => check(['hello', 'world'], S.array(S.string)));
test("array(string)(['🟥', '🟥'])", () => check(['🟥', '🟥'], S.array(S.string)));
test("array(string)(['a', 'b', 'c'])", () => check(['a', 'b', 'c'], S.array(S.string)));

test("array(int7)([])", () => check([], S.array(S.int7)));
test("array(int7)([0])", () => check([0], S.array(S.int7)));
test("array(int7)([127])", () => check([127], S.array(S.int7)));
test("array(int7)([128])", () => check([128], S.array(S.int7)));
test("array(int7)([128, 65536])", () => check([128, 65536], S.array(S.int7)));

type Triple = {
    readonly a : number
    readonly b : string
    readonly c : readonly number[]
}

const triple = S.obj<Triple>({
    a: S.int7,
    b: S.string,
    c: S.array(S.int7)
});

test("object({a: 0, b: '', c: []})", () => check({a: 0, b: '', c: []}, triple));
test("object({a: 128, b: 'hello', c: [1]})", () => check({a: 128, b: 'hello', c: [1]}, triple));
test("object({a: 65536, b: '🟥', c: [1, 10, 100, 1000, 10000, 100000]})", () => check({a: 65536, b: '🟥', c: [1, 10, 100, 1000, 10000, 100000]}, triple));

type MyEnum = "A" | "B" | "C"
const myEnum = S.enm<MyEnum>(["A", "B", "C"]);

test("enum('A')", () => check('A', myEnum));
test("enum('B')", () => check('B', myEnum));
test("enum('C')", () => check('C', myEnum));

const built = S.build<Triple>()
    .pass("b", S.string)
    .pass("c", S.array(S.int7))
    .call((b, c) => ({ a: c.length, b, c }));

test("built({a: 0, b: '', c: []}", () => check({a: 0, b: '', c: []}, built));
test("built({a: 1, b: 'hello', c: [1]}", () => check({a: 1, b: 'hello', c: [1]}, built));

type Mutable = {
    readonly a : number
    b : string
    c : number
}

const mutate = S.build<Mutable>()
    .self(b => b
        .pass("a", S.int7)
        .call((a) => ({a, b: "", c: 0})))
    .pass("b", S.string)
    .call((m: Mutable, b: string) => {
        m.b = b;
        m.c = m.a + b.length;
        return m;
    });

test("mutate({a: 0, b: '', c: 0})", () => check({a: 0, b: '', c: 0}, mutate));
test("mutate({a: 1, b: 'hello', c: 6})", () => check({a: 1, b: 'hello', c: 6}, mutate));

test("uint16array", () => {
    const bigArray = new Uint16Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10000, 20000, 30000, 40000, 50000, 60000]);
    const sourceArray = bigArray.subarray(1, bigArray.length - 1);
    const resultArray = writeAndRead(sourceArray, S.uint16array);
    expect([...resultArray]).toEqual([...sourceArray]);
});

test("float32array", () => {
    const bigArray = new Float32Array([1, 0.1, 0.01, 0.001, 0.0001, 10, 100, 1000, 10000]);
    const sourceArray = bigArray.subarray(1, bigArray.length - 1);
    const resultArray = writeAndRead(sourceArray, S.float32array);
    expect([...resultArray]).toEqual([...sourceArray]);
});

type KindA = {
    x: number,
    y: number
}

type KindB = {
    y: string,
    z: string
}

type Kinds = ({ kind: "A" } & KindA) | ({ kind: "B" } & KindB)

const pack_kinds : S.Pack<Kinds> = 
    S.union<"A", KindA>("A", {x: S.int7, y: S.int7})
        .or<"B", KindB>("B", {y: S.string, z: S.string})
        .pack();

test("union({kind:'A', x:1337, y:65536})", () => check({kind: "A", x: 1337, y: 65536}, pack_kinds));
test("union({kind:'B', y:'hello', z:'world'})", () => check({kind: "B", y: 'hello', z: 'world'}, pack_kinds));