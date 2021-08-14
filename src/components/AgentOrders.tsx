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

function undercoverEffects(agent: AgentView): [Effect, string][] {
    return [["gold", signedDecimal(agent.stats.idleIncome.value) + "/day"]]
}

type OrderNode = {
    readonly label: string
    readonly tooltip: string
    readonly effects: (agent: AgentView) => [Effect, string][]
    readonly children: OrderNode[]
}

const orderNodes: OrderNode[] = [
    {
        label: "Stay undercover...",
        tooltip: `
#name# will spend the day on their occupation as #occupation#,
earning their usual :gold: income and gaining experience. 

They will pray to you every night, providing 
:touch: and letting you give new orders for the next day.

Undercover agents attract less attention, slowly reducing 
their :exposure:.`,
        effects: undercoverEffects,
        children: [
            {
                label: "...for a day.",
                tooltip: `
#name# will expect new orders on the next turn.`,
                effects: undercoverEffects,
                children: []
            },
            {
                label: "...for a week.",
                tooltip: `
#name# will not expect new orders for the next seven turns. You may
still give them new orders before that.`,
                effects: undercoverEffects,
                children: []
            }
        ]
    },
    {
        label: "Recruit agent...",
        tooltip: `
#name# will attempt to find and convert another agent in #location#, 
so that they may both serve you. This will likely take several days.

#name# will pray to you every night, providing :touch: and letting you 
give them different orders before they are done.`,
        effects: () => [],
        children: []
    }
]

export function AgentOrders(props: {
    agent: AgentView
}): JSX.Element {
    
    const [descent, setDescent] = useState<number[]>([])
    let nodes: OrderNode[] = orderNodes;
    for (let d of descent) nodes = nodes[d].children;

    return <div className="gui-give-orders">
        <table className="gui-info-table">
            <tr><th>Current orders</th><DescribeOrder order={props.agent.order}/></tr>
        </table>
        <hr/>
        {nodes.map((node, i) => 
            <Order key={i}
                agent={props.agent}
                label={node.label}
                disabled={false}
                tooltip={node.tooltip}
                onClick={() => {setDescent(a => [...a, i])}}
                effects={node.effects(props.agent)}/>)}
    </div>
}