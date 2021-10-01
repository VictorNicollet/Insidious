import { h, JSX } from "preact"
import type { Cell, Grid } from '../model/grid';
import type { WorldView } from '../view/world';
import { AgentCount } from './AgentCount';
import { useWorld } from './Context';
import { useMemo } from 'preact/hooks';

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

// Display a path segment inside the cell, given the grid-level 
// offsets to the origin and destination cells. 
function PathSvg(props: {
    originX: number,
    originY: number,
    destX: number,
    destY: number
}) {
    const {originX, originY, destX, destY} = props;
    const __html = [
        "<path d=\"M",
        (CENTERX + CENTERX * originX).toFixed(),
        " ",
        (CENTERY + (0.5 * TILEYOFFSET * originY)).toFixed(),
        "C",
        CENTERX.toFixed(),
        " ",
        CENTERY.toFixed(),
        ",",
        CENTERX.toFixed(),
        " ",
        CENTERY.toFixed(),
        ",",
        (CENTERX + CENTERX * destX).toFixed(),
        " ",
        (CENTERY + (0.5 * TILEYOFFSET * destY)).toFixed(),
        "\"></path>"
    ].join("");
    return <svg className="path" width="128" height="192" dangerouslySetInnerHTML={{__html}}/>
}

// A cell in the grid.
export function MapCell(props: {
    cell: Cell
    show?: boolean
    fog?: boolean
    selected?: boolean
    top: number
    left: number
    // Display an agent's portrait on the cell ?
    portraits: string[]
    // If in a path, the cell before and cell after
    pathBefore?: Cell
    pathAfter?: Cell 
    // Naked: draw only the hex, no other decoration.
    naked?: boolean
}): JSX.Element {

    const world = useWorld();
    const {cells, locations, grid} = world.map;

    const {aspect, hasVariants} = cells[props.cell];
    const locid = locations[props.cell];
    const location = props.naked || typeof locid == "undefined"
        ? undefined : world.locations[locid];
    
    const path = useMemo<JSX.Element|undefined>(() => {
        const [bX, bY] = grid.uncell(props.pathBefore ? props.pathBefore : props.cell);
        const [myX, myY] = grid.uncell(props.cell);
        const [aX, aY] = grid.uncell(props.pathAfter ? props.pathAfter : props.cell);
        
        return <PathSvg originX={bX+yshift(bY)-myX-yshift(myY)} originY={bY-myY}
                        destX={aX+yshift(aY)-myX-yshift(myY)} destY={aY-myY} />
    }, [grid, props.pathBefore, props.pathAfter])

    return <div className={"hex " + aspect + 
                           (hasVariants ? variant(props.cell) : "") +
                           (props.fog ? " fog" : "") + 
                           (props.selected ? " selected" : "") +
                           (props.show === false ? " hide" : "")}  
            style={{left:props.left, top:props.top}}>
        {path}
        {location 
            ? <span className="name">
                <AgentCount count={location.agents.length}/>
                {location.name.short}
            </span>
            : props.portraits.map((p,i) => 
                <div key={p} className={"portrait " + p}/>)}
    </div>
}

export function Map(props: {
    world: WorldView
    selected: Cell|undefined
    path: readonly Cell[]|undefined
}) {

    const {map: {grid, vision}, agents} = useWorld();
    const tiles : JSX.Element[] = []

    const [pathBefore, pathAfter] = useMemo<[(n: number) => Cell|undefined, 
                                             (n: number) => Cell|undefined]>(() => {
        if (!props.path || !props.path.length || typeof props.selected === "undefined") 
            return [() => undefined, () => undefined];
        // For each cell on the map, store 0 if no before (resp. after), or 
        // the other cell+1.
        const before = new Int32Array(grid.count);
        const after  = new Int32Array(grid.count);
        before[props.path[0]] = props.selected + 1;
        for (let i = 1; i < props.path.length; ++i) {
            before[props.path[i]] = props.path[i-1] + 1;
            after[props.path[i-1]] = props.path[i] + 1
        }
        return [(n) => before[n] ? before[n] - 1 : undefined,
                (n) => after[n] ? after[n] - 1 : undefined]
    }, [grid, props.path])

    const portraits = useMemo<string[][]>(() => {
        const portraits : string[][] = [];
        for (let cell = 0; cell < grid.count; ++cell) portraits.push([]);
        for (let agent of agents) 
            portraits[agent.cell].push("x");
        return portraits;
    }, [agents, grid]);

    for (let y = 0; y < grid.side; ++y) {
        for (let x = 0; x < grid.side; ++x) {
            const cell = grid.cell(x,y);
            tiles.push(<MapCell 
                key={cell} 
                show={!!vision[cell]}
                fog={vision[cell] < 2}
                cell={cell} 
                pathAfter={pathAfter(cell)}
                pathBefore={pathBefore(cell)}
                portraits={portraits[cell]}
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