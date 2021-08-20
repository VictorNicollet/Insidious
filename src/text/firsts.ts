import { format } from './format'
import { ByGatherInfoMode, GatherInfoMode } from '../model/orders'
import { LocationKind } from '../model/locations'

const byMode : ByGatherInfoMode<string> = {
    street: "Patiently listening to rumors",
    tavern: "Asking questions in the local taverns",
    underworld: "Finding informants in the bad districts",
    gentry: "Infiltrating high society gatherings",
    bribe: "Bribing a few select officials"
}

export const gatherInfo = (mode: GatherInfoMode) => format<{
    aspect: string
    location: string
    lockind: LocationKind
}>(`
${byMode[mode]} has revealed interesting information about #location#. 
This is a good first step towards infiltrating it, perhaps even 
gathering a local #aspect# cult. 

The ##lockind# still holds many secrets, however, so it might 
be wise to investigate it further.`)