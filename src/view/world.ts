import { location, LocationView } from "./locations"
import { agent, AgentView } from "./agents"
import { map, MapView } from "./map"
import { World } from '../model/world'
import { Cell } from 'model/grid'
import { ResourcesOf } from 'model/resources'
import { Stat, toStat, StatReason } from 'model/stats'

export type WorldView = {
    readonly locations: readonly LocationView[]
    readonly agents: readonly AgentView[]
    readonly map: MapView
    readonly initial: Cell
    readonly resources: ResourcesOf<{ current: number, daily: Stat }>
}

function dailyGold(w: World): Stat {
    
    let undercover = 0;
    for (let a of w.agents())
        undercover += a.stats.idleIncome.value;

    const reasons: StatReason[] = [
        { why: "Undercover agents", contrib: undercover },
    ];

    return toStat(reasons);

}

export function world(w: World): WorldView {
    const locations = w.seenLocations
    const resources = {
        gold: {
            current: w.resources.gold,
            daily: dailyGold(w)
        },
        touch: {
            current: w.resources.touch,
            daily: { value: 0.1, reasons: [{ why: "Base", contrib: 0.1 }]}
        }
    }
    return {
        locations: locations.map(location),
        agents: w.agents().map(agent),
        map: map(w.map),
        initial: locations[0].cell,
        resources
    }
}