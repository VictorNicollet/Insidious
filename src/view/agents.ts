import type { PersonName } from '../model/names';
import type { Agent } from "../model/agents"
import type { Occupation, ByOccupation } from 'model/occupation';
import type { Stats } from 'model/stats';
import { Order } from 'model/orders';
import type { TooltipContext } from 'components/Tooltip';

export type AgentView = {
    readonly id: number
    readonly name: PersonName
    readonly cell: number
    readonly occupation: Occupation
    readonly levels: Readonly<ByOccupation<number>>
    readonly stats: Readonly<Stats>
    readonly order: Readonly<Order>
    readonly progress: number
    readonly ctx: TooltipContext
    // The original model object. Mutable, so don't use it, or its properties,
    // for anything around memoization !
    readonly agent: Agent
}

export function agent(a: Agent, id: number): AgentView {
    return {
        id,
        agent: a,
        name: a.name,
        cell: a.cell,
        occupation: a.occupation,
        levels: {...a.levels},
        stats: a.stats,
        order: a.order,
        progress: a.progress,
        ctx: {
            name() { return a.name.short },
            occupation() { return a.occupation },
            location() { return a.location ? a.location.name.short : "Outdoors"},
        }
    }
}
