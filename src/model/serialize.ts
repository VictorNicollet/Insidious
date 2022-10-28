export class Writer {    
    private readonly buffers: Uint8Array[]
    private inBuffers : number
    private buffer : Uint8Array
    private pos : number
    
    // Total size written so far. 
    public get size() { return this.inBuffers + this.pos; }

    constructor() {
        this.buffers = []
        this.buffer = new Uint8Array(1024);
        this.pos = 0;
        this.inBuffers = 0;
    }

    public byte(byte: number) {
        this.buffer[this.pos] = byte;
        if (++this.pos >= this.buffer.length) {
            this.buffers.push(this.buffer);
            this.inBuffers += this.pos;
            this.buffer = new Uint8Array(1024);
            this.pos = 0;
        }
    }

    public bytes(range: Uint8Array, align = 1) {
        
        // If an alignment is requested, write zero bytes until aligned
        while(this.size % align != 0) 
            this.byte(0);

        if (range.length == 0) 
            return;

        if (this.pos == 0) {
            this.buffers.push(range);
            this.inBuffers += range.length;
        } else if (this.pos + range.length < this.buffer.length) {
            this.buffer.set(range, this.pos);
            this.pos += range.length;
        } else {
            this.buffers.push(this.buffer.slice(0, this.pos));
            this.inBuffers += this.pos;
            this.pos = 0;
            this.buffers.push(range);
            this.inBuffers += range.length;
        }
    }

    public toArray(): Uint8Array {

        if (this.pos > 0) {
            this.buffers.push(this.buffer.slice(0, this.pos));
            this.pos = 0;
        }

        if (this.buffers.length == 0)
            return new Uint8Array(0);

        if (this.buffers.length == 1)
            return this.buffers[0];
        
        let totalBytes = 0;
        for (const buf of this.buffers) 
            totalBytes += buf.byteLength;
        
        const result = new Uint8Array(totalBytes);
        let offset = 0;
        for (const buf of this.buffers) {
            result.set(buf, offset);
            offset += buf.byteLength;
        }

        return result;
    }
}

export class Reader {
    public pos : number

    constructor(private readonly buffer : Uint8Array) {
        this.pos = 0;
    }

    public byte(): number {
        return this.buffer[this.pos++];
    }

    public bytes(count: number, align = 1) {
        // If an alignment is requested, skip bytes until aligned
        while ((this.pos % align) != 0) ++this.pos;
        const start = this.pos;
        this.pos += count;
        return this.buffer.slice(start, this.pos);
    } 
}

// Logic for packing and unpacking a given type
export type Pack<T> = [
    /* write */ (writer: Writer, value: T) => void,
    /* read  */ (reader: Reader) => T
]

// Lens for a 7-bit encoded integer
function int7write(writer: Writer, value: number) {
    while (value > 0x7F) {
        writer.byte((value & 0x7F) | 0x80);
        value >>= 7;
    }
    writer.byte(value);
}

function int7read(reader: Reader) {
    const pos = reader.pos;
    let value = 0;
    let shift = 0;
    while (true) {
        const byte = reader.byte();
        value |= (byte & 0x7F) << shift;
        if (byte <= 0x7F) return value;
        shift += 7;
    }
}

export const int7 : Pack<number> = [int7write, int7read];

// Lens for a floating-point number
const asFloat = new Float32Array(1);
const asUint8 = new Uint8Array(asFloat.buffer);
export const float : Pack<number> = [
    function(writer: Writer, value: number) {
        asFloat[0] = value;
        writer.byte(asUint8[0]);
        writer.byte(asUint8[1]);
        writer.byte(asUint8[2]);
        writer.byte(asUint8[3]);
    },
    function(reader:Reader) {
        asUint8[0] = reader.byte();
        asUint8[1] = reader.byte();
        asUint8[2] = reader.byte();
        asUint8[3] = reader.byte();
        return asFloat[0];
    }
]

// Lens for a boolean
export const boolean : Pack<boolean> = [
    function(writer: Writer, b: boolean) { writer.byte(b ? 1 : 0) },
    function(reader: Reader) { return !!reader.byte() }]

// Lens for a string, as byte count (int7) followed by UTF-8 bytes
function stringWrite(writer: Writer, value: string) {
    const encoded = new TextEncoder().encode(value);
    int7write(writer, encoded.byteLength);
    writer.bytes(encoded);
}

function stringRead(reader: Reader) {
    return new TextDecoder().decode(reader.bytes(int7read(reader)));
}

export const string : Pack<string> = [stringWrite, stringRead]

// Lens for an array of a value type, serialized as an initial 
// length followed by the elements.
export function array<T>(element: Pack<T>) : Pack<readonly T[]> {
    return [
        function(writer: Writer, value: readonly T[]) {
            int7write(writer, value.length);
            for (const v of value)
                element[0](writer, v);
        },
        function(reader: Reader) {
            const length = int7read(reader);
            const result : T[] = [];
            while (result.length < length) 
                result.push(element[1](reader));
            return result;
        }
    ]
}

// Like 'array' but for non-readonly arrays
export function rwarray<T>(element: Pack<T>) : Pack<T[]> {
    return [
        function(writer: Writer, value: T[]) {
            int7write(writer, value.length);
            for (const v of value)
                element[0](writer, v);
        },
        function(reader: Reader) {
            const length = int7read(reader);
            const result : T[] = [];
            while (result.length < length) 
                result.push(element[1](reader));
            return result;
        }
    ]
}

// Serializing pairs of values
export function pair<T1, T2>(fst: Pack<T1>, snd: Pack<T2>): Pack<[T1, T2]> {
    return [
        function(writer: Writer, [f, s]: [T1, T2]) {
            fst[0](writer, f);
            snd[0](writer, s);
        }, 
        function(reader: Reader): [T1, T2] {
            return [ fst[1](reader), snd[1](reader) ]
        }
    ]
}

export const uint16array : Pack<Uint16Array> = [
    function(writer: Writer, array: Uint16Array) {
        int7write(writer, array.length);
        writer.bytes(
            new Uint8Array(array.buffer, array.byteOffset, array.byteLength),
            /* align */ 2);
    },
    function(reader: Reader) {
        const bytes = reader.bytes(
            /* sizeof(uint16) */ 2 * int7read(reader),
            /* align */ 2);
        return new Uint16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
    }
]

export const float32array : Pack<Float32Array> = [
    function(writer: Writer, array: Float32Array) {
        int7write(writer, array.length);
        writer.bytes(
            new Uint8Array(array.buffer, array.byteOffset, array.byteLength),
            /* align */ 4);
    },
    function(reader: Reader) {
        const bytes = reader.bytes(
            /* sizeof(float32) */ 4 * int7read(reader),
            /* align */ 4);
        return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
    }
]

export const uint32array : Pack<Uint32Array> = [
    function(writer: Writer, array: Uint32Array) {
        int7write(writer, array.length);
        writer.bytes(
            new Uint8Array(array.buffer, array.byteOffset, array.byteLength),
            /* align */ 4);
    },
    function(reader: Reader) {
        const bytes = reader.bytes(
            /* sizeof(uint32) */ 4 * int7read(reader),
            /* align */ 4);
        return new Uint32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
    }
]

export type ObjPack<T> = {
    readonly [Property in keyof T]: Pack<T[Property]>
}

type OrUndefined<T> = {
    [Property in keyof T]?: T[Property]
}

// Lens for an object with a serializer for each property. 
export function obj<T>(pack: ObjPack<T>): Pack<T> {
    return [
        function(writer: Writer, value: T) {
            for (const k in pack)
                pack[k][0](writer, value[k]);
        },
        function(reader: Reader) {
            const result : OrUndefined<T> = {};
            for (const k in pack) 
                result[k] = pack[k][1](reader);
            return result as T;
        }
    ]
}

class Union<TKinds extends string, TUnion extends { readonly kind: TKinds }> {

    constructor(
        public readonly nextid : number,
        public readonly write : (writer: Writer, value: TUnion) => void,
        public readonly read : (id: number, reader: Reader) => TUnion)
    {}

    public or<TKind extends string, TAlt>(tag: TKind, pack: ObjPack<TAlt>) : Union<TKinds | TKind, TUnion | (TAlt & { readonly kind: TKind })> {
        const id = this.nextid;
        const write = this.write;
        const read = this.read;
        return new Union<TKinds | TKind, TUnion | (TAlt & { readonly kind: TKind })>(
            id + 1,
            function(writer: Writer, value: TUnion | (TAlt & { readonly kind: TKind })) {
                if (value.kind !== tag) {
                    const v = value as TUnion;
                    write(writer, v);
                } else {
                    const v = value as TAlt;
                    writer.byte(id);
                    for (const k in pack)
                        pack[k][0](writer, v[k]);
                }
            },
            function(readid: number, reader: Reader) : TUnion | (TAlt & { readonly kind: TKind }) {
                if (readid !== id) return read(readid, reader);
                const result : OrUndefined<TAlt> = {};
                for (const k in pack) 
                    result[k] = pack[k][1](reader);
                (result as TAlt & { kind: TKind }).kind = tag;
                return result as TAlt & { readonly kind: TKind };
            });
    }

    // The pack protocol for this union type
    public pack() : Pack<TUnion> {
        const read = this.read;
        return [this.write, function(reader: Reader) { return read(reader.byte(), reader) }]
    }
}

// Defines a disjoint union type, using property 'kind' as discriminator
export function union<TKind extends string, TUnion>(tag: TKind, pack: ObjPack<TUnion>) : Union<TKind, TUnion & { readonly kind: TKind }> {
    return new Union<TKind, TUnion & { readonly kind: TKind }>(
        1,
        function(writer: Writer, value: TUnion & { readonly kind: TKind }) {
            writer.byte(0);
            const v = value as TUnion;
            for (const k in pack)
                pack[k][0](writer, v[k]);
        },
        function(readid: number, reader: Reader) : TUnion & { readonly kind: TKind } {
            if (readid !== 0) throw ("Unknown read-id " + readid);
            const result : OrUndefined<TUnion> = {};
            for (const k in pack) 
                result[k] = pack[k][1](reader);
            (result as TUnion & { kind: TKind }).kind = tag;
            return result as TUnion & { readonly kind: TKind };
        });
}

// Lens for an enumeration encoded as a single byte value
export function enm<T extends string>(values: readonly T[]): Pack<T> {
    if (values.length > 256) throw "Max enum size is 256"
    const forward = {} as { [Property in T]: number };
    for (let i = 0; i < values.length; ++i) forward[values[i]] = i; 
    return [
        function(writer: Writer, value: T) {
            writer.byte(forward[value]);
        },
        function(reader: Reader) {
            return values[reader.byte()];
        }
    ]
}

// Lens for an optional value
export function option<T>(pack: Pack<T>): Pack<T|undefined> {
    return [
        function(writer: Writer, value: T|undefined) {
            if (typeof value !== "undefined") {
                writer.byte(1);
                pack[0](writer, value);
            } else {
                writer.byte(0);
            }
        },
        function(reader: Reader) {
            return reader.byte() ? pack[1](reader) : undefined;
        }
    ]
}

class CallBuilder<T, TArgs extends unknown[]> {

    constructor(
        private readonly write : readonly ((writer: Writer, value: T) => void)[], 
        private readonly read : readonly ((reader: Reader) => any)[])
    {}

    public pass<TP extends keyof T>(key: TP, pack: Pack<T[TP]>) : CallBuilder<T, [...TArgs, T[TP]]> {
        return new CallBuilder<T, [...TArgs, T[TP]]>(
            [...this.write, (writer: Writer, value: T) => pack[0](writer, value[key])],
            [...this.read, pack[1]]);
    }

    public self(f: (builder: CallBuilder<T, []>) => Pack<T>) : CallBuilder<T, [...TArgs, T]> {
        const lens = f(new CallBuilder<T, []>([], []));
        return new CallBuilder<T, [...TArgs, T]>(
            [...this.write, lens[0]],
            [...this.read, lens[1]]);
    }

    public call(f: (...args: TArgs) => T): Pack<T> {
        const write = this.write;
        const read = this.read;
        return [
            function(writer: Writer, value: T) { 
                for (const w of write) w(writer, value);
            }, 
            function(reader: Reader) {
                // TODO: there is likely a way to type-check this properly
                return f.apply(undefined, read.map(r => r(reader)) as TArgs)
            }
        ]
    }
}

export function build<T>(): CallBuilder<T, []> {
    return new CallBuilder<T, []>([], []);
}

