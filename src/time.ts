// Time in the game is measured as days of 24 hours each.
//
// There are 28 days in a month, 12 months in a year, and the starting
// date (day 0 hour 0) is the 13th day of the 8th month of year 1153.

const start = (1153 * 12 + 7) * 28 + 12;

export class Time {
    
    constructor(
        public readonly day: number,
        public readonly hour: number) {
        
        if (hour < 0 || hour >= 24) throw ("Hour: " + hour)
    }

    // Are two times equal ?
    equals(t: Time) {
        return this.day == t.day && this.hour == t.hour;
    }

    // Does this time come strictly before another ?
    isStrictlyBefore(t: Time) {
        return this.day < t.day || 
               this.day == t.day && this.hour < t.hour;
    }

    // Does this time come strictly after another ?
    isStrictlyAfter(t: Time) { 
        return this.day > t.day || 
               this.day == t.day && this.hour > t.hour;
    }

    // The date as a [year, month, day] triple
    get date(): [number, number, number] {
        const days = start + this.day;
        const months = Math.floor(days / 28)
        const d = (days % 28) + 1;
        const m = (months % 12) + 1;
        const y = Math.floor(months / 12);
        return [y, m, d];
    }

    // Move into the future by a number of hours 
    addHours(hours: number) {
        if (hours < 0) throw ("Negative hours: " + hours)
        hours += this.hour;
        return new Time(this.day + Math.floor(hours / 24), hours % 24);
    }

    // Move into the future by a number of days
    addDays(days: number) {
        if (days < 0) throw ("Negative days: " + days)
        return new Time(this.day + days, this.hour);
    }
}