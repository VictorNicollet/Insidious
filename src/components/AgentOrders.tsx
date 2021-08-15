import { h, JSX } from "preact"
import { AgentView, } from 'view/agents'
import { Order, undercover, daysRemaining } from 'model/orders'
import { never } from 'never';
import { signedDecimal, days, decimal } from './numbers';
import { useState, useMemo, useCallback } from 'preact/hooks';
import { Tooltip } from './Tooltip';
import { occupations, Occupation, presenceByLocationKind } from 'model/occupation';
import { occupationTooltip } from './help';
import { explain, Reason, Explained } from 'model/explainable';
import { Location } from 'model/locations';
import { Agent } from 'model/agents';

function DescribeOrder(props: {order: Order}): JSX.Element {
    const order = props.order;
    switch (order.kind) {
        case "undercover":
            return <td>Staying undercover</td>
        case "recruit-agent":
            return <td>Recruiting a {order.occupation} agent</td>
        default: return never<JSX.Element>(order);
    }
}

type Effect = "gold"|"touch"

function Explain(props: {value: Explained}): JSX.Element {
    const e = props.value;
    if (e.multiplier) {
        return <span>
            {decimal(e.value)} = {decimal(e.multiplier)} &times; (1{e.reasons.map(r => 
                <span>{" +"}&nbsp;{decimal(r.contrib)}&nbsp;<span style={{opacity:0.5}}>({r.why})</span></span>)})
        </span>
    }
    return <span>
        {decimal(e.value)}{e.reasons.map((r,i) => 
            <span>{i == 0 ? " =" : " +"}&nbsp;{decimal(r.contrib)}&nbsp;<span style={{opacity:0.5}}>({r.why})</span></span>)}
    </span>
}

function Order(props: {
    agent: AgentView
    label: string
    disabled: string|undefined
    tooltip: string
    order: Order|undefined
    effects: readonly [Effect, string][]
    onClick: () => void
}): JSX.Element {
    const [tip, setTip] = useState(false);
    const tooltip = props.tooltip + 
        (props.disabled 
            ? "\n\n***\n\n" + props.disabled : "") + 
        (props.order && props.order.kind != "undercover" 
            ? "\n\n***\n\n%0" : "");
    const inserts = !props.order ? [] : [
        <div>
            <p>
                Duration <span class="turns"/><b>{daysRemaining(props.order)}</b> = {decimal(props.order.difficulty.value)} / {decimal(props.order.speed.value)}
            </p>
            <p style={{paddingLeft: 20}}>
                <span style={{opacity:0.5}}>Difficulty&nbsp;</span> 
                <Explain value={props.order.difficulty}/>
            </p>
            <p style={{paddingLeft: 20}}>
                <span style={{opacity:0.5}}>Ability&nbsp;</span> 
                <Explain value={props.order.speed}/>
            </p>
        </div>
    ]
    return <button className="gui-order" 
                   disabled={!!props.disabled} 
                   onClick={props.onClick}
                   onMouseEnter={() => setTip(true)}
                   onMouseLeave={() => setTip(false)}>
        {!tip ? undefined : 
            <Tooltip tip={tooltip} ctx={props.agent.ctx} inserts={inserts}/>}
        {props.label}
        {props.order && <span className="effects">
                {props.effects.map((e, i) => 
                    <span key={i}>&nbsp;<span class={e[0]}/>{e[1]}</span>)}
                <span>
                    &nbsp;<span class="turns"/><b>{daysRemaining(props.order)}</b>
                </span>
            </span>}
    </button>
}

// A node in the decision tree that leads to producing orders.
class OrderNode {
    public readonly children: OrderNode[]|undefined
    public readonly order: Order|undefined
    public readonly disabled: string|undefined
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly effects: readonly [Effect, string][],
        childrenOrOrder: OrderNode[]|Order|string
    ) {
        if (Array.isArray(childrenOrOrder)) {
            this.children = childrenOrOrder;
            this.order = undefined;
            this.disabled = undefined
        } else if (typeof childrenOrOrder === "string") {
            this.children = undefined;
            this.order = undefined;
            this.disabled = childrenOrOrder;
        } else {
            this.children = undefined;
            this.order = childrenOrOrder;
            this.disabled = undefined;
        }
    }
}

// Produces a "recruit-agent" order, or an impossibility message
function recruitOrder(occupation: Occupation, agent: Agent, location: Location): Order|string {
    const ease = presenceByLocationKind[location.kind][occupation];
    const cellKind = location.world.map.cells[location.cell];

    if (ease === 0) {
        return `!!Cannot recruit a ${occupation} ${cellKind.inThis()}.!!`
    }

    const difficulty = explain([
        {why: "Base", contrib: 2}, 
        {why: `${occupation} ${cellKind.inThis()}`, contrib: 60 / ease}]);

    const multipliers: Reason[] = [
        {why: "Skill", contrib: agent.stats.recruit.value}
    ]

    if (agent.occupation == occupation)
        multipliers.push({why: "Same occupation", contrib: agent.stats.recruit.value});

    const speed = explain(multipliers, 2)

    return {
        kind: "recruit-agent",
        occupation,
        difficulty,
        speed,
        accumulated: 0
    }
}

function makeOrderTree(agent: AgentView): OrderNode[] {
    
    const undercoverEffects : [Effect, string][] = 
        [["gold", signedDecimal(agent.stats.idleIncome.value) + "/day"]]

    const location = agent.agent.location;

    return [

        // UNDERCOVER ========================================================
        new OrderNode(
            "Stay undercover...", `
#name# will spend the day on their occupation as #occupation#,
earning their usual :gold: income and gaining experience. 

They will pray to you every night, providing 
:touch: and letting you give new orders for the next day.

Undercover agents attract less attention, slowly reducing 
their :exposure:.`, undercoverEffects, [
            new OrderNode(
                "Stay undercover for a day.",
                `#name# will expect new orders on the next turn.`,
                undercoverEffects,
                undercover),
            new OrderNode(
                "Stay undercover for a week.", `
#name# will not expect new orders for the next seven turns. You may
still give them new orders before that.`, 
                undercoverEffects,
                { ...undercover, difficulty: { value: 7, reasons: [] } })
        ]),

        // RECRUITMENT =======================================================
        new OrderNode(
            "Recruit agent...", `
#name# will attempt to find and convert another agent in #location#, 
so that they may both serve you. This will likely take several days.

#name# will pray to you every night, providing :touch: and letting you 
give them different orders before they are done.`, [],
            location === undefined 
            ? `!!New agents cannot be recruited outdoors.!!`
            : occupations.map(occupation => new OrderNode(
                "Recruit a " + occupation,
                occupationTooltip[occupation],
                [],
                recruitOrder(occupation, agent.agent, location)))
        ),
    ];
}

function OrderProgress(props: {
    order: Order
}): JSX.Element {
    const fractionDone = props.order.accumulated / props.order.difficulty.value;
    return <div className="gui-order-progress">
        <div className="progress-time">
            <div style={{width:fractionDone + "%"}}></div>
        </div>
        <span>
            <span className="turns"/><b>{daysRemaining(props.order)}</b> 
        </span>
    </div>
}

export function AgentOrders(props: {
    agent: AgentView
}): JSX.Element {
    
    const order = props.agent.order;
    const [descent, setDescent] = useState<number[]>([])
    
    let nodes: OrderNode[] = useMemo(() => 
        makeOrderTree(props.agent),
        [props.agent]);

    for (let d of descent) nodes = nodes[d].children;

    const setOrder = useCallback((order: Order) => {
        const agent = props.agent.agent;
        agent.order = order;
        agent.world.refresh();
        setDescent([])
    }, [props.agent, setDescent]);

    return <div className="gui-give-orders">
        <table className="gui-info-table">
            <tr><th>Current orders</th><DescribeOrder order={order}/></tr>
        </table>
        {order.accumulated >= order.difficulty.value ? undefined : 
            <OrderProgress order={order}/>}
        <hr/>
        {nodes.map((node, i) => 
            <Order key={i}
                agent={props.agent}
                label={node.label}
                disabled={node.disabled}
                tooltip={node.tooltip}
                order={node.order}
                onClick={() => {
                    if (node.children) 
                        setDescent(a => [...a, i])
                    else if (node.order)
                        setOrder(node.order)
                }}
                effects={node.effects}/>)}
    </div>
}