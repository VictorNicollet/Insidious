import type { Agent } from 'model/agents';
import type { Location } from 'model/locations';
import { GatherInfoMode } from 'model/orders';
import * as Firsts from 'text/firsts';
import { withExcellent, withProceed, withDisappointing } from 'model/message';
import { RandomBag } from 'model/generation/randombag';
import { format } from 'text/format';

const agentAttackedWon = format<{agent: string}>(`
#agent# reports that they were ambushed by two thugs in a deserted alley, 
but managed to fend them off.`);

const agentMissingUnderground = format<{agent: string, location: string}>(`
You have lost contact with #agent#, who was fishing for information in 
the criminal underbelly of #location#. Their death was a risk you were 
willing to take.`)

const agentWasPickpocketed = format<{agent: string, location: string, gold: string}>(`
After spending the afternoon in a seedy district of #location#, #agent# discovered
that their coin purse was missing, along with the #gold# it contained.
`);

// A bad crime event returns false if it has prevented the information
// gathering from yielding additional information. If 'survive' is set,
// do not let the agent die. 
const badCrimeEvent = new RandomBag<((agent: Agent, location: Location, survive: boolean) => boolean)>([
    // Attacked by thugs
    function(agent, location, survive) {
        if (agent.survives(5, 3) || survive) {
            agent.world.newMessage(withProceed(agentAttackedWon.toHTML({
                agent: agent.name.short
            })))
            return true;
        }
        agent.world.newMessage(withDisappointing(agentMissingUnderground.toHTML({
            agent: agent.name.short,
            location: location.name.short
        })))
        agent.world.removeAgent(agent);
        return false;
    },
    // Pickpocketed
    function(agent, location) {
        const gold = agent.world.resources.gold;
        const lost = Math.ceil(gold / agent.world.agents().length);
        agent.world.resources.gold -= lost;
        agent.world.newMessage(withDisappointing(agentWasPickpocketed.toHTML({
            agent: agent.name.short,
            location: location.name.short,
            gold: ':gold=' + lost + ':'
        })))
        return true;
    }
])

// Invoked when gathering information about a location would succeed
// in increasing the information level by 1. If it returns false,
// the information level is _not_ increased. 
export function succeeds(
    agent: Agent, 
    location: Location, 
    mode: GatherInfoMode
): boolean {
    const world = agent.world;

    if (!world.flags.firstGatherInfo) {
        world.flags.firstGatherInfo = true;
        world.newMessage(withExcellent(
            Firsts.gatherInfo(mode).toHTML({
                location: location.name.short,
                lockind: location.kind,
                aspect: world.god.aspect
            })));
        return true;
    }

    // Does something bad happen ? 
    if (mode === "underworld" && Math.random() < 0.1) {
        const ev = badCrimeEvent.pick();
        // If agent is the only one, don't frustrate the player: ensure 
        // that the agent survives.
        const survive = world.agents().length == 1;
        if (!ev(agent, location, survive)) return false;
    }

    const foundSomething = Math.random() < 0.5;
    if (!foundSomething) return true;

}
