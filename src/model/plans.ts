import type { Location } from './locations'
import { array, boolean, enm, float, int7, obj, option, Pack, string } from './serialize'
import type { World } from './world'

// A plan, of the nefarious kind
export type Plan = {
    // Internal identifier of this plan instance
    readonly id: number
    // The label displayed for this plan
    readonly label: string
    // All the steps in this plan
    readonly steps: readonly PlanStep[]
    // The currently active step
    readonly step: number
}

// A plan requirement expects a certain statistic to have reached
// a certain level before the next step begins.
export type PlanRequirement = {
    // The value that will be compared to the target.
    readonly what: PlanRequirementValue
    // If set, only count values in this location.
    readonly location: Location|undefined
    // The number that must be reached or exceeded.
    readonly target: number
    // The current value for this, cached to avoid re-computing
    // it all the time. The requirement is satisfied if current >= target
    current: number
    // True if target <= current
    satisfied: boolean
}

// A value that a plan requirement computes and compares.
export type PlanRequirementValue = 
      // The number of agents (global or in location)
      "agents" 
      // Proportion 0..1 of the population that becomes to 
      // the evil cult (global or in location)
    | "cult-proportion"
      // Amount of the "touch" resource
    | "touch"
      // Amount of the "gold" resource
    | "gold"

const pack_planRequirementValue = enm<PlanRequirementValue>([
    "agents",
    "cult-proportion",
    "touch",
    "gold"
]);

// The effect of a plan step (in addition to advancing to the next stage).
// Not all plan steps have an effect. 
export type PlanStepEffect = ({
    kind: "win"
})

export type PlanStep = ({
    // A plan step that waits for all requirements to be satisfied.
    readonly kind: "requirements",
    readonly reqs: readonly PlanRequirement[]
}) & {
    readonly effect?: PlanStepEffect
} 

// Evaluate the value tracked by a requirement
function evalRequirement(req: PlanRequirement, world: World): number {
    switch (req.what) {
        case "touch": return world.resources.touch;
        case "gold": return world.resources.gold;
        case "cult-proportion": return 0;
        case "agents": 
            if (req.location) {
                let n = 0;
                for (let agent of world.agents())
                    if (agent.location === req.location) ++n;
                return n;
            } else {
                return world.agents().length;
            }
    }
}

// Refresh the 'PlanRequirement.current' and 'PlanRequirement.satisfied'
function refreshRequirement(req: PlanRequirement, world: World) {
    req.current = evalRequirement(req, world)
    req.satisfied = req.current >= req.target
}

let nextId = 0;

// Create a new plan with the specified label and list of steps.
export function createPlan(label: string, steps: readonly PlanStep[]) : Plan {
    return {
        id: nextId++,
        label,
        steps,
        step: 0
    }
}

export function pack_plan(pack_loc: Pack<Location>) : Pack<Plan> {
    return obj<Plan>({
        id: int7,
        label: string,
        step: int7,
        steps: array(obj<PlanStep>({
            kind: enm<"requirements">(["requirements"]),
            reqs: array(obj<PlanRequirement>({
                current: int7,
                location: option(pack_loc),
                satisfied: boolean,
                target: float,
                what: pack_planRequirementValue
            })),
            effect: option(obj<PlanStepEffect>({
                kind: enm<"win">(["win"])
            }))
        }))
    });
}