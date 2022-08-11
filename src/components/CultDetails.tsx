import { h, JSX, Fragment, ComponentChildren } from "preact"
import * as B from "./Box"
import * as R from "../model/cult/recruit"
import { useState } from "preact/hooks";
import { TooltipEx } from "./Tooltip";
import { useWorld } from "./Context";

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
                    //onClick={() => select(mode)}
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

export function CultDetails(props: {
    page: "recruitment"
    height: number
    close: () => void
}) {
    switch (props.page) {
        case "recruitment":
            return <CultRecruitment height={props.height} close={props.close}/>;
    }
}