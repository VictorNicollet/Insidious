import { h, JSX } from "preact"
import { Map, pick, cellPos } from 'components/Map'
import { Cell, Grid } from 'model/grid';
import { StateUpdater, useRef, useMemo, useState, useCallback, useEffect } from 'preact/hooks';
import { WorldView } from 'view/world';
import { LocationView } from 'view/locations';

export type MapScrollerProps = {
    world: WorldView,
    // Dimensions of the screen
    screenH: number
    screenW: number
    // When a location is selected OR unselected by clicking
    onLocation: (location: (LocationView|undefined)) => void
}

type MapScrollerState = [number, number, Cell|undefined]

type MapScroller = {
    (props: MapScrollerProps): JSX.Element
    select: (cell: Cell) => void
}

export function useMapScroller(grid: Grid): MapScroller {
    const ctrl = useRef<StateUpdater<MapScrollerState>>()
    return useMemo(() => 
    {
        const Component = ((props: MapScrollerProps): JSX.Element => {

            const {screenW, screenH, world, onLocation} = props;
            const {map, locations} = world;
            const locByCell = map.locations;

            // Initially center on the first location
            const [ix, iy] = cellPos(world.initial, grid)

            const [[x,y,selected], setState] = 
                useState<MapScrollerState>([ix, iy, undefined]);

            useEffect(() => {ctrl.current = setState});

            const left = screenW/2 - x;
            const top  = screenH/2 - y;

            const onClick = useCallback(function(e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) {
                setState(state => {
                    const [ox, oy, osel] = state;
                    // If something was selected, just unselect it.
                    if (typeof osel !== "undefined") {
                        onLocation(undefined);
                        return [ox,oy,undefined]
                    }
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
                    if (sel === undefined) return [cx,cy,undefined];
                    onLocation(locations[sel]);
                    return [cx,cy,cell];
                });      
            }, [screenW, screenH, setState, grid, locByCell, map.vision, onLocation, locations])
            
            return <div className="gui-map" onClick={onClick}>
                <div style={{
                    position: "relative", 
                    left, 
                    top,
                    transition: "left top",
                    transitionDuration: "0.2s",
                    transitionTimingFunction: "ease-out"
                }}>
                    <Map world={world} selected={selected} />
                </div>
            </div>
        }) as MapScroller;

        Component.select = function(cell: Cell) {
            const [x,y] = cellPos(cell, grid);
            ctrl.current &&
            ctrl.current([x,y,cell])
        }

        return Component

    }, [ctrl, grid]);
}

