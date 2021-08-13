import { h, ComponentChildren, JSX } from "preact"
import type { LeftPanelShown } from './LeftPanel';
import { useWorld } from './Context';
import { Tooltip } from './Tooltip';
import { useState } from 'preact/hooks';
import { Stat } from 'model/stats';
import { decimal, signedDecimal } from './numbers';

function Resource(props: {
    children: ComponentChildren,
    tooltip: JSX.Element
}): JSX.Element {
    const [tip, setTip] = useState(false);
    return <div class="resource" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
        {tip && props.tooltip}
        {props.children}
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
    return <div className="gui-navbar">
        <button onClick={() => left("locations")}>Locations</button>
        <button onClick={() => left("agents")}>Agents</button>
        <button onClick={() => left("cult")}>Cult</button>
        <button onClick={() => left("rituals")}>Rituals</button>
        <button onClick={() => left("artifacts")}>Artifacts</button>
        {/* float:right appear in reverse order */}
        <button className="turn">End Turn</button>
        <Resource tooltip={<GoldTooltip daily={world.resources.gold.daily}/>}>
            <span className="gold"></span> {world.resources.gold.current}
        </Resource>
        <Resource tooltip={<TouchTooltip daily={world.resources.touch.daily}/>}>
            <span className="touch"></span> {world.resources.touch.current}
        </Resource>
    </div>
}