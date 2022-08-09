import { Location, pack_location, pack_locationRef } from "./locations"
import { Agent, pack_agent } from "./agents"
import type { PersonName } from './names';
import { pack_worldMap, WorldMap } from './map';
import type { Cell } from './grid';
import type { ByOccupation, Occupation } from './occupation';
import { pack_resourcesOf, Resources, ResourcesOf } from './resources';
import { countResourceDelta, executeOrder } from './execute';
import { Explained, Reason, explain, dedup } from './explainable';
import { Routes } from './routes';
import type { Message } from './message';
import { Sagas, ActiveSaga } from './saga';
import { pack_population, Population } from './population';
import { pack_worldFlags, WorldFlags, worldFlags } from './flags';
import { pack_plan, Plan } from './plans';
import { God, pack_god, sample } from './god'
import { Cult, pack_cult } from "./cult";
import * as S from "./serialize";
import { saveToLocalStore } from "localStoreSave";

export class World {
    
    private readonly _listeners : (() => void)[]

    // Pathfinding cache, cleared every time map visibility changes.
    private _routes : Routes|undefined


    private readonly _sagas : Sagas

    constructor(
        private readonly _locations: readonly Location[],
        public readonly seenLocations : Location[],
        private readonly _agents : Agent[],
        private readonly _plans : Plan[],
        private _cult : Cult|undefined,
        public readonly population : Population,
        public readonly resources: Resources,
        public readonly flags: WorldFlags,
        public readonly god: God,

        // Current turn number
        private turn : number,

        // A *stack* of mssages to be displayed on the next render.
        private readonly messages : Message[],
        public readonly map : WorldMap)
    {
        for (const location of this._locations) 
            (location as {world: World}).world = this;

        for (const agent of this._agents)
            (agent as {world: World}).world = this;

        this._listeners = [];

        this._sagas = new Sagas(this);

        this._routes = undefined

        if (this._cult)
            (this._cult as {world: World}).world = this;
    }

    static create(
        locations : {population:number,cell:Cell}[],
        map : WorldMap
    ) {
        const locs = locations.map((l, id) => 
            Location.create(map.cells[l.cell], id, l.cell, l.population));

        return new World(
            locs,
            [],
            [],
            [],
            undefined,
            Population.create(locs),
            { gold: 0, touch: 0 },
            worldFlags,
            sample,
            0,
            [],
            map);
    }

    // Deserialize from a binary save produced by save()
    static load(reader: S.Reader): World {
        
        // Manual deserialization (because of dependencies between fields),
        // the order here should match the one in save()

        const map = pack_worldMap[1](reader);
        const resources = pack_resourcesOf(S.float)[1](reader);
        const flags = pack_worldFlags[1](reader);
        const god = pack_god[1](reader);
        const turn = S.int7[1](reader);
        const locations = S.array(pack_location)[1](reader);

        // Everything below needs to resolve locations based on their id.
        const pack_loc = pack_locationRef(locations);

        const agents = S.rwarray(pack_agent(pack_loc))[1](reader);
        const plans = S.rwarray(pack_plan(pack_loc))[1](reader);
        const seen = S.rwarray(pack_loc)[1](reader);
        const cult = S.option(pack_cult)[1](reader);
        const population = pack_population(locations)[1](reader);

        return new World(
            locations,
            seen,
            agents,
            plans,
            cult,
            population,
            resources,
            flags,
            god,
            turn,
            [],
            map);
    }

    public save(writer: S.Writer) {

        pack_worldMap[0](writer, this.map);
        pack_resourcesOf(S.float)[0](writer, this.resources);
        pack_worldFlags[0](writer, this.flags);
        pack_god[0](writer, this.god);
        S.int7[0](writer, this.turn);
        S.array(pack_location)[0](writer, this._locations);

        // Everything below needs to resolve locations based on their id.
        const pack_loc = pack_locationRef(this._locations);

        S.rwarray(pack_agent(pack_loc))[0](writer, this._agents);
        S.rwarray(pack_plan(pack_loc))[0](writer, this._plans);
        S.array(pack_loc)[0](writer, this.seenLocations);
        S.option(pack_cult)[0](writer, this._cult);
        pack_population(this._locations)[0](writer, this.population);
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
        const agent = Agent.create(name, location, location.cell, occupation, levels);
        (agent as {world: World}).world = this;
        this._agents.push(agent);
        this.visitLocation(location);
        this.map.addViewer(location.cell);
        return agent;
    }

    public removeAgent(agent: Agent) {
        const idx = this._agents.indexOf(agent);
        if (idx < 0) return;
        this._agents[idx] = this._agents[this._agents.length - 1];
        this._agents.pop();
    }

    public createCult(name: string) {
        this._cult = new Cult(name);
        (this._cult as {world: World}).world = this;
    }
 
    public get cult() : Cult|undefined { return this._cult; }

    public agents() : readonly Agent[] { return this._agents; }

    public plans() : readonly Plan[] { return this._plans; }

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
        if (++this.turn % 7 == 0) {
            this.population.weekly();

            // Let's save! 
            saveToLocalStore("save", writer => this.save(writer));
        }

        // All done, notify the view that it should be re-rendered because
        // the world changed.
        this.refresh();
    }

    public addSaga(saga: ActiveSaga) {
        this._sagas.add(saga);
    }

    public addPlan(plan: Plan) {
        this._plans.push(plan);
    }
}