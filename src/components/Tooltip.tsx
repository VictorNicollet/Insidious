import { h, JSX } from "preact"

export type TooltipContent = string
export type TooltipContext = { [key: string]: () => string }

// Convert a 'tooltip content' string into HTML. 
// 
// All HTML is escaped. Empty lines separate paragraphs.
// 
//  - Icons :foo: are converted to their HTML representation.
//  - Context calls #foo# are replaced by the result of props.ctx.foo()
//  - Inserts %N are replaced by props.inserts[N]
//
// The purpose of this function is to describe the content of tooltips
// as plain strings (except for the custom inserted values), which may
// then be translated to another language or moved to a content pack.
function toHTML(
    tip: TooltipContent, 
    ctx: TooltipContext, 
    inserts: readonly JSX.Element[],
): JSX.Element[] {
    
    // Replace all inserts. 
    return tip.replace(/#[a-z]+#/g, match => {
        const call = match.substr(1, match.length - 2);
        return "*" + ctx[call]() + "*";
    })

    // Don't leak any unescaped HTML, including from inserts 
    .replace(/[<>&"]/g, s => 
        s == "<" ? "&lt;" : 
        s == ">" ? "&gt;" : 
        s == "&" ? "&amp;" : "&quot;")

    // Standard replacements of icons (done after escaping, since
    // output contains HTML)
    //
    // For example :gold: becomes <span class=gold/><b>gold</b>
    .replace(/:[a-z]+:/g, match => {
        const icon = match.substr(1, match.length - 2);
        return "<span class=\"" + icon + "\"></span><b>" + icon + "</b>";
    })

    // Change *foo* to <b>foo</b>
    .replace(/\*.*?\*/g, match => {
        return "<b>" + match.substr(1, match.length - 2) + "</b>";
    })

    // Cut the content into paragraphs based on empty lines. 
    .split(/\n\s*\n/g).filter(s => s).map(html => 
        /^%\d+\s*$/.test(html) 
            ? inserts[Number(html.substring(1))]
            : <p dangerouslySetInnerHTML={{__html:html}}/>);
}

export function Tooltip<T extends TooltipContext>(props: {
    tip: TooltipContent
    ctx: T
    inserts: readonly JSX.Element[]
}): JSX.Element {
    return <div className="tooltip">
        <div>{toHTML(props.tip, props.ctx, props.inserts)}</div>
    </div>
}