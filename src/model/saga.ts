import type { World } from "./world";

// A saga represents a sequence of related events in the game. 

// An active saga has been initiated, and waits for something to 
// begin its next step. 
export class ActiveSaga {

    private next : undefined|SagaNext

    constructor(
        // A function that returns the next step in a saga. 
        next : SagaNext)
    {
        this.next = next;
    }

    // Run the saga. Will return false if the saga is no longer
    // active. 
    run(world: World): boolean {
        if (!this.next) return false;
        const step = this.next(world);
        if (step) step(world, next => this.next = next);
        return true;
    }
}

// A function that returns the next step in a saga, if that 
// step has become available. 
export type SagaNext = (world: World) => SagaStep|undefined

// A function that applies the effect of a step in the saga
// to the game world, including: 
//  - displaying messages
//  - altering location or agent states
// Also receives a 'setNext' callback as argument, invoked with 
// a function to return the following step, to be plugged into 
// button clicks or other events.
export type SagaStep = (world: World, setNext: SetNextStep) => void

// A callback used to set the next step of a saga.
export type SetNextStep = (next: SagaNext|undefined) => void

// Keeps track of all active sagas in the game world.
export class Sagas {

    private readonly active : ActiveSaga[]

    constructor(
        private readonly world : World
    ) {
        this.active = []
    }

    public add(saga: ActiveSaga) {
        this.active.push(saga);
    }

    public run() {
        for (let i = 0; i < this.active.length; ++i) {
            const alive = this.active[i].run(this.world);
            if (!alive) {
                this.active[i] = this.active[this.active.length - 1];
                this.active.pop();
                i--;
            }
        }
    }
} 