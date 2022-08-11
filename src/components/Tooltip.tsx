import { h, JSX } from "preact"
import { TxtContext, TxtFormat, toHTML, TxtFormatEx } from '../text/format'

export function Tooltip<T extends TxtContext>(props: {
    tip: TxtFormat
    ctx: T
    pos?: "left"|"right"
    inserts: readonly JSX.Element[]
}): JSX.Element {
    return <div className={"tooltip " + (props.pos || "")}>
        <div>{toHTML(props.tip, props.ctx, props.inserts)}</div>
    </div>
}
export function TooltipEx<T extends TxtContext>(props: {
    tip: TxtFormatEx<T>
    ctx: T
    pos?: "left"|"right"
}): JSX.Element {
    return <div className={"tooltip " + (props.pos || "")}>
        <div>{props.tip.toHTML(props.ctx)}</div>
    </div>
}