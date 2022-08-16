import type { LocationName } from '../model/names';
import type { Cell } from '../model/grid';
import type { Location } from '../model/locations';
import type { CellKind } from '../model/map';
import type { RecruitEffect } from '../model/cult/recruit';

export type LocationView = {
    readonly id : number
    readonly name : LocationName
    readonly cell : Cell
    readonly cellKind : CellKind
    readonly population : number
    readonly cultpop : number
    readonly cultrecruit : RecruitEffect|undefined
    readonly information : number
    readonly agents : readonly number[]
}

export function location(l: Location, id: number): LocationView {
    
    const agents : number[] = []
    const worldAgents = l.world.agents()
    for (let i = 0; i < worldAgents.length; ++i) 
        if (worldAgents[i].cell == l.cell) agents.push(i)
    
    return {
        id,
        name: l.name,
        cell: l.cell,
        cellKind: l.world.map.cells[l.cell],
        cultpop: l.cultpop,
        cultrecruit: l.recruit,
        population: l.population,
        information: l.information,
        agents
    }
}