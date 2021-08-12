import { h, JSX } from "preact"
import { LocationList } from './LocationList'
import { useState, useMemo, useRef, useEffect, StateUpdater, useCallback } from 'preact/hooks';
import { AgentList } from './AgentList';
import { useWorld } from './Context';

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
                        
            return <div style={{
                position: "fixed",
                left: 10,
                top: MARGINTOP,
                bottom: MARGINBOT,
                width: 340,
                zIndex: 100
            }}>
                {shown == "locations" 
                    ? <LocationList locations={world.locations}
                                    height={height} 
                                    close={close} />
                    : shown == "agents" 
                    ? <AgentList agents={world.agents}
                                 height={height} 
                                 close={close} />
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
