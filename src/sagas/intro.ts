import { ActiveSaga, SetNextStep, SagaStep } from "../model/saga"
import { withProceed } from "../model/message"
import type { World } from "../model/world";
import * as Intro from "../text/intro"
import type { Agent } from "../model/agents";
import type { Location } from "../model/locations";

export function saga(agent: Agent, loc: Location) { return new ActiveSaga(w => intro(w, agent, loc)); }

function intro(w: World, agent: Agent, loc: Location) {
    
    const context = {
        god: w.god.name,
        agent: agent.name.short,
        location: loc.name.short,
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