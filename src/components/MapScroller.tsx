import { h, JSX } from "preact"
import { Map, pick, cellPos } from 'components/Map'
import type { Cell } from 'model/grid';
import { useState, useCallback, useEffect } from 'preact/hooks';
import { useWorld } from './Context';
import type { Selection } from './Screen';

export type MapScrollerProps = {
    // Dimensions of the screen
    screenH: number
    screenW: number
    // What is currently selected, and how to change it. 
    selected: Selection
    setSelected: (sel: Selection) => void
}

type MapScrollerState = [number, number]

type MapScroller = {
    (props: MapScrollerProps): JSX.Element
    select: (cell: Cell) => void
}

export function MapScroller(props: MapScrollerProps): JSX.Element {

    const {screenW, screenH, selected, setSelected} = props;
    const world = useWorld();
    const {map, locations} = world;
    const {locations:locByCell, grid} = map;

    // Initially center on the first location
    const [ix, iy] = cellPos(world.initial, grid)

    const [[selfx,selfy], setState] = 
        useState<MapScrollerState>([ix, iy]);

    // Determine if we need to override the position based on an 
    // active selection ?
    const cell = 
        selected.selected === "agent"    ? world.agents[selected.id].cell :
        selected.selected === "location" ? world.locations[selected.id].cell :
        undefined;

    const [x,y] = 
        typeof cell === "undefined" ? [selfx, selfy] :
        cellPos(cell, grid);

    if (x != selfx || y != selfy)
        setState([x,y])

    const left = screenW/2 - x;
    const top  = screenH/2 - y;

    const onClick = useCallback(function(e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) {
        setState(state => {
            // Undo the transformation by subtracting [left,top]
            // from the client location of the click.
            const x = e.clientX - (screenW/2 - state[0]);
            const y = e.clientY - (screenH/2 - state[1]);
            const cell = pick(x, y, grid);
            if (typeof cell === "undefined") return state;
            // Check that the clicked cell is visible
            if (!map.vision[cell]) return state;
            const [cx,cy] = cellPos(cell, grid);
            const sel = locByCell[cell];
            if (sel === undefined) {
                setSelected({selected:"none"});
                return [cx,cy];
            }
            setSelected({selected:"location",id:sel});
            return [cx,cy];
        });
    }, [screenW, screenH, setState, grid, locByCell, map.vision, selected, setSelected, locations])
    
    return <div className="gui-map" onClick={onClick}>
        <div style={{
            position: "relative", 
            left, 
            top,
            transition: "left top",
            transitionDuration: "0.2s",
            transitionTimingFunction: "ease-out"
        }}>
            <Map world={world} selected={cell} />
        </div>
    </div>
}