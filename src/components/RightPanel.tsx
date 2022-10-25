import { h, JSX } from "preact"
import { useCallback } from 'preact/hooks';
import { LocationDetails } from './LocationDetails';
import { AgentDetails } from './AgentDetails';
import type { Selection } from './Screen'
import { never } from '../never';
import { CultDetails } from "./CultDetails";
import { DistrictDetails } from "./DistrictDetails";

export type RightPanelProps = {
    screenH: number
    screenW: number
    // What is currently selected, and how to change it. 
    selected: Selection
    setSelected: (sel: Selection) => void    
}

const MARGINTOP = 10;
const MARGINBOT = 57;

// The right panel provides information and actions about an individual
// element (a location, an agent)

export function RightPanel(props: RightPanelProps): JSX.Element {            
    
    const {selected, setSelected} = props;

    const close = useCallback(() => setSelected({selected:"none"}), [setSelected]);

    if (selected.selected == "none") return <div></div>;

    const height = props.screenH - MARGINTOP - MARGINBOT;

    return <div style={{
        position: "fixed",
        right: 10,
        top: MARGINTOP,
        bottom: MARGINBOT,
        width: 480,
        zIndex: 100
    }}>
        {selected.selected == "agent" ? 
            <AgentDetails agent={selected.id}
                height={height}
                close={close}/> :
        selected.selected === "location" ? 
            <LocationDetails location={selected.id} 
                page={selected.page}
                height={height}
                close={close} /> :
        selected.selected === "district" ?
            <DistrictDetails district={selected.id} 
                height={height}
                close={close} /> : 
        selected.selected === "plan" ? 
            <div>Plan</div> : 
        selected.selected === "cult" ?
            <CultDetails page={selected.page}
                height={height}
                close={close} /> :
        never(selected)}
    </div>;
}