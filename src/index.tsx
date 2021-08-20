import { generate } from './model/generation/worldgen';
import { h, render } from "preact"
import { Screen } from './components/Screen';
import { loadAndUnpack } from './pack/unpack';

async function loadAndRun() {

    await loadAndUnpack();

    const worldModel = generate();

    render(
        <Screen world={worldModel}/>,
        document.body);
}

loadAndRun();