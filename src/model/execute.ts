import type { Agent } from './agents';
import type { ResourcesOf } from './resources';
import type { Reason } from './explainable';
import { never } from 'never';
import { Order } from './orders';
import { randomPerson } from './generation/namegen';
import { byOccupation } from './occupation';

function countDailyResourcesForOrder(
    agent: Agent, 
    order: Order, 
    resources: ResourcesOf<Reason[]>
) {
    const stats = agent.stats;
    resources.touch.push({ why: "Agents", contrib: stats.conduit.value });
    switch (order.kind) {
        case "undercover": 
            resources.gold.push(
                { why: "Undercover agents", contrib: stats.idleIncome.value });
            return;
        case "recruit-agent":
            return;
        case "travel":
            return;
        default: 
            never(order);
    }
}

// Counts daily contributions of an agent to global resources, appending them to 
// the arrays passed as argument.
export function countDailyResources(agent: Agent, resources: ResourcesOf<Reason[]>) {
    countDailyResourcesForOrder(agent, agent.order, resources);
}

// Executes an agent's current order, performing any necessary 
// side-effects and returning the new version of the order.
// Note that the daily resource upgrades are performed separately !
export function executeOrder(agent: Agent): Order {
    
    const order = agent.order;

    // Nothing to do if order is already done.
    if (order.accumulated >= order.difficulty.value) return order;

    // Increase the accumulated progress.
    const accumulated = Math.min(
        order.accumulated + order.speed.value,
        order.difficulty.value);

    // Flag: the order has completed during this turn.
    const isDone = accumulated == order.difficulty.value;

    switch (order.kind) {
        case "undercover": break;
        case "travel": break;
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
        default: never(order);
    }

    // Orders are immutable (since they are used as both model and view)
    // so return a copy with the new accumulated progress.
    return { ...agent.order, accumulated }
}