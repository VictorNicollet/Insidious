//@ts-nocheck
import * as fs from "fs"
import * as sharp from "sharp"
import * as BufferBuilder from "buffer-builder"

const replacements : Promise<Buffer>[] = []

// The styles !

const rawStyle = fs.readFileSync("./src/pack/style.css");
const style = rawStyle.toString('utf-8').replace(/\s+/g, " ");

const styleWithHoles = style.replace(/url\([^)]*\)/g, function(url) {
    const [, sx, sy, sw, sh, sscale, simg] = 
        /^url\( *(?:\/\* *(\d+) +(\d+) +(\d+) +(\d+)(?: +(\d+))? *\*\/ *)?(.*) *\)$/.exec(url);

    const noExtract = !sx && !sy && !sw && !sh;

    const imgPath = JSON.parse(simg).replace("../../", "./");
    
    const mime = /\.ttf$/.test(imgPath) ? "font/ttf" : "image/png";
    const repl = "##" + mime + "##";

    async function theBuffer() : Promise<Buffer> {

        let buffer : Buffer;
        if (noExtract)
        {
            buffer = fs.readFileSync(imgPath);
        }
        else
        {
            const [left,top,width,height] = [sx,sy,sw,sh].map(Number);

            let img = sharp(imgPath)
                .extract({left,top,width,height});

            if (typeof sscale !== "undefined") {
                const scale = Number(sscale) / 100;
                img = img.resize(Math.floor(width * scale), Math.floor(height * scale));
            }

            buffer = await img.toBuffer();
        }

        console.log("%s KB : %s", (buffer.length / 1024).toFixed(), imgPath)

        return buffer;
    }

    replacements.push(theBuffer());

    return repl;
});

const smallStyleWithHoles = styleWithHoles
    .replace(/\/\*.*?\*\//g, "")
    .replace(/ *([;:/{},]) */g, (_,a) => a);

fs.writeFileSync("./src/pack/style.ts", 
    "export function style(url: (mime: string) => string) {" + 
    "return " + JSON.stringify(smallStyleWithHoles) + ".replace(/##(.*?)##/g, match => 'url(' + url(match[1]) + ')')" +
    "}");

// The sounds !

(function(values: { [name: string]: string }) {

    const list : string[] = [];
    for (let name in values) {
        list.push(name);

        const path = values[name];
        
        async function theBuffer() {
            const buffer = fs.readFileSync(path);
            console.log("%s KB : %s", (buffer.length / 1024).toFixed(), path);
            return buffer;
        }

        replacements.push(theBuffer())
    }

    fs.writeFileSync("./src/pack/sound.ts", 
        "export type Sounds = {" + 
            list.map(function(key) { 
                return JSON.stringify(key) + ":HTMLAudioElement"
            }).join(",") +
        "}\n" + 
        "export function sound(url: () => string): Sounds { return {" + 
            list.map(function(key) {
                return JSON.stringify(key) + ":new Audio(url())"
            }).join(",") + 
        "}}")

})({
    music01: "./BigAssets/PurplePlanet/Respawn.mp3",
    music02: "./BigAssets/PurplePlanet/Expectancy.mp3",
    music03: "./BigAssets/PurplePlanet/TheChase.mp3"
});

// Generate the asset pack.

async function finish() {
    
    const blobs : Buffer[] = [];
    for (let promise of replacements) blobs.push(await promise);
    
    const builder = new BufferBuilder();
    builder.appendUInt32LE(blobs.length);
    for (let b of blobs) builder.appendUInt32LE(b.byteLength);
    for (let b of blobs) builder.appendBuffer(b);

    const blob : Buffer = builder.get();

    console.log("%s KB total", (blob.length / 1024).toFixed())
    fs.writeFileSync("./dist/assets.bin", blob);
}

finish(styleWithHoles);
