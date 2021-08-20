// An indexed array is both an array (allows random access and listing values)
// and a way to access values by their internal identifier.
export type IdxArray<T extends {id: number}> = ReadonlyArray<T> & { idx: (id: number) => T|undefined }

export function index<T extends {id: number}>(array: T[]): IdxArray<T> {
    const indexed = (array as any) as IdxArray<T>;
    const byId = {};
    for (let t of indexed) byId[t.id] = t;
    indexed.idx = function(id: number): T|undefined { return byId[id] }
    return indexed;
}