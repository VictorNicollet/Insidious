import type { ByOccupation } from '../model/occupation';
import type { TxtFormat } from './format';
import type { StatsOf } from '../model/stats';

export const occupationTooltip : ByOccupation<TxtFormat> = {
    Noble: `
*Nobles* wield political power, though many are merely cousins or younger
siblings of the actual dukes and earls. They have access to the closed
circles of high society, and to the resources and connections of their 
family.

A well-rounded occupation, with above-average skills in nearly every
category. Nobles can only be recruited in a *City* or *Fortress*.`,
    Merchant: `
*Merchants* carry goods between towns, selling at a profit to earn 
a good *income*. 

Excellent judges of character, and in a position to 
meet many strangers, they are the best for *recruiting* new agents.`,
    Mage: `
*Mages* study hermetic arts both arcane and divine, then sell their
sorcery to a rich clientele, at higher levels earning the best 
*income* of all occupations.

Their magic makes them good conduits for your :touch:. 
Mages can only be recruited in a *City*, *Academy* or *Fortress*.`,
    Criminal: `
*Criminals* work outside the law, skulking in dark alleys and old 
ruins. The nature of their work frequently places them in mortal danger.

Clever and deceitful, they are the best for *spreading lies*,
*blackmail* and *murder*. 

At low levels, criminals have the best skills of nearly all 
occupations, though they have little room for growth.`,
    Farmer: `
*Farmers* tend the lands around cities and villages, feeding the 
entire society that weighs on their shoulders. 

They have mediocre skills, but their great numbers and discontent 
with their situation makes them easy to recruit.`,
    Smith: `
*Smiths* work the forges and workshops of the kingdom, earning a 
good *income*. 

Their skills are invaluable for producing new *equipment*.` , 
    Mercenary: `
*Mercenaries* work as guards, monster exterminators or bodyguards,
either alone or as part of bands or private armies. The nature of their 
work frequently places them in mortal danger.

They have the best *combat* ability of all occupations, and 
are quite used to traveling outdoors. `,
    Hunter: `
*Hunters* roam the land, killing game to sell meat and pelts back 
in town. The nature of their work sometimes places them in mortal 
danger.

They are the best at traveling *outdoors*, and decent in 
*combat*.`,
}

export const statTip : StatsOf<TxtFormat> = {
    contacts: `
How easily this agent can contact other people, whether passively 
through their occupation, or actively through an existing network.

Covers how quickly this agent can recruit other agents. Skill is
doubled when recruiting an agent of the same occupation.`,
    idleIncome: `
Amount of :gold: produced by this agent's day-to-day occupation,
collected for every day spent *undercover*. 

At low levels, acting undercover as some occupations (such 
as *merchant* or *noble*) may cost :gold: instead.`,
    upkeep: `
Amount of :gold: spent daily by this agent, regardless of the
orders given.`,
    outdoors: `
How fast this agent can travel outdoors. Also reduces the risk of 
encountering bandits or wild beasts. Does not apply to sailing.`,
    combat: `
How well this agent can fight.`,
    conduit: `
Amount of :touch: spend to maintain your link to this agent. 
Increases with. the level of the agent. 

Rituals performed by a good conduit are more effective.`,
    authority: `
This agent's authority over non-believers, whether through 
wealth, rank or reputation. 

As a downside, the agent's :exposure: 
cannot be decreased below their :authority:, since the 
powerful are more easily noticed.`,
    deceit: `
How well this agent can deceive and manipulate others, 
and spread lies and rumors. Also makes the agent less 
suspicious, gaining less exposure from their actions.`
}

export const upkeepTip : TxtFormat = `
Amount of :gold: needed by this agent for their daily needs. This
is determined by the agent's *occupation*, but not their *level*.

Being unable to pay this cost will reduce the agent's effectiveness, 
and may even lead them to abandon or betray your cause.`

export const exposureTip : TxtFormat = `
An agent's :exposure: measures how noticeable that agent's actions 
are—assuming that your enemies choose to look. 

The *Kingdom*, the *Inquisitors* and other factions opposing you will 
easily detect any agents whose :exposure: exceeds that faction's 
alertness level in a given location. 

Agents gain significant :exposure: when they act overtly in service 
to your plans.

They gain some :exposure: when they are seen doing things they should not 
do, or being in places they should not be. 

Agents can decrease their :exposure: by *staying undercover*.`

export const undercoverTip : TxtFormat = `

Every day provides the agent's *income* as :gold:,
and decreases their :exposure: by 1, though it cannot cause the
:exposure: to go below the agent's *authority*.`

export const recruitmentDifficultyTip : TxtFormat = `
The *recruitment difficulty* is the effort necessary to recruit a 
member in a given location. 

Recruitment is easy for the first members, but increases 
abruptly as the cult takes over a location. The last few 
members in a location may be nearly impossible to convert.

***

%0`

export function recruitmentPowerTip(needPriest: boolean) : TxtFormat {

  return `
The *recruitment power* measures the combined efforts of *priests*
and cult *members* in #location# to recruit new members for the cult.
` + (needPriest ? "\n\n" + 
"!!Your recruitment policy requires a priest to be present in order to " +
"recruit new members.!!" : "");
}

export const priestRecruitmentPowerTip : TxtFormat = `
Your *agents*, when ordered to act as *priests*, contribute to the 
member recruitment effort based on their *contact* ability.`

export const memberRecruitmentPowerTip : TxtFormat = `
The *members* of your cult contribute to the member recruitment effort.`

export const exposureRecruitmentPowerTip : TxtFormat = `
A higher :exposure: of your *cult* means it is easier for prospective
*members* to notice it and ask to join.`