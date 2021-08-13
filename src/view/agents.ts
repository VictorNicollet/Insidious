import type { PersonName } from '../model/names';
import type { Agent } from "../model/agents"
import type { Occupation, ByOccupation } from 'model/occupation';
import type { Stats } from 'model/stats';

export type AgentView = {
    readonly id: number
    readonly name: PersonName
    readonly cell: number
    readonly occupation: Occupation
    readonly levels: Readonly<ByOccupation<number>>
    readonly stats: Readonly<Stats>
}

export function agent(a: Agent, id: number): AgentView {
    return {
        id,
        name: a.name,
        cell: a.cell,
        occupation: a.occupation,
        levels: {...a.levels},
        stats: a.stats
    }
}