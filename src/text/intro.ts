import { format } from './format';

export const intro = format<{
    god: string 
    aspect: string
    agent:string
    occupation: string 
    location:string
}>(`
Your infinite consciousness brushes against a new world, one you had never
noticed before. It is a slight touch, an open gate too small for you to pass 
through, but you hear a voice, a chant, a dark prayer. 

/text-align:center;filter:brightness(0.8)/ « I implore you, #god#, hear my call! »

You answer, and demand an explanation. The supplicant calls themselves 
#agent#, a #occupation# from #location#, and they heard your name in a 
dream the previous night. 

They know their world to be broken, incomplete. You can feel it, 
too. A bland taste, a faded tapestry, a deep thirst, a lack of #aspect#. 
Yes, more #aspect# would be precisely what this failed world needs! 
And there is none better than #god# to provide it.

As the first agent of your will, #agent# is waiting for your orders.
`);

export const second = format<{
    god: string 
    aspect: string
    agent:string
    occupation: string 
    location:string
}>(`
The first day ends, and #agent# reaches out again with a midnight prayer.
You can feel your :touch: over this world strengthen. Soon, you will be 
able to bring all your might to bear. But until then…

A distressing proportion of this world's mortals are quite content with
the current state of reality. In fact, they think there is too much #aspect#
in this world already, however absurd this may seem. They will react 
violently to your plans of improving their situation. 

You must work in secret. Insidiously. #agent# should try to find 
like-minded mortals, and recruit them as your *agents* throughout 
the kingdom.`);

export const third = format<{
    agent: string
    aspect: string
}>(`
#agent#'s voice brought you to this world. Perhaps, if more voices called
for your presence, you could grasp this realm fully, to give it the 
#aspect# it needs. 

Thousands of voices, tens of thousands. A cult to beseech you. Not all 
mortals will be as understanding as #agent#, or as faithful, or even 
willing, but that matters not, as long as you can hear their voices. 

Through strength, deceit or persuasion, your agents should recruit
cultists to clamor your name. 

/text-align:center/You have a new *plan* to take over this world.
`);