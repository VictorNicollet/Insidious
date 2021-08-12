import { h, JSX } from "preact"
import * as B from "./Box"
import { LocationView } from 'view/locations'
import { WorldView } from 'view/world'
import { population } from './numbers'

export function LocationDetails(props: {
    world: WorldView,
    // The location to display
    location: LocationView
    // The pixel height available for the component to display in
    height: number
}): JSX.Element {
    
    const {location, height} = props;

    return <B.Box title={location.name.short}>
        <div style={{height:B.innerHeight(height)}}>
            <table class="gui-info-table">
                <tr><th>Location Type</th><td>{location.cellKind.name}</td></tr>
                <tr><th>Adult Population</th><td>{population(location.population)}</td></tr>
            </table>
        </div>
    </B.Box>
}