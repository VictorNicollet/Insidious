import { h, JSX } from "preact"
import { MapScroller } from './MapScroller';
import { useLeftPanel } from './LeftPanel';
import * as WorldView from 'view/world';
import { Navbar } from './Navbar';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { RightPanel } from './RightPanel';
import { LocationView } from 'view/locations';
import { AgentView } from 'view/agents';
import { Context } from './Context';
import { World } from 'model/world';
import { Notifications } from './Notification';
import { Message as MessageBox } from './Message';
import { PlanView } from 'view/plans';

export type Selection = {
    selected: "agent"
    id: number
} | {
    selected: "location"
    id: number
} | {
    selected: "plan"
    id: number
} | {
    selected: "none"
}

export function Screen(props: { world: World }): JSX.Element {
    
    // View management =======================================================

    const [world, setWorld] = useState(WorldView.world(props.world));

    useEffect(() => 
        props.world.addListener(() => 
            setWorld(WorldView.world(props.world))), 
        [props.world])

    // Screen size management ================================================

    const [[screenW, screenH], setScreenSize] = 
        useState([window.innerWidth, window.innerHeight]);

    useEffect(() => {
        function onResize() {
            setScreenSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    })

    // Selected element management ===========================================

    const [selUnsafe, setSelected] = useState<Selection>({selected: "none"});

    // Agents and plans can disappear, so unselect them when they do.
    const selected : Selection = 
        selUnsafe.selected == "agent" && !world.agents.idx(selUnsafe.id) ||
        selUnsafe.selected == "plan" && !world.plans.idx(selUnsafe.id)
        ? {selected:"none"}
        : selUnsafe;

    // Sub-components ========================================================

    const LeftPanel = useLeftPanel();

    const selectLocation = useCallback((location: LocationView) => {
        setSelected({selected: "location", id: location.id})
    }, [setSelected])

    const selectAgent = useCallback((agent: AgentView) => {
        setSelected({selected: "agent", id: agent.id})
    }, [setSelected])

    const selectPlan = useCallback((plan: PlanView) => {
        setSelected({selected: "plan", id: plan.id})
    }, [setSelected])

    return <div>
        <Context world={world} 
                 agent={selectAgent} 
                 location={selectLocation} 
                 plan={selectPlan}>
            <MapScroller 
                screenH={screenH}
                screenW={screenW}
                selected={selected}
                setSelected={setSelected}/>
            <LeftPanel screenH={screenH} screenW={screenW} />
            <RightPanel 
                selected={selected} 
                setSelected={setSelected}
                screenH={screenH} 
                screenW={screenW} />
            <Notifications/>
            <Navbar 
                left={LeftPanel.toggle} />
            {world.message && <MessageBox message={world.message}/>}
        </Context>
    </div>
}