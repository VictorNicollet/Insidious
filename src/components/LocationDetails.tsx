import { Fragment, h, JSX } from "preact"
import * as B from "./Box"
import { population } from './numbers'
import { InnerAgentList } from './AgentList'
import { useMemo } from 'preact/hooks'
import { useSelectors, useWorld } from './Context'
import { notUndefined } from '../notundefined'
import type { LocationView } from "../view/locations"
import type { WorldView } from "../view/world"
import type { LocationPages } from "./Screen"
import { never } from "../never"

// Size of the top-of-box info region
const INFOHEIGHT = 48 /* table */ + 17 /* h4 */;

export const infolevel = [
    /* 0 */ "None",     
    /* 1 */ "Basic",
    /* 2 */ "Poor",
    /* 3 */ "Moderate",
    /* 4 */ "Good", 
    /* 5 */ "Excellent", 
    /* 6 */ "Perfect"
]

function LocationAgentsPage(props: {
    world: WorldView,
    location: LocationView,
    innerHeight: number,
}) {

    const agents = useMemo(
        () => notUndefined(props.location.agents.map(i => props.world.agents.idx(i))),
        [props.location, props.world]);

    return <Fragment>
        <table class="gui-info-table">
            <tr><th>Location Type</th><td>{props.location.cellKind.name}</td></tr>
            <tr><th>Adult Population</th><td>{population(props.location.population, props.location.information)}</td></tr>
            <tr><th>Information</th><td>{infolevel[props.location.information]}</td></tr>
        </table>
        <hr/>
        <InnerAgentList agents={agents} 
                        noLocation={true}
                        empty="You have no agents in this location."
                        height={props.innerHeight  - INFOHEIGHT}/>
    </Fragment>;
}

const locationPages : LocationPages[] = ["Agents","Cult"]

export function LocationDetails(props: {
    // The location to display
    location: number
    // The location page to display
    page: LocationPages
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {
    
    const sel = useSelectors();
    const world = useWorld();
    const location = world.locations[props.location]; 
    const innerHeight = B.innerHeight(props.height);

    return <B.Box<LocationPages> title={location.name.short} 
            close={props.close}
            tabs={locationPages}
            tab={props.page}
            onTab={page => sel.location(location, page)}>
        {props.page == "Agents" 
            ? <LocationAgentsPage innerHeight={innerHeight} world={world} location={location} /> :
         props.page == "Cult"
            ? <div>A</div> :
         never(props.page)}
    </B.Box>
}