import { h, JSX } from "preact"
import { World } from 'model/world';
import { MapView } from './MapView';
import { LeftPanel } from './LeftPanel';
import { useState } from 'preact/hooks';

export function Screen(props: { world: World }): JSX.Element {
    
    const screenH = window.innerHeight;
    const screenW = window.innerWidth;

    // Centering on the map happens at this level, to let sub-components
    // control the center when something is selected.
    const [[centerX, centerY], setCenter] = useState([0,0]);

    return <div>
        <MapView 
            map={props.world.map}
            screenH={screenH}
            screenW={screenW}
            centerX={centerX}
            centerY={centerY} 
            click={(x,y) => setCenter([x,y])}/>
        <LeftPanel
            screenH={screenH} 
            screenW={screenW} 
            world={props.world}/>
    </div>
}