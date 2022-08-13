// The number of priests in a location is multiplied by this number

import { build, int7, Pack } from "../serialize"
import { format, TxtFormatEx } from "../../text/format"

// and added to the total recruitment power for that location.
export const basePriestMult = 100

// The number of cult members in a location is multiplied by this 
// number and added to the total recruitment power for that location. 
export const baseMemberMult = 10

// The global cult exposure is multiplied by this number and
// added to the total recruitment power for all locations. 
export const baseExposureMult = 1

// The recruitment power cost to recruit a single additional member. 
// Fractional payments are possible, resulting in a linear probability
// of success. 
export const baseRecruit = 1000

export type Recruitment = {
    // Unique identifier of this recruitment mode
    readonly id : number
    // Name of this recruitment mode
    readonly name : string
    // Detailed description of this recruitment mode
    readonly description : TxtFormatEx<{cultname: string}>
    // Is a priest required locally in order for recruitment to happen ?
    readonly priestRequired: boolean
    // This relative percentage is applied to the priest-multiplier. 
    readonly priestEffect : number
    // The number of members in a location is multiplied 
    // by this value (and the base member multiplier) and 
    // added to the recruitment power
    readonly memberEffect : number
    // The cult exposure is multiplied by this value (and 
    // the base exposure multiplier) and added to the recruitment power
    readonly exposureEffect : number
    // Cult exposure gained from the priest and member components
    // of the recruitment power
    readonly exposureGainEffect : number
} 

// Add recruitment modes to this array, generating their id at the same
// time.
const added : Recruitment[] = [];
function add(r: Omit<Recruitment, 'id'>) {

    let desc = r.description.format + "\n\n***";

    function percentChange(good:boolean, value: number, what: string) {
        const txtvalue = (value >= 0 ? "+" : "") + (value * 100).toFixed(0) + "%";
        const colored = value >= 0 == good ? "^^" + txtvalue + "^^" : "!!" + txtvalue + "!!";
        return colored + " " + what;
    }
    
    if (r.priestEffect != 0)
        desc += "\n\n/.effect/" + percentChange(true, r.priestEffect, "recruitment by *priests*");

    if (r.memberEffect != 0)
        desc += "\n\n/.effect/" + percentChange(true, r.memberEffect, "recruitment by cult members");

    if (r.exposureEffect != 0)
        desc += "\n\n/.effect/" + percentChange(true, r.exposureEffect, "recruitment through cult :exposure:");

    if (r.exposureGainEffect != 0)
        desc += "\n\n/.effect/" + percentChange(false, r.exposureGainEffect, "cult :exposure: gain");
    
    added.push({...r, id: added.length, description: format(desc) });
}

add({
    name: "Chosen by Priests",
    description: format<{cultname: string}>(
        "Priests of the #cultname# identify those who are worthy of " +
        "joining, and extend them an introduction." +
        "\n\n" +
        "Slow but safe recruitment mode, with the lowest :exposure: gain " + 
        "and a reduced risk of *infiltration*."),
    priestRequired:      true, 
    priestEffect:        0,
    memberEffect:       -1,
    exposureEffect:     -0.75,
    exposureGainEffect: -0.5,
});

add({
    name: "Member Recommendations",
    description: format<{cultname: string}>(
        "Any member of the #cultname# may recommend new recruits, " +
        "though priests must vet every referral."),
    priestRequired:      true, 
    priestEffect:        0,
    memberEffect:        0,
    exposureEffect:     -0.5,
    exposureGainEffect: -0.25,
})

add({
    name: "Word-of-mouth",
    description: format<{cultname: string}>(
        "Any member of the #cultname# may bring those they deem worthy " +
        "into the cult, even without a priest's supervision."),
    priestRequired:      false,
    priestEffect:        0,
    memberEffect:        0.5,
    exposureEffect:      0,
    exposureGainEffect:  0,
})

add({
    name: "Active Outreach",
    description: format<{cultname: string}>(
        "Members and priests of the #cultname# call out for new members " +
        "in public places. Anyone is free to join." + 
        "\n\n" + 
        "The most effective for quickly increasing the size of the cult, " + 
        "but at the cost of brazenly accumulating :exposure:. The quality " + 
        "and loyalty of new recruits is likely to be low."),
    priestRequired:      false,
    priestEffect:        1,
    memberEffect:        1,
    exposureEffect:      1,
    exposureGainEffect:  1,
})

export const modes : readonly Recruitment[] = added;

export const pack_recruitment : Pack<Recruitment> = build<Recruitment>()
        .pass("id", int7)
        .call(id => modes[id])
