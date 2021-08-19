export function integer(n: number) {
    if (n == Number.POSITIVE_INFINITY) return "∞";
    // Separator is a narrow non-breaking space \u202F
    return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function days(n: number) {
    return integer(n) + (n == 1 ? " day" : " days");
}

export function population(pop: number, info: number) {
    if (info == 0) return "Unknown";
    if (info == 1) {
        if (pop < 100) return "Tens";
        if (pop < 1000) return "Hundreds";
        if (pop < 10000) return "Thousands";
        if (pop < 100000) return "Tens of thousands";
        return "Over a hundred thousand";
    }
    return integer(Math.floor(pop));
}

export function decimal(n: number): string {
    let i = 0;
    for (let m = 1; i < 15; ++i, m *= 10) {
        if (Math.abs(m * n - Math.round(m * n)) < 0.001)
            break;
    }
    return n.toFixed(i);
}

// Like 'decimal', but always with a '+' or '-' in front of
// the number (to represent a variation)
export function signedDecimal(n: number): string {
    return (n >= 0 ? "+" : "") + decimal(n);
}