import { h, JSX } from "preact"
import { World } from 'model/world';
import { MapView } from './MapView';
import { cellPos, pick } from "./Map"
import { LeftPanel } from './LeftPanel';
import { useState, useCallback } from 'preact/hooks';
import { Cell } from 'model/grid';

export function Screen(props: { world: World }): JSX.Element {
    
    const grid = props.world.map.grid;
    const screenH = window.innerHeight;
    const screenW = window.innerWidth;

    // Centering on the map happens at this level, to let sub-components
    // control the center when something is selected.
    const [[centerX, centerY, selected], setCenter] = 
        useState<[number,number,Cell?]>([0,0,undefined]);

    // Invoke on a cell to center on its position.
    const select = useCallback(function (cell: Cell) {
        const [x,y] = cellPos(cell, grid);
        setCenter([x,y,cell])
    }, [setCenter, grid]);

    // Invoke on the nearest cell to the position (or unselect if
    // already selected)
    const mapClick = useCallback(function (x: number, y: number) {
        setCenter(old => {
            const [oldX, oldY, oldSel] = old;
            if (oldSel) return [oldX, oldY, undefined];
            const cell = pick(x, y, grid);
            if (typeof cell == "undefined") return old;
            const [cx,cy] = cellPos(cell, grid);
            return [cx,cy,cell];
        })
    }, [setCenter, grid])

    return <div>
        <MapView 
            map={props.world.map}
            screenH={screenH}
            screenW={screenW}
            centerX={centerX}
            centerY={centerY} 
            selected={selected}
            click={mapClick}/>
        <LeftPanel
            screenH={screenH} 
            screenW={screenW} 
            world={props.world}
            select={select}/>
    </div>
}