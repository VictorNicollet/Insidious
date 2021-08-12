import { h, JSX } from "preact"
import { Cell, Grid } from 'model/grid';
import { WorldView } from 'view/world';
import { AgentCount } from './AgentCount';
import { useWorld } from './Context';

const ABOVE = 128/2;
const TILEWIDTH = 256/2;
const TILEYOFFSET = 192/2;
const TILEHEIGHT = 384/2;

// Offset of the center from the top-left of the sprite
const CENTERX = TILEWIDTH/2;
const CENTERY = ABOVE + (TILEHEIGHT - ABOVE)/2; 

// Odd hex rows are shifted
function yshift(y: number) {
    if (y % 2 == 0) return 0;
    return 0.5;
}

// The variant (0..3) for cells that have one.
function variant(cell: Cell) {
    return (((cell >> 6) ^ (cell >> 4) ^ (cell >> 2) ^ cell) & 3).toString()
}

// A cell in the grid.
export function Cell(props: {
    cell: Cell
    fog?: boolean
    selected?: boolean
    top: number
    left: number 
    // Naked: draw only the hex, no other decoration.
    naked?: boolean
}): JSX.Element {

    const world = useWorld();
    const {cells, locations} = world.map;

    const {aspect, hasVariants} = cells[props.cell];
    const location = props.naked || typeof locations[props.cell] == "undefined"
        ? undefined : world.locations[locations[props.cell]];
    
    return <div className={"hex " + aspect + 
                           (hasVariants ? variant(props.cell) : "") +
                           (props.fog ? " fog" : "") + 
                           (props.selected ? " selected" : "") }  
             style={{left:props.left, top:props.top}}>
        {location && <span className="name">
                        <AgentCount count={location.agents.length}/>
                        {location.name.short}
                     </span>}
    </div>
}

export function Map(props: {
    world: WorldView, 
    selected: Cell|undefined
}) {

    const {map: {grid, vision}} = useWorld();
    const tiles : JSX.Element[] = []

    for (let y = 0; y < grid.side; ++y) {
        for (let x = 0; x < grid.side; ++x) {
            const cell = grid.cell(x,y);
            if (!vision[cell]) continue;
            tiles.push(<Cell 
                key={cell} 
                fog={vision[cell] < 2}
                cell={cell} 
                selected={props.selected === cell}
                top={y * TILEYOFFSET - CENTERY} 
                left={(x + yshift(y)) * TILEWIDTH - CENTERX}/>)
        }
    }

    const cn = typeof props.selected == "undefined" ? "map" : "map unselected";

    return <div className={cn}
                style={{
                    width: 20.5 * TILEWIDTH,
                    height: TILEHEIGHT + 20*TILEYOFFSET
                }}>
        {tiles}
    </div>
}

// The position of the center of the hex cell, in pixel coordinates, on the map.
export function cellPos(cell: Cell, grid: Grid): [number, number] {
    const [cx, cy] = grid.uncell(cell);
    return [
        (cx + yshift(cy)) * TILEWIDTH,
        (cy * TILEYOFFSET) 
    ];
}

// The nearest cell to the provided pixel coordinates, on the map.
export function pick(x: number, y: number, grid: Grid): Cell|undefined {
    let best : Cell|undefined = undefined;
    let bestDistance = TILEWIDTH * TILEWIDTH;
    for (let cell = 0; cell < grid.count; ++cell) {
        const [cx,cy] = cellPos(cell, grid);
        const dx = cx - x;
        const dy = cy - y;
        const d = dx * dx + dy * dy;
        if (d < bestDistance) { 
            best = cell ; bestDistance = d; 
        }
    }
    return best;
}