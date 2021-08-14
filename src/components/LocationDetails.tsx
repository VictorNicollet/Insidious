import { h, JSX } from "preact"
import * as B from "./Box"
import { population } from './numbers'
import { InnerAgentList } from './AgentList'
import { useMemo } from 'preact/hooks'
import { useWorld } from './Context'

// Size of the top-of-box info region
const INFOHEIGHT = 48 /* table */ + 17 /* h4 */;

export function LocationDetails(props: {
    // The location to display
    location: number
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {
    
    const world = useWorld();
    const location = world.locations[props.location]; 
    const innerHeight = B.innerHeight(props.height);

    const agents = useMemo(
        () => location.agents.map(i => world.agents[i]),
        [location, world]);
        
    return <B.Box title={location.name.short} close={props.close}>
        <table class="gui-info-table">
            <tr><th>Location Type</th><td>{location.cellKind.name}</td></tr>
            <tr><th>Adult Population</th><td>{population(location.population)}</td></tr>
        </table>
        <hr/>
        <InnerAgentList agents={agents} 
                        noLocation={true}
                        height={innerHeight  - INFOHEIGHT}/>
    </B.Box>
}