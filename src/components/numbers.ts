export function integer(n: number) {
    // Separator is a narrow non-breaking space \u202F
    return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function population(pop: number) {
    return integer(Math.floor(pop));
}

export function decimal(n: number): string {
    let i = 0;
    for (let m = 1; i < 15; ++i, m *= 10) {
        if (m * n - Math.floor(m * n) < 0.001)
            break;
    }
    return n.toFixed(i);
}