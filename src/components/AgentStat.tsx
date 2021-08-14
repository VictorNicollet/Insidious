import { h, JSX } from "preact"
import { StatsOf, Stats, maxStats, allStats } from "model/stats";
import { decimal } from './numbers';
import { useState } from 'preact/hooks';
import { Tooltip, TooltipContent } from './Tooltip';
import type { AgentView } from 'view/agents';
import { Explained } from 'model/explainable';

const statName : StatsOf<string> = {
    recruit:    "Recruitment",
    idleIncome: "Income",
    outdoors:   "Outdoors",
    combat:     "Combat",
    conduit:    "Conduit",
    deceit:     "Deceit"
}

const statTip : StatsOf<TooltipContent> = {
    recruit: `
How quickly this agent can recruit other agents. Effectiveness is
doubled when recruiting an agent of the same occupation.`,
    idleIncome: `
Amount of :gold: produced (or consumed) by this agent, for every 
day spent under cover.`,
    outdoors: `
How fast this agent can travel outdoors. Also reduces the risk of 
encountering bandits or wild beasts. Does not apply to sailing.`,
    combat: `
How well this agent can fight.`,
    conduit: `
How well this agent can act as a conduit for your :touch:.
Rituals performed by a good conduit are more effective. 
Also increases your :touch: by this amount every day.`,
    deceit: `
How well this agent can deceive and manipulate others, 
and spread lies and rumors. Also makes the agent less 
suspicious, gaining less exposure from their actions.`
}

// A single stat/ability in the agent's detail page, formatted as
//  {statName} [============== {statValue} ==]
// (the value is in a fillable progress-bar).
function Stat(props: {
    stat: keyof(Stats),
    value: Explained
}): JSX.Element {
    const [tip, setTip] = useState(false);
    const value = props.value.value;
    const max = maxStats[props.stat];
    return <div className="stat" 
                onMouseEnter={() => setTip(true)} 
                onMouseLeave={() => setTip(false)}>
        {tip && <Tooltip 
            tip={statTip[props.stat] + "\n\n%0"}
            ctx={{}}
            inserts={[
<p style={{textAlign:"center"}}>
    {decimal(props.value.value)}&nbsp;={props.value.reasons.map((reason, i) => 
        <span key={i}>{i > 0 ? " +" : ""}&nbsp;{decimal(reason.contrib)}&nbsp;<span style={{opacity:0.5}}>({reason.why})</span>
        </span>)}
</p>]}/>}
        <span className="stat-name">{statName[props.stat]}</span>
        <div className="progress">
            <div style={{width: (Math.max(0, value/max) * 100) + "%"}} />
        </div>
        <div className="value">
            {props.stat === "idleIncome" && <span className="gold"/>}
            {props.stat === "conduit" && <span className="touch"/>}
            {decimal(props.value.value)}
        </div>
    </div>
}

// A block containing all stats of an agent, for display in the 
// agent's detail page.
export function AgentStats(props: { agent: AgentView }) {
    return <div class="stats">
        {allStats.map(stat => 
            <Stat key={stat} stat={stat} value={props.agent.stats[stat]}/>)}
    </div>
}