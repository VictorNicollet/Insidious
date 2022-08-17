import type { World } from "./world"
import { pack_personName, PersonName } from './names'
import type { Location } from "./locations"
import type { Cell } from './grid'
import { Occupation, ByOccupation, lvlxp, pack_occupation, pack_byOccupation } from './occupation'
import { Stats, computeStats } from './stats'
import { Order, done, pack_order } from "./orders"
import { objmap } from '../objmap'
import { build, int7, option, Pack } from "./serialize"

export class Agent {
    // Cached stats computed from the agent's other properties
    public stats : Stats
    public readonly world : World
    constructor(
        public name: PersonName,
        public location: Location|undefined,
        public cell: Cell,
        public occupation: Occupation,
        public levels: ByOccupation<number>,
        public experience : ByOccupation<number>,
        public exposure: number,
        public order : Order,
    ) {
        this.stats = computeStats(this);

        // We cheat by injecting the world reference later, when
        // this instances is added to the world
        // (because Locations and World are mutually recursive)
        this.world = undefined as any
    }

    static create(
        name: PersonName,
        location: Location|undefined,
        cell: Cell,
        occupation: Occupation,
        levels: ByOccupation<number>): Agent
    {
        return new Agent(
            name,
            location,
            cell, 
            occupation,
            levels,
            objmap(levels, lvl => lvlxp[lvl]),
            0,
            done);
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
            const location = this.world.seenLocations.find(l => l.cell == cell)!;
            this.location = location;
            this.world.visitLocation(location);
        } else {
            this.location = undefined;
        }
    }

    // Does the agent survive 'count' attacks with power 'attack' ?
    public survives(attack: number, count: number) {
        let accumulated = 0;
        for (let i = 0; i < count; ++i) {
            if (Math.random() > this.stats.combat.value / 100) accumulated += attack;
        }
        return accumulated < 10;
    } 

    // Change the order of this agent, refreshing any related values
    public setOrder(order: Order) {
        this.order = order;
        this.location?.refresh();
        this.world.refresh();
    }
}

export function pack_agent(loc: Pack<Location>) : Pack<Agent> {
    return build<Agent>()
        .pass("name", pack_personName)
        .pass("cell", int7)
        .pass("location", option(loc))
        .pass("occupation", pack_occupation)
        .pass("levels", pack_byOccupation(int7))
        .pass("experience", pack_byOccupation(int7))
        .pass("exposure", int7)
        .pass("order", pack_order(loc))
        .call((name, cell, location, occupation, levels, experience, exposure, order) => 
            new Agent(name, location, cell, occupation, levels, experience, exposure, order));
}
