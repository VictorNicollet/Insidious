import { h, JSX } from "preact"
import { useMapScroller } from './MapScroller';
import { useLeftPanel } from './LeftPanel';
import * as WorldView from 'view/world';
import { Navbar } from './Navbar';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { useRightPanel } from './RightPanel';
import { LocationView } from 'view/locations';
import { AgentView } from 'view/agents';
import { Context } from './Context';
import { World } from 'model/world';

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

    // Sub-components ========================================================

    const LeftPanel = useLeftPanel();
    const RightPanel = useRightPanel();
    const MapScroller = useMapScroller(world.map.grid);

    const selectLocation = useCallback((location: LocationView) => {
        MapScroller.select(location.cell);
        RightPanel.show({what: "location", location: location.id});
    }, [MapScroller, RightPanel])

    const selectAgent = useCallback((agent: AgentView) => {
        MapScroller.select(agent.cell);
        RightPanel.show({what: "agent", agent: agent.id})
    }, [MapScroller, RightPanel])

    return <div>
        <Context world={world} agent={selectAgent} location={selectLocation}>
            <MapScroller 
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