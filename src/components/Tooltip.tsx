import { h, JSX } from "preact"
import { TxtContext, TxtFormat, toHTML } from '../text/format'

export function Tooltip<T extends TxtContext>(props: {
    tip: TxtFormat
    ctx: T
    inserts: readonly JSX.Element[]
}): JSX.Element {
    return <div className="tooltip">
        <div>{toHTML(props.tip, props.ctx, props.inserts)}</div>
    </div>
}