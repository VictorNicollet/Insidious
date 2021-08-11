import { LocationName } from '../model/names';
import { Cell } from '../model/grid';
import { Location } from '../model/locations';
import { CellKind } from 'model/map';

export type LocationView = {
    readonly name : LocationName
    readonly cell : Cell
    readonly cellKind : CellKind
    readonly population : number
    readonly agents : readonly number[]
}

export function location(l: Location): LocationView {
    
    const agents : number[] = []
    const worldAgents = l.world.agents()
    for (let i = 0; i < worldAgents.length; ++i) 
        if (worldAgents[i].cell == l.cell) agents.push(i)
    
    return {
        name: l.name,
        cell: l.cell,
        cellKind: l.world.map.cells[l.cell],
        population: l.population,
        agents
    }
}