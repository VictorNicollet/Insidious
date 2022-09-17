import { Pack, obj, string, option } from './serialize'

export type LocationName = {
    // 'Paris'
    readonly short : string
    // 'the city of Paris' 
    readonly long : string
    // 'Parisian'
    readonly adjective : string
}

export const pack_locationName : Pack<LocationName> = obj<LocationName>({
    short: string,
    long: string,
    adjective: string,
})

export type PersonName = {
    // "John H. Smith" 
    readonly full : string
    // "Earl of Wiggleton"
    readonly title? : string
    // "Earl Smith"
    readonly short : string
}

export const pack_personName : Pack<PersonName> = obj<PersonName>({
    full: string,
    title: option(string),
    short: string,
})

export type DistrictName = {
    short: string
}

export const pack_districtName : Pack<DistrictName> = obj<DistrictName>({
    short: string,
});
