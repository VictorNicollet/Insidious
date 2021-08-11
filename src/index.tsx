import { generate } from 'model/generation/worldgen';
import { h, render } from "preact"
import { Screen } from 'components/Screen';
import { world } from 'view/world';

const worldModel = generate();
const worldView = world(worldModel);

render(
    <Screen world={worldView}/>,
    document.body);

