export function objmap<T extends {}, U>(
    obj: T,
    f: (t: T[keyof(T)]) => U
): {readonly [key in keyof(T)]: U} {
    const ret : {[key in keyof(T)]: U} = {} as any;
    for (let prop in obj) ret[prop] = f(obj[prop]);
    return ret;
}
