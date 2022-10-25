import { location, LocationView } from "./locations"
import { district, DistrictView } from "./districts"
import { agent, AgentView } from "./agents"
import { map, MapView } from "./map"
import type { World } from '../model/world'
import type { Cell } from '../model/grid'
import type { ResourcesOf } from '../model/resources'
import type { Explained } from '../model/explainable'
import type { Routes } from '../model/routes'
import { Message } from '../model/message'
import { PlanView, plan } from './plans'
import { IdxArray, index } from '../idindexed'
import { CultView, cult } from "./cult"

export type WorldView = {
    // All visible locations
    readonly locations: readonly LocationView[]
    // All districts (including those not visible yet). 
    readonly districts: readonly DistrictView[]
    readonly agents: IdxArray<AgentView>
    readonly plans: IdxArray<PlanView>
    readonly map: MapView
    readonly cult: CultView|undefined
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
    const locations = w.seenLocations.map(location)
    const districts = w.districts()
    const agents = index(w.agents().map(agent))

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
        locations,
        districts: districts.map(d => district(d, locations)),
        agents,
        map: map(w, w.map),
        cult: cult(w, agents),
        initial: locations[0].cell,
        routes: w.routes(),
        plans: index(w.plans().map(plan)),
        message: w.firstMessage(),
        needOrders: agents.filter(a => a.order.progress >= a.order.difficulty.value),
        resources
    }
}