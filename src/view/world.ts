import { location, LocationView } from "./locations"
import { agent, AgentView } from "./agents"
import { map, MapView } from "./map"
import { World } from '../model/world'
import { Cell } from 'model/grid'

export type WorldView = {
    readonly locations: readonly LocationView[]
    readonly agents: readonly AgentView[]
    readonly map: MapView
    readonly initial: Cell
}

export function world(w: World): WorldView {
    const locations = w.seenLocations
    return {
        locations: locations.map(location),
        agents: w.agents().map(agent),
        map: map(w.map),
        initial: locations[0].cell
    }
}