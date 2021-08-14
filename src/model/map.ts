import type { Grid, Cell } from './grid'
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
        public readonly an: string,
        public readonly name: string,
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

    // A human-readable 'in this location' sentence, e.g. 'in the ocean'
    public inThis() {
        return this.an === "" ? "in " + this.name : "in " + this.an + " " + this.name;
    }

    // True if this cell kind is one of the specified cell kinds
    public is(...others: CellKind[]) {
        for (let other of others)
            if (other.id === this.id) return true;
        return false;
    }
}


export const none         = new CellKind("",                "",    "[bug]",            false)
export const ocean        = new CellKind("ocean",           "the", "ocean",            true)
export const plains       = new CellKind("plains",          "the", "plains",           true)
export const forest       = new CellKind("forest",          "a",   "forest",           true)
export const marsh        = new CellKind("marsh",           "the", "wetlands",         true)
export const moor         = new CellKind("moor",            "a",   "moorland",         true)
export const hills        = new CellKind("hills",           "the", "hills",            true)
export const mountain     = new CellKind("mountain",        "the", "mountains",        true)
export const farm         = new CellKind("farm",            "a",   "farmland",         true)
export const graveyard    = new CellKind("graveyard",       "",    "Flooded Ruins",    false, 2, "xs")
export const henge        = new CellKind("henge",           "",    "Ancient Ruins",    false, 2, "xs")
export const foresterA    = new CellKind("forester0",       "a",   "Lumber Camp",      false, 0, "xs")
export const foresterB    = new CellKind("forester1",       "a",   "Lumber Camp",      false, 0, "xs")
export const templeRuins  = new CellKind("temple-ruins",    "",    "Temple Ruins",     false, 1, "xs")
export const villageUnder = new CellKind("village-under",   "a",   "Village",          false, 2, "xs")
export const smithy       = new CellKind("smithy",          "",    "Iron Works",       false, 4, "s")
export const mountainMine = new CellKind("mountain-mine",   "a",   "Mining Town",      true,  0, "s")
export const hillsMine    = new CellKind("hills-mine",      "a",   "Mining Town",      true,  0, "s")
export const forestRuins  = new CellKind("forest-ruins",    "",    "Overgrown Ruins",  false, 2, "s")
export const inn          = new CellKind("inn",             "an",  "Inn",              false, 4, "s")
export const academy      = new CellKind("temple",          "the", "Magic Academy",    false, 1, "s")
export const villageSmall = new CellKind("village-small",   "a",   "Town",             true,  0, "sm")
export const village      = new CellKind("village",         "a",   "Town",             true,  0, "m")
export const elvenLodge   = new CellKind("elven-lodge",     "a",   "Lodge",            false, 1, "l")
export const castleA      = new CellKind("castle-red",      "a",   "City",             false, 0, "l")
export const castleB      = new CellKind("castle-green",    "a",   "City",             false, 0, "l")
export const castleC      = new CellKind("castle-blue",     "a",   "City",             false, 0, "l")
export const castleD      = new CellKind("mountain-castle", "a",   "Fortress",         false, 1, "l")
export const castleE      = new CellKind("walled-city",     "a",   "City",             false, 0, "l")
export const fortA        = new CellKind("fortress",        "a",   "Fortress",         false, 0, "l")
export const fortB        = new CellKind("dwarven-fort",    "a",   "Fortress",         false, 1, "l")

export class WorldMap { 
    public readonly cells: CellKind[]
    // For every cell: 
    //   - 0 if never seen
    //   - 1 if already seen, currently in fog of war
    //   - 1+N if currently seen by N agents
    public readonly vision: Uint32Array
    constructor(
        public readonly grid : Grid,
        public readonly world : World
    ) {
        const cells : CellKind[] = []
        while (cells.length < grid.count) cells.push(ocean);
        this.cells = cells;
        this.vision = new Uint32Array(grid.count);
    }

    // Mark a cell, and surrounding cells in a radius of 1,
    // as having been seen (if not already)
    // Returns the number of cells that are now seen that 
    // were previously unseed.
    public makeSeen(cell: Cell, distance: number): number {
        
        let discovered = 0;
        const seen = this.vision;
        const grid = this.grid;

        if (distance <= 1) {
            if (seen[cell] == 0) { ++discovered; seen[cell] = 1; }
            if (distance == 0) return;
            for (let adj of grid.adjacent(cell)) 
                if (seen[cell] == 0) { ++discovered; seen[cell] = 1; }
        }

        for (let test = 0; test < this.grid.count; ++test)
            if (seen[test] == 0 && grid.distance(test, cell) <= distance)
                { ++discovered; seen[test] = 1; }

        return discovered;
    }

    // Add a viewer to a cell and the adjecent cells.
    public addViewer(cell: Cell) {
        const seen = this.vision;
        const grid = this.grid;
        seen[cell] = 1 + (seen[cell] || 1);
        for (let adj of grid.adjacent(cell))
            seen[adj] = 1 + (seen[adj] || 1);
    }
}
