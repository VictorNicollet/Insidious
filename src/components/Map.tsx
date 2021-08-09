import { h } from "preact"
import { WorldMap } from 'model/map';
import { Cell, Grid } from 'model/grid';

type TileInfo = {
    readonly aspect: "plains" | "ocean" | "mountain" | "castle"
    readonly x: number
    readonly y: number
    readonly cell: number
}

const ABOVE = 128/2;
const TILEWIDTH = 256/2;
const TILEYOFFSET = 192/2;
const TILEHEIGHT = 384/2;

// Offset of the center from the top-left of the sprite
const CENTERX = TILEWIDTH/2;
const CENTERY = ABOVE + (TILEHEIGHT - ABOVE)/2; 

function yshift(y: number) {
    if (y % 2 == 0) return 0;
    return 0.5;
}


export function Map(props: {map: WorldMap, selected: Cell|undefined}) {

    const {cells, grid} = props.map;
    const tiles : TileInfo[] = []

    for (let y = 0; y < grid.side; ++y) {
        for (let x = 0; x < grid.side; ++x) {
            const cell = grid.cell(x,y);
            const aspect = cells[cell].aspect;
            tiles.push({x, y, aspect, cell})
        }
    }

    return <div className={typeof props.selected == "undefined" 
                            ? "map" : "map unselected"}
                style={{
                    width: 20.5 * TILEWIDTH,
                    height: TILEHEIGHT + 20*TILEYOFFSET
                }}>
        {tiles.map(tile => 
            <div className={"hex " + tile.aspect + 
                            (tile.cell == props.selected ? " selected" : "") }  
                 key={tile.cell}
                 style={{top: tile.y * TILEYOFFSET - CENTERY, 
                         left: (tile.x + yshift(tile.y)) * TILEWIDTH - CENTERX}} />
        )}
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