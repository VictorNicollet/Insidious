import { location, LocationView } from "./locations"
import { agent, AgentView } from "./agents"
import { map, MapView } from "./map"
import { World } from '../model/world'

export type WorldView = {
    readonly locations: readonly LocationView[]
    readonly agents: readonly AgentView[]
    readonly map: MapView
}

export function world(w: World): WorldView {
    return {
        locations: w.locations().map(location),
        agents: w.agents().map(agent),
        map: map(w.map)
    }
}