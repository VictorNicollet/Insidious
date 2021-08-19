import { Occupation, presenceByLocationKind, recruitCost } from "./occupation";
import type { Location } from './locations';
import type { Agent } from './agents';
import type { Order } from './orders';
import { explain, Reason, Explained } from './explainable';
import { Route } from './routes';
import { Cell } from './grid';
import { zero } from './resources';

// Produces a "recruit-agent" order, or an impossibility message
export function recruitOrder(occupation: Occupation, agent: Agent, location: Location): Order|string {
    const ease = presenceByLocationKind[location.kind][occupation];
    const cellKind = location.world.map.cells[location.cell];

    if (ease === 0) {
        return `!!Cannot recruit a ${occupation} ${cellKind.inThis()}.!!`
    }

    const difficultyMult : Reason[] = [];

    if (ease != 3)
        difficultyMult.push({
            why: `${occupation} ${cellKind.inThis()}`,
            // ease 1 = +40%
            // ease 2 = +20%
            // ease 4 = -20%
            // ease 5 = -40%
            contrib: (3 - ease) * 0.2
        });
    
    difficultyMult.push({
        why: "Skill",
        contrib: -agent.stats.recruit.value/100
    });

    const exposureMult: Reason[] = [{why: "Deceit", contrib: -agent.stats.deceit.value/100} ]

    if (agent.occupation == occupation) 
        difficultyMult.push({why: "Same occupation", contrib: -agent.stats.recruit.value/100});
    
    const difficulty = explain(difficultyMult, 7, 1)
    const exposure = explain(exposureMult, 2, 0);

    return {
        kind: "recruit-agent",
        occupation,
        difficulty,
        exposure,
        cost: recruitCost[occupation],
        progress: 0
    }
}

// Produces a "travel" order along the specified route
export function travelOrder(agent: Agent, route: Route): Order|string {
    
    const cells = agent.world.map.cells;

    let difficulty : Explained = explain([{why: "Sail", contrib: route.distance}])
    if (!route.sail) {
        const mult : Reason[] = [
            {why: "Skill", contrib: -agent.stats.outdoors.value/100}
        ];
        difficulty = explain(mult, route.distance, 1)
    }

    const ratio = difficulty.value / route.distance;

    let offset = 0
    let path : [number,Cell][] = []
    for (let cell of route.steps) {
        path.push([offset * ratio, cell]);
        offset += cells[cell].difficulty;
    }

    return {
        kind: "travel",
        sail: route.sail,
        difficulty,
        exposure: { value: 0, reasons: [] },
        progress: 0,
        cost: route.sail ? { gold: 2 * route.distance, touch: 0 } : zero,
        path
    }
}
