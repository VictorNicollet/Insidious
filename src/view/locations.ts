import type { LocationName } from '../model/names';
import type { Cell } from '../model/grid';
import type { Location } from '../model/locations';
import type { CellKind } from '../model/map';

export type LocationView = {
    readonly id : number
    readonly name : LocationName
    readonly cell : Cell
    readonly cellKind : CellKind
    readonly population : number
    readonly cultpop : number
    readonly information : number
    readonly agents : readonly number[]
    readonly districts : readonly number[]
}

export function location(l: Location, id: number): LocationView {
    
    const agents : number[] = []
    const worldAgents = l.world.agents()
    for (let i = 0; i < worldAgents.length; ++i) 
        if (worldAgents[i].cell == l.cell) agents.push(i)
    
    const districts : number[] = []
    for (const d of l.districts) districts.push(d.id);

    return {
        id,
        name: l.name,
        cell: l.cell,
        cellKind: l.world.map.cells[l.cell],
        cultpop: l.cultpop,
        population: l.population,
        information: l.information,
        agents,
        districts
    }
}