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
    function playNext() {
        current = (current + 1) % tracks.length;
        tracks[current].play();
    }

    for (const track of tracks)
        track.addEventListener("ended", playNext);

    playNext();
}