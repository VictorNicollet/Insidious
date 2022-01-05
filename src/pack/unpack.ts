import { style } from "./style"
import { Sounds, sound } from "./sound"

let loadedSounds : Sounds|undefined = undefined

// Unpacks the style and assets packed with build.ts
export async function loadAndUnpack() {

    const assets = await fetch("/assets.bin");
    const buffer = await assets.arrayBuffer();
    
    const count = new Uint32Array(buffer, 0, 1)[0];
    const sizes = new Uint32Array(buffer, 4, count);

    let offset = (count + 1) * 4;
    let i = 0;

    function url(mime: string): string {
        const blob = new Blob(
            [ new Uint8Array(buffer, offset, sizes[i]) ],
            {type: mime})

        offset += sizes[i];
        i++;

        return URL.createObjectURL(blob);
    }

    const css = style((mime: string) => JSON.stringify(url(mime)));

    const styleElement = document.createElement("style");
    styleElement.appendChild(document.createTextNode(css));
    document.head.appendChild(styleElement);

    loadedSounds = sound(() => url("audio/mpeg"));
}

export function withSound(callback: (sounds: Sounds) => void) {
    if (loadedSounds) callback(loadedSounds)
}
