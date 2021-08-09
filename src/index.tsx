import { generate } from 'model/generation/worldgen';
import { h, render } from "preact"
import { Container } from 'components/Container';
import { LocationList } from 'components/LocationList';
import { MapView } from 'components/MapView';
import { LeftPanel } from 'components/LeftPanel';

const world = generate();

const screenH = window.innerHeight;
const screenW = window.innerWidth;

render(
    <div>
        <MapView map={world.map}/>
        <LeftPanel screenH={screenH} screenW={screenW} world={world}/>
    </div>,
    document.body);

