import type { World } from "./world"
import { PersonName } from './names'
import { Location } from "./locations"

export class Person {
    constructor(
        private readonly world : World,
        public name: PersonName,
        public location: Location) {}
}