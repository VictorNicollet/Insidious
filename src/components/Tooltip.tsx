import { h, JSX, ComponentChildren } from "preact"

export function Tooltip(props: {
    children: ComponentChildren
}): JSX.Element {
    return <div className="tooltip">
        <div>{props.children}</div>
    </div>
}