import { useContext } from "preact/hooks";
import { h, createContext, ComponentChildren } from 'preact';
import { WorldView } from 'view/world';
import { LocationView } from 'view/locations';
import { AgentView } from 'view/agents';


type Selectors = {
    location: (location: LocationView) => void
    agent: (agent: AgentView) => void
}

type Context = {
    world: WorldView
} & Selectors

const context = createContext<Context>(undefined as Context)

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
    return {location: sel.location, agent: sel.agent};
}