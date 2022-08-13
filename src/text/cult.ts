import { format } from './format';

export const create = format<{
    aspect: string
}>(`
Founding a cult in your name is one way to bring #aspect# into this 
unfinished world, and your *agents* stand ready, should you give the 
order.

Your *agents* will become able to act as *priests*, recruiting initiates
into the cult and guiding their congregation. As your cult grows, you 
will be able to shape its beliefs and practices as you desire. 
`);

export function cultPopulationTip(current: number) { 

    if (current == 0)
        return `
The number of *members* in your cult, not counting *agents*. 

Command your agents to work as *priests* in order to recruit more members.
`

    return `
There are ${current} *members* in your cult, not counting *agents*. 

Command your agents to work as *priests* in order to recruit more members.
    `
}

export const cultPriestsTip = `
You may command your *agents* to act as *priests*, tending to your cult 
and your believers.

Priests will *recruit new members* in the location where they work.
`

export const cultExposureTip = `
As your *priests* and *members* act in the open, they may be noticed by
the *Kingdom*, the *Inquisitors*, or your other enemies. The :exposure: 
level measures how noticeable the cult has become. 

A higher :exposure: also helps recruit members faster.  
`