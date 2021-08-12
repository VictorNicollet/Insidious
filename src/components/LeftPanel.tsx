import { h, JSX } from "preact"
import { LocationList } from './LocationList'
import { Cell } from 'model/grid';
import { WorldView } from 'view/world';
import { useState, useMemo, useRef, useEffect, StateUpdater } from 'preact/hooks';
import { AgentList } from './AgentList';
import { LocationView } from 'view/locations';
import { AgentView } from 'view/agents';

export type LeftPanelShown = 
    "locations" | 
    "agents" | 
    "cult" | 
    "rituals" | 
    "artifacts" | 
    undefined

export type LeftPanelProps = {
    screenH: number
    screenW: number
    world: WorldView
    onLocation: (location: LocationView) => void
    onAgent: (agent: AgentView) => void
}

const MARGINTOP = 10;
const MARGINBOT = 57;

// The left panel provides top-level lists of things (all locations,
// all priests, etc.)

type LeftPanel = {
    (props: LeftPanelProps): JSX.Element
    toggle: (shown: LeftPanelShown) => void
}

export function useLeftPanel(): LeftPanel {
    const ctrl = useRef<StateUpdater<LeftPanelShown>>();
    return useMemo(() => 
    {
        const Component = ((props: LeftPanelProps): JSX.Element => {
            const [shown, setShown] = useState<LeftPanelShown>();
            useEffect(() => {ctrl.current = setShown});
            const height = props.screenH - MARGINTOP - MARGINBOT;
            if (!shown) return <div></div>;
            return <div style={{
                position: "fixed",
                left: 10,
                top: MARGINTOP,
                bottom: MARGINBOT,
                width: 340,
                zIndex: 100
            }}>
                {shown == "locations" 
                    ? <LocationList locations={props.world.locations}
                                    world={props.world}
                                    height={height} 
                                    select={props.onLocation} />
                    : shown == "agents" 
                    ? <AgentList agents={props.world.agents}
                                 world={props.world}
                                 height={height} 
                                 select={props.onAgent} />
                    : shown == "cult"
                    ? undefined
                    : shown == "rituals"
                    ? undefined
                    : shown == "artifacts"
                    ? undefined
                    : undefined}
            </div>
        }) as LeftPanel;

        Component.toggle = function(shown: LeftPanelShown) {
            ctrl.current && 
            ctrl.current(old => old == shown ? undefined : shown);
        }

        return Component;

    }, [ctrl]);
}
