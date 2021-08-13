import type { Agent } from './agents';
import type { ResourcesOf } from './resources';
import type { StatReason } from './stats';

// Counts daily contributions of an agent to global resources, appending them to 
// the arrays passed as argument.
export function countDailyResources(agent: Agent, resources: ResourcesOf<StatReason[]>) {
    resources.touch.push({ why: "Agents", contrib: agent.stats.conduit.value });
    switch (agent.order.kind) {
        case "undercover": 
            resources.gold.push(
                { why: "Undercover agents", contrib: agent.stats.idleIncome.value });
            return;
    }
}