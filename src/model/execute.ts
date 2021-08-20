import type { Agent } from './agents';
import type { ResourcesOf } from './resources';
import type { Reason } from './explainable';
import type { Location } from './locations';
import { never } from 'never';
import { Order, GatherInfoMode } from './orders';
import { randomPerson } from './generation/namegen';
import { byOccupation } from './occupation';
import * as Firsts from 'text/firsts';
import { withExcellent } from './message';
import * as GatherInfo from 'events/gatherinfo';

function countResourceDeltaForOrder(
    agent: Agent, 
    order: Order, 
    resources: ResourcesOf<{daily:Reason[],once:number}>
) {
    const stats = agent.stats;
    
    if (order.progress == 0) {
        resources.touch.once -= order.cost.touch;
        resources.gold.once -= order.cost.gold;
    }

    resources.touch.daily.push({ why: "Agents", contrib: stats.conduit.value });
    if (order.progress >= order.difficulty.value) return;

    switch (order.kind) {
        case "undercover": 
            resources.gold.daily.push(
                { why: "Undercover agents", contrib: stats.idleIncome.value });
            return;
        case "recruit-agent":
            return;
        case "travel":
            return;
        case "gather-info":
            return;
        default: 
            never(order);
    }
}

// Counts daily and one-shot contributions of an agent to global resources, 
// appending them to the arrays passed as argument.
export function countResourceDelta(
    agent: Agent, 
    resources: ResourcesOf<{daily:Reason[],once:number}>
) {
    countResourceDeltaForOrder(agent, agent.order, resources);
}

// Executes an agent's current order, performing any necessary 
// side-effects and returning the new version of the order.
// Note that the daily resource upgrades are performed separately !
export function executeOrder(agent: Agent): Order {
    
    const order = agent.order;

    // Nothing to do if order is already done.
    const {progress: accumulated, difficulty} = order;
    if (accumulated >= difficulty.value) return order;

    // Keep track of exposure
    if (order.exposure.value < 0) {
        // Decreases in exposure cannot go under the authority stat
        if (agent.exposure >= agent.stats.authority.value)
            agent.exposure = Math.max(
                agent.stats.authority.value, 
                agent.exposure + order.exposure.value)
    } else {
        agent.exposure += order.exposure.value;
    }

    // Increase the accumulated progress.
    const newAccumulated = Math.min(accumulated + 1, difficulty.value);

    // Flag: the order has completed during this turn.
    const isDone = newAccumulated == difficulty.value;

    switch (order.kind) {
        case "undercover": 
            agent.earnExperience(agent.occupation, 1);
            break;
        case "travel": 
            for (let i = 0; i < order.path.length; ++i) {
                const [difficulty, cell] = order.path[i];
                // Already passed through this cell ?
                if (difficulty - 0.001 <= accumulated) continue;
                // Moved as far as possible ? 
                if (difficulty - 0.001 > newAccumulated) break;
                agent.moveTo(cell);
            }
            break;
        case "recruit-agent": 
            if (isDone) {
                // The recruited agent's level is one less than the recruiting
                // agent (this is to incentivize using higher-level agents
                // to recruit). Cannot go lower than 1.
                const levels = byOccupation(0);
                levels[order.occupation] = Math.max(1, agent.levels[agent.occupation]-1);
                agent.world.newAgent(
                    randomPerson(),
                    agent.location,
                    order.occupation,
                    levels);
            }
            break;
        case "gather-info":
            if (isDone) {
                const max = order.mode == "street" ? 1 : 
                            order.mode == "tavern" ? 3 : 6;
                const location = agent.location!;
                const oldInfo = location.information;
                const newInfo = Math.min(max, location.information + 1);
                if (oldInfo >= newInfo) break;
                if (GatherInfo.succeeds(agent, location, order.mode))
                    location.information = newInfo;
            }
            break;           
        default: never(order);
    }

    // Orders are immutable (since they are used as both model and view)
    // so return a copy with the new accumulated progress.
    return { ...agent.order, progress: newAccumulated }
}