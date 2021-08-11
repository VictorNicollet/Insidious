import { h } from "preact"
import { Map } from 'components/Map'
import { Cell } from 'model/grid';
import { MapView } from 'view/map';

export function MapScroller(props: {
    map: MapView,
    // Dimensions of the screen
    screenH: number
    screenW: number
    // X,Y position of the center
    centerX: number
    centerY: number
    // Currently selected cell, if any
    selected: Cell|undefined
    // Invoked when clicking on a tile
    // (coordinates given in the map referential)
    click: (x: number, y: number) => void
}) {
    
    const left = props.screenW/2 - props.centerX;
    const top  = props.screenH/2 - props.centerY;
    
    return <div className="gui-map" onClick={onClick}>
        <div style={{
            position: "relative", 
            left, 
            top,
            transition: "left top",
            transitionDuration: "0.2s",
            transitionTimingFunction: "ease-out"
        }}>
            <Map map={props.map} selected={props.selected} />
        </div>
    </div>

    function onClick(e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) {
        // We need to undo the transformation
        props.click(e.clientX - left, e.clientY - top);
    }
}