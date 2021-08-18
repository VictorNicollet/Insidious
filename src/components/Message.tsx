import { h, JSX } from "preact"
import { Message } from "model/message";
import { useWorld } from './Context';
import { useCallback } from 'preact/hooks';
import { ModalBox } from './Box';

export function Message(props: {message: Message}): JSX.Element {
    
    const world = useWorld();
    const close = useCallback(() => {
        world.world.removeMessage();
        world.world.refresh();
    }, [world.world]);

    return <ModalBox close={close}>
        {props.message.contents}
        <div style={{textAlign: "center",marginTop:10}}>
            {props.message.buttons.map(b => 
                <button className="red" onClick={() => { b.click() ; close(); }}>
                    {b.label}
                </button>)}
        </div>
    </ModalBox>
}
