import type { DistrictName } from '../model/names';
import type { RecruitEffect } from '../model/cult/recruit';
import type { District } from '../model/districts';
import type { LocationView } from './locations';

export type DistrictView = {
    readonly id : number
    // Index of the location among the seen locations, -1 if 
    // the location of this district was not seen yet 
    readonly location : number
    readonly name : DistrictName
    readonly population : number
    readonly cultpop : number
    readonly cultrecruit : RecruitEffect|undefined
}

export function district(d: District, ls: LocationView[]): DistrictView {
    
    return {
        id: d.id,
        location: ls.findIndex(l => l.cell == d.location.cell),
        name: d.name,
        cultpop: d.cultpop,
        population: d.population,
        cultrecruit: d.recruit
    }
}