import { h } from "preact"
import type { LeftPanelShown } from './LeftPanel';

export function Navbar(props: {
    left: (show: LeftPanelShown) => void
}) {
    const left = props.left;
    return <div className="gui-navbar">
        <button onClick={() => left("locations")}>Locations</button>
        <button onClick={() => left("agents")}>Agents</button>
        <button onClick={() => left("cult")}>Cult</button>
        <button onClick={() => left("rituals")}>Rituals</button>
        <button onClick={() => left("artifacts")}>Artifacts</button>
    </div>
}