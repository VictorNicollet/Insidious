import { h, ComponentChildren, JSX } from "preact"

export function Box(props: {
    title: string,
    children: ComponentChildren
}) : JSX.Element {
    return <div className="gui-box">
        <div className="gui-box-title">{props.title}</div>
        <div className="gui-box-body">{props.children}</div>
    </div>
}
