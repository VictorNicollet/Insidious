import { h, JSX } from "preact"
import * as B from "./Box"
import type { AgentView } from 'view/agents'
import { useWorld, useSelectors } from './Context';
import { AgentStats } from './AgentStat';
import { useState } from 'preact/hooks';
import { AgentOrders } from './AgentOrders';

type Tabs = "Orders" | "Stats"
const tabs: Tabs[] = ["Orders", "Stats"]

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
    const [tab, setTab] = useState<Tabs>("Orders")

    const where = world.map.locations[agent.cell] === undefined
        ? <span>Outdoors</span>
        : <span className="named-entity" 
            onClick={() => selectors.location(world.locations[world.map.locations[agent.cell]])}>
            {world.locations[world.map.locations[agent.cell]].name.short}
        </span>;

    return <B.Box<Tabs> title={agent.name.full} 
                        close={props.close}
                        tabs={tabs}
                        tab={tab}
                        onTab={setTab}>
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
            {tab === "Orders" ? 
                <AgentOrders agent={agent}/> : 
                <AgentStats agent={agent}/>}
        </div>
    </B.Box>
}