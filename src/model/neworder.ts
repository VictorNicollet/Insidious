import { Occupation, presenceByLocationKind, recruitCost } from "./occupation";
import type { Location } from './locations';
import type { Agent } from './agents';
import type { Order, GatherInfoMode } from './orders';
import { explain, Reason, Explained } from './explainable';
import { Route } from './routes';
import { Cell } from './grid';
import { zero } from './resources';

function exposureOf(agent: Agent, base: number) {
    return explain([{why: "Deceit", contrib: -agent.stats.deceit.value/100}], base, 0);
}

// Produces a "recruit-agent" order, or an impossibility message
export function recruitOrder(occupation: Occupation, agent: Agent, location: Location|undefined): Order|string {
    
    if (location === undefined)
        return `!!Cannot recruit agents outdoors.!!`

    const ease = presenceByLocationKind[location.kind][occupation];
    const cellKind = location.world.map.cells[location.cell];

    if (ease === 0) 
        return `!!Cannot recruit a ${occupation} ${cellKind.inThis()}.!!`
    
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
        why: "Contacts",
        contrib: -agent.stats.contacts.value/100
    });

    if (agent.occupation == occupation) 
        difficultyMult.push({why: "Same occupation", contrib: -agent.stats.contacts.value/100});
    
    const difficulty = explain(difficultyMult, 7, 1)
    
    return {
        kind: "recruit-agent",
        occupation,
        difficulty,
        location,
        exposure: exposureOf(agent, 2),
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
            {why: "Outdoors", contrib: -agent.stats.outdoors.value/100}
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

// Produces a "gather info" order 
export function gatherInfoOrder(agent: Agent, mode: GatherInfoMode): Order|string {
    switch (mode) {
        case "street":
            return {
                kind: "gather-info",    
                difficulty: explain(
                    [{why: "Contacts", contrib: -agent.stats.contacts.value/100}], 7, 1),
                cost: zero,
                mode,
                progress: 0,
                exposure: { value: 0, reasons: [] }
            };
        case "tavern":
            return {
                kind: "gather-info",
                difficulty: explain(
                    [{why: "Exposure", contrib: agent.exposure/100}], 7, 1),
                cost: {gold: 5, touch: 0},
                mode,
                progress: 0,
                exposure: exposureOf(agent, 2)
            };
        case "underworld":
            return {
                kind: "gather-info",
                difficulty: explain([
                        {why: "Exposure", contrib: agent.exposure/100},
                        (agent.levels.Criminal == 0 ? undefined : 
                            {   why: "Criminal Lv." + agent.levels.Criminal, 
                                contrib: -0.5 - 0.05 * agent.levels.Criminal })
                    ], 14, 1),
                cost: {gold: 5, touch: 0},
                mode,
                progress: 0,
                exposure: exposureOf(agent, 3)
            };
        case "gentry":
            return {
                kind: "gather-info",
                difficulty: explain([{why: "Authority", contrib: -agent.stats.authority.value/100}], 5, 1),
                cost: {gold: 50, touch: 0},
                mode,
                progress: 0,
                exposure: exposureOf(agent, 1)
            };
        case "bribe":
            return {
                kind: "gather-info",
                difficulty: explain([{why: "Authority", contrib: -agent.stats.authority.value/100}], 3, 1),
                cost: {gold: 100, touch: 0},
                mode,
                progress: 0,
                exposure: exposureOf(agent, 40)
            };
    }
}

export function workAsPriestOrder(agent: Agent, location: Location): Order {
    return {
        kind: "priest-work",
        difficulty: { value: Number.POSITIVE_INFINITY, reasons: [] },
        location,
        exposure: exposureOf(agent, 2),
        cost: {gold: 0, touch: 0},
        progress: 0
    }
}