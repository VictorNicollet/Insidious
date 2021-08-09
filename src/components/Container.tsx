import { h, JSX, ComponentChildren } from "preact"

type ContainerProps = {
    position: "centered",
    width: number,
    top: number,
    children: ComponentChildren
} 

export function Container(props: ContainerProps): JSX.Element {
    if (props.position == "centered") {
        return <div style={{position: "fixed", 
                            top: props.top, 
                            bottom: 0, 
                            left: 0, 
                            right: 0 }}>
            <div className="gui-container"
                 style={{width: props.width,
                         margin: "auto"}}>
                {props.children}
            </div>
        </div>
    }
}