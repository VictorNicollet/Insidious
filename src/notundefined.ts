// Eliminates all 'undefined' values from an array.
export function notUndefined<T>(array: readonly (T | undefined)[]): readonly T[] {
    return array.filter(t => typeof t != "undefined") as T[];
}