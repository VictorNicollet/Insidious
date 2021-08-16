import type { JSX } from "preact";

export type Message = {
    // The textual contents of the message.
    readonly contents: readonly JSX.Element[]
}