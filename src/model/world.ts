import { Location } from "./locations"
import { Person } from "./people"
import { PersonName, LocationName } from './names';
import { WorldMap } from './map';
import { Cell } from './grid';

export class World {
    private readonly _locations : Location[]
    private readonly _people : Person[]

    constructor(public readonly map : WorldMap) {
        this._locations = [];
        this._people = [];
    }

    public newLocation(
        name: LocationName,
        coords: Cell) : Location
    {
        const location = new Location(this, name, coords);
        this._locations.push(location);
        return location;
    }

    public locations() : readonly Location[] { return this._locations; }

    public newPerson(
        name: PersonName,
        location: Location) : Person
    {
        const person = new Person(this, name, location);
        this._people.push(person);
        return person;
    }
 
}