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
        coords: Cell,
        population: number)
    {
        this._locations.push(new Location(this, name, coords, population));
    }

    public locations() : readonly Location[] { return this._locations; }

    public newAgent(
        name: PersonName,
        location: Location) : Agent
    {
        const person = new Agent(this, name, location, location.cell);
        this._agents.push(person);
        this.visitLocation(location);
        this.map.addViewer(location.cell);
        return person;
    }
 
    public agents() : readonly Agent[] { return this._agents; }

    public visitLocation(location: Location) {
        // View 2 around the location
        this.map.makeSeen(location.cell, 2);
        // For other locations at distance 3, view 1
        for (let other of this._locations) {
            if (this.map.grid.distance(location.cell, other.cell) == 3)
                this.map.makeSeen(other.cell, 1)
        }
    }
}