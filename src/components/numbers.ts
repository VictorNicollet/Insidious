export function integer(n: number) {
    // Separator is a narrow non-breaking space \u202F
    return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function population(pop: number) {
    return integer(Math.floor(pop));
}