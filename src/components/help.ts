import { ByOccupation } from 'model/occupation';
import { TooltipContent } from './Tooltip';

export const occupationTooltip : ByOccupation<TooltipContent> = {
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
Mages can only be recruited in a *City*, *Temple* or *Fortress*.`,
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