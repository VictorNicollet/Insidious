import type { Grid } from './grid'
import type { World } from './world'

export const allCells : CellKind[] = []
export const tinyLocationCells : CellKind[] = []
export const smallLocationCells : CellKind[] = []
export const mediumLocationCells : CellKind[] = []
export const largeLocationCells : CellKind[] = []

export class CellKind {
    public readonly id : number
    public readonly maxCount : number
    constructor(
        public readonly aspect: string,
        public readonly hasVariants: boolean,
        maxCount?: number,
        size?: "xs"|"s"|"sm"|"m"|"l") 
    {
        this.id = allCells.length;
        allCells.push(this);
        if (size == "xs") tinyLocationCells.push(this);
        if (size == "s" || size == "sm") smallLocationCells.push(this);
        if (size == "m" || size == "sm") mediumLocationCells.push(this);
        if (size == "l") largeLocationCells.push(this);
        this.maxCount = maxCount || 100000
    }
}


export const none         = new CellKind("",                false)
export const ocean        = new CellKind("ocean",           true)
export const plains       = new CellKind("plains",          true)
export const forest       = new CellKind("forest",          true)
export const marsh        = new CellKind("marsh",           true)
export const moor         = new CellKind("moor",            true)
export const hills        = new CellKind("hills",           true)
export const mountain     = new CellKind("mountain",        true)
export const farm         = new CellKind("farm",            true)
export const graveyard    = new CellKind("graveyard",       false, 2, "xs")
export const henge        = new CellKind("henge",           false, 2, "xs")
export const foresterA    = new CellKind("forester0",       false, 0, "xs")
export const foresterB    = new CellKind("forester1",       false, 0, "xs")
export const templeRuins  = new CellKind("temple-ruins",    false, 1, "xs")
export const villageUnder = new CellKind("village-under",   false, 2, "xs")
export const smithy       = new CellKind("smithy",          false, 4, "s")
export const mountainMine = new CellKind("mountain-mine",   true,  0, "s")
export const hillsMine    = new CellKind("hills-mine",      true,  0, "s")
export const forestRuins  = new CellKind("forest-ruins",    false, 2, "s")
export const inn          = new CellKind("inn",             false, 4, "s")
export const temple       = new CellKind("temple",          false, 1, "s")
export const villageSmall = new CellKind("village-small",   true,  0, "sm")
export const village      = new CellKind("village",         true,  0, "m")
export const elvenLodge   = new CellKind("elven-lodge",     false, 1, "l")
export const castleA      = new CellKind("castle-red",      false, 0, "l")
export const castleB      = new CellKind("castle-green",    false, 0, "l")
export const castleC      = new CellKind("castle-blue",     false, 0, "l")
export const castleD      = new CellKind("mountain-castle", false, 1, "l")
export const castleE      = new CellKind("walled-city",     false, 0, "l")
export const fortA        = new CellKind("fortress",        false, 0, "l")
export const fortB        = new CellKind("dwarven-fort",    false, 1, "l")

export class WorldMap { 
    public readonly cells: CellKind[]
    constructor(
        public readonly grid : Grid,
        public readonly world : World
    ) {
        const cells : CellKind[] = []
        while (cells.length < grid.count) cells.push(ocean);
        this.cells = cells;
    }
}
