import { PersonName } from '../model/names';
import { Agent } from "../model/agents"

export type AgentView = {
    readonly name: PersonName
    readonly cell: number
}

export function agent(a: Agent): AgentView {
    return {
        name: a.name,
        cell: a.cell
    }
}