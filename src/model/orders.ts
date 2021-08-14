import type { Occupation } from './occupation'
import type { Explained } from './explainable'

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

export type Order = 
    ( UndercoverOrder 
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