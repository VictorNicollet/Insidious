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