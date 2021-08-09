import { h } from "preact"
import { Map } from 'components/Map'
import { WorldMap } from 'model/map';

export function MapView(props: {
    map: WorldMap,
    // Dimensions of the screen
    screenH: number
    screenW: number
    // X,Y position of the center
    centerX: number
    centerY: number
    // Invoked when clicking on a tile
    // (coordinates given in the map referential)
    click: (x: number, y: number) => void
}) {
    
    const left = props.centerX + props.screenW/2;
    const top  = props.centerY + props.screenH/2;
    
    return <div className="gui-map" onClick={onClick}>
        <div style={{
            position: "relative", 
            left, 
            top,
            transition: "left top",
            transitionDuration: "0.2s",
            transitionTimingFunction: "ease-out"
        }}>
            <Map map={props.map}/>
        </div>
    </div>

    function onClick(e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) {
        // We need to undo the transformation
        props.click(left - e.clientX, top - e.clientY);
    }
}