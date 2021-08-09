import { h } from "preact"
import { Map } from 'components/Map'
import { WorldMap } from 'model/map';
import { useState } from 'preact/hooks';

export function MapView(props: {map: WorldMap}) {
    
    // Use the mouse to drag the map around.
    const [{left,top}, setPos] = useState({left:0, top:0});
    const [drag, setDrag] = useState<undefined|{x:number,y:number}>();

    return <div className="gui-map" 
                onMouseDown={e => setDrag({x:e.clientX,y:e.clientY})} 
                onMouseMove={e => {
                    if (drag) {
                        if (e.buttons < 1) {
                            // Sometimes, the drag state remains after
                            // it should have been disabled.
                            setDrag(undefined);
                        } else {
                            const dx = e.clientX - drag.x;
                            const dy = e.clientY - drag.y;
                            setPos({left: left + dx, top: top + dy});
                            setDrag({x:e.clientX,y:e.clientY})
                        }
                    }
                }}
                onMouseUp={() => setDrag(undefined)}
                onMouseLeave={() => setDrag(undefined)}>
        <div style={{position: "relative", left, top}}>
            <Map map={props.map}/>
        </div>
    </div>
}