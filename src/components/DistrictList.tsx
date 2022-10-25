import { h, JSX } from "preact"
import { useState } from "preact/hooks"
import * as P from './Pagination'
import { DistrictView } from '../view/districts'
import { useSelectors } from './Context'
import { ByDistrictKind } from '../model/districts'

// The height, in pixels, of an element in the districts list
const ITEMSIZE = 50;

const districtKindName : ByDistrictKind<string> = {
    academy: "Academy",
    barracks: "Military",
    castle: "Castle",
    commercial: "Market", 
    docks: "Docks",
    greens: "Green",
    ironworks: "Iron Works",
    lumber: "Lumber Yard", 
    mine: "Mine", 
    residential: "Residential",
    ruins: "Ruins",
    temple: "Temple"
}

// The district list, intended to be placed inside a box.
export function InnerDistrictList(props: {
    // The districts to display
    districts: readonly DistrictView[],
    // The pixel height available for the component to display in
    height: number
    // Message displayed if the list is empty.
    empty: string
}) : JSX.Element {
    const {districts, height} = props;
    
    const selectors = useSelectors();

    const pagesize = Math.floor((height - P.height) / ITEMSIZE);

    const [page, setPage] = useState(0)
    const pages = Math.ceil(districts.length / pagesize);
    const start = page * pagesize;
    const end   = Math.min(start + pagesize, districts.length);

    const shown = districts.slice(start, end);

    return <div>
        <ul className="gui-districts" style={{height: 50*pagesize}}>
            {shown.length == 0 ? <li className="empty">{props.empty}</li> : undefined}
            {shown.map(district => {
                return <li key={district.id} 
                    onClick={() => selectors.district(district)}>
                    <div className="name">
                        {district.name.short}
                    </div>
                    <div className="info">
                        {districtKindName[district.kind]}
                    </div>
                </li>
            })}
        </ul>
        <P.Pagination page={page} pages={pages} setPage={setPage}/>
    </div>;
}
