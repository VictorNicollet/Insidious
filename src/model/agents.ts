import type { World } from "./world"
import type { PersonName } from './names'
import type { Location } from "./locations"
import type { Cell } from './grid'
import { Occupation, ByOccupation, lvlxp } from './occupation'
import { Stats, computeStats } from './stats'
import { Order, done } from "./orders"
import { objmap } from 'objmap'

export class Agent {
    public stats : Stats
    public order : Order
    public exposure : number
    private experience : ByOccupation<number>
    constructor(
        public readonly world : World,
        public name: PersonName,
        public location: Location|undefined,
        public cell: Cell,
        public occupation: Occupation,
        public levels: ByOccupation<number>
    ) {
        this.stats = computeStats(this);
        this.order = done;
        this.exposure = 0;
        this.experience = objmap(this.levels, lvl => lvlxp[lvl])
    }

    // Add experience to the specified occupation of this agent.
    public earnExperience(occupation: Occupation, xp: number) {
        const newxp = this.experience[occupation] += xp;
        
        let newlvl = 0;
        while (newxp >= lvlxp[newlvl + 1]) newlvl++;

        if (newlvl == this.levels[occupation]) return;

        const gainedlvls = newlvl - this.levels[occupation];
        this.levels[occupation] = newlvl;
        this.stats = computeStats(this);

        // TODO: notify that agent has gained a level.
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