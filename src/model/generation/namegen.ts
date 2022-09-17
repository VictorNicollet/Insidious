import type { PersonName, LocationName, DistrictName } from "../names"
import type { LocationKind, ByLocationKind } from "../locations"
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

const collapse = (s: string) => 
    s.replace(/(?<=.)[aeiou]+[bcdfghj-np-tvwxz]+(?=[aeiou])/, "");

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
    
// Combination prefixes: 
// 
//  '_': always separate prefix.
//  '-': can be connected or separated.  
//  '|': can be connected to a small (less than 3 word) prefix
//  '+': always connected prefix.

const suffixes : ByLocationKind<RandomBag<string>> = {
    ruins: new RandomBag<string>([
        "-tree", "-hall", "-stone", 
        "-cut", "-rune", "-range", 
        "_pit", "_fog", "_leap", "_hole", "_yell", "_candle",
        "|castle", "|grave", "|cairn", "|circle", "|crown", "|tower",
        "|ghosts", "-thorns"
    ]),
    town: new RandomBag<string>([
        "+ton", "+bury", "+ham", "+stead", "+wich", "+side",
        "-fair", "-town", "-tower", "-mill", "-ford", "-yard", "-mark", 
        "|barn", "|house", "|farm", "|land", "|quay",
        "|square", "|greens", "|field", "|inn", "|orchard",
        "|hearth"
    ]),
    workcamp: new RandomBag<string>([
        "|mine", "|camp", "-wood", "_pit", "_fall", "_step", "-coal",
        "_clearing"
    ]),
    city: new RandomBag<string>([
        "+ton", "+bury", "+over", "+ley", "+worth",
        "|wall", "|crown", "|rule", "|candle", "|keep",
        "-ford", "-town", "-gate", "-castle", "-side", "-market",  
        "+minster", "+head"
    ]),
    fortress: new RandomBag<string>([
        "|wall", "|keep", "|fort", "-castle", "|peak", "|ridge",
        "_overlook", "_redoubt", "_fortress", "_pass"
    ]),
    academy: new RandomBag<string>([
        "_academy", "_school", "_circle", "_tower", "_palace"
    ])
}

// Landmarks used anywhere except academy + fortress
const commonSuffixes = new RandomBag<string>([
    "+oak", "+ash", "+willow", '-hedge', '-star',  
    "-grounds", "-yard", "-hill", "-vale", "-ridge", 
    "|crest", "|mound", "-wood", "|ditch", "|brook", 
    "|creek", "|marsh", "-vale", "|cross", "|range", 
    "-edge", "-bridge", "-well", "-pool", "|hunt"
])

const customSuffixProbability : ByLocationKind<number> = {
    ruins: 0.5,
    town: 0.5,
    city: 0.5,
    workcamp: 0.4,
    fortress: 0.7,
    academy: 1
}

// Final letter: 
//   $ disappears if followed by s, becomes 's if followed by space, 
//       otherwise becomes 's'
//   § disappears if followed by s or space, otherwise becomes 's'
//   + can never be followed by space.
//   _ always followed by space. 

const commonPrefixes = new RandomBag<string>([
    "archer$", "autumn§", "alms-",
    "blue-", "big-", "broad-", "black-", "bramble+", "bright-", "burn+",
    "cling§", "cold-", "cloud$", "copper+", "cull+",
    "deep-", "dour-", "dun+", "dawn+",
    "elder-", "ever+", "even+", "end$", "east-",
    "first-", "found+", "#four-", "#five_", "finch+", "fair-", "feather-",
    "great-", "greater_", "giant-", "gutter+", "grim$",
    "high-", "hale+", "hawk+", "hog§",
    "idle-", "inner-", "ivy+",
    "joy$", "jack$",
    "kind+", "king$", "keeper$",
    "long-", "light-", "loud-", "lower-", "lord$",
    "moon$", "middle-", "master$", "moss+",
    "new-", "never-", "night$", "north-", "nail+",
    "old-", "over+", "outer-", "oracle$",
    "purple-", "porter$",
    "quiet-", "queen$",  
    "raven$", "rich+", "runner$", "rain$", "river+", 
    "silent-", "still-", "shout-", "#seven-", "sun$", "spring§", "#six_", "south-", "stone+",
    "#ten-", "#three_", "#two-", "tall-", "tower$",
    "upper-", 
    "vow$", 
    "wild-", "where+", "wood$", "wain$", "willow$", "west-"
])

const prefixes : ByLocationKind<RandomBag<string>> = {
    ruins: new RandomBag<string>([
        "bleak-", "foul-", "fel-", "ugly-", "broken_", "lost_", 
        "whispering_", "ghost$", "dead-", "rotting_", 
        "shadow-", "curse$", "ancient_", "hero$",
    ]), 
    town: new RandomBag<string>(["saint_"]),
    city: new RandomBag<string>(["saint_"]),
    academy: new RandomBag<string>([
        "iron_", "steel_", "red_", "blue_", "green_", "yellow_", 
        "hexagram_", "royal_", "imperial_", "oldest_", "obsidian_",
        "tall_", "higher_", "whispering_", "gold_", "ruby_", 
        "emerald_", "sapphire_", "fifth_", "celestial_",
        "white_", "black_", "grey_"
    ]),
    fortress: new RandomBag<string>([
        "general$", "captain$", "imperial_", "royal_", 
        "fortified_", "frost§", "winter§", "spear$", 
        "sword$", "shield$", "eagle_", "tiger_", "lion§", "hawk_",
        "dragon§", "hero$",
    ]),
    workcamp: new RandomBag<string>([
        "iron-", "steel-", "hot-", "wood+", "autumn_", 
        "winter_", "charred_", "summer_"
    ])
}

// Probability of using the per-kind prefix bag instead of the 
// general prefix bag.
const customPrefixProbability : ByLocationKind<number> = {
    ruins: 0.3,
    town: 0.01, 
    city: 0.01,
    academy: 1,
    fortress: 0.8,
    workcamp: 0.1
}

function locationOfKind(kind: LocationKind): LocationName {

    const suffixBag = Math.random() > customSuffixProbability[kind] 
        ? commonSuffixes : suffixes[kind];
    const prefixBag = Math.random() > customPrefixProbability[kind]
        ? commonPrefixes : prefixes[kind];

    const pickedSuffix = suffixBag.pick();
    let suffixTag = pickedSuffix.charAt(0);
    const suffix = pickedSuffix.slice(1);

    // If the suffix can be kept separate, have a 30% chance of "Foo's Suffix"
    // town name instead of picking a prefix.
    if ((suffixTag == "-" || suffixTag == "|" || suffixTag == "_") && Math.random() < 0.3) {
        const person = randomPerson().short;
        const name = genitive(person) + " " + capitalize(suffix);
        return {
            short: name,
            long: name, 
            adjective: demonym(person)
        };
    }

    for (let i = 0; i < 100; ++i) {
        const pickedPrefix = prefixBag.pick();
        const prefixTag = pickedPrefix.charAt(pickedPrefix.length - 1);
        const prefixIsNumber = pickedPrefix.charAt(0) == '#';
        
        const prefix = pickedPrefix.slice(
            prefixIsNumber ? 1 : 0, 
            pickedPrefix.length - 1);

        const usedSuffix = prefixIsNumber ? plural(suffix) : suffix;

        // If the two can be both connected or separated, have a 10% chance
        // of separating them.
        if ((prefixTag + suffixTag == "--" ||
             prefixTag + suffixTag == "$-" ||
             prefixTag + suffixTag == "§-") && Math.random() < 0.1)
            suffixTag = "+";

        switch (prefixTag + suffixTag) {
            case "--":
            case "+-":
            case "+|":
            case "++": 
            case "-+": 
                const cat = capitalize(prefix) + usedSuffix;
                if (Math.random() < 0.3) {
                    const collapsed = collapse(cat);   
                    return { short: collapsed, long: collapsed, adjective: demonym(collapsed) };
                }
                return { short: cat, long: cat, adjective: demonym(cat) };
            case "-_":
            case "_-":
            case "__":
            case "§_":
            case "_|":
            case "§|": 
                const spaced = capitalize(prefix) + " " + capitalize(usedSuffix);
                return { short: spaced, long: spaced, adjective: demonym(spaced) };
            case "-|":
                const spacedOrCat = capitalize(prefix) + 
                    (prefix.length < 4 ? " " + capitalize(usedSuffix) : usedSuffix);
                return { short: spacedOrCat, long: spacedOrCat, adjective: demonym(spacedOrCat) };
            case "$_": 
            case "$|":
                const spaceds = capitalize(prefix) + "'s " + capitalize(usedSuffix);
                return { short: spaceds, long: spaceds, adjective: demonym(spaceds) };
            case "$+":
            case "$-":
            case "§+":
            case "§-":
                const withs = capitalize(prefix) + (usedSuffix.charAt(0) == "s" ? "" : "s") + usedSuffix;
                return { short: withs, long: withs, adjective: demonym(withs) };
            case "+_":
            case "_+": 
                const mangle = capitalize(prefix) + usedSuffix;
                const cut = collapse(mangle);
                if (cut != mangle)
                    return { short: cut, long: cut, adjective: demonym(cut) };
                break;
            default: 
                console.log("Mismatch: %s %s", pickedPrefix, pickedSuffix);
        }
    }

    // Couldn't find compatible prefix, so we choose a messy solution.
    return {
        short: "Central " + capitalize(suffix), 
        long: "Central" + capitalize(suffix),
        adjective: demonym(capitalize(suffix))
    }
}


function location(kind: LocationKind) : LocationName { 
    return notBad(() => locationOfKind(kind)) 
}

// DISTRICT GENERATION =======================================================

function district(kind: LocationKind) : DistrictName {
    return { short: location(kind).short };
}

// Generate a random person name
export function randomPerson() : PersonName { return notAlready(person); }

// Generate a random location name
export function randomLocation(kind: LocationKind) : LocationName { return notAlready(() => location(kind)); }

// Generate a random district name
export function randomDistrict(kind: LocationKind) : DistrictName { return notAlready(() => district(kind)); }