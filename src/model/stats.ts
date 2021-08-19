import type { Agent } from "./agents"
import type { ByOccupation } from './occupation';
import { Explained, Reason, explain } from './explainable';

// Numerical statistics of an agent, computed from the 
// agent's situation. This is DENSE.
export type StatsOf<T> = {
    // Gold income produced every day by the 'idle' 
    // action. Fractional values are interpreted as a 
    // probability of producing one unit. 
    idleIncome: T
    // Number of "standard agent recruitment units" produced 
    // by the "recruit agent" action every day. Recruitment 
    // succeeds when the number of units (based on the 
    // difficulty) is reached.
    recruit: T
    // Related to travel time outdoors, also decreases dangers
    // of moving or being outdoors.
    outdoors: T
    // General ability to fight
    combat: T
    // Daily touch increase, and ability to perform rituals
    conduit: T, 
    // Ability to lie and manipulate others, used to reduce 
    // exposure gain and to spread lies and rumors
    deceit: T,
}

export type Stats = StatsOf<Explained>
export type StatKey = keyof(Stats)

const weeklyIdleIncomeByOccupation : ByOccupation<[number,number]> = {
    // Initial, and per-level increase
    //                        Lv.0 Lv.1 Lv.2 Lv.3 Lv.4 Lv.5 Lv.6 Lv.7 Lv.8 Lv.9
    Noble:     [-10, 5  ], //  -10   -5    0    5   10   15   20   25   30   35
    Mage:      [-16, 7  ], //  -16   -9   -2    5   12   19   26   33   40   47
    Merchant:  [ -5, 5  ], //   -5    0    5   10   15   20   25   30   35   40
    Mercenary: [  0, 1  ], //    0    1    2    3    4    5    6    7    8    9
    Criminal:  [  0, 1  ], //    0    1    2    3    4    5    6    7    8    9
    Smith:     [ -4, 3  ], //   -1    1    4    7   10   13   16   19   21   24
    Farmer:    [  0, 0.4], //    0  0.4  0.8  1.2  1.6    2  2.4  2.8  3.2  3.6  
    Hunter:    [  0, 0.4], //    0  0.4  0.8  1.2  1.6    2  2.4  2.8  3.2  3.6  
}

const agentRecruitPowerByOccupation : ByOccupation<[number,number]> = {
    // Per-level bonus if main, per-level bonus if secondary
    // Skill on 1-100 range. 
    Noble:     [ 5, 2],
    Mage:      [ 1, 0],
    Merchant:  [10, 5],
    Mercenary: [ 3, 1],
    Criminal:  [ 2, 2],
    Smith:     [ 1, 0],
    Farmer:    [ 1, 0],
    Hunter:    [ 1, 0]
}

const outdoorsByOccupation : ByOccupation<[number,number]> = {
    // Initial, and per-level bonus (ignored when negative)
    //                     Lv.0 Lv.1 Lv.2 Lv.3 Lv.4 Lv.5 Lv.6 Lv.7 Lv.8 Lv.9
    Noble:     [0,  0], //    0    0    0    0    0    0    0    0    0    0
    Mage:      [0,  0], //    0    0    0    0    0    0    0    0    0    0
    Merchant:  [-4, 4], //    0    0    4    8   12   16   20   24   28   32
    Criminal:  [-4, 2], //    0    0    0    2    4    6    8   10   12   14
    Smith:     [0,  0], //    0    0    0    0    0    0    0    0    0    0
    Farmer:    [0,  2], //    0    2    4    6    8   10   12   14   16   18
    Mercenary: [0,  4], //    0    4    8   12   16   20   24   28   32   36
    Hunter:    [0,  6]  //    0    6   12   18   24   30   36   42   48   54
}

const combatByOccupation : ByOccupation<[number,number]> = {
    // Initial, and per-level bonus (ignored when negative)
    //                      Lv.0 Lv.1 Lv.2 Lv.3 Lv.4 Lv.5 Lv.6 Lv.7 Lv.8 Lv.9
    Noble:     [0,   2], //    0    2    4    6    8   10   12   14   16   18
    Mage:      [-12, 5], //    0    0    0    3    8   13   18   23   28   33
    Merchant:  [1,   0], //    0    1    1    1    1    1    1    1    1    1
    Criminal:  [3,   1], //    0    4    5    6    7    8    9   10   11   12
    Smith:     [0,   0], //    0    0    0    0    0    0    0    0    0    0
    Farmer:    [-6,  1], //    0    0    0    0    0    0    0    1    2    3
    Mercenary: [3,   3], //    0    6    9   12   15   18   21   24   27   30
    Hunter:    [-1,  3], //    0    2    5    8   11   14   17   20   23   26
}

const conduitByOccupation : ByOccupation<number> = {
    // Per-level bonus (regardless of main occupation)
    Noble: 0.2,
    Merchant: 0.2,
    Criminal: 0.2,
    Smith: 0.2,
    Farmer: 0.2,
    Mercenary: 0.2,
    Hunter: 0.2,
    Mage: 0.6
}

const deceitByOccupation : ByOccupation<[number,number]> = {
    // Per-level bonus if main, and if secondary
    Criminal: [9, 6],
    Noble: [6, 3],
    Merchant: [6, 3],
    Mercenary: [3, 1],
    Mage: [6, 1],
    Farmer: [1, 0],
    Hunter: [1, 0],
    Smith: [1, 0]
}

// The rules to compute all the stats based on an agent.
const rules: StatsOf<(reasons: Reason[], agent: Agent) => void> = {
    idleIncome: function(reasons: Reason[], agent: Agent) {
        for (let occupation in weeklyIdleIncomeByOccupation) {
            const [initial, byLevel] = weeklyIdleIncomeByOccupation[occupation];
            const level = agent.levels[occupation];
            const value = initial + byLevel * level;
            if (agent.occupation == occupation)
                reasons.push({ why: occupation + " Lv." + level, contrib: value })
            else if (value > 0) 
                reasons.push({ why: occupation + " Lv." + level, contrib: value/2});       
        }
    },
    conduit: function(reasons: Reason[], agent: Agent) {
        reasons.push({ why: "Base", contrib: 0.4 })
        for (let occupation in conduitByOccupation) {
            const byLevel = conduitByOccupation[occupation];
            const level = agent.levels[occupation];
            if (level > 0) 
                reasons.push({ why: occupation + " Lv." + level, contrib: byLevel * level })
        }
    }, 
    recruit: function(reasons: Reason[], agent: Agent) {
        for (let occupation in agentRecruitPowerByOccupation) {
            const [ifMain, ifSecondary] = agentRecruitPowerByOccupation[occupation];
            const level = agent.levels[occupation];
            const value = (agent.occupation == occupation ? ifMain : ifSecondary) * level;
            if (value > 0) 
                reasons.push({ why: occupation + " Lv." + level, contrib: value })
        }
    },
    outdoors: function(reasons: Reason[], agent: Agent) {
        for (let occupation in outdoorsByOccupation) {
            const [base, byLevel] = outdoorsByOccupation[occupation];
            const level = agent.levels[occupation];
            const value = Math.max(0, base + level * byLevel);    
            if (value > 0) 
                reasons.push({ why: occupation + " Lv." + level, contrib: value })
        }
        if (reasons.length == 0) 
            reasons.push({ 
                why: agent.occupation + " Lv." + agent.levels[agent.occupation],
                contrib: 0
            })
    },
    combat: function(reasons: Reason[], agent: Agent) {
        for (let occupation in combatByOccupation) {
            const [base, byLevel] = combatByOccupation[occupation];
            const level = agent.levels[occupation];
            const value = Math.max(0, base + level * byLevel);    
            if (level > 0 && (value > 0 || occupation == agent.occupation)) 
                reasons.push({ why: occupation + " Lv." + level, contrib: value })
        }
    },
    deceit: function(reasons: Reason[], agent: Agent) {
        for (let occupation in deceitByOccupation) {
            const [ifMain, ifSecondary] = deceitByOccupation[occupation];
            const level = agent.levels[occupation];
            const value = (agent.occupation == occupation ? ifMain : ifSecondary) * level;
            if (value > 0) 
                reasons.push({ why: occupation + " Lv." + level, contrib: value })
        }
    },
}

export const allStats = Object.keys(rules) as StatKey[]

export const resources : StatKey[] = ["idleIncome", "conduit"]
export const skills : StatKey[] = allStats.filter(c => c != "idleIncome" && c != "conduit")

// Not actually the maximum, we just advertise this as a reasonable 
// maximum that can be used for comparison.
export const maxStats : StatsOf<number> = {
    idleIncome: 50,
    recruit:    100,
    outdoors:   100,
    combat:     30,
    conduit:    5,
    deceit:     100,
}

// Compute the current stats for an agent
export function computeStats(agent: Agent): Stats {
    const result : {[key: string]: Explained} = {};
    for (let key in rules) {
        const reasons : Reason[] = []
        rules[key](reasons, agent);
        result[key] = explain(reasons);
    }
    return result as Stats;
}