import type { Grid } from './grid'
import type { World } from './world'

export const allCells : CellKind[] = []
export const tinyLocationCells : CellKind[] = []
export const smallLocationCells : CellKind[] = []
export const mediumLocationCells : CellKind[] = []
export const largeLocationCells : CellKind[] = []

export class CellKind {
    public readonly id : number
    constructor(
        public readonly aspect: string,
        public readonly hasVariants: boolean,
        size?: "xs"|"s"|"sm"|"m"|"l") 
    {
        this.id = allCells.length;
        allCells.push(this);
        if (size == "xs") tinyLocationCells.push(this);
        if (size == "s" || size == "sm") smallLocationCells.push(this);
        if (size == "m" || size == "sm") mediumLocationCells.push(this);
        if (size == "l") largeLocationCells.push(this);
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
export const graveyard    = new CellKind("graveyard",       false, "xs")
export const henge        = new CellKind("henge",           false, "xs")
export const foresterA    = new CellKind("forester0",       false, "xs")
export const foresterB    = new CellKind("forester1",       false, "xs")
export const templeRuins  = new CellKind("temple-ruins",    false, "xs")
export const villageUnder = new CellKind("village-under",   false, "xs")
export const smithy       = new CellKind("smithy",          false, "s")
export const mountainMine = new CellKind("mountain-mine",   true,  "s")
export const hillsMine    = new CellKind("hills-mine",      true,  "s")
export const forestRuins  = new CellKind("forest-ruins",    false, "s")
export const inn          = new CellKind("inn",             false, "s")
export const temple       = new CellKind("temple",          false, "s")
export const villageSmall = new CellKind("village-small",   true,  "sm")
export const village      = new CellKind("village",         true,  "m")
export const elvenLodge   = new CellKind("elven-lodge",     false, "l")
export const castleA      = new CellKind("castle-red",      false, "l")
export const castleB      = new CellKind("castle-green",    false, "l")
export const castleC      = new CellKind("castle-blue",     false, "l")
export const castleD      = new CellKind("mountain-castle", false, "l")
export const castleE      = new CellKind("walled-city",     false, "l")
export const fortA        = new CellKind("fortress",        false, "l")
export const fortB        = new CellKind("dwarven-fort",    false, "l")


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
