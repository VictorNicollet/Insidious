import { World } from "../world"
import { randomLocation } from './namegen';
import { Coords } from 'model/grid';

const MINDIST = 2.5;
const LOCATIONS = 25;

function randomCoords(world: World): Coords {
    let angle = Math.random() * Math.PI * 2;
    let x = 0, y = 0;
    
    while (true) {
        
        const isTooClose = world.locations().some(location => {
            const xdist = x - location.coords.x;
            const ydist = y - location.coords.y;
            const distance = xdist * xdist + ydist * ydist;
            return (distance < MINDIST * MINDIST)
        });

        if (!isTooClose) break;

        x += MINDIST * Math.cos(angle);
        y += MINDIST * Math.sin(angle);
    }   
    
    return { x: Math.floor(x), y: Math.floor(y) };
}

export function generate() : World {
    const world = new World();

    for (let i = 0; i < LOCATIONS; ++i)
    {
        const location = world.newLocation(
            randomLocation(), randomCoords(world));
        
    }

    return world;
}