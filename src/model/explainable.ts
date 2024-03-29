import { notUndefined } from '../notundefined';
import { array, float, obj, option, Pack, string } from './serialize';

// An explainable numeric value.
export type Explained = {
    // The final value. 
    readonly value: number

    // The multiplier ; when provided, will represent a 
    // formula 'value = multiplier * (1 + reason1 + reason2)'
    readonly multiplier?: number

    // The individual components which are added together
    readonly reasons: readonly Reason[]
}

export type Reason = {

    // Human-readable explanation of why this component is present
    // and has this value
    readonly why : string

    // The contribution of this component to the explained number
    readonly contrib : number
}

// Produce an explained value using a sum of resons.
export function explain(optReasons: readonly (Reason|undefined)[], multiplier?: number, minimum?: number): Explained {
    const reasons = notUndefined(optReasons)
    let value = 0;
    for (let reason of reasons) value += reason.contrib;
    if (typeof multiplier === "undefined") 
        return {value, reasons}
    value = multiplier * (1 + value);
    if (typeof minimum !== "undefined")
        value = Math.max(minimum, value);
    return {value, reasons, multiplier}
}

// De-duplicate the 'why' in a list of reasons, producing a (likely)
// shorter list of reasons where every explanation appears exactly
// once (in the position of its first occurrence in the original list).
export function dedup(reasons: readonly Reason[]): readonly Reason[] {
    const byWhy : { [key: string]: number } = {};
    for (let reason of reasons) {
        byWhy[reason.why] = (byWhy[reason.why] || 0) + reason.contrib;
    }
    const returned : Reason[] = [];
    for (let why in byWhy) returned.push({ why, contrib: byWhy[why] })
    return returned;
}

export const pack_reason : Pack<Reason> = obj<Reason>({
    why: string,
    contrib: float
})

export const pack_explained : Pack<Explained> = obj<Explained>({
    value: float,
    multiplier: option(float),
    reasons: array(pack_reason)
})
