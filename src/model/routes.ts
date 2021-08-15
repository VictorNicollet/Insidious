import { Cell } from "./grid";
import { WorldMap, ocean } from './map';

export type Route = {
    readonly from: Cell 
    // Those are indices of locations in the world's location list.
    readonly to: number
    // Is this a sail route (only water), or a land route ?
    readonly sail: boolean
    // Total difficulty
    readonly distance: number
    // The steps to follow (as a list of cells)
    readonly steps: readonly Cell[]
}

export class RouteSet {
    
    // The point from which all routes in this set begin
    public readonly from: Cell

    // For each cell in the grid, either 0 (this cell is 
    // unreachable from the start point) or 1+cell, where 
    // 'cell' is the cell through which the path from 
    // the start point passes right before reaching this one.
    private readonly parent: Int32Array

    // For each location, a route to that location, or undefined.
    public readonly routes : readonly (Route|undefined)[]

    constructor(map: WorldMap, from: Cell, sail: boolean) {
        this.from = from;
        const parent = this.parent = new Int32Array(map.grid.count);
        const routes : (Route|undefined)[] = []
        this.routes = routes

        // The distance to the starting point (only applicable if there is 
        // a parent). 
        const distanceOf = new Int32Array(map.grid.count);
        
        // For every distance, the cells at that distance that have not 
        // yet had their adjacent cells explored.
        const queuesByDistance : Cell[][] = [[from]];

        // 0 if cell is not a location, 1+index of that location otherwise.
        const locationOf = new Int32Array(map.grid.count);
        
        for (let l = 0; l < map.world.seenLocations.length; ++l) {
            locationOf[map.world.seenLocations[l].cell] = l + 1;
            routes.push(undefined)
        }

        let distance = 0;

        while (distance < queuesByDistance.length) {
            while (queuesByDistance[distance].length > 0) {
                
                const next = queuesByDistance[distance].pop();

                // Maybe a relaxation caused this node to be explored
                // earlier, without removing it from this queue ?
                if (distanceOf[next] != distance) continue;

                // If this is a target location, construct and remember a path
                if (locationOf[next] != 0 && next != from) {

                    const to = locationOf[next] - 1;
                    const path : Cell[] = [];
                    for (let elem = next; elem != from; elem = parent[elem] - 1) 
                        path.push(elem);
                    path.push(from);

                    routes[to] = {
                        from, 
                        to,
                        sail,
                        distance,
                        steps: path.reverse()
                    };
                }

                // Don't explore adjacents of cells that have the wrong type for 
                // our travel mode (except, obviously, for the starting point).
                if (next != from && sail != map.cells[next].is(ocean)) continue;

                // Travel cost is paid when LEAVING a cell.
                const nextDistance = distance + map.cells[next].difficulty;

                for (let adj of map.grid.adjacent(next)) {

                    // Don't even think of non-visible cells
                    if (map.vision[adj] == 0) continue;

                    // Adjacents that already hold a shorter path are left untouched.
                    if (parent[adj] > 0 && distanceOf[adj] <= nextDistance) continue;

                    parent[adj] = 1 + next;
                    distanceOf[adj] = nextDistance;

                    while (queuesByDistance.length <= nextDistance) 
                        queuesByDistance.push([])
                    queuesByDistance[nextDistance].push(adj);
                }    
            }

            ++distance;
        }
    }
}

// Computes, and keeps in cache, the paths between locations (as well as 
// complete layouts starting at each location).
//
// Assumes that the map, _or its visibility information_, do not change
// at all (if they do, create a new Routes object).
export class Routes {
    private readonly _sail : (RouteSet|undefined)[]
    private readonly _walk : (RouteSet|undefined)[]
    constructor(private readonly map: WorldMap) {
        this._sail = [];
        while (this._sail.length < map.grid.count) this._sail.push(undefined);
        this._walk = []
        while (this._walk.length < map.grid.count) this._walk.push(undefined);
    }

    // Find a sail trajectory from a location to another
    public sail(from: number, to: number): Route|undefined {
        const set = this._sail[from] || new RouteSet(this.map, from, true);
        this._sail[from] = set;
        return set.routes[to];
    }

    // Find a walk trajectory from a location to another
    public walk(from: number, to: number): Route|undefined {
        const set = this._walk[from] || new RouteSet(this.map, from, false);
        this._walk[from] = set;
        return set.routes[to];
    }

    // All routes starting from a certain location
    public allFrom(from: number): Route[] {
        const sailSet = this._sail[from] || new RouteSet(this.map, from, true);
        this._sail[from] = sailSet;
        const walkSet = this._walk[from] || new RouteSet(this.map, from, false);
        this._walk[from] = walkSet;
        return [...sailSet.routes.filter(s => !!s), 
                ...walkSet.routes.filter(s => !!s) ]
    }
}