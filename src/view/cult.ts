import type { World } from "../model/world";
import type { Cult } from "../model/cult";
import type { Recruitment } from "../model/cult/recruit";
import type { AgentView } from "./agents";
import type { IdxArray } from "../idindexed";
import type { Pretense } from "../model/cult/pretense";

export type CultView = {
    readonly name : string
    readonly pretense : Pretense
    readonly recruitment : Recruitment
    // Total number of cult members
    readonly population : number
    // Total cult exposure
    readonly exposure : number
    // All active priests
    readonly priests : readonly AgentView[]
    // The original model object. Mutable, so don't use it, or its properties,
    // for anything around memoization !
    readonly cult: Cult
}

export function cult(w: World, agents: IdxArray<AgentView>): CultView|undefined {
    const cult = w.cult;
    if (!cult) return undefined;

    let priests : AgentView[] = []
    for (const a of agents)
        if (a.agent.order.kind == "priest-work")
            priests.push(a)

    return {
        name: cult.name,
        pretense: cult.pretense,
        recruitment: cult.recruitment,
        exposure: cult.exposure,
        population: w.population.cultTotal,
        priests,
        cult
    };
}