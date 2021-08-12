import { h, JSX } from "preact"
import { StatsOf, Stats, Stat, maxStats } from "model/stats";
import { decimal } from './numbers';

export const statName : StatsOf<string> = {
    agentRecruitPower: "Recruitment",
    weeklyIdleIncome:  "Weekly Income",
    outdoors:          "Outdoors",
}

// A single stat/ability in the agent's detail page, formatted as
//  {statName} [============== {statValue} ==]
// (the value is in a fillable progress-bar).
export function Stat(props: {
    stat: keyof(Stats),
    value: Stat
}): JSX.Element {
    const value = props.value.value;
    const max = maxStats[props.stat];
    return <div className="stat">
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
