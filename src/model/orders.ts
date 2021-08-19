import type { Occupation } from './occupation'
import type { Explained } from './explainable'
import { Cell } from './grid'
import { ResourcesOf } from './resources'

// An order to stay undercover and act as one's outward occupation
export type UndercoverOrder = {
    readonly kind: "undercover"
}

// An order to recruit another agent
export type RecruitAgentOrder = {
    readonly kind: "recruit-agent"
    // The occupation that should be recruited
    readonly occupation: Occupation
}

// An order to travel along a path
export type TravelOrder = {
    readonly kind : "travel"
    readonly sail : boolean
    // The cells in the path, and for each cell, the 
    // difficulty of moving to the next cell.
    readonly path : readonly [number, Cell][]
}

export type GatherInfoMode = 
      "street" 
    | "tavern" 
    | "underworld" 
    | "gentry" 
    | "bribe"

export type GatherInfoOrder = {
    readonly kind : "gather-info"
    readonly mode : GatherInfoMode
}

export type Order = 
    ( UndercoverOrder 
    | TravelOrder
    | GatherInfoOrder
    | RecruitAgentOrder ) & {
    // The difficulty, expressed in days.
    readonly difficulty: Explained
    // Work accumulated so far ; initially 0, equals
    // speed times the number of days spent on the order.
    readonly progress: number
    // Daily exposure gain
    readonly exposure : Explained
    // The cost, in various resources, of STARTING this order.
    // Non-refundable once it started.
    readonly cost: ResourcesOf<number>
}

// The default "stay undercover" order.
export const undercover : Order = {
    kind: "undercover",
    difficulty: { value: 1, reasons: [] },
    exposure: { value: -1, reasons: [] },
    cost: {gold: 0, touch: 0},
    progress: 0
}

// A completed order, which will show up as 'Awaiting orders'
export const done : Order = {...undercover, progress: 1}

// Count how many days are remaining before the order has been completed
export function daysRemaining(order: Order) {
    return Math.ceil(order.difficulty.value - order.progress)
}
