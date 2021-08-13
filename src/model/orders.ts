import type { Occupation } from './occupation'

// An order to stay undercover and act as one's outward occupation
export type UndercoverOrder = {
    readonly kind: "undercover"
}

// An order to recruit another agent
export type RecruitAgentOrder = {
    readonly kind: "recruit-agent"
    // The occupation that should be recruited
    readonly occupation: Occupation
    // The difficulty 
    readonly difficulty: number
}

export type Order = UndercoverOrder

