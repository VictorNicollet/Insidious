import { h, JSX } from "preact"
import type { LeftPanelShown } from './LeftPanel';
import { useWorld } from './Context';
import { Tooltip } from './Tooltip';
import { useState } from 'preact/hooks';
import { Stat } from 'model/stats';
import { decimal, signedDecimal, integer } from './numbers';

function Resource(props: {
    kind: string
    current: number
    daily: Stat
    Tooltip: (props: {daily: Stat}) => JSX.Element
}): JSX.Element {
    const [tip, setTip] = useState(false);
    return <div class="resource" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
        {tip && <props.Tooltip daily={props.daily}/>}
        <span className={props.kind}/> {integer(props.current)} 
        <span style={{opacity:0.7}}>&nbsp;{signedDecimal(props.daily.value)}</span>
    </div>
}

function GoldTooltip(props: {
    daily: Stat
}) {
    return <Tooltip>
        <p>
            Your agents spend <span className="gold"/><b>gold</b> to purchase
            equipment and perform certain actions.
        </p>
        <p>
            You earn <span className="gold"/><b>gold</b> from your undercover 
            agents' day-to-day work, and from the tithes of your cult.
        </p>
        <p style={{textAlign:"center"}}>
            {signedDecimal(props.daily.value)}/day&nbsp;={props.daily.reasons.map((reason, i) => 
                <span key={i}>{i > 0 ? " +" : ""}&nbsp;{decimal(reason.contrib)}&nbsp;<span style={{opacity:0.5}}>({reason.why})</span>
                </span>)}
        </p>
    </Tooltip>
}

function TouchTooltip(props: {
    daily: Stat
}) {
    return <Tooltip>
        <p>
            As your <span className="touch"/><b>touch</b> upon this world strengthens, 
            your agents can perform rituals to channel your power.
        </p>
        <p style={{textAlign:"center"}}>
            {signedDecimal(props.daily.value)}/day&nbsp;={props.daily.reasons.map((reason, i) => 
                <span key={i}>{i > 0 ? " +" : ""}&nbsp;{decimal(reason.contrib)}&nbsp;<span style={{opacity:0.5}}>({reason.why})</span>
                </span>)}
        </p>
    </Tooltip>
}

export function Navbar(props: {
    left: (show: LeftPanelShown) => void
}) {
    const left = props.left;
    const world = useWorld();
    const {gold, touch} = world.resources;
    return <div className="gui-navbar">
        <button onClick={() => left("locations")}>Locations</button>
        <button onClick={() => left("agents")}>Agents</button>
        <button onClick={() => left("cult")}>Cult</button>
        <button onClick={() => left("rituals")}>Rituals</button>
        <button onClick={() => left("artifacts")}>Artifacts</button>
        {/* float:right appear in reverse order */}
        <button className="turn">End Turn</button>
        <Resource kind="gold" current={gold.current} daily={gold.daily} Tooltip={GoldTooltip}/>
        <Resource kind="touch" current={touch.current} daily={touch.daily} Tooltip={TouchTooltip}/>
    </div>
}