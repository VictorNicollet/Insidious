import { useContext } from "preact/hooks";
import { h, createContext, ComponentChildren } from 'preact';
import type { WorldView } from '../view/world';
import type { LocationView } from '../view/locations';
import type { AgentView } from '../view/agents';
import type { PlanView } from '../view/plans';
import { CultPages } from "./Screen";


type Selectors = {
    location: (location: LocationView) => void
    agent: (agent: AgentView) => void
    plan: (plan: PlanView) => void
    cult: (page: CultPages) => void
}

type Context = {
    world: WorldView
} & Selectors

const context = createContext<Context>(undefined as unknown as Context)

// Instantiate the context, so that all child components can access
// the provided values.
export function Context(props: Context & {children: ComponentChildren}) {
    return <context.Provider value={props}>
        {props.children}
    </context.Provider>
}

// Access the world from the context
export function useWorld(): WorldView {
    return useContext(context).world;
}

// Access the selectors from the context
export function useSelectors(): Selectors {
    const sel = useContext(context);
    return {location: sel.location, agent: sel.agent, plan: sel.plan, cult: sel.cult};
}