// A bag that supports picking a value at random. 
export class RandomBag<T> {

    // The weight for picking each value in the bag. Sum equals 1.
    private readonly weights : Float32Array

    // If true, then after picking, half the weight of the picked value
    // is redistributed among all other values (to reduce the probability
    // of picking the same value twice).
    private readonly redist : boolean

    // Create a back that picks at random among the provided values. 
    // Optionally accepts an array of explicit weights (same length
    // as the array of values). 
    //
    // If the array of explicit weights is provided, then those 
    // weights are used for every call to pick().
    //
    // If no array of explicit weights is provided, then equal weights
    // are used, and the weight of each value decreases every time it
    // is picked.
    constructor(
        private readonly values: T[],
        explicitWeights?: number[]) 
    {
        const count = values.length;
        const weights = this.weights = new Float32Array(values.length)
        if (explicitWeights) {
            let sum = 0;
            for (let w of explicitWeights) sum += w;
            for (let i = 0; i < count; ++i) 
                weights[i] = explicitWeights[i] / sum;
        } else {
            const p = 1 / count;
            for (let i = 0; i < count; ++i) 
                weights[i] = p;
        }
        this.redist = !explicitWeights;
    } 

    pick() : T {
        const roll = Math.random();
        const weights = this.weights;
        
        // Find the picked entry
        let i = 0, sum = 0;
        while (sum <= roll && i < weights.length) sum += weights[i++];
        const picked = i - 1;

        if (this.redist)
        {
            // Redistribute half of the picked's probability
            const redistributed = weights[picked]/2/(weights.length - 1);
            sum = 0;
            for (i = 0; i < weights.length; ++i)
            {
                if (i == picked) continue;
                sum += (weights[i] += redistributed);
            }

            // Normalize to 1
            weights[picked] = 1 - sum;
        }

        // Return picked entry
        return this.values[picked];
    }
}