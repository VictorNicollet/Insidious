import { Location } from "./locations"
import { Agent } from "./agents"
import { PersonName, LocationName } from './names';
import { WorldMap } from './map';
import { Cell, Grid } from './grid';
import { ByOccupation, Occupation } from './occupation';
import { Resources } from './resources';

export class World {
    private readonly _locations : Location[]
    private readonly _agents : Agent[]
    public readonly map : WorldMap
    public readonly seenLocations : Location[]
    public readonly resources: Resources

    constructor(grid: Grid) {
        this._locations = [];
        this._agents = [];
        this.seenLocations = [];
        this.map = new WorldMap(grid, this);
        this.resources = { gold: 0, touch: 0 }
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
        location: Location,
        occupation: Occupation, 
        levels: ByOccupation<number>) : Agent
    {
        const person = new Agent(
            this, name, location, location.cell, occupation, levels);
        this._agents.push(person);
        this.visitLocation(location);
        this.map.addViewer(location.cell);
        return person;
    }
 
    public agents() : readonly Agent[] { return this._agents; }

    public visitLocation(location: Location) { 
        // View 2 around the location
        let seen = this.map.makeSeen(location.cell, 2);
        // For other locations at distance 3, view 1
        for (let other of this._locations) {
            if (this.map.grid.distance(location.cell, other.cell) == 3)
                seen += this.map.makeSeen(other.cell, 1)
        }

        if (seen > 0)
            this.refreshSeenLocations();
    }

    // Add any visible locations to 'seenLocations' if they were
    // not already visible.
    private refreshSeenLocations() {
        for (let loc of this._locations) {
            if (this.map.vision[loc.cell] == 0) continue;
            if (this.seenLocations.indexOf(loc) >= 0) continue;
            this.seenLocations.push(loc);
        }
    }
}