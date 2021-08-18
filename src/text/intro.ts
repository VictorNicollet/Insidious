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
}>(``);