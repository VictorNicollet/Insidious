import type { PersonName, LocationName } from "../names"
import { RandomBag } from './randombag';

// Avoid returning the same name more than once.
const already : { [index: string]: boolean } = {}
function notAlready<T extends { short: string }>(generator: () => T): T {
    let name = generator();
    for (let i = 0; i < 100 && already[name.short]; ++i) 
        name = generator();
    already[name.short] = true;
    return name;
}

// Avoid returning bad words (we accept the scunthorpe problem)
function hasBad<T extends { [index: string]: string }>(value: T): boolean {
    return Object.values(value).some(function(str) {
        return /f.ck|n.gg|c.nt|sh.t|d.ck/.test(str);
    });
}

function notBad<T extends {}>(generator: () => T): T {
    let name = generator();
    while (hasBad(name)) name = generator();
    return name;
}


// PERSON GENERATION =========================================================

const firstnameBegin = new RandomBag<string>([
    "Aan", "Ab", "Ad", "Aed", "Ael", "Al", "Ard", 
    "Bal", "Ban", "Bel", "Ben", "Ber", "Bid",
    "Carl",
    "Dal", "Daer", "Den", "Dob", "Dor", "Dos", "Dun",
    "Ead", "Eem", "Eod", "Eon", "Er", "Erd", "Erl", 
    "Fal", "Fad", "Fel", "Fer", "Fom", "Fob", "Fur",
    "Gab", "Gal", "Gam", "Ged", "Ger", "Ges", "Gil", "Gin", "Git", "Gil", "Gom", "Gor",
    "Hil", "Hor", "Huel",
    "Ial", "Iad", "In", "Ir", "Iur",
    "Jan", "Jed", "Jeg", "Jer", "Jib", "Jid", "Jol", "Jur",
    "Kad", "Kel", "Ker", "Kod", "Kog", "Kum",
    "Lad", "Lal", "Lan", "Las", "Ler", "Les", "Lon", "Lot", "Lor", "Lur",
    "Mab", "Mal", "Mar", "Med", "Mer", "Mim", "Miim", "Miur", "Mod", "Mog", "Mud",
    "Nal", "Nar", "Ned", "Niur", "Nog", "Nun",
    "Od", "Ol", "Om", "Oed", "Oel", "Ord",
    "Pat", "Per", "Poel",
    "Ran", "Reb", "Red", "Reg", "Rom", "Ror", "Ruad", "Ruar", "Ruel", "Ruer",
    "Sal", "Sam", "Sar", "Sib", "Sid", "Sieg", "Sim", "Sol", "Sor", "Sur",
    "Tal", "Tar", "Tet", "Tid", "Tir", "Toel", "Toor", "Tuel",
    "Ub", "Ued", "Uel", "Uer", "Uun",
]);

const femaleFirstnameEnd = new RandomBag<string>([
    "a", "ada", "ala", "ara", "ari", "aria", "alia", "ali", "amia",
    "ea", "eda", "ela", "era", "eria", "elia", 
    "i", "ia", "ina", "ida", "ima",
    "ora", "ori", "oria", "oda", "ola", "ona",
    "ud", "un", "una",
    "ce", 
    "ta",
    "di", "dia",
    "si", "shi", "sia", "shia"
])

const maleFirstnameEnd = new RandomBag<string>([
    "ag", "am", "ar", "ari", "aris", "aros", "arig", "al", "alos",
    "eg", "er", "eri", "erig", "el",
    "i", "ieg", "im", "iam", "ios", "ir", "iros",
    "og", "os", "ogham", "omir",
    "us", "uos", "ur", "uthur", "uram", "uros", "udos",
    "dios", "dig", "din", 
    "ceor", "ceos", 
    "tum", "tos", 
    "sen", "ser", "seos", "seros", "seus"
])

const firstname = new RandomBag<() => string>([
    () => (firstnameBegin.pick() + femaleFirstnameEnd.pick()),
    () => (firstnameBegin.pick() + maleFirstnameEnd.pick())
])

function person() : PersonName {
    return notBad(() => {
        const short = firstname.pick()();
        return { short, full: short }
    })
}

// LOCATION GENERATION =======================================================

const capitalize = (s: string) => 
    s.charAt(0).toUpperCase() + s.slice(1)

const genitive = (s: string) =>
    s.charAt(s.length -1) == 's' ? s + "'" : s + "'s";

const deconsonantize = (s: string) => {
    const s2 = s.replace(/s+(?=[hpt])/g, "µ")
        .replace(/ck/g, "%")
        .replace(/[aeiou]+[bcdfghj-np-tvwxz]{3,}/ig, "")
        .replace(/µ/g, "s")
        .replace(/%/g, "ck");
    return (s2.length < 3) ? s : s2;
}

const demonym = (s: string) => {
    switch (s.charAt(s.length - 1)) {
        case "e": return s + "r";
        case "a": return s + "n";
        case "i": return s
        case "u": return s.slice(0, s.length - 2) + "an"; 
        case "l": 
        case "n": return s + "er";
        case "s": 
        case "p":
        case "t": return s + "ian";
        case "i":
        case "o":
        case "r": return s + "an";
        default: return s + "er";
    }
}

const plural = (s: string) =>
    s.charAt(s.length - 1) == 's' ? s : 
    s.charAt(s.length - 1) == 'h' ? s + "es" : s + "s";

const landmark = new RandomBag<string>([
    "mill", "castle", "cairn", "cave", "wood", "forge",
    "ford", "vale", "stream", "well", "steps",
    "stone", "barn", "wall", "range", "fire", "dell", 
    "spring", "mark", "land", "keep", "fort", "heap", 
    "leap", "grounds", "brook", "creek", "lane", 
    "count", "fence", "hill", "mine", "pit",
    "hall", "marsh", "tower", "market", "fair", "camp",
    "house", "ridge", "ravine", "yard", "step", "pint",
    "cross", "cut", "rune", "farm", "door", "plot", 
    "pole", "ditch", "ore", "oak", "yell", "candle", 
    "oven", "crown", "fall", "summer", "winter", "willow",
    "bog", "tree", "fog", "frost", "hammer", "sword", 
    "shield", "brother", "sister", "froth"
])

const adjective = new RandomBag<string>([
    "ash", 
    "blue", "big", "broad", "black", "bright", "bleak",
    "cold", "cool", "clouds", "captains", "catch",
    "down", "deep", "dead",
    "elder", "ever", "even", "ends",
    "foul", "fel", "first", "found", "fours", 
    "great", "giant", "gutter", "generals",
    "high", "hot", "heros", 
    "idle", "inner",
    "jacks", "joys",
    "kind", "keepers", "kings",
    "long", "light", "linger", "loud", "lifes", "lower",
    "moons", "middle", "masters", 
    "new", "never", "nights", "nother",
    "old", "over", "outer", "oracles",
    "pine", "pewter", "porters", "purple",
    "quiet", 
    "ravens", "rich", "rains", "runners", "river", "riven",
    "silent", "shadow", "still", "stacks", "sky", "shout", "sevens", "suns",
    "timber", "tight", "ten", "twos", "tall",
    "under",
    "vows", "vain", 
    "wild", "where", "wains", "willows"
])

const counts = new RandomBag<string>([
    "two",
    "three",
    "four", 
    "five", 
    "six", 
    "seven",
    "eight",
    "nine",
    "ten"
], [
    1, 1, 0.8, 0.8, 0.2, 0.5, 0.2, 0.3, 0.3
])

const lower = new RandomBag<string>([
    "Lower ", "Upper ", "New ", "Old ", ""
], [0.1, 0.1, 0.1, 0.1, 5])

const locations = new RandomBag<() => LocationName>([
    // <firstname>'s <landmark>
    function() {
        const fn = firstname.pick()();
        const short = genitive(fn) + " " + capitalize(landmark.pick());
        return {
            short,
            long: "the city of " + short,
            adjective: demonym(fn)
        }
    },
    // <adj><landmark>
    function() {
        const adj = adjective.pick();
        const land = landmark.pick();
        const n = capitalize(deconsonantize(adj + land));
        const short = lower.pick() + n;
        return {
            short,
            long: "the town of " + short,
            adjective: demonym(n)
        }
    },
    // Saint <firstname>
    function() {
        const fn = firstname.pick()();
        const short = "Saint " + fn;
        return {
            short,
            long: "the city of " + short,
            adjective: demonym(fn)
        }
    },
    // <count> <landmark>
    function() {
        const land = capitalize(plural(landmark.pick()));
        const count = capitalize(counts.pick());
        const short = count + " " + land;
        return {
            short,
            long: "the town of " + short,
            adjective: demonym(land)
        }
    }
], [
    0.5,
    1,
    0.1,
    0.1
])

function location() : LocationName { return notBad(() => locations.pick()()) }

// Generate a random person name
export function randomPerson() : PersonName { return notAlready(person); }

// Generate a random location name
export function randomLocation() : LocationName { return notAlready(location); }
