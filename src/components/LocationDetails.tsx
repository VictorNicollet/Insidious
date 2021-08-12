import { h, JSX } from "preact"
import * as B from "./Box"
import { LocationView } from 'view/locations'
import { WorldView, world } from 'view/world'
import { population } from './numbers'
import { InnerAgentList } from './AgentList'
import { useMemo } from 'preact/hooks'

// Size of the top-of-box info region
const INFOHEIGHT = 48 /* table */ + 17 /* h4 */;

export function LocationDetails(props: {
    world: WorldView,
    // The location to display
    location: LocationView
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {
    
    const {location, height, world} = props;

    const innerHeight = B.innerHeight(height);

    const agents = useMemo(
        () => location.agents.map(i => world.agents[i]),
        [location, world]);
        
    return <B.Box title={location.name.short} close={props.close}>
        <table class="gui-info-table">
            <tr><th>Location Type</th><td>{location.cellKind.name}</td></tr>
            <tr><th>Adult Population</th><td>{population(location.population)}</td></tr>
        </table>
        <hr/>
        <InnerAgentList world={world}
                        agents={agents} 
                        select={() => {}} 
                        noLocation={true}
                        height={innerHeight  - INFOHEIGHT}/>
    </B.Box>
}