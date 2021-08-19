import { location, LocationView } from "./locations"
import { agent, AgentView } from "./agents"
import { map, MapView } from "./map"
import type { World } from '../model/world'
import type { Cell } from 'model/grid'
import type { ResourcesOf } from 'model/resources'
import type { Explained } from 'model/explainable'
import type { Routes } from 'model/routes'
import { Message } from 'model/message'

export type WorldView = {
    readonly locations: readonly LocationView[]
    readonly agents: readonly AgentView[]
    readonly map: MapView
    readonly initial: Cell
    readonly resources: ResourcesOf<{ current: number, daily: Explained }>
    readonly routes : Routes
    // Agents that need orders
    readonly needOrders: readonly AgentView[]
    // Reference to the model. This is a mutable class, so don't use it
    // or its fields for anything involving memoization.
    readonly world: World
    // The message to be displayed as a modal, if any.
    readonly message: Message|undefined
}

export function world(w: World): WorldView {
    const locations = w.seenLocations
    const agents = w.agents().map(agent)

    // We subtract the 'once' delta from the available resources, to 
    // take into account the cost of orders that are given but not yet
    // executed. This means: 
    //  - the order's cost is "paid" as soon as it is selected (and
    //    thus can be rejected if too costly)
    //  - the order's cost is "refunded" if another order is given in
    //    the same turn
    const delta = w.resourceDelta();
    const resources = {
        gold: {
            current: w.resources.gold + delta.gold.once,
            daily: delta.gold.daily
        },
        touch: {
            current: w.resources.touch + delta.touch.once,
            daily: delta.touch.daily
        }
    }

    return {
        world: w,
        locations: locations.map(location),
        agents,
        map: map(w.map),
        initial: locations[0].cell,
        routes: w.routes(),
        message: w.firstMessage(),
        needOrders: agents.filter(a => a.order.progress >= a.order.difficulty.value),
        resources
    }
}