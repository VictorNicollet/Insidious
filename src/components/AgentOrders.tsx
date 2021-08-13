import { h, JSX } from "preact"
import { AgentView, } from 'view/agents'
import { Order } from 'model/orders'
import { never } from 'never';
import { signedDecimal } from './numbers';
import { useState } from 'preact/hooks';
import { Tooltip } from './Tooltip';

function DescribeOrder(props: {order: Order}): JSX.Element {
    const order = props.order;
    switch (order.kind) {
        case "undercover":
            return <td>Staying undercover</td>
        case "recruit-agent":
            return <td>Recruiting a {order.occupation} <b>{order.occupation}</b> agent</td>
        default: return never<JSX.Element>(order);
    }
}

type Effect = "gold"|"touch"

function Order(props: {
    agent: AgentView
    label: string
    disabled: boolean
    tooltip: string
    effects: [Effect, string][]
    onClick: () => void
}): JSX.Element {
    const [tip, setTip] = useState(false);
    return <button className="gui-order" 
                   disabled={props.disabled} 
                   onClick={props.onClick}
                   onMouseEnter={() => setTip(true)}
                   onMouseLeave={() => setTip(false)}>
        {!tip ? undefined : 
            <Tooltip tip={props.tooltip} ctx={props.agent.ctx} inserts={[]}/>}
        {props.label}
        {props.effects.length == 0 ? undefined : <span className="effects">
                {props.effects.map((e, i) => 
                    <span key={i}>&nbsp;<span class={e[0]}/>{e[1]}</span>)}
            </span>}
    </button>
}

export function AgentOrders(props: {
    agent: AgentView
}): JSX.Element {
    return <div className="gui-give-orders">
        <table className="gui-info-table">
            <tr><th>Current orders</th><DescribeOrder order={props.agent.order}/></tr>
        </table>
        <hr/>
        <Order agent={props.agent}
               label="Stay undercover..."
               disabled={false}
               tooltip={`
#name# will spend the day on their occupation as #occupation#,
earning their usual :gold: income and gaining experience. 

They will pray to you every night, providing 
:touch: and letting you give new orders for the next day.

Undercover agents attract less attention, slowly reducing their :exposure:.
`}
               onClick={() => {}}
               effects={[["gold", signedDecimal(props.agent.stats.idleIncome.value) + "/day"]]}
            />
        <Order agent={props.agent}
               label="Recruit agent..."
               disabled={false}
               tooltip={`
#name# will attempt to find and convert another agent in #location#, 
so that they may both serve you. This will likely take several days.

#name# will pray to you every night, providing :touch: and letting you 
give them different orders before they are done.`}
               onClick={() => {}}
               effects={[]} 
            />
    </div>
}