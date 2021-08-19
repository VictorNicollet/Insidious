import { h, JSX, Fragment } from "preact"
import { AgentView } from 'view/agents'
import { Order, undercover, daysRemaining } from 'model/orders'
import { never } from 'never';
import { decimal, integer } from './numbers';
import { useState, useMemo, useCallback } from 'preact/hooks';
import { Tooltip } from './Tooltip';
import { occupations } from 'model/occupation';
import * as Help from 'text/help';
import { Explained } from 'model/explainable';
import { useWorld } from './Context';
import { WorldView } from 'view/world';
import { recruitOrder, travelOrder, gatherInfoOrder } from 'model/neworder';
import { zero } from 'model/resources';

function DescribeOrder(props: {order: Order}): JSX.Element {
    const world = useWorld();
    const order = props.order;
    if (order.progress >= order.difficulty.value)
        return <td className="no-orders">None</td>
    switch (order.kind) {
        case "undercover":
            return <td>Stay undercover</td>
        case "recruit-agent":
            return <td>Recruit a {order.occupation}</td>
        case "gather-info":
            switch (order.mode) {
                case "bribe": return <td>Gather info (bribe)</td>;
                case "street": return <td>Gather info (passive)</td>;
                case "tavern": return <td>Gather info (taverns)</td>;
                case "underworld": return <td>Gather info (underworld)</td>;
                case "gentry": return <td>Gather info (high society)</td>;
            }
        case "travel":
            const [,dest] = order.path[order.path.length - 1];
            const location = world.map.locations[dest];
            if (typeof location === "undefined")
                return <td>{order.sail ? "Sail" : "Travel"}</td>
            return <td>{order.sail ? "Sail" : "Travel"} to {world.locations[location].name.short}</td>
        default: return never<JSX.Element>(order);
    }
}

function Explain(props: {left?: string, value: Explained}): JSX.Element {
    const e = props.value;
    if (e.multiplier) {
        return <span>
            {typeof props.left === "undefined" ? " = " : " " + props.left + " "}
            {decimal(e.multiplier)}&nbsp;<span style={{opacity:0.5}}>(Base)</span> {e.reasons.map(r => 
                <span>{r.contrib > 0 ? " +" : " -"}&nbsp;{integer(Math.abs(r.contrib * 100))}%&nbsp;<span style={{opacity:0.5}}>({r.why})</span></span>)}
        </span>
    }
    return <span>
        {e.reasons.map((r,i) => 
            <span>{i == 0 ? " =" : " +"}&nbsp;{decimal(r.contrib)}&nbsp;<span style={{opacity:0.5}}>({r.why})</span></span>)}
    </span>
}

function Order(props: {
    agent: AgentView
    label: string
    disabled: string|undefined
    tooltip: string
    order: Order|undefined
    onClick: () => void
}): JSX.Element {
    const [tip, setTip] = useState(false);
    const tooltip = props.tooltip + 
        (props.disabled 
            ? "\n\n***\n\n" + props.disabled : 
         props.order && props.order.kind != "undercover" 
            ? "\n\n***\n\n%0" : "");
    const days = props.order ? daysRemaining(props.order) : 0;
    const inserts = !props.order ? [] : [
        <Fragment>
            <p style={{paddingLeft:40,textIndent:-40}}>
                <span class="turns"/><b>{days}</b><Explain value={props.order.difficulty}/>
            </p>
            {props.order.exposure.value > 0 ? 
                <p style={{paddingLeft:40,textIndent:-40}}>
                    <span class="exposure"/><b>{decimal(days * props.order.exposure.value)}</b>
                    &nbsp;= <span class="turns"/><b>{days}</b>
                    <Explain left={"×"} value={props.order.exposure}/>
                </p> : undefined}
        </Fragment>
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
                {props.order.cost.gold > 0 ? <Fragment>
                    {" "}<span class="gold"/><b>{integer(props.order.cost.gold)}</b>
                    </Fragment> : undefined}
                {props.order.cost.touch > 0 ? <Fragment>
                    {" "}<span class="touch"/><b>{integer(props.order.cost.touch)}</b>
                    </Fragment> : undefined}
                {props.order.exposure.value > 0 ? <Fragment>
                    {" "}<span class="exposure"/><b>{integer(Math.round(props.order.exposure.value * Math.ceil(props.order.difficulty.value)))}</b>
                </Fragment> : undefined}
                <Fragment>
                    {" "}<span class="turns"/><b>{integer(props.order.difficulty.value)}</b>
                </Fragment>
            </span>}
    </button>
}

// A future order (or disabled order) given in a node
type FutureOrder = {
    disabled?: string,
    order?: Order
}

// A node in the decision tree that leads to producing orders.
class OrderNode {
    public readonly children: OrderNode[]|undefined
    public readonly order: Order|undefined
    public readonly disabled: string|undefined
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        childrenOrOrder: OrderNode[]|FutureOrder
    ) {
        if (Array.isArray(childrenOrOrder)) {
            this.children = childrenOrOrder;
            this.order = undefined;
            this.disabled = undefined
        } else {
            this.children = undefined;
            this.order = childrenOrOrder.order;
            this.disabled = childrenOrOrder.disabled;
        }
    }
}

function makeOrderTree(agent: AgentView, world: WorldView): OrderNode[] {
    
    const location = agent.agent.location;
    
    // If an order's initial cost is too high, prevent it from being selected.
    // Note that if the agent already has an active order with an initial cost that 
    // has NOT been paid, then it will be refunded when a new order is selected
    // (and therefore must be taken into account as available).
    const currentOrderRes = agent.order.progress == 0 ? agent.order.cost : zero;
    function checkResources(order: Order|string): FutureOrder {
        if (typeof order === "string") return { disabled: order };
        const needGold = order.cost.gold - (world.resources.gold.current + currentOrderRes.gold);
        const needTouch = order.cost.touch - (world.resources.touch.current + currentOrderRes.touch);
        if (needGold > 0) 
            return {
                disabled: `!!An additional :gold=${Math.ceil(needGold)}: is needed.!!`,
                order
            };
        if (needTouch > 0)
            return {
                disabled: `!!An additional :touch=${Math.ceil(needTouch)}: is needed.!!`,
                order
            };
        return {order}
    }

    return [

        // UNDERCOVER ========================================================
        new OrderNode(
            "Stay undercover...", `
#name# will spend the day on their occupation as #occupation#,
earning their usual :gold: income and gaining experience. 

They will pray to you every night, providing 
:touch: and letting you give new orders for the next day.

Undercover agents attract less attention, slowly reducing 
their :exposure:.`, [
            new OrderNode(
                "Stay undercover for a day.",
                `
#name# will expect new orders on the next turn.

***

` + Help.undercoverTip, {order:undercover}),
            new OrderNode(
                "Stay undercover for a week.", `
#name# will not expect new orders for the next seven turns. You may
still give them new orders before that.

***

` + Help.undercoverTip, {order:{ ...undercover, difficulty: { value: 7, reasons: [] }}}),
            new OrderNode(
                "Stay undercover until further notice.", `
#name# will stay undercover until you decide to give them new orders.

***

` + Help.undercoverTip, {order:{ ...undercover, difficulty: { value: Number.POSITIVE_INFINITY, reasons: [] }}}),
        ]),

        // GATHER INFO =======================================================
        new OrderNode(
            "Gather information...", `
#name# will gather additional information about #location#.

#name# will pray to you every night, providing :touch: and letting you 
give them different orders before they are done.`,
            location === undefined
            ? {disabled:`!!Cannot gather information outdoors.!!`}
            : [
                new OrderNode(
                    "Listen to rumors", `
#name# will listen in on whispers, rumors and gossip, while nodding politely
and occasionally expressing socially acceptable levels of surprise.

Costs no :gold: or :exposure:, but cannot provide information beyond the 
*Basic* level.`,
                    location.information >= 1 
                    ? {disabled:"!!Cannot provide information beyond the *Basic* level.!!"}
                    : checkResources(gatherInfoOrder(agent.agent, "street"))),
                new OrderNode(
                    "Visit taverns", `
#name# will visit taverns, inns and merry places, paying for rounds and asking
the right questions. 

Strangers tend to share less information with agents with a high :exposure:. 

Slightly increases :exposure: and cannot provide information beyond the 
*Moderate* level.`,
                    location.information >= 3
                    ? {disabled:"!!Cannot provide information beyond the *Moderate* level.!!"}
                    : checkResources(gatherInfoOrder(agent.agent, "tavern"))
                ),
                new OrderNode(
                    "Visit the criminal underworld", `
#name# will visit bad neighborhoods and houses of ill repute to tap into 
the criminal grapevine. Agents with a criminal background will have an 
easier time entering the right places and asking the right people.

Strangers tend to share less information with agents with a high :exposure:.

Carries a moderate risk of death and increases :exposure:, but has
no limit on the level of information that can be gathered.`,
                    checkResources(gatherInfoOrder(agent.agent, "underworld"))
                ),
                new OrderNode(
                    "Ask in high society", `
#name# will visit the social gatherings, tea parties and evening balls of 
high society, bringing thoughtful gifts and feigning interest in the 
goings-on of #location# for legitimate reasons. 

No limit on the level of information that can be gathered. 

Only nobles, mages and merchants of sufficient standing can attend 
events in high society.`,
                    (agent.occupation === "Noble" && agent.levels.Noble >= 1 ||
                     agent.occupation === "Mage" && agent.levels.Mage >= 3 ||
                     agent.occupation === "Merchant" && agent.levels.Merchant >= 4)
                    ? checkResources(gatherInfoOrder(agent.agent, "gentry"))
                    : {disabled:`!!Must be a Noble Lv.1, Mage Lv.3, Merchant Lv.4 or higher.!!`}
                ),
                new OrderNode(
                    "Bribe officials", `
#name# will drop a fat pouch of gold in the lap of a greedy administrator,
officer or representative, along with the appropriate questions.

Very costly in :gold:, and increases :exposure: significantly, but has no
limit on the level of information that can be gathered.`,
                    checkResources(gatherInfoOrder(agent.agent, "bribe")))
            ]),

        // RECRUITMENT =======================================================
        new OrderNode(
            "Recruit agent...", `
#name# will attempt to find and convert another agent in #location#, 
so that they may both serve you. This will likely take several days.

#name# will pray to you every night, providing :touch: and letting you 
give them different orders before they are done.`, 
            location === undefined 
            ? {disabled:`!!New agents cannot be recruited outdoors.!!`}
            : occupations.map(occupation => new OrderNode(
                "Recruit a " + occupation,
                Help.occupationTooltip[occupation],
                checkResources(recruitOrder(occupation, agent.agent, location))))
        ),

        // TRAVELING =========================================================
        new OrderNode("Travel to...", `
By land or by water, #name# will attempt to reach another town, city or 
location.

Land travel is slow and dangerous, but can be improved by the *outdoors* 
skill of the agent.

Water travel is fast, but costs :gold: to hire a ship and a crew.`, 
            world.routes.allFrom(agent.cell).map(route => 
            {
                const location = world.locations[route.to];
                return new OrderNode(
                    (route.sail ? "Sail to " : "Travel to ") + location.name.short,
                    (route.sail ? `
#name# will hire a ship and a crew and sail to destination, for a fee
proportional to the distance travelled.

Sailing carries a small risk of encountering a deadly storm or 
a pirate attack.` : `
#name# will travel across the land to reach the destination. Crossing
:plains: and :farmland: is easy, but other terrain types can greatly 
increase the difficulty of the journey. 

Land travels carry a moderate risk of encountering wild beasts
or a bandit attack. 

Both the difficulty and the risks are reduced by the agent's *outdoors* skill.
`), 
                    checkResources(travelOrder(agent.agent, route)));
            }).sort((o1, o2) => o1.order.difficulty.value - o2.order.difficulty.value))
    ];
}

function OrderProgress(props: {
    order: Order
}): JSX.Element {
    const fractionDone = props.order.progress / props.order.difficulty.value;
    return <div className="gui-order-progress">
        <div className="progress-time">
            <div style={{width:(100*fractionDone) + "%"}}></div>
        </div>
        <span>
            <span className="turns"/><b>{integer(daysRemaining(props.order))}</b> 
        </span>
    </div>
}

export function AgentOrders(props: {
    agent: AgentView
}): JSX.Element {
    
    const order = props.agent.order;
    const [descent, setDescent] = useState<number[]>([])
    const world = useWorld();

    // Display the order tree _despite_ the agent already having
    // (non-completed) orders given to them ?
    const [despiteAlready, setDespiteAlready] = useState(false);

    let nodes: OrderNode[] = useMemo(() => 
        makeOrderTree(props.agent, world),
        [props.agent, world]);

    for (let d of descent) nodes = nodes[d].children;

    const setOrder = useCallback((order: Order) => {
        const agent = props.agent.agent;
        agent.order = order;
        agent.world.refresh();
        setDescent([])
        setDespiteAlready(false)
    }, [props.agent, setDescent]);

    return <div className="gui-give-orders">
        <table className="gui-info-table">
            <tr><th>Current orders</th><DescribeOrder order={order}/></tr>
        </table>
        {order.progress >= order.difficulty.value ? undefined :
            <OrderProgress order={order}/>}
        <hr/>
        {order.progress < order.difficulty.value && !despiteAlready 
            /* Display "already has orders" message */
            ? <div className="already">
                And so it shall be done.
                <button className="red" onClick={() => setDespiteAlready(true)}>
                    Change
                </button>
            </div> : <div>
            {/* Display the orders list */}
                {descent.length == 0 ? 
                    undefined : 
                    <button className="gui-order" 
                        onClick={() => setDescent(a => a.slice(0, a.length-1))}>
                    &larr; Back
                </button>}
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
                        }}/>)}
            </div>}
    </div>
}