import { Reader, Writer } from "./model/serialize";

// TODO: LZW implementation is actually broken...

// LZW compression uses a trie of 256-element nodes. 
type Trie = ({children: Trie, code: string}|undefined)[]

function initTrie(): Trie {
    const trie: Trie = [];
    for (let i = 0; i < 256; ++i)
        trie.push({children: [], code: String.fromCharCode(i)})
    return trie;
}

// LZW compression of an Uint8Array into a string
export function lzwEncode(a: Uint8Array): string {

    // Maps byte sequences to codes (codes are single-character strings)
    let trie = initTrie();
    let nextCode = 256;

    let out = "";
    let i = 0;
    while (i < a.length) {

        // If we have exceeded the maximum size of the trie, clear it and 
        // start from scratch.
        if (nextCode == 65535) {
            trie = initTrie();
            nextCode = 256;
        }

        // Read forward through characters and traverse the trie looking 
        // for a code associated with a prefix sequence (longest sequence
        // is better), leaving i on the past-the-end-position. If no 
        // prefix sequence is found, i is left untouched and the code
        // stays empty. 
        let best = "";
        let trieSearch = trie;
        while (true) {

            if (i == a.length) {
                // Reached the end of the buffer while matching a prefix: 
                // write out that prefix then stop. 
                out += best;
                break;
            }

            // Does the next byte also match an existing prefix ? 
            const byte = a[i++];
            const maybeTrie = trieSearch[byte];
            
            if (!maybeTrie) {
                // Value not present in trie: we emit the prefix that we did manage
                // to match so far, then the next byte. From then on, this
                // new prefix will be associated with a code. 
                out += best + String.fromCharCode(byte);
                trieSearch[byte] = {children: [], code: String.fromCharCode(nextCode++) }                
                break;
            } 

            // Value present in trie: keep the code and look at the next character
            best = maybeTrie.code;
            trieSearch = maybeTrie.children;
        }
    }

    return a.length.toFixed(0) + ";" + out;
}

export function lzwDecode(str: string): Uint8Array {
    
    const semicolon = str.indexOf(';');
    const a = new Uint8Array(Number(str.substring(0, semicolon)));

    // Maps codes to the location of the byte sequences in the array
    // (codes under 256 are emitted directly as values)
    const seqOfCode : {start: number, end: number}[] = [];

    // Current write cursor inside 'a'
    let pos = 0;

    for (let i = semicolon + 1; i < str.length; i += 2) {

        if (seqOfCode.length + 256 === 65535) {
            seqOfCode.length = 0;
        }

        const code = str.charCodeAt(i);

        // Except for the last value, we always emit pairs of prefix + byte. 
        if (i + 1 < str.length) {

            const byte = str.charCodeAt(i+1);
            const start = pos;

            if (code < 256) {
                a[pos++] = code;
            } else {
                const seq = seqOfCode[code-256];
                a.copyWithin(pos, seq.start, seq.end);
                pos += seq.end - seq.start;
            }

            a[pos++] = byte;
            seqOfCode.push({start, end: pos});
        
        } else {

            if (code < 256) {
                a[pos++] = code;
            } else {
                const seq = seqOfCode[code-256];
                a.copyWithin(pos, seq.start, seq.end);
                pos += seq.end - seq.start;
            }
        }
    }

    return a;
}


// Save game data to the local store using the provided callback.
// This is a rather bad idea because of storage space usage. 
export function saveToLocalStore(field: string, callback: (writer: Writer) => void) {
    const d1 = +new Date();
    
    const writer = new Writer();
    callback(writer);
    
    const d2 = +new Date();
    
    const data = writer.toArray();
    
    const d3 = +new Date();
    
    const compressed = lzwEncode(data);
    
    const d4 = +new Date();
    //console.log("Saving to local storage: %o (write %f, toArray %f, lzw %f)", compressed, d2-d1, d3-d2, d4-d1);
    
    const decompressed = lzwDecode(compressed);

    localStorage.setItem(field, compressed);
}

export function loadFromLocalStore<T>(field: string, callback: (reader: Reader) => T): T|undefined {

    const value = localStorage.getItem(field);

    if (!value) return undefined;

    const array = lzwDecode(value);
    const reader = new Reader(array);
    
    return callback(reader);
}