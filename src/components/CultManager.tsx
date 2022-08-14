import { h, Fragment, JSX } from "preact"
import { CultView } from "../view/cult";
import { WorldView } from "../view/world";
import { create, cultExposureTip, cultPopulationTip, cultPriestsTip } from "../text/cult"
import * as B from "./Box"
import * as Cheats from "../cheats"
import { useSelectors, useWorld } from "./Context"
import { useState } from "preact/hooks";
import { Tooltip } from "./Tooltip";
import { TxtFormat } from "../text/format";
import { CultPages } from "./Screen";

function CultPolicy(props: {
    page: CultPages
    name: string
    current: string
    tip: TxtFormat
}) {
    
    const selectors = useSelectors();
    const [tip, setTip] = useState(false);
    
    return <li onClick={() => selectors.cult(props.page)}
               onPointerEnter={() => setTip(true)}
               onPointerLeave={() => setTip(false)}>
        {tip && <Tooltip pos="right" tip={props.tip} ctx={{}} inserts={[]}/>}
        <span className="policy">{props.name}</span>
        <span className="current">{props.current}</span>
    </li>
}

function CultInfoLine(props: {
    label: string,
    value: JSX.Element|string,
    tooltip?: JSX.Element
}): JSX.Element {

    const [tip, showTip] = useState(false);

    return <tr onMouseEnter={() => showTip(true)}
               onMouseLeave={() => showTip(false)}
               style={{position:"relative"}}>
        <th>{props.label}</th>
        <td>
            {tip ? props.tooltip : undefined}
            {props.value}
        </td>
    </tr>

}

// The actual cult display
function Cult(props: {cult: CultView, height: number}) {
    
    // Subtract the height of the top information region from the 
    // height left over for policies
    const height = props.height - 88;

    return <div>
        <table class="gui-info-table">
            <CultInfoLine label="Members" 
                value={props.cult.population.toFixed()}
                tooltip={<Tooltip pos="right" tip={cultPopulationTip(props.cult.population)} 
                            ctx={{}} inserts={[]}/>}
                            />
            <CultInfoLine label="Priests" 
                value={props.cult.priests.length.toFixed()}
                tooltip={<Tooltip pos="right" tip={cultPriestsTip} 
                            ctx={{}} inserts={[]}/>}
                            />
            <CultInfoLine label="Exposure" 
                value={<Fragment><span className="exposure"/><b>{props.cult.exposure.toFixed(0)}</b></Fragment>}
                tooltip={<Tooltip pos="right" tip={cultExposureTip} 
                            ctx={{}} inserts={[]}/>}
                            />
        </table>
        <hr/>
        <ul className="gui-cult-policies" style={{height}}>
            <CultPolicy page="pretense"
                name="Pretense"
                tip="The *pretense* is the ostensible objective of the cult, as presented to the general population.\n\nClick to change it."
                current={props.cult.pretense.name}/>
            <CultPolicy page="recruitment"
                name="Recruitment Policy"
                tip="The *recruitment policy* determines how new members are allowed to join the cult.\n\nClick to change it."
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

