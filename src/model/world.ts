import { Location } from "./locations"
import { Agent } from "./agents"
import { PersonName, LocationName } from './names';
import { WorldMap } from './map';
import { Cell, Grid } from './grid';

export class World {
    private readonly _locations : Location[]
    private readonly _agents : Agent[]
    public readonly map : WorldMap

    constructor(grid: Grid) {
        this._locations = [];
        this._agents = [];
        this.map = new WorldMap(grid, this)
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

    public newAgent(
        name: PersonName,
        location: Location) : Agent
    {
        const person = new Agent(this, name, location, location.cell);
        this._agents.push(person);
        return person;
    }
 
    public agents() : readonly Agent[] { return this._agents; }
}