import { h, JSX } from "preact"
import { LocationList } from './LocationList'
import { useState, useMemo, useRef, useEffect, StateUpdater, useCallback } from 'preact/hooks';
import { AgentList } from './AgentList';
import { useWorld } from './Context';
import { PlanList } from './PlanList';
import { CultManager } from "./CultManager";

export type LeftPanelShown = 
    "locations" | 
    "agents" |
    "plans" |
    "cult" | 
    "rituals" | 
    "artifacts" | 
    undefined

export type LeftPanelProps = {
    screenH: number
    screenW: number
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
            
            const close = useCallback(() => setShown(undefined), [setShown]);
            const world = useWorld();
            
            if (!shown) return <div></div>;

            const height = props.screenH - MARGINTOP - MARGINBOT;
                        
            const [width, inner] = 
                shown == "locations" 
                    ? [340, <LocationList 
                        locations={world.locations}
                        height={height} 
                        close={close} />]
                    : shown == "agents" 
                    ? [340, <AgentList 
                        agents={world.agents}
                        height={height} 
                        close={close} />]
                    : shown == "plans"
                    ? [340, <PlanList 
                        plans={world.plans}
                        height={height}
                        close={close} />]
                    : shown == "cult"
                    ? [500, <CultManager 
                        height={height}
                        close={close} />]
                    : shown == "rituals"
                    ? [340, undefined]
                    : shown == "artifacts"
                    ? [340, undefined]
                    : [340, undefined];

            return <div style={{
                position: "fixed",
                left: 10,
                top: MARGINTOP,
                bottom: MARGINBOT,
                width,
                zIndex: 100
            }}>
                {inner}
            </div>
        }) as LeftPanel;

        Component.toggle = function(shown: LeftPanelShown) {
            ctrl.current && 
            ctrl.current(old => old == shown ? undefined : shown);
        }

        return Component;

    }, [ctrl]);
}
