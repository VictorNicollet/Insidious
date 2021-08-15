import { location, LocationView } from "./locations"
import { agent, AgentView } from "./agents"
import { map, MapView } from "./map"
import type { World } from '../model/world'
import type { Cell } from 'model/grid'
import type { ResourcesOf } from 'model/resources'
import type { Explained } from 'model/explainable'
import type { Routes } from 'model/routes'

export type WorldView = {
    readonly locations: readonly LocationView[]
    readonly agents: readonly AgentView[]
    readonly map: MapView
    readonly initial: Cell
    readonly resources: ResourcesOf<{ current: number, daily: Explained }>
    readonly routes : Routes
    // Reference to the model. This is a mutable class, so don't use it
    // or its fields for anything involving memoization.
    readonly world: World
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
        world: w,
        locations: locations.map(location),
        agents: w.agents().map(agent),
        map: map(w.map),
        initial: locations[0].cell,
        routes: w.routes(),
        resources
    }
}