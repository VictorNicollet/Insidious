import { Pack, build, int7, rwarray, uint16array } from './serialize'
import { Grid, Cell, pack_grid } from './grid'

export const allCells : CellKind[] = []
export const tinyLocationCells : CellKind[] = []
export const smallLocationCells : CellKind[] = []
export const mediumLocationCells : CellKind[] = []
export const largeLocationCells : CellKind[] = []
export const hugeLocationCells : CellKind[] = []

export class CellKind {
    public readonly id : number
    public readonly maxCount : number
    public readonly isLocation : boolean
    constructor(
        public readonly aspect: string,
        public readonly difficulty: number,
        public readonly an: string,
        public readonly name: string,
        public readonly hasVariants: boolean,
        maxCount?: number,
        size?: "xs"|"s"|"sm"|"m"|"l"|"xl") 
    {
        this.id = allCells.length;
        allCells.push(this);
        if (size == "xs") tinyLocationCells.push(this);
        if (size == "s" || size == "sm") smallLocationCells.push(this);
        if (size == "m" || size == "sm") mediumLocationCells.push(this);
        if (size == "l" || size == "xl") largeLocationCells.push(this);
        if (size == "xl") hugeLocationCells.push(this);
        this.maxCount = maxCount || 100000
        this.isLocation = !!size;
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

export const pack_cellKind : Pack<CellKind> = build<CellKind>()
    .pass("id", int7)
    .call((id) => allCells[id]);

export const none         = new CellKind("",                1, "",    "[bug]",            false)
export const ocean        = new CellKind("ocean",           1, "the", "ocean",            true)
export const plains       = new CellKind("plains",          2, "the", "plains",           true)
export const forest       = new CellKind("forest",          4, "a",   "forest",           true)
export const marsh        = new CellKind("marsh",           5, "the", "wetlands",         true)
export const moor         = new CellKind("moor",            3, "a",   "moorland",         true)
export const hills        = new CellKind("hills",           3, "the", "hills",            true)
export const mountain     = new CellKind("mountain",        7, "the", "mountains",        true)
export const farm         = new CellKind("farm",            2, "a",   "farmland",         true)
export const graveyard    = new CellKind("graveyard",       1, "",    "Flooded Ruins",    false, 2, "xs")
export const henge        = new CellKind("henge",           1, "",    "Ancient Ruins",    false, 2, "xs")
export const foresterA    = new CellKind("forester0",       1, "a",   "Lumber Camp",      false, 0, "xs")
export const foresterB    = new CellKind("forester1",       1, "a",   "Lumber Camp",      false, 0, "xs")
export const templeRuins  = new CellKind("temple-ruins",    1, "",    "Temple Ruins",     false, 1, "xs")
export const villageUnder = new CellKind("village-under",   1, "a",   "Village",          false, 2, "xs")
export const smithy       = new CellKind("smithy",          1, "",    "Iron Works",       false, 4, "s")
export const mountainMine = new CellKind("mountain-mine",   1, "a",   "Mining Town",      true,  0, "s")
export const hillsMine    = new CellKind("hills-mine",      1, "a",   "Mining Town",      true,  0, "s")
export const forestRuins  = new CellKind("forest-ruins",    1, "",    "Overgrown Ruins",  false, 2, "s")
export const inn          = new CellKind("inn",             1, "an",  "Inn",              false, 4, "s")
export const academy      = new CellKind("temple",          1, "the", "Magic Academy",    false, 1, "s")
export const villageSmall = new CellKind("village-small",   1, "a",   "Town",             true,  0, "sm")
export const village      = new CellKind("village",         1, "a",   "Town",             true,  0, "m")
export const elvenLodge   = new CellKind("elven-lodge",     1, "a",   "Lodge",            false, 1, "xl")
export const castleA      = new CellKind("castle-red",      1, "a",   "City",             false, 0, "xl")
export const castleB      = new CellKind("castle-green",    1, "a",   "City",             false, 0, "xl")
export const castleC      = new CellKind("castle-blue",     1, "a",   "City",             false, 0, "xl")
export const castleD      = new CellKind("mountain-castle", 1, "a",   "Fortress",         false, 1, "l")
export const castleE      = new CellKind("walled-city",     1, "a",   "City",             false, 0, "xl")
export const fortA        = new CellKind("fortress",        1, "a",   "Fortress",         false, 0, "l")
export const fortB        = new CellKind("dwarven-fort",    1, "a",   "Fortress",         false, 1, "l")

export class WorldMap { 
    constructor(
        public readonly grid : Grid,
        public readonly cells: CellKind[],
        // For every cell: 
        //   - 0 if never seen
        //   - 1 if already seen, currently in fog of war
        //   - 1+N if currently seen by N agents
        public readonly vision : Uint16Array
    ) {}

    static create(grid: Grid): WorldMap {
        const cells : CellKind[] = []
        while (cells.length < grid.count) cells.push(ocean);
        return new WorldMap(grid, cells, new Uint16Array(grid.count));
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
            if (distance == 0) return discovered;
            for (let adj of grid.adjacent(cell)) 
                if (seen[cell] == 0) { ++discovered; seen[cell] = 1; }
        }

        for (let test = 0; test < this.grid.count; ++test)
            if (seen[test] == 0 && grid.distance(test, cell) <= distance)
                { ++discovered; seen[test] = 1; }

        return discovered;
    }

    // Add a viewer to a cell and the adjecent cells.
    // Return number of newly discovered cells.
    public addViewer(cell: Cell): number {
        
        let discovered = 0;
        
        const {vision, grid} = this;
        
        if (vision[cell] == 0) { ++discovered; vision[cell] = 1; }
        vision[cell]++;

        for (let adj of grid.adjacent(cell)) {
            if (vision[adj] == 0) { ++discovered; vision[adj] = 1; }
            vision[adj]++;
        }

        return discovered;
    }

    // Remove a viewer from a cell and the adjacent cells.
    public removeViewer(cell: Cell) {
        const {vision, grid} = this;
        vision[cell]--;
        for (let adj of grid.adjacent(cell))
            vision[adj]--;
    }
}

export const pack_worldMap : Pack<WorldMap> = build<WorldMap>()
    .pass("grid", pack_grid)
    .pass("cells", rwarray(pack_cellKind))
    .pass("vision", uint16array)
    .call((grid, cells, vision) => new WorldMap(grid, cells, vision));
