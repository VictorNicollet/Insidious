import { h, JSX } from "preact"
import * as B from "./Box"
import { WorldView } from 'view/world'
import { AgentView } from 'view/agents'

export function AgentDetails(props: {
    world: WorldView,
    // The agent to display
    agent: AgentView
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {
    
    const {world, agent, height} = props;

    const where = world.map.locations[agent.cell] === undefined
        ? <span>Outdoors</span>
        : <span className="named-entity">
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
        </div>
    </B.Box>
}