import { h, JSX } from "preact"
import { WorldView } from 'view/world';
import { useState, useMemo, useRef, useEffect, StateUpdater } from 'preact/hooks';
import { LocationView } from 'view/locations';
import { AgentView } from 'view/agents';
import { LocationDetails } from './LocationDetails';

export type RightPanelShown = { 
    what: "location"
    location: LocationView
} | {
    what: "agent" 
    agent: AgentView
} | undefined

export type RightPanelProps = {
    screenH: number
    screenW: number
    world: WorldView
}

const MARGINTOP = 10;
const MARGINBOT = 57;

// The right panel provides information and actions about an individual
// element (a location, an agent)

type RightPanel = {
    (props: RightPanelProps): JSX.Element
    show: (shown: RightPanelShown) => void
    showLocation: (location: LocationView|undefined) => void
}

export function useRightPanel(): RightPanel {
    const ctrl = useRef<StateUpdater<RightPanelShown>>();
    return useMemo(() => 
    {
        const Component = ((props: RightPanelProps): JSX.Element => {
            const [shown, setShown] = useState<RightPanelShown>();
            useEffect(() => {ctrl.current = setShown});
            const height = props.screenH - MARGINTOP - MARGINBOT;
            if (!shown) return <div></div>;

            const contents = useMemo(() => {
                if (shown.what === "location") 
                    return <LocationDetails world={props.world} 
                                            location={shown.location} 
                                            height={height} />;
                return <div>Agent {shown.agent.name.short}</div>;
            }, [shown]);

            return <div style={{
                position: "fixed",
                right: 10,
                top: MARGINTOP,
                bottom: MARGINBOT,
                width: 480,
                zIndex: 100
            }}>{contents}</div>
        }) as RightPanel;

        Component.show = function(shown?: RightPanelShown) {
            ctrl.current && ctrl.current(shown);
        }

        Component.showLocation = function(location: LocationView|undefined) {
            ctrl.current && ctrl.current(old => 
                // If want to show no location, hide the current location
                (location === undefined && old && old.what === "location") ? undefined :
                // If want to show a location, show it
                location ? { what: "location", location } : 
                // Do nothing
                old);
        }

        return Component;

    }, [ctrl]);
}
