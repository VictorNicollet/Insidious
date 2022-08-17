import { Explained } from "../model/explainable";
import { h, JSX } from "preact"
import { decimal, integer } from "./numbers";

export function Explain(props: {left?: string, value: Explained}): JSX.Element {
    const e = props.value;
    if (typeof e.multiplier !== "undefined") {
        return <span>
            {typeof props.left === "undefined" ? " = " : " " + props.left + " "}
            {decimal(e.multiplier, 2)}&nbsp;<span style={{opacity:0.5}}>(Base)</span> {e.reasons.map(r => 
                <span>{r.contrib > 0 ? " +" : " -"}&nbsp;{integer(Math.abs(r.contrib * 100))}%&nbsp;<span style={{opacity:0.5}}>({r.why})</span></span>)}
        </span>
    }
    return <span>
        {e.reasons.map((r,i) => 
            <span>{i == 0 ? " =" : " +"}&nbsp;{decimal(r.contrib, 2)}&nbsp;<span style={{opacity:0.5}}>({r.why})</span></span>)}
    </span>
}
