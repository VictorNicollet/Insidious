import { h, JSX, Fragment } from "preact"
import { CultView } from "../view/cult";
import { WorldView } from "../view/world";
import { create } from "../text/cult"
import * as B from "./Box"
import * as Cheats from "../cheats"
import { useWorld } from "./Context"
import { useState } from "preact/hooks";

// The actual cult display
function Cult(props: {cult: CultView}) {
    return <Fragment></Fragment>;
}

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

function defaultCultName(w: WorldView) {
    return "Cult of " + w.world.god.name
}

// Display cult creation modal.
function CreateCult() {
    const w = useWorld();
    const [name, setName] = useState(defaultCultName(w));
    const valid = /[^ ]/.test(name);
    return <div>
        {create.toHTML({aspect: w.world.god.aspect})}
        <div className="gui-form">
            <label>
                Cult name 
                <input value={name} onInput={e => setName(e.currentTarget.value)}/>
            </label>
            <div className="gui-form-buttons">
                <button className="red" disabled={!valid} 
                        onClick={() => valid && w.world.createCult(name)}>
                    Found a cult
                </button>
            </div>
        </div>
    </div>
}

export function CultManager(props: {
    height: number
    close: () => void
}) {
    const w = useWorld();
    const cult = w.cult;
    const title = cult ? cult.name : defaultCultName(w);

    return <B.Box title={title} decorate={true} close={props.close}>
        {cult ? <Cult cult={cult}/> : 
         (Cheats.createCult || w.agents.length >= 3) ? <CreateCult/> : 
         <NeedAgents/>}
    </B.Box>
}