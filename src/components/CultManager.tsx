import { h, Fragment } from "preact"
import { CultView } from "../view/cult";
import { WorldView } from "../view/world";
import { create } from "../text/cult"
import * as B from "./Box"
import * as Cheats from "../cheats"
import { useSelectors, useWorld } from "./Context"
import { useState } from "preact/hooks";
import { Tooltip } from "./Tooltip";
import { TxtFormat } from "../text/format";

type CultPolicies = "recruitment"

function CultPolicy(props: {
    policy: CultPolicies
    name: string
    current: string
    tip: TxtFormat
}) {
    
    const selectors = useSelectors();
    const [tip, setTip] = useState(false);
    
    return <li onClick={() => selectors.cult("recruitment")}
               onPointerEnter={() => setTip(true)}
               onPointerLeave={() => setTip(false)}>
        {tip && <Tooltip pos={"right"} tip={props.tip} ctx={{}} inserts={[]}/>}
        <span className="policy">{props.name}</span>
        <span className="current">{props.current}</span>
    </li>
}

// The actual cult display
function Cult(props: {cult: CultView, height: number}) {
    
    return <div>
        <ul className="gui-cult-policies" style={{height:props.height}}>
            <CultPolicy policy="recruitment"
                name="Recruitment Policy"
                tip="The *recruitment policy* determines how new members are allowed to join the cult."
                current={props.cult.recruitment.name}/>
        </ul>
    </div>;
}

// Display 'you need at least N agents to start a cult'
function NeedAgents(props: {height: number}) {
       
    const w = useWorld();
    const a = w.agents;

    return <div style={{textAlign: "center", height: props.height}}>
        <p style={{marginTop: 30}}>
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
function CreateCult(props:{height: number}) {
    const w = useWorld();
    const [name, setName] = useState(defaultCultName(w));
    const valid = /[^ ]/.test(name);
    return <div style={{height: props.height}}>
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

    const innerHeight = B.innerHeight(props.height);

    return <B.Box title={title} decorate={true} close={props.close}>
        {cult ? <Cult cult={cult} height={innerHeight}/> : 
         (Cheats.createCult || w.agents.length >= 3) ? <CreateCult height={innerHeight}/> : 
         <NeedAgents height={innerHeight}/>}
    </B.Box>
}