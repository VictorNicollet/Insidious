// The on/off flags that can be set at the world level.
export type WorldFlags = {
    // Has the player already performed the first 'Gather Information'
    // instruction in this world ? 
    firstGatherInfo: boolean
}

export const worldFlags : WorldFlags = {
    firstGatherInfo: false
}
