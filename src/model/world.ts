import { Location } from "./locations"
import { Agent } from "./agents"
import type { PersonName, LocationName } from './names';
import { WorldMap } from './map';
import type { Cell, Grid } from './grid';
import type { ByOccupation, Occupation } from './occupation';
import type { Resources, ResourcesOf } from './resources';
import { countDailyResources, executeOrder } from './execute';
import { Explained, Reason, explain, dedup } from './explainable';
import { Routes } from './routes';
import { Message } from './message';

export class World {
    private readonly _locations : Location[]
    private readonly _agents : Agent[]
    private readonly _listeners : (() => void)[]
    public readonly map : WorldMap
    public readonly seenLocations : Location[]
    public readonly resources: Resources

    // Pathfinding cache, cleared every time map visibility changes.
    private _routes : Routes|undefined

    // A *stack* of mssages to be displayed on the next render.
    private readonly messages : Message[]

    constructor(grid: Grid) {
        this._locations = [];
        this._agents = [];
        this._listeners = [];
        this.seenLocations = [];
        this.messages = [];
        this.map = new WorldMap(grid, this);
        this._routes = undefined
        this.resources = { gold: 0, touch: 0 }
    }

    // Add a new message, to be displayed on the next render.
    // Multiple messages will be queued, and displayed one at a time,
    // in reverse order (the last pushed message is displayed first)
    public newMessage(message: Message) {
        this.messages.push(message);
    }

    // Remove the first message (the one that would be 
    // returned by 'firstMessage()'). 
    // TODO: pass action arguments if needed.
    public removeMessage() {
        this.messages.shift();
    }

    // The first message, undefined if none.
    public firstMessage() : Message|undefined {
        return this.messages[0];
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

        if (seen > 0) {
            this.refreshSeenLocations();
            this._routes = undefined;
        }
    }

    // Add any visible locations to 'seenLocations' if they were
    // not already visible.
    public refreshSeenLocations() {
        for (let loc of this._locations) {
            if (this.map.vision[loc.cell] == 0) continue;
            if (this.seenLocations.indexOf(loc) >= 0) continue;
            this.seenLocations.push(loc);
            this._routes = undefined;
        }
    }

    // Return all available routes, re-computing them if necessary.
    public routes(): Routes  {
        if (this._routes === undefined)
            this._routes = new Routes(this.map);
        return this._routes;
    }

    // Compute the current daily resource production (does not include
    // one-off consumption). 
    public dailyResources(): ResourcesOf<Explained> {
        const total : ResourcesOf<Reason[]> = { gold: [], touch: [] };
        for (let agent of this._agents) countDailyResources(agent, total);
        return {
            gold: explain(dedup(total.gold)),
            touch: explain(dedup(total.touch))
        }
    }

    // Adds a new listener that listens to 'refresh()' calls.
    public addListener(callback: () => void): () => void {
        this._listeners.push(callback);
        return () => { 
            const index = this._listeners.findIndex(callback);
            this._listeners[index] = this._listeners[this._listeners.length - 1];
            this._listeners.pop();
        }
    }

    // Notifies the listeners that something has changed.
    public refresh() {
        for (let cb of this._listeners) cb();
    }

    // End the current turn, applying a simulation step
    public endTurn() {

        // First, apply resource changes. This is done for two reasons: 
        //  1. to reuse the dailyResources() function, and thus be 
        //     certain that the shown daily resource usage is the one 
        //     used for actual computations.
        //  2. so that the order of execution does not cause orders to 
        //     run out of resources by mistake (e.g. with zero gold, 
        //     executing (-5, +10) fails but (+10, -5) works). 
        // This may cause resources to go negative. We'll fix this in 
        // a later stage !
        const res = this.dailyResources();
        this.resources.gold += res.gold.value;
        this.resources.touch += res.touch.value;
        
        // Now, execute orders, applying their effects.
        for (let agent of this._agents) {
            agent.order = executeOrder(agent)
        }

        // All done, notify the view that it should be re-rendered because
        // the world changed.
        this.refresh()
    }
}