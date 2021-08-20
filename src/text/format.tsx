import { h, JSX } from "preact"

export type TxtFormat = string
export type TxtContext = { [key: string]: string|(() => string) }

export type TxtFormatEx<T extends TxtContext> = { 
    format: TxtFormat
    toHTML: (t: T) => JSX.Element[] 
}

function style(html: string) {
    const match = /^\/([^\/]*)\//.exec(html);
    return match ? match[1] : "";
}

function unstyle(html: string) {
    return html.replace(/^\/[^\/]*\//, "");
}

// Convert a 'tooltip content' string into HTML. 
// 
// All HTML is escaped. Empty lines separate paragraphs.
// 
//  - Icons :foo: are converted to their HTML representation.
//  - Context calls #foo# are replaced by the result of props.ctx.foo()
//    (use #foo# to insert a *bold* value, ##foo# for a normal value).
//  - Inserts %N are replaced by props.inserts[N]
//
// The purpose of this function is to describe the content of tooltips
// as plain strings (except for the custom inserted values), which may
// then be translated to another language or moved to a content pack.
export function toHTML(
    tip: TxtFormat, 
    ctx: TxtContext, 
    inserts: readonly JSX.Element[],
): JSX.Element[] {
    
    // Replace all inserts. 
    return tip.replace(/##?[a-z]+#/ig, match => {
        const isBold = match.charAt(1) != '#';
        const call = match.substr(isBold ? 1 : 2, match.length - 2);
        const prop = ctx[call];
        const value = typeof prop == "string" ? prop : prop();
        return isBold ? '*'+value+'*' : value;
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
    .replace(/:[a-z]+(=[a-z0-9]+)?:/ig, match => {
        const icon = /(?<=:)[a-z]+/i.exec(match);
        const text = /[a-z0-9]+(?=:)/i.exec(match);
        return "<span class=\"" + icon + "\"></span><b>" + text + "</b>";
    })

    // Change *** to <hr/>
    .replace(/\*{3}/g, '<hr/>')
    
    // Change *foo* to <b>foo</b>
    .replace(/\*.*?\*/g, match => {
        return "<b>" + match.substr(1, match.length - 2) + "</b>";
    })

    // Change !!foo!! to a red font
    .replace(/!!.*!!/g, match => {
        return "<span style='color:#E77'>" + match.substr(2, match.length - 4) + '</span>';
    })

    // Cut the content into paragraphs based on empty lines. 
    .split(/\n\s*\n/g).filter(s => s).map(html => 
        /^%\d+\s*$/.test(html) 
            ? inserts[Number(html.substring(1))]
            : <p style={style(html)} dangerouslySetInnerHTML={{__html:unstyle(html)}}/>);
}

// Create a type-tagged format.
export function format<T extends TxtContext>(format: string) : TxtFormatEx<T> {
    return {format, toHTML: (ctx: T) => toHTML(format, ctx, [])}
}
