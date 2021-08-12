import { h, JSX } from "preact"
import * as B from "./Box"
import { AgentView } from 'view/agents'
import { useWorld, useSelectors } from './Context';
import { statName, Stats, Stat, allStats, maxStats } from 'model/stats';
import { decimal } from './numbers';

function Stat(props: {
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

export function AgentDetails(props: {
    // The agent to display
    agent: AgentView
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {
    
    const {agent, height} = props;

    const world = useWorld();
    const selectors = useSelectors();

    const where = world.map.locations[agent.cell] === undefined
        ? <span>Outdoors</span>
        : <span className="named-entity" 
            onClick={() => selectors.location(world.locations[world.map.locations[agent.cell]])}>
            {world.locations[world.map.locations[agent.cell]].name.short}
        </span>;

    return <B.Box title={agent.name.full} close={props.close}>
        <div className="gui-agent-details"
             style={{height:B.innerHeight(height)}}>
            <div className="portrait"/>
            <div className="top">
                <table class="gui-info-table">
                    <tr><th>Location</th><td>{where}</td></tr>
                    <tr><th>Occupation</th><td>
                        {agent.occupation} Lv.{agent.levels[agent.occupation]}
                    </td></tr>
                    <tr><th>Orders</th><td>Stay undercover</td></tr>
                </table>
            </div>
            <hr/>
            <div class="stats">
                {allStats.map(stat => 
                    <Stat key={stat} stat={stat} value={agent.stats[stat]}/>)}
            </div>
        </div>
    </B.Box>
}