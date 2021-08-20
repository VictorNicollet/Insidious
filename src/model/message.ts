import type { JSX } from "preact";

export type Message = {
    // The textual contents of the message.
    readonly contents: readonly JSX.Element[]
    // Buttons (text and effect) 
    readonly buttons: MessageButton[]
}

export type MessageButton = {
    readonly label: string
    readonly click: () => void
}

export function withProceed(contents: readonly JSX.Element[]) {
    return {contents, buttons: [{label: "Proceed", click:() => {}}]}
}

export function withExcellent(contents: readonly JSX.Element[]) {
    return {contents, buttons: [{label: "Excellent", click:() => {}}]}
}