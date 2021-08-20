import { ActiveSaga, SetNextStep, SagaStep } from "model/saga"
import { withProceed } from "model/message"
import type { World } from "model/world";
import * as Intro from "text/intro"

export function saga() { return new ActiveSaga(intro); }

function intro(w: World) {
    
    const agent = w.agents()[0];
    const last = agent.location;
    const context = {
        god: w.god.name,
        agent: agent.name.short,
        location: last.name.short,
        occupation: agent.occupation.toLocaleLowerCase(),
        aspect: w.god.aspect
    };

    return function(w: World, setNext: SetNextStep) {    
        w.newMessage(withProceed(Intro.intro.toHTML(context)));
        setNext(secondDay);
    }

    function secondDay(w: World): SagaStep {
        return function(w: World, setNext: SetNextStep) {
            w.newMessage(withProceed(Intro.second.toHTML(context)));
            setNext(undefined);
        }
    }
}