import { h, JSX } from "preact"
import { LocationList } from './LocationList'
import { Cell } from 'model/grid';
import { WorldView } from 'view/world';

const MARGINTOP = 10;
const MARGINBOT = 57;
// The left panel provides top-level lists of things (all locations,
// all priests, etc.)
export function LeftPanel(props: {
    screenH: number
    screenW: number
    world: WorldView
    select: (cell: Cell) => void
}): JSX.Element {
    const height = props.screenH - MARGINTOP - MARGINBOT;
    return <div style={{
        position: "fixed",
        left: 10,
        top: MARGINTOP,
        bottom: MARGINBOT,
        width: 340
    }}>
        <LocationList locations={props.world.locations}
                      height={height} 
                      select={props.select} />
    </div>
}
