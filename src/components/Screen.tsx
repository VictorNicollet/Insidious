import { h, JSX } from "preact"
import { useMapScroller } from './MapScroller';
import { cellPos, pick } from "./Map"
import { useLeftPanel } from './LeftPanel';
import { WorldView } from 'view/world';
import { Navbar } from './Navbar';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { useRightPanel } from './RightPanel';
import { Cell } from 'model/grid';
import { LocationView } from 'view/locations';
import { AgentView } from 'view/agents';
import { Context } from './Context';




export function Screen(props: { world: WorldView }): JSX.Element {
    
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

    // Sub-components ========================================================

    const LeftPanel = useLeftPanel();
    const RightPanel = useRightPanel();
    const MapScroller = useMapScroller(props.world.map.grid);

    const selectLocation = useCallback((location: LocationView) => {
        MapScroller.select(location.cell);
        RightPanel.show({what: "location", location});
    }, [MapScroller, RightPanel])

    const selectAgent = useCallback((agent: AgentView) => {
        MapScroller.select(agent.cell);
        RightPanel.show({what: "agent", agent})
    }, [MapScroller, RightPanel])

    return <div>
        <Context world={props.world} agent={selectAgent} location={selectLocation}>
            <MapScroller 
                world={props.world}
                screenH={screenH}
                screenW={screenW}
                onLocation={RightPanel.showLocation} />
            <LeftPanel screenH={screenH} screenW={screenW} />
            <RightPanel screenH={screenH} screenW={screenW} />
            <Navbar 
                left={LeftPanel.toggle} />
        </Context>
    </div>
}