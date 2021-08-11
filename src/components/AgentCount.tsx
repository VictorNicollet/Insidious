import { h } from "preact"

export function AgentCount(props: {count: number}) {
    if (props.count == 0) return <div></div>;
    return <div class="gui-agent-count">{props.count}</div>
}