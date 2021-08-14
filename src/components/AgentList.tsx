import { h, JSX } from "preact"
import { useState } from "preact/hooks"
import * as B from "./Box"
import * as P from './Pagination'
import { AgentView } from 'view/agents'
import { useWorld, useSelectors } from './Context'

// The height, in pixels, of an element in the agents list
const ITEMSIZE = 50;

// The agent list, intended to be placed inside a box.
export function InnerAgentList(props: {
    // The agents to display
    agents: readonly AgentView[],
    // The pixel height available for the component to display in
    height: number
    // Hide the location of the agent (for instance, if the list is 
    // displayed in the location's own window)
    noLocation?: boolean
}) {
    const {agents, height} = props;
    
    const world = useWorld();
    const selectors = useSelectors();

    const pagesize = Math.floor((height - P.height) / ITEMSIZE);

    const [page, setPage] = useState(0)
    const pages = Math.ceil(agents.length / pagesize);
    const start = page * pagesize;
    const end   = Math.min(start + pagesize, agents.length);

    const shown = agents.slice(start, end);

    return <div>
        <ul className="gui-agents" style={{height: 50*pagesize}}>
            {shown.map(agent => {
                const where = props.noLocation ? undefined : 
                    world.map.locations[agent.cell] === undefined
                    ? <span>Outdoors</span>
                    : <span className="named-entity">
                        {world.locations[world.map.locations[agent.cell]].name.short}
                    </span>;
                const orders = 
                    agent.order.kind == "recruit-agent" ? "Recruiting" :
                    agent.order.kind == "undercover" ? "Undercover" : 
                    "No orders"
                return <li key={agent.id} 
                    onClick={() => selectors.agent(agent)}>
                    <div className="name">
                        {agent.name.full}
                        <span className="job">{agent.occupation}</span>
                    </div>
                    {where
                        ? <div className="info">{orders} &middot; {where}</div>
                        : <div className="info">{orders}</div>}
                </li>
            })}
        </ul>
        <P.Pagination page={page} pages={pages} setPage={setPage}/>
    </div>;
}

// The agent list, inside a box.
export function AgentList(props: {
    // The agents to display
    agents: readonly AgentView[],
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {

    const {agents, height} = props;

    const innerHeight = B.innerHeight(height);

    return <B.Box title="Agents" decorate={true} close={props.close}>
        <InnerAgentList agents={agents} height={innerHeight} />
    </B.Box>
}