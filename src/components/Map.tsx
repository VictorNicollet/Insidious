import { h } from "preact"

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

export function Map(props: {n: number}) {

    const tiles : TileInfo[] = []
    const aspects : TileInfo["aspect"][] = ["plains","ocean","mountain","castle"]

    for (let y = 0; y < 20; ++y) {
        for (let x = 0; x < 20; ++x) {
            const aspect = aspects[((y + props.n * x) % aspects.length)];
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