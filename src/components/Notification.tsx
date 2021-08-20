import { h, JSX, Fragment } from "preact"
import { useWorld, useSelectors } from './Context'
import { useMemo } from 'preact/hooks';

type Notif = {
    readonly message: string
    readonly onClick: () => void
}

export function Notifications(props:{}): JSX.Element {
    
    const world = useWorld();
    const sel = useSelectors();
    const notifs : readonly Notif[] = useMemo(() => {
        
        const notifs : Notif[] = [];

        if (world.needOrders.length > 0) {
            notifs.push({
                message: 
                    world.needOrders.length == 1 
                    ? "An agent needs new orders."
                    : world.needOrders.length + " agents need new orders.",
                onClick: () => sel.agent(world.needOrders[0])
            })
        }

        while (notifs.length > 3)
            notifs.pop();

        return notifs;

    }, [sel.agent, world])

    if (notifs.length)
        return <div className="gui-notifications">
            {notifs.map(notif => 
                <div className="notif" onClick={notif.onClick}>
                    {notif.message}
                </div>)}
        </div>
    
    return <Fragment/>;
}