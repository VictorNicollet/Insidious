import { generate } from 'model/generation/worldgen';
import { h, render } from "preact"
import { Screen } from 'components/Screen';

const world = generate();

render(
    <Screen world={world}/>,
    document.body);

