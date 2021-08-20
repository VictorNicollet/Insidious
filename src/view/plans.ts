import type { Plan } from 'model/plans';

export type PlanView = {
    id: number
    label: string
    plan: Plan
}

export function plan(plan: Plan) {
    return {
        id: plan.id,
        label: plan.label,
        plan
    }
}