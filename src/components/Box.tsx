import { h, ComponentChildren, JSX } from "preact"

export function Tabs<Tab extends string>(props: {
    tabs: readonly Tab[]
    tab?: Tab
    onTab: (tab: Tab) => void
}): JSX.Element {

    return <div className="gui-box-tabs">
        {props.tabs.map(tab => {
            const selected = props.tab == tab;
            const onClick = selected ? undefined : () => props.onTab(tab);
            return <button disabled={selected} onClick={onClick}>
                {tab}
            </button>
        })}
    </div>
}

export function ModalBox(props: {
    children: ComponentChildren,
    close?: () => void
}): JSX.Element {
    return <div className="gui-box-modal" onClick={props.close}>
        <div className="gui-box-body">{props.children}</div>
    </div>;
}

export function Box<Tab extends string>(props: {
    title: string
    decorate?: boolean
    children: ComponentChildren
    tabs?: readonly Tab[]
    tab?: Tab
    onTab?: (tab: Tab) => void
    close?: () => void
}) : JSX.Element {
    return <div className={props.decorate ? "gui-box gui-bottom-ornament" : "gui-box"}>
        <div className="gui-box-title">
            {props.title}
            {props.close && <button className="gui-box-close" onClick={props.close}/>}
        </div>
        <div className="gui-box-body">{props.children}</div>
        {props.tabs !== undefined && props.onTab !== undefined && 
            <Tabs<Tab> tabs={props.tabs} onTab={props.onTab} tab={props.tab} />}
    </div>
}

// The pixels "wasted" on non-content data above and below
// the inner region of the box.
const WASTED_HEIGHT = 200;

export function innerHeight(outerHeight: number) {
    return outerHeight - WASTED_HEIGHT;
}