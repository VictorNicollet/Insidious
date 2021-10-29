import { h, JSX, Fragment } from "preact"
import { create } from "../text/cult"
import * as B from "./Box"
import { useWorld } from "./Context"

// Display 'you need at least N agents to start a cult'
function NeedAgents() {
       
    const w = useWorld();
    const a = w.agents;

    return <div style={{textAlign: "center", marginTop: 30, marginBottom: 30}}>
        <p>
            You need at least 3 agents to start a cult.
        </p>
        <p>
            Order <b>{a[0].name.full}</b> 
            {a.length > 1 ? <Fragment> or <b>{a[1].name.full}</b></Fragment> : undefined} 
            to recruit more agents.
        </p>
    </div>
}

// Display cult creation modal.
function CreateCult() {
    const w = useWorld();
    return <div>
        {create.toHTML({aspect: w.world.god.aspect})}
    </div>
}

export function CultManager(props: {
    height: number
    close: () => void
}) {
    const w = useWorld();

    return <B.Box title={"Cult of " + w.world.god.name} decorate={true} close={props.close}>
        {w.agents.length < 3 ? <NeedAgents/> : <CreateCult/>}
    </B.Box>
}