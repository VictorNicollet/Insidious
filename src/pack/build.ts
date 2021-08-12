import * as fs from "fs"
import * as sharp from "sharp"
import bufferToDataUrl from "buffer-to-data-url"
import { isObject } from 'util';

const rawStyle = fs.readFileSync("./src/pack/style.css");
const style = rawStyle.toString('utf-8').replace(/\s+/g, " ");

const replacements : Promise<(style: string) => string>[] = []

const styleWithHoles = style.replace(/url\([^)]*\)/g, function(url) {
    const [, sx, sy, sw, sh, sscale, simg] = 
        /^url\( *(?:\/\* *(\d+) +(\d+) +(\d+) +(\d+)(?: +(\d+))? *\*\/ *)?(.*) *\)$/.exec(url);

    const noExtract = !sx && !sy && !sw && !sh;

    const imgPath = JSON.parse(simg).replace("../../", "./");
    const repl = "####" + replacements.length + "####";

    const mime = /\.ttf$/.test(imgPath) ? "font/ttf" : "image/png";

    async function replace() : Promise<(style: string) => string> {

        let url : string;
        if (noExtract)
        {
            url = await bufferToDataUrl(mime, fs.readFileSync(imgPath));
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

            const buffer = await img.toBuffer();

            url = await bufferToDataUrl(mime, buffer);
        }

        console.log("%s KB : %s", (url.length / 1024).toFixed(), imgPath)

        return (style: string) => 
            style.replace(repl, "url(" + JSON.stringify(url) + ")")
    }

    replacements.push(replace());

    return repl;
});

async function finish(style: string) {
    for (let promise of replacements) {
        const repl = await promise;
        style = repl(style);
    }    
    console.log("%s KB total", (style.length / 1024).toFixed())
    fs.writeFileSync("./dist/style.css", style);
}

finish(styleWithHoles);
