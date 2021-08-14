import { location, LocationView } from "./locations"
import { agent, AgentView } from "./agents"
import { map, MapView } from "./map"
import { World } from '../model/world'
import { Cell } from 'model/grid'
import { ResourcesOf } from 'model/resources'
import { Explained } from 'model/explainable'

export type WorldView = {
    readonly locations: readonly LocationView[]
    readonly agents: readonly AgentView[]
    readonly map: MapView
    readonly initial: Cell
    readonly resources: ResourcesOf<{ current: number, daily: Explained }>
}

export function world(w: World): WorldView {
    const locations = w.seenLocations
    const daily = w.dailyResources();
    const resources = {
        gold: {
            current: w.resources.gold,
            daily: daily.gold
        },
        touch: {
            current: w.resources.touch,
            daily: daily.touch
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