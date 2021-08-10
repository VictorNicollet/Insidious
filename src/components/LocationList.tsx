import { h, JSX } from "preact"
import { useState } from "preact/hooks"
import * as B from "./Box"
import { Location } from "../model/locations"
import * as P from './Pagination'
import { Cell } from 'model/grid'
import * as Numbers from './numbers'

// The height, in pixels, of an element in the locations list
const ITEMSIZE = 50;

export function LocationList(props: {
    // The locations to display
    locations: readonly Location[]
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

    const shown = props.locations.slice(start, end);

    return <B.Box title="Locations" decorate={true}>
        <ul className="gui-locations" style={{height: 50*pagesize}}>
            {shown.map(location => 
                <li key={location.name.short} 
                    onClick={() => props.select(location.cell)}>
                    <div className="flag"/>
                    <div className="name">
                        {location.name.short}
                    </div>
                    <div className="info">
                        Pop {Numbers.population(location.population)}
                    </div>
                </li>)}
        </ul>
        <P.Pagination page={page} pages={pages} setPage={setPage}/>
    </B.Box>
}