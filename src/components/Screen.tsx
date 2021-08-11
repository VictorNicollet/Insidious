import { h, JSX } from "preact"
import { useMapScroller } from './MapScroller';
import { cellPos, pick } from "./Map"
import { useLeftPanel } from './LeftPanel';
import { WorldView } from 'view/world';
import { Navbar } from './Navbar';

export function Screen(props: { world: WorldView }): JSX.Element {
    
    const grid = props.world.map.grid;
    const screenH = window.innerHeight;
    const screenW = window.innerWidth;

    const LeftPanel = useLeftPanel();
    const MapScroller = useMapScroller(grid);

    return <div>
        <MapScroller 
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