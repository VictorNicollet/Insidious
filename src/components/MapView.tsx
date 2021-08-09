import { h } from "preact"
import { Map } from 'components/Map'

export function MapView(props: {n: number}) {
    const left = 0;
    const top = 0;
    return <div className="gui-map">
        <div style={{position: "relative", left, top}}>
            <Map n={props.n}/>
        </div>
    </div>
}