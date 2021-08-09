import { h } from "preact"
import { Map } from 'components/Map'
import { WorldMap } from 'model/map';

export function MapView(props: {map: WorldMap}) {
    const left = 0;
    const top = 0;
    return <div className="gui-map">
        <div style={{position: "relative", left, top}}>
            <Map map={props.map}/>
        </div>
    </div>
}