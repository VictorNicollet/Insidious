import { Occupation, presenceByLocationKind } from "./occupation";
import type { Location } from './locations';
import type { Agent } from './agents';
import type { Order } from './orders';
import { explain, Reason } from './explainable';
import { Route } from './routes';
import { Cell } from './grid';

// Produces a "recruit-agent" order, or an impossibility message
export function recruitOrder(occupation: Occupation, agent: Agent, location: Location): Order|string {
    const ease = presenceByLocationKind[location.kind][occupation];
    const cellKind = location.world.map.cells[location.cell];

    if (ease === 0) {
        return `!!Cannot recruit a ${occupation} ${cellKind.inThis()}.!!`
    }

    const difficulty = explain([
        {why: "Base", contrib: 2}, 
        {why: `${occupation} ${cellKind.inThis()}`, contrib: 60 / ease}]);

    const multipliers: Reason[] = [
        {why: "Skill", contrib: agent.stats.recruit.value}
    ]

    if (agent.occupation == occupation)
        multipliers.push({why: "Same occupation", contrib: agent.stats.recruit.value});

    const speed = explain(multipliers, 2)

    return {
        kind: "recruit-agent",
        occupation,
        difficulty,
        speed,
        accumulated: 0
    }
}

// Produces a "travel" order along the specified route
export function travelOrder(agent: Agent, route: Route): Order|string {
    
    const cells = agent.world.map.cells;

    let offset = 0
    let path : [number,Cell][] = []
    for (let cell of route.steps) {
        path.push([offset, cell]);
        offset += cells[cell].difficulty;
    }   

    return {
        kind: "travel",
        sail: route.sail,
        difficulty: explain([{why: "Travel", contrib: route.distance}]),
        speed: explain([
            route.sail ? {why: "Sail", contrib: 1} : 
            {why: "Skill", contrib: agent.stats.outdoors.value}
        ]),
        accumulated: 0,
        path
    }
}