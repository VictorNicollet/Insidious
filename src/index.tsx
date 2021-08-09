import { generate } from 'model/generation/worldgen';
import { h, render } from "preact"
import { Container } from 'components/Container';
import { LocationList } from 'components/LocationList';
import { MapView } from 'components/MapView';

const world = generate();
const locations = world.locations();

render(
    <div>
        <MapView map={world.map}/>
        <Container position="centered" top={40} width={400}>
            <LocationList locations={locations} pagesize={7} />
        </Container>
    </div>,
    document.body);

