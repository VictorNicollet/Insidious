import type { World } from "./world"
import { PersonName } from './names'
import { Location } from "./locations"
import { Cell } from './grid'
import { Occupation, ByOccupation } from './occupation'

export class Agent {
    constructor(
        private readonly world : World,
        public name: PersonName,
        public location: Location|undefined,
        public cell: Cell,
        public occupation: Occupation,
        public levels: ByOccupation<number>) {}
}