import { h, JSX } from "preact"
import { useState } from "preact/hooks"
import * as B from "./Box"
import * as P from './Pagination'
import { useSelectors } from './Context'
import type { PlanView } from '../view/plans'

// The height, in pixels, of an element in the agents list
const ITEMSIZE = 50;

// The agent list, inside a box.
export function PlanList(props: {
    // The agents to display
    plans: readonly PlanView[],
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {

    const {plans, height} = props;

    const selectors = useSelectors();

    const innerHeight = B.innerHeight(height);
    const pagesize = Math.floor((innerHeight - P.height) / ITEMSIZE);

    const [page, setPage] = useState(0)
    const pages = Math.ceil(plans.length / pagesize);
    const start = page * pagesize;
    const end   = Math.min(start + pagesize, plans.length);

    const shown = plans.slice(start, end);

    return <B.Box title="Plans" decorate={true} close={props.close}>
        <ul className="gui-agents" style={{height: 50*pagesize}}>
            {shown.length == 0 ? <li className="empty">You have no ongoing plans.</li> : undefined}
            {shown.map(plan => 
                <li key={plan.id} onClick={() => selectors.plan(plan)}>
                    <div className="name">
                        {plan.label}
                    </div>
                </li>
            )}
        </ul>
        <P.Pagination page={page} pages={pages} setPage={setPage}/>
    </B.Box>
}