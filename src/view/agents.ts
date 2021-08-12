import { PersonName } from '../model/names';
import { Agent } from "../model/agents"
import { Occupation, ByOccupation } from 'model/occupation';

export type AgentView = {
    readonly id: number
    readonly name: PersonName
    readonly cell: number
    readonly occupation: Occupation
    readonly levels: Readonly<ByOccupation<number>>
}

export function agent(a: Agent, id: number): AgentView {
    return {
        id,
        name: a.name,
        cell: a.cell,
        occupation: a.occupation,
        levels: {...a.levels}
    }
}