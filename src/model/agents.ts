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
        private readonly world : World,
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
}