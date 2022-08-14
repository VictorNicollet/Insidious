import { h, Fragment, JSX } from "preact"
import * as B from "./Box"
import * as R from "../model/cult/recruit"
import * as P from "../model/cult/pretense"
import { useState } from "preact/hooks";
import { TooltipEx } from "./Tooltip";
import { useWorld } from "./Context";
import { CultPages } from "./Screen";
import { never } from "../never";

function CultRecruitment(props: {
    height: number,
    close: () => void
}) {

    const w = useWorld();
    const cult = w.cult;

    const [tip, setTip] = useState(-1);

    if (!cult) return <Fragment></Fragment>;

    return <B.Box title="Recruitment Policy">
        {R.modes.map(mode => 
            <button className="gui-order"
                    onClick={() => { cult.cult.setRecruitment(mode); props.close() }}
                    onPointerEnter={() => setTip(mode.id)}
                    onPointerLeave={() => setTip(old => old === mode.id ? -1 : old)}>
                {tip !== mode.id ? undefined : 
                    <TooltipEx<{cultname: string}> 
                        tip={mode.description} 
                        ctx={{cultname: cult.name}}/>}
                    {mode.name}
            </button>)}
    </B.Box>
}

function CultPretense(props: {
    height: number,
    close: () => void
}) {

    const w = useWorld();
    const cult = w.cult;

    const [tip, setTip] = useState(-1);

    if (!cult) return <Fragment></Fragment>;

    return <B.Box title="Cult Pretense">
        {P.pretenses.map(pretense => 
            <button className="gui-order"
                    onClick={() => { cult.cult.setPretense(pretense); props.close() }}
                    onPointerEnter={() => setTip(pretense.id)}
                    onPointerLeave={() => setTip(old => old === pretense.id ? -1 : old)}>
                {tip !== pretense.id ? undefined : 
                    <TooltipEx<{cultname: string, aspect: string}> 
                        tip={pretense.description} 
                        ctx={{cultname: cult.name, aspect: w.world.god.aspect}}/>}
                    {pretense.name}
            </button>)}
    </B.Box>
}

export function CultDetails(props: {
    page: CultPages
    height: number
    close: () => void
}): JSX.Element {
    switch (props.page) {
        case "pretense":
            return <CultPretense height={props.height} close={props.close}/>;
        case "recruitment":
            return <CultRecruitment height={props.height} close={props.close}/>;
        default: 
            return never(props.page);
    }
}