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
        RightPanel.show({what: "location", location: location});
    }, [MapScroller, RightPanel])

    return <div>
        <MapScroller 
            world={props.world}
            screenH={screenH}
            screenW={screenW}
            onLocation={RightPanel.showLocation} />
        <LeftPanel
            screenH={screenH} 
            screenW={screenW} 
            world={props.world}
            onLocation={selectLocation}/>
        <RightPanel
            screenH={screenH}
            screenW={screenW}
            world={props.world}/>
        <Navbar 
            left={LeftPanel.toggle} />
    </div>
}