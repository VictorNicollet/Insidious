import { h, JSX, Fragment } from "preact"
import { useState } from "preact/hooks"
import * as B from "./Box"
import * as P from './Pagination'
import { LocationView } from '../view/locations'
import * as M from './Map'
import { AgentCount } from './AgentCount'
import { useSelectors, Selectors, useWorld } from './Context'
import { infolevel } from './LocationDetails'

// The height, in pixels, of an element in the locations list
const ITEMSIZE = 50;

export function LocationListItem(props: {
    location: LocationView
    select: () => void
}) {
    const location = props.location;

    const info = location.information == 0 ? undefined : 
        <Fragment> &middot; {infolevel[location.information]} info </Fragment>
    return <li onClick={props.select}>
        <div className="location-mini">
            <M.MapCell cell={location.cell}
                    top={-77} left={-39}
                    portraits={[]}
                    naked={true}/>
        </div>
        <AgentCount count={location.agents.length}/>
        <div className="name">
            {location.name.short}
        </div>
        <div className="info">
            {location.cellKind.name} {info}
        </div>
    </li>
}

export function LocationList(props: {
    // The locations to displa
    locations: readonly LocationView[]
    // The pixel height available for the component to display in
    height: number
    // Close this list
    close: () => void
}): JSX.Element {
    
    const {locations, height} = props;
    const selectors = useSelectors();

    const innerHeight = B.innerHeight(height) - P.height;
    const pagesize = Math.floor(innerHeight / ITEMSIZE);

    const [page, setPage] = useState(0)
    const pages = Math.ceil(locations.length / pagesize);
    const start = page * pagesize;
    const end   = Math.min(start + pagesize, locations.length);

    const shown = locations.slice(start, end);

    return <B.Box title="Locations" decorate={true} close={props.close}>
        <ul className="gui-locations" style={{height: 50*pagesize}}>
            {shown.map(location => <LocationListItem 
                key={location.name.short} 
                select={() => selectors.location(location)} 
                location={location}/>)}
        </ul>
        <P.Pagination page={page} pages={pages} setPage={setPage}/>
    </B.Box>
}