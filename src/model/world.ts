import { Location } from "./locations"
import { Agent } from "./agents"
import type { PersonName } from './names';
import type { WorldMap } from './map';
import type { Cell } from './grid';
import type { ByOccupation, Occupation } from './occupation';
import type { Resources, ResourcesOf } from './resources';
import { countResourceDelta, executeOrder } from './execute';
import { Explained, Reason, explain, dedup } from './explainable';
import { Routes } from './routes';
import type { Message } from './message';
import { Sagas, ActiveSaga } from './saga';
import { Population } from './population';
import { WorldFlags, worldFlags } from './flags';

export class World {
    private readonly _locations: readonly Location[]
    private readonly _agents : Agent[]
    private readonly _listeners : (() => void)[]
    private readonly _sagas : Sagas
    public readonly population : Population
    public readonly seenLocations : Location[]
    public readonly resources: Resources
    public readonly flags: WorldFlags
    public readonly god: {name: string, aspect: string}

    // Current turn number
    private turn : number

    // Pathfinding cache, cleared every time map visibility changes.
    private _routes : Routes|undefined

    // A *stack* of mssages to be displayed on the next render.
    private readonly messages : Message[]

    constructor(
        locations : {population:number,cell:Cell}[],
        public readonly map : WorldMap
    ) {
        this._locations = locations.map((l, id) => 
            new Location(id, this, l.cell, l.population));
        this._agents = [];
        this._listeners = [];
        this.seenLocations = [];
        this.messages = [];
        this._routes = undefined
        this.resources = { gold: 0, touch: 0 }
        this._sagas = new Sagas(this);
        this.population = new Population(this._locations);
        this.turn = 0
        this.flags = worldFlags
        this.god = {name: "Azathoth", aspect: "madness"}
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

    public removeAgent(agent: Agent) {
        const idx = this._agents.indexOf(agent);
        if (idx < 0) return;
        this._agents[idx] = this._agents[this._agents.length - 1];
        this._agents.pop();
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
            this._routes = new Routes(this, this.map);
        return this._routes;
    }

    // Compute the current daily resource production (does not include
    // one-off consumption). 
    public resourceDelta(): ResourcesOf<{daily:Explained, once:number}> {
        const total : ResourcesOf<{daily:Reason[], once:number}> = { 
            gold: { daily:[], once: 0 },
            touch: { daily:[], once: 0 }
        };
        for (let agent of this._agents) 
            countResourceDelta(agent, total);
        return {
            gold: {
                daily: explain(dedup(total.gold.daily)),
                once: total.gold.once
            },
            touch: {
                daily: explain(dedup(total.touch.daily)),
                once: total.touch.once
            }
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

        // Apply resource changes
        const res = this.resourceDelta();
        this.resources.gold += res.gold.daily.value + res.gold.once;
        this.resources.touch += res.touch.daily.value + res.touch.once;
        
        // Now, execute orders, applying their effects.
        for (let agent of this._agents) {
            agent.order = executeOrder(agent)
        }

        // Run through all sagas.
        this._sagas.run();

        // Increment turn number and execute weekly changes
        if (++this.turn % 7 == 0)
            this.population.weekly();

        // All done, notify the view that it should be re-rendered because
        // the world changed.
        this.refresh();
    }

    public addSaga(saga: ActiveSaga) {
        this._sagas.add(saga);
    }
}