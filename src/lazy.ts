// A class that performs lazy evaluation of the provided function.
// This is used to avoid computing the same costly value more than 
// once, while delaying its computation to when it is actually
// needed.
export class Lazy<T>
{
    private _value : T
    private _eval : boolean

    constructor(private readonly _function: () => T) {
        this._value = (undefined as any)
        this._eval = false
    }

    get value() : T {
        if (!this._eval) {
            this._value = this._function.call(undefined);
            this._eval = true;
        }
        return this._value;
    } 
}