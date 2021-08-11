import { h, JSX } from "preact"
import { useMapScroller } from './MapScroller';
import { cellPos, pick } from "./Map"
import { useLeftPanel } from './LeftPanel';
import { WorldView } from 'view/world';
import { Navbar } from './Navbar';
import { useState, useEffect } from 'preact/hooks';


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
    const MapScroller = useMapScroller(props.world.map.grid);

    return <div>
        <MapScroller 
            world={props.world}
            map={props.world.map}
            screenH={screenH}
            screenW={screenW} />
        <LeftPanel
            screenH={screenH} 
            screenW={screenW} 
            world={props.world}
            select={MapScroller.select}/>
        <Navbar 
            left={LeftPanel.toggle} />
    </div>
}