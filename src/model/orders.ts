import type { Occupation } from './occupation'
import type { Explained } from './explainable'
import { Cell } from './grid'

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

export type Order = 
    ( UndercoverOrder 
    | TravelOrder
    | RecruitAgentOrder ) & {
    // The difficulty.
    readonly difficulty: Explained
    // The speed. Time to complete = difficulty/speed
    readonly speed: Explained    
    // Work accumulated so far ; initially 0, equals
    // speed times the number of days spent on the order.
    readonly accumulated: number
}

// The default "stay undercover" order.
export const undercover : Order = {
    kind: "undercover",
    difficulty: { value: 1, reasons: [] },
    speed: { value: 1, reasons: [] },
    accumulated: 0
}

// Count how many days are remaining before the order has been completed
export function daysRemaining(order: Order) {
    return Math.ceil((order.difficulty.value - order.accumulated) / order.speed.value)
}
