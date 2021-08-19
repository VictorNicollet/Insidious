import { LocationName } from '../model/names';
import { Cell } from '../model/grid';
import { Location } from '../model/locations';
import { CellKind } from 'model/map';

export type LocationView = {
    readonly id : number
    readonly name : LocationName
    readonly cell : Cell
    readonly cellKind : CellKind
    readonly population : number
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
        population: l.population,
        information: l.information,
        agents
    }
}