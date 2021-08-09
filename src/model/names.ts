export type LocationName = {
    // 'Paris'
    readonly short : string
    // 'the city of Paris' 
    readonly long : string
    // 'Parisian'
    readonly adjective : string
}

export type PersonName = {
    // "John H. Smith" 
    readonly full : string
    // "Earl of Wiggleton"
    readonly title? : string
    // "Earl Smith"
    readonly short : string
}
