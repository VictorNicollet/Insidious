import { withSound } from "./pack/unpack";

// Start playing music. Expects the assets to have already been loaded.
export function playMusic() {

    const tracks : HTMLAudioElement[] = [];
    
    withSound(sounds => {
        tracks.push(
            sounds.music01, 
            sounds.music02, 
            sounds.music03)
    });

    let current = -1;
    async function playNext() {
        current = (current + 1) % tracks.length;
        try
        {
            await tracks[current].play();
            return true;
        }
        catch 
        {
            return false;
        }
    }

    for (const track of tracks)
        track.addEventListener("ended", playNext);

    // Some browsers prevent sounds from playing until the 
    // first interaction with the page, so react to clicks
    // instead. 
    async function tryStartPlay() {
        if (!await playNext()) setTimeout(tryStartPlay, 1000);
    }

    tryStartPlay();
}