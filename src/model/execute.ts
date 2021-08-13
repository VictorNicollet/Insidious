import type { Agent } from './agents';
import type { ResourcesOf } from './resources';
import type { StatReason } from './stats';
import { never } from 'never';

// Counts daily contributions of an agent to global resources, appending them to 
// the arrays passed as argument.
export function countDailyResources(agent: Agent, resources: ResourcesOf<StatReason[]>) {
    const {order, stats} = agent;
    resources.touch.push({ why: "Agents", contrib: stats.conduit.value });
    switch (order.kind) {
        case "undercover": 
            resources.gold.push(
                { why: "Undercover agents", contrib: stats.idleIncome.value });
            return;
        case "recruit-agent":
            return;
        default: 
            never(order);
    }
}

