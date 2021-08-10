import { h, JSX } from "preact"
import { LocationList } from './LocationList'
import { World } from 'model/world';
import { Cell } from 'model/grid';

const MARGIN = 10;

// The left panel provides top-level lists of things (all locations,
// all priests, etc.)
export function LeftPanel(props: {
    screenH: number
    screenW: number
    world: World
    select: (cell: Cell) => void
}): JSX.Element {
    const height = props.screenH - 2*MARGIN;
    return <div style={{
        position: "fixed",
        left: MARGIN,
        top: MARGIN,
        bottom: MARGIN,
        width: 340
    }}>
        <LocationList locations={props.world.locations()}
                      height={height} 
                      select={props.select} />
    </div>
}
