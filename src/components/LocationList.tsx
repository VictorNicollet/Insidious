import { h, JSX } from "preact"
import { useState } from "preact/hooks"
import * as B from "./Box"
import * as P from './Pagination'
import { Cell } from 'model/grid'
import * as Numbers from './numbers'
import { LocationView } from 'view/locations'
import * as M from './Map'
import { WorldView } from 'view/world'
import { AgentCount } from './AgentCount'

// The height, in pixels, of an element in the locations list
const ITEMSIZE = 50;

export function LocationList(props: {
    world: WorldView,
    // The locations to display
    locations: readonly LocationView[]
    // The pixel height available for the component to display in
    height: number
    // Invoke to flag a cell on the map as "selected"
    select: (cell: Cell) => void
}): JSX.Element {
    
    const {locations, height} = props;

    const innerHeight = B.innerHeight(height) - P.height;
    const pagesize = Math.floor(innerHeight / ITEMSIZE);

    const [page, setPage] = useState(0)
    const pages = Math.ceil(locations.length / pagesize);
    const start = page * pagesize;
    const end   = Math.min(start + pagesize, locations.length);

    const shown = locations.slice(start, end);

    return <B.Box title="Locations" decorate={true}>
        <ul className="gui-locations" style={{height: 50*pagesize}}>
            {shown.map(location => {
                const cell = props.world.map.cells[location.cell];
                return <li key={location.name.short} 
                    onClick={() => props.select(location.cell)}>
                    <div className="location-mini">
                        <M.Cell world={props.world}
                                cell={location.cell}
                                top={-77} left={-39}
                                naked={true}/>
                    </div>
                    <AgentCount count={location.agents.length}/>
                    <div className="name">
                        {location.name.short}
                    </div>
                    <div className="info">
                        {cell.name} &middot; Pop {Numbers.population(location.population)}
                    </div>
                </li>
            })}
        </ul>
        <P.Pagination page={page} pages={pages} setPage={setPage}/>
    </B.Box>
}