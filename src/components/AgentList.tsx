import { h, JSX } from "preact"
import { useState } from "preact/hooks"
import * as B from "./Box"
import * as P from './Pagination'
import { Cell } from 'model/grid'
import * as Numbers from './numbers'
import { LocationView } from 'view/locations'
import * as M from './Map'
import { WorldView } from 'view/world'
import { AgentView } from 'view/agents'

// The height, in pixels, of an element in the locations list
const ITEMSIZE = 50;

export function AgentList(props: {
    world: WorldView,
    // The agents to display
    agents: readonly AgentView[],
    // The pixel height available for the component to display in
    height: number
}): JSX.Element {

    const {agents, height, world} = props;

    const innerHeight = B.innerHeight(height) - P.height;
    const pagesize = Math.floor(innerHeight / ITEMSIZE);

    const [page, setPage] = useState(0)
    const pages = Math.ceil(agents.length / pagesize);
    const start = page * pagesize;
    const end   = Math.min(start + pagesize, agents.length);

    const shown = agents.slice(start, end);

    return <B.Box title="Agents" decorate={true}>
        <ul className="gui-agents" style={{height: 50*pagesize}}>
            {shown.map(agent => {
                const where = world.map.locations[agent.cell] === undefined
                    ? <span>Outdoors</span>
                    : <span className="named-entity">
                        {world.locations[world.map.locations[agent.cell]].name.short}
                      </span>;
                return <li key={agent.id}>
                    <div className="name">
                        {agent.name.full}
                        <span className="job">Merchant</span>
                    </div>
                    <div className="info">
                        Undercover &middot; {where}
                    </div>
                </li>
            })}
        </ul>
        <P.Pagination page={page} pages={pages} setPage={setPage}/>
    </B.Box>
}