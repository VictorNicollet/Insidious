import { Occupation, pack_occupation } from './occupation'
import { Explained, pack_explained } from './explainable'
import { Cell } from './grid'
import { pack_resourcesOf, ResourcesOf } from './resources'
import { Location } from './locations'
import { array, boolean, enm, float, int7, ObjPack, Pack, pair, union } from './serialize'

export type Common = {
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

// An order to stay undercover and act as one's outward occupation
export type UndercoverOrder = {
    readonly kind: "undercover"
} & Common

// An order to recruit another agent
export type RecruitAgentOrder = {
    readonly kind: "recruit-agent"
    // The occupation that should be recruited
    readonly occupation: Occupation
    // The location where the recruitment happens
    readonly location : Location
} & Common

export type WorkAsPriestOrder = {
    readonly kind : "priest-work"
    // Where the priest works
    readonly location : Location
} & Common

// An order to travel along a path
export type TravelOrder = {
    readonly kind : "travel"
    readonly sail : boolean
    // The cells in the path, and for each cell, the 
    // difficulty of moving to the next cell.
    readonly path : readonly [number, Cell][]
} & Common

export type ByGatherInfoMode<T> = {
    street: T
    tavern: T
    underworld: T
    gentry: T
    bribe: T
}

export type GatherInfoMode = keyof(ByGatherInfoMode<string>)

const pack_gatherInfoMode = enm<GatherInfoMode>([
    "street", 
    "tavern", 
    "underworld", 
    "gentry", 
    "bribe"]);

export type GatherInfoOrder = {
    readonly kind : "gather-info"
    readonly mode : GatherInfoMode
} & Common

export type Order = 
    ( UndercoverOrder 
    | TravelOrder
    | GatherInfoOrder
    | RecruitAgentOrder 
    | WorkAsPriestOrder)

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

export function pack_order(pack_loc: Pack<Location>) : Pack<Order> {

    const common : ObjPack<Common> = {
        difficulty: pack_explained,
        exposure: pack_explained,
        cost: pack_resourcesOf(float),
        progress: float
    }

    return union<"undercover", Omit<UndercoverOrder, "kind">>("undercover", common)
        .or<"recruit-agent", Omit<RecruitAgentOrder, "kind">>("recruit-agent", {
            ...common,
            occupation: pack_occupation,
            location: pack_loc
        })
        .or<"travel", Omit<TravelOrder, "kind">>("travel", {
            ...common,
            sail: boolean,
            path: array(pair(float, int7))
        })
        .or<"gather-info", Omit<GatherInfoOrder, "kind">>("gather-info", {
            ...common,
            mode: pack_gatherInfoMode
        })
        .or<"priest-work", Omit<WorkAsPriestOrder, "kind">>("priest-work", {
            ...common,
            location: pack_loc
        })
        .pack();
}
