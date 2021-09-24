import { h, JSX } from "preact"
import * as B from "./Box"
import { useWorld } from "./Context"

export function CultManager(props: {
    height: number
    close: () => void
}) {
    const w = useWorld();

    return <B.Box title={"Cult of " + w.world.god.name} decorate={true} close={props.close}>
        
        You need at least 3 agents to start a cult.

    </B.Box>
}