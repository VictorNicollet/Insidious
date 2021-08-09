import { h, JSX } from "preact"
import { useState } from "preact/hooks"
import { Box } from "./Box"
import { Location } from "../model/locations"
import { Pagination } from './Pagination';

export function LocationList(props: {
    locations: readonly Location[],
    pagesize: number
}): JSX.Element {
    
    const {locations, pagesize} = props;

    const [page, setPage] = useState(0)
    const pages = Math.ceil(locations.length / pagesize);
    const start = page * pagesize;
    const end   = Math.min(start + pagesize, locations.length);

    const shown = props.locations.slice(start, end);

    return <Box title="Locations">
        <ul className="gui-locations" style={{height: 50*pagesize}}>
            {shown.map(location => 
                <li key={location.name.short}>
                    <div className="flag"/>
                    <div className="name">
                        {location.name.short}
                    </div>
                    <div className="info">
                        Pop 352
                    </div>
                </li>)}
        </ul>
        <Pagination page={page} pages={pages} setPage={setPage}/>
    </Box>
}