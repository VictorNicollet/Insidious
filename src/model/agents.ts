import type { World } from "./world"
import type { PersonName } from './names'
import type { Location } from "./locations"
import type { Cell } from './grid'
import type { Occupation, ByOccupation } from './occupation'
import { Stats, computeStats } from './stats'
import { Order, undercover } from "./orders"

export class Agent {
    public stats : Stats
    public order : Order
    public progress : number
    constructor(
        public readonly world : World,
        public name: PersonName,
        public location: Location|undefined,
        public cell: Cell,
        public occupation: Occupation,
        public levels: ByOccupation<number>
    ) {
        this.stats = computeStats(this);
        this.order = undercover;
        this.progress = 0;
    }

    // Move the agent to a new cell.
    public moveTo(cell: Cell) {
        const map = this.world.map;
        // Stop seeing the old cell
        map.removeViewer(this.cell);

        // Start seeing the new cell
        this.cell = cell;
        const seen = map.addViewer(cell);
        if (seen > 0)
            this.world.refreshSeenLocations();

        // Is the new cell a location ? 
        if (map.cells[cell].isLocation) {
            const location = this.world.seenLocations.find(l => l.cell == cell);
            this.location = location;
            this.world.visitLocation(location);
        } else {
            this.location = undefined;
        }
    }
}