import { build, int7, Pack } from "../serialize"
import { format, TxtFormatEx } from "../../text/format";
import * as P from "../population";

type CasteEffect = {
    effect: number
    castes: number[]
}

export type Pretense = {
    // Unique identifier of this pretense
    readonly id : number
    // Name of this cult pretense
    readonly name : string
    // Detailed description
    readonly description : TxtFormatEx<{cultname: string, aspect: string}>
    // Are we being honest about the real promise of the cult ?
    readonly isHonest : boolean
    // Modifier to exposure gain
    readonly exposureGainEffect : number
    // Modifier to the cost of performing miracles
    readonly miracleCostEffect : number
    // Modifier to the cost of maintaining the cult
    readonly maintenanceCostEffect : number
    // Default affinity gain (for castes not listed below)
    readonly defaultAffinity: number
    // Bonus/malus to social caste affinity
    readonly casteAffinity: readonly CasteEffect[]
    // Faith loss effect
    readonly faithLoss : number
}

// Add cult pretenses to this array, generating their id at the same time
const added : Pretense[] = [];
function add(p: Omit<Pretense, "id">) {
 
    let desc = p.description.format + "\n\n***";

    function percentChange(good:boolean, value: number, what: string) {
        const txtvalue = (value >= 0 ? "+" : "") + (value * 100).toFixed(0) + "%";
        const colored = value >= 0 == good ? "^^" + txtvalue + "^^" : "!!" + txtvalue + "!!";
        return colored + " " + what;
    }

    if (p.defaultAffinity != 0)
        desc += "\n\n/.effect/" + percentChange(true, p.defaultAffinity, "affinity for recruiting *members*");

    for (const {effect, castes} of p.casteAffinity) {
        let castestr = "*" + P.casteName(castes[0]) + "*";
        for (let i = 1; i < castes.length - 1; i++) castestr += ", *" + P.casteName(castes[i]) + "*";
        if (castes.length > 1) castestr += " and *" + P.casteName(castes[castes.length - 1]) + "*";
        desc += "\n\n/.effect/" + percentChange(true, effect, "affinity for " + castestr);
    }

    if (p.maintenanceCostEffect != 0)
        desc += "\n\n/.effect/" + percentChange(false, p.maintenanceCostEffect, ":gold: cost of running the cult");

    if (p.miracleCostEffect != 0)
        desc += "\n\n/.effect/" + percentChange(false, p.miracleCostEffect, ":touch: cost of *miracles*");

    if (p.exposureGainEffect != 0)
        desc += "\n\n/.effect/" + percentChange(false, p.exposureGainEffect, "cult :exposure: gain");
    
    if (p.faithLoss != 0)
        desc += "\n\n/.effect/" + percentChange(true, p.faithLoss, ":faith: when true nature is revealed");
    
    added.push({...p, id: added.length, description: format(desc) });   
}

add({
    name: "To Serve You",
    description: format<{cultname: string, aspect: string}>(`
Publicly admit that the objective of the #cultname# is to help you 
bring #aspect# into this world. Sometimes, honesty is the best policy!

Recruiting new *members* will be harder in this world that does not 
recognize the need for #aspect#, but they will be more loyal to your 
cause.`),
    isHonest: true,
    defaultAffinity: 0,
    casteAffinity: [],
    maintenanceCostEffect: 0,
    miracleCostEffect: 0,
    exposureGainEffect: 0,
    faithLoss: 0
})

add({
    name: "To Understand the Universe",
    description: format<{cultname: string, aspect: string}>(`
A call to intellectuals: the #cultname# will ostensibly act to 
investigate the deepest secrets of the universe. Our *members* 
will be men of science and magic, they will teach lessons, perform 
experiments and write books. 

Most of the population cares little for these things, but we will
attract those who seek knowledge—and knowledge is power. 

Our members will be more likely to understand that #aspect# is the
true meaning of this world, and thus less likely to lose :faith: 
when they peek behind the curtain.`),
    isHonest: false,
    defaultAffinity: 0,
    casteAffinity: [
        {effect: 1, castes: [P.mystics]},
        {effect: 0.5, castes: [P.bourgeois, P.gentry]},
        {effect: 0.25, castes: [P.artisans]}
    ],
    maintenanceCostEffect: 1,
    miracleCostEffect: 1,
    exposureGainEffect: -0.5,
    faithLoss: -0.1
});

add({
    name: "To Bring Good Fortune",
    description: format<{cultname: string, aspect: string}>(`
The #cultname# will present you as an all-powerful but distant god, 
your divine will only revealed to your *priests*. To the faithful, 
your power brings good health, abundant crops or plentiful deals, but 
there are no guarantees.

Most *members* will join just to get you on their good side, but will
not invest too much time or money into the cult.`),
    isHonest: false,
    defaultAffinity: 0.1,
    casteAffinity: [
        {effect: 0.3, castes: [P.laborers, P.artisans, P.fighters]},
        {effect: 0.2, castes: [P.bourgeois, P.criminals]}
    ],
    maintenanceCostEffect: 0.1,
    miracleCostEffect: 0.1,
    exposureGainEffect: -0.5,
    faithLoss: -0.5
});

add({
    name: "To Grant Power over Others",
    description: format<{cultname: string, aspect: string}>(`
A tool for the ambitous: the #cultname# will support those who seek
power and authority, improving their skills, sabotaging their rivals
and encouraging nepotism between *members*.`),
    isHonest: false,
    defaultAffinity: 0.25,
    casteAffinity: [
        {effect: 1, castes: [P.bourgeois, P.gentry, P.criminals]},
        {effect: 0.5, castes: [P.fighters, P.mystics]}
    ],
    maintenanceCostEffect: 0.5,
    miracleCostEffect: 0.5,
    exposureGainEffect: 0.1,
    faithLoss: -0.6
});

add({
    name: "To Help Those in Need",
    description: format<{cultname: string, aspect: string}>(`
The sweetest lie: the #cultname# will ostensibly act to relieve the 
the tired, the poor, the huddled masses. We will feed the hungry and 
heal the sick, we will build orphanages and plead with the authorities
for relief. 

The lower classes will flock to become *members*, and even the higher
classes will only criticize the cult in private. Those who discover
the true aim of the cult, however, will lose faith entirely.`),
    isHonest: false,
    defaultAffinity: 0.5,
    casteAffinity: [
        {effect: 1, castes: [P.laborers, P.artisans]},
        {effect: -0.25, castes: [P.bourgeois, P.gentry]}
    ],
    maintenanceCostEffect: 1,
    miracleCostEffect: 1.5,
    exposureGainEffect: -0.9,
    faithLoss: -0.95
});

export const pretenses : readonly Pretense[] = added;

export const pack_pretense : Pack<Pretense> = build<Pretense>()
    .pass("id", int7)
    .call(id => pretenses[id])
