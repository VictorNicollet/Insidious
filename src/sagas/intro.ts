import { ActiveSaga, SetNextStep, SagaStep } from "model/saga"
import type { World } from "model/world";
import * as Intro from "text/intro"

export function saga() { return new ActiveSaga(intro); }

function intro(w: World) {
    
    const agent = w.agents()[0];
    const last = agent.location;
    const context = {
        god: "PLAYERNAME",
        agent: agent.name.short,
        location: last.name.short,
        occupation: agent.occupation.toLocaleLowerCase(),
        aspect: "blood"
    };

    return function(w: World, setNext: SetNextStep) {    
        w.newMessage({ contents: Intro.intro.toHTML(context) })
        setNext(secondDay);
    }

    function secondDay(w: World): SagaStep {
        return function(w: World, setNext: SetNextStep) {
            w.newMessage({ contents: Intro.second.toHTML(context) })
            setNext(undefined);
        }
    }
}