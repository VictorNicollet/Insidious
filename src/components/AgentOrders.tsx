import { h, JSX } from "preact"
import { AgentView, } from 'view/agents'
import { Order } from 'model/orders'
import { never } from 'never';
import { signedDecimal } from './numbers';
import { useState } from 'preact/hooks';
import { Tooltip } from './Tooltip';

function an(t: string) {
    return /^aeiou/i.test(t) ? "an" : "a";
}

function DescribeOrder(props: {order: Order}): JSX.Element {
    const order = props.order;
    switch (order.kind) {
        case "undercover":
            return <td>Staying undercover</td>
        case "recruit-agent":
            return <td>Recruiting {an(order.occupation)} <b>{order.occupation}</b> agent</td>
        default: return never<JSX.Element>(order);
    }
}

type Effect = "gold"|"touch"

function Order(props: {
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
        {!tip ? undefined : <Tooltip>{props.tooltip}</Tooltip>}
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
        <Order label="Stay undercover..."
               disabled={false}
               tooltip={"Tooltip"}
               onClick={() => {}}
               effects={[["gold", signedDecimal(props.agent.stats.idleIncome.value) + "/day"]]}
            />
        <Order label="Recruit agent..."
               disabled={false}
               tooltip={"Tooltip"}
               onClick={() => {}}
               effects={[]} 
            />
    </div>
}