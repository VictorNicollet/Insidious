import { h, JSX } from "preact"
import { StatsOf, Stats, maxStats, resources, skills } from "../model/stats";
import { decimal } from './numbers';
import { useState } from 'preact/hooks';
import { Tooltip } from './Tooltip';
import type { AgentView } from '../view/agents';
import { explain, Explained } from '../model/explainable';
import { statTip, upkeepTip } from '../text/help';
import type { TxtFormat } from "../text/format";

const statName : StatsOf<string> = {
    contacts:   "Recruitment",
    upkeep:     "Upkeep",
    idleIncome: "Income",
    outdoors:   "Outdoors",
    combat:     "Combat",
    conduit:    "Conduit",
    authority:  "Authority",
    deceit:     "Deceit"
}

// A single stat/ability in the agent's detail page, formatted as
//  {statName} [============== {statValue} ==]
// (the value is in a fillable progress-bar).
function RawStat(props: {
    tip: TxtFormat
    name: string
    value: Explained
    max: number
    children: JSX.Element|undefined|(JSX.Element|undefined)[]
    unit: string
}): JSX.Element {
    const [tip, setTip] = useState(false);
    const value = props.value.value;
    return <div className="stat" 
                onMouseEnter={() => setTip(true)} 
                onMouseLeave={() => setTip(false)}>
        {tip && <Tooltip 
            tip={props.tip + "\n\n%0"}
            ctx={{}}
            inserts={[
<p style={{textAlign:"center"}}>
    {decimal(props.value.value)}&nbsp;={props.value.reasons.map((reason, i) => 
        <span key={i}>{i > 0 ? " +" : ""}&nbsp;{decimal(reason.contrib)}&nbsp;<span style={{opacity:0.5}}>({reason.why})</span>
        </span>)}
</p>]}/>}
        <span className="stat-name">{props.name}</span>
        <div className="progress">
            <div style={{width: (Math.max(0, value/props.max) * 100) + "%"}} />
        </div>
        <div className="value">
            {props.children}
            {decimal(props.value.value)}
            {props.unit}
        </div>
    </div>
}


// A single stat/ability in the agent's detail page, formatted 
// using RawStat
function Stat(props: {
    stat: keyof(Stats),
    value: Explained
}): JSX.Element {
    return <RawStat
        tip={statTip[props.stat]}
        max={maxStats[props.stat]}
        name={statName[props.stat]}
        value={props.value}
        unit={props.stat !== "idleIncome" && props.stat !== "upkeep" && props.stat !== "conduit" ? "%" : ""}
    >
        {props.stat === "idleIncome" || props.stat === "upkeep" ? <span className="gold"/> :
         props.stat === "conduit" ? <span className="touch"/> : 
         undefined}
    </RawStat>
}

// A block containing all stats of an agent, for display in the 
// agent's detail page.
export function AgentStats(props: { agent: AgentView }) {
    return <div class="stats">
        <div style={{padding:4,textAlign:"center"}}>☙ Resources ❧</div>
        {resources.map(stat => 
            <Stat key={stat} stat={stat} value={props.agent.stats[stat]}/>)}
        <div style={{padding:4,textAlign:"center"}}>☙ Skills ❧</div>
        {skills.map(stat => 
            <Stat key={stat} stat={stat} value={props.agent.stats[stat]}/>)}
    </div>
}