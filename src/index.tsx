import { generate } from './model/generation/worldgen';
import { h, render } from "preact"
import { Screen } from './components/Screen';
import { loadAndUnpack } from './pack/unpack';
import { playMusic } from './music';
import { loadFromLocalStore } from 'localStoreSave';
import { World } from './model/world';

async function loadAndRun() {

    await loadAndUnpack();
    playMusic();

    const worldModel = loadFromLocalStore("save", World.load) || generate();

    render(
        <Screen world={worldModel}/>,
        document.body);
}

loadAndRun();