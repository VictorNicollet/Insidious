import { h, JSX, Fragment } from "preact"
import * as B from "./Box"
import { useWorld, useSelectors } from './Context';
import { AgentStats } from './AgentStat';
import { useState } from 'preact/hooks';
import { AgentOrders } from './AgentOrders';
import * as Help from "../text/help"
import { Tooltip, TipInfoLine } from './Tooltip';
import { integer } from './numbers';

type Tabs = "Orders" | "Stats"
const tabs: Tabs[] = ["Orders", "Stats"]


export function AgentDetails(props: {
    // The agent to display
    agent: number
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {
    
    const world = useWorld();

    // We assert that the agent exists, because it wouldn't have stayed selected
    // if it did not.
    const agent = world.agents.idx(props.agent)!;

    const selectors = useSelectors();
    const [tab, setTab] = useState<Tabs>("Orders")

    const loc = world.map.locations[agent.cell]
    const where = loc === undefined
        ? <span>Outdoors</span>
        : <span className="named-entity" 
            onClick={() => selectors.location(world.locations[loc], "Agents")}>
            {world.locations[loc].name.short}
        </span>;

    return <B.Box<Tabs> title={agent.name.full} 
                        close={props.close}
                        tabs={tabs}
                        tab={tab}
                        onTab={setTab}>
        <div className="gui-agent-details"
             style={{height:B.innerHeight(props.height)}}>
            <div className="portrait"/>
            <div className="top">
                <table class="gui-info-table">
                    <TipInfoLine label="Location" value={where}/>
                    <TipInfoLine label="Occupation"  
                        value={agent.occupation + " Lv." + agent.levels[agent.occupation]}
                        tooltip={<Tooltip tip={Help.occupationTooltip[agent.occupation]}
                                    inserts={[]}
                                    ctx={{}}/>}/>
                    <TipInfoLine label="Exposure" 
                        value={<Fragment><span className="exposure"/><b>{integer(agent.exposure)}</b></Fragment>}
                        tooltip={<Tooltip tip={Help.exposureTip} inserts={[]} ctx={{}}/>}/>
                </table>
            </div>
            <hr/>
            {tab === "Orders" ? 
                <AgentOrders agent={agent}/> : 
                <AgentStats agent={agent}/>}
        </div>
    </B.Box>
}