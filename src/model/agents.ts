import type { World } from "./world"
import { PersonName } from './names'
import { Location } from "./locations"
import { Cell } from './grid'
import { Occupation, ByOccupation } from './occupation'
import { Stats, computeStats } from './stats'

export class Agent {
    public stats : Stats
    constructor(
        private readonly world : World,
        public name: PersonName,
        public location: Location|undefined,
        public cell: Cell,
        public occupation: Occupation,
        public levels: ByOccupation<number>
    ) {
        this.stats = computeStats(this);
    }
}