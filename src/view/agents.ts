import { PersonName } from '../model/names';
import { Agent } from "../model/agents"

export type AgentView = {
    readonly id: number
    readonly name: PersonName
    readonly cell: number
}

export function agent(a: Agent, id: number): AgentView {
    return {
        id,
        name: a.name,
        cell: a.cell
    }
}