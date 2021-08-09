import { generate } from 'model/generation/worldgen';
import { h, render } from "preact"
import { Container } from 'components/Container';
import { LocationList } from 'components/LocationList';
import { MapView } from 'components/MapView';

const world = generate();
const locations = world.locations();

render(
    <MapView map={world.map}/>,
    document.body);

