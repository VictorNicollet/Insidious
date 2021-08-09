import { h, JSX } from "preact"
import { LocationList } from './LocationList'
import { World } from 'model/world';

// The left panel provides top-level lists of things (all locations,
// all priests, etc.)

const FLUFF = 220;
const ITEMSIZE = 50;

export function LeftPanel(props: {
    screenH: number
    screenW: number
    world: World
}): JSX.Element {
    const pagesize = Math.floor((props.screenH - FLUFF) / ITEMSIZE);
    return <div style={{
        position: "fixed",
        left: 10,
        top: 10,
        bottom: 10,
        width: 340
    }}>
        <LocationList locations={props.world.locations()}
                      pagesize={pagesize} />
    </div>
}