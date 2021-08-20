import { h, JSX } from "preact"
import type { LeftPanelShown } from './LeftPanel';
import { useWorld } from './Context';
import { Tooltip } from './Tooltip';
import { useState } from 'preact/hooks';
import { decimal, signedDecimal, integer } from './numbers';
import { Explained } from '../model/explainable';

function Resource(props: {
    kind: string
    current: number
    daily: Explained
    Tooltip: (props: {daily: Explained}) => JSX.Element
}): JSX.Element {
    const [tip, setTip] = useState(false);
    return <div class="resource" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
        {tip && <props.Tooltip daily={props.daily}/>}
        <span className={props.kind}/> {integer(props.current)} 
        <span style={{opacity:0.7}}>&nbsp;{signedDecimal(props.daily.value)}</span>
    </div>
}

function GoldTooltip(props: {
    daily: Explained
}) {
    return <Tooltip tip={`
Your agents spend :gold: to purchase equipment and perform
certain actions.

You earn :gold: from your undercover agents' day-to-day work, 
and from the tithes of your cult.

%0
`} ctx={{}} inserts={[
        <p style={{textAlign:"center"}}>
            {signedDecimal(props.daily.value)}/day&nbsp;={props.daily.reasons.map((reason, i) => 
                <span key={i}>{i > 0 ? " +" : ""}&nbsp;{decimal(reason.contrib)}&nbsp;<span style={{opacity:0.5}}>({reason.why})</span>
                </span>)}
        </p>
            ]}/>
}

function TouchTooltip(props: {
    daily: Explained
}) {
    return <Tooltip tip={`
As your :touch: upon this world strengthens, 
your agents can perform rituals to channel your power.

%0
`} ctx={{}} inserts={[
        <p style={{textAlign:"center"}}>
            {signedDecimal(props.daily.value)}/day&nbsp;={props.daily.reasons.map((reason, i) => 
                <span key={i}>{i > 0 ? " +" : ""}&nbsp;{decimal(reason.contrib)}&nbsp;<span style={{opacity:0.5}}>({reason.why})</span>
                </span>)}
        </p>
            ]}/>
}

export function Navbar(props: {
    left: (show: LeftPanelShown) => void
}) {
    const left = props.left;
    const world = useWorld();
    const {gold, touch} = world.resources;
    return <div className="gui-navbar">
        <button className="link" onClick={() => left("locations")}>Locations</button>
        <button className="link" onClick={() => left("agents")}>Agents</button>
        <button className="link" onClick={() => left("plans")}>Plans</button>
        <button className="link" onClick={() => left("cult")}>Cult</button>
        <button className="link" onClick={() => left("rituals")}>Rituals</button>
        <button className="link" onClick={() => left("artifacts")}>Artifacts</button>
        {/* float:right appear in reverse order */}
        <button className="turn" onClick={() => world.world.endTurn()}>End Turn</button>
        <Resource kind="gold" current={gold.current} daily={gold.daily} Tooltip={GoldTooltip}/>
        <Resource kind="touch" current={touch.current} daily={touch.daily} Tooltip={TouchTooltip}/>
    </div>
}