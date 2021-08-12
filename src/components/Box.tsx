import { h, ComponentChildren, JSX } from "preact"

export function Box(props: {
    title: string,
    decorate?: boolean,
    children: ComponentChildren,
    close?: () => void
}) : JSX.Element {
    return <div className={props.decorate ? "gui-box gui-bottom-ornament" : "gui-box"}>
        <div className="gui-box-title">
            {props.title}
            {props.close && <button className="gui-box-close" onClick={props.close}/>}
        </div>
        <div className="gui-box-body">{props.children}</div>
    </div>
}

// The pixels "wasted" on non-content data above and below
// the inner region of the box.
const WASTED_HEIGHT = 185;

export function innerHeight(outerHeight: number) {
    return outerHeight - WASTED_HEIGHT;
}