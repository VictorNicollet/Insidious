import { h, JSX } from "preact"
import { StatsOf, Stats, Stat, maxStats } from "model/stats";
import { decimal } from './numbers';
import { useState } from 'preact/hooks';
import { Tooltip } from './Tooltip';

const statName : StatsOf<string> = {
    agentRecruitPower: "Recruitment",
    weeklyIdleIncome:  "Weekly Income",
    outdoors:          "Outdoors",
    combat:            "Combat"
}

const statTip : StatsOf<string> = {
    agentRecruitPower: "How quickly this agent can recruit other agents. Effectiveness is doubled when recruiting an agent of the same occupation.",
    weeklyIdleIncome: "Amount of gold produced (or consumed) by this agent, for every week spent under cover.",
    outdoors: "How fast this agent can travel outdoors. Also reduces the risk of encountering bandits or wild beasts. Does not apply to sailing.",
    combat: "How well this agent can fight."
}

// A single stat/ability in the agent's detail page, formatted as
//  {statName} [============== {statValue} ==]
// (the value is in a fillable progress-bar).
export function Stat(props: {
    stat: keyof(Stats),
    value: Stat
}): JSX.Element {
    const [tip, setTip] = useState(false);
    const value = props.value.value;
    const max = maxStats[props.stat];
    return <div className="stat" 
                onMouseEnter={() => setTip(true)} 
                onMouseLeave={() => setTip(false)}>
        {tip && <Tooltip>
            <p>{statTip[props.stat]}</p>
            <p style={{textAlign:"center"}}>
                {decimal(props.value.value)}&nbsp;={props.value.reasons.map((reason, i) => 
                    <span key={i}>{i > 0 ? " +" : ""}&nbsp;{decimal(reason.contrib)}&nbsp;<span style={{opacity:0.5}}>({reason.why})</span>
                    </span>)}
            </p>
        </Tooltip>}
        <span className="stat-name">{statName[props.stat]}</span>
        <div className="progress">
            <div style={{width: (Math.max(0, value/max) * 100) + "%"}} />
        </div>
        <div className="value">
            {props.stat === "weeklyIdleIncome" && <span className="gold"/>}
            {decimal(props.value.value)}
        </div>
    </div>
}
