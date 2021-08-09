import { h } from "preact"
import { WorldMap } from 'model/map';

type TileInfo = {
    readonly aspect: "plains" | "ocean" | "mountain" | "castle"
    readonly x: number
    readonly y: number
}

const TILEWIDTH = 256/2;
const TILEYOFFSET = 192/2;
const TILEHEIGHT = 384/2;

function yshift(y: number) {
    if (y % 2 == 0) return 0;
    return 0.5;
}

export function Map(props: {map: WorldMap}) {

    const {cells, grid} = props.map;
    const tiles : TileInfo[] = []

    for (let y = 0; y < grid.side; ++y) {
        for (let x = 0; x < grid.side; ++x) {
            const aspect = cells[grid.cell(x,y)].aspect;
            tiles.push({x, y, aspect})
        }
    }

    return <div class="map" style={{
        width: 20.5 * TILEWIDTH,
        height: TILEHEIGHT + 20*TILEYOFFSET
    }}>
        {tiles.map(tile => 
            <div className={"hex " + tile.aspect} 
                 key={tile.x + "," + tile.y}
                 style={{top: tile.y * TILEYOFFSET, 
                         left: (tile.x + yshift(tile.y)) * TILEWIDTH}} />
        )}
    </div>
}