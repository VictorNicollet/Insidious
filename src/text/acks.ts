import { RandomBag } from "model/generation/randombag";
import { TxtFormat } from './format';

const custom = new RandomBag<TxtFormat>([
    "I hear and obey!",
    "It shall be so.",
    "I will make it so.",
    "I shall not disappoint you.",
    "Of course, my ##title#.",
    "Yes, ##aspect# for ##name#!",
    "For ##name#!",
    "For ##name# who ##verb#."
])

const article = new RandomBag<string>(["the", "my", "our"])
const epithet = new RandomBag<string>(["##epithetA#", "##epithetB#", "##epithetC#", "##color#"])
const kind = new RandomBag<string>(["##one#", "##title#", "##nature#"])
const exclaim = new RandomBag<string>(["!", "."])
const iwant = new RandomBag<string>([
    "For", 
    "In the name of", 
    "It will bring us", 
    "More", 
    "We shall have", 
    "Bring us", 
    "Let us have", 
    "I hunger for"])

export const acks = new RandomBag<() => TxtFormat>([
    function() { return custom.pick() },
    function() {
        const k = kind.pick();
        const a = k == "##one#" ? "the" : article.pick();
        return `For ${a} ${epithet.pick()} ${k}${exclaim.pick()}`
    },
    function() {
        return `${iwant.pick()} ##aspect#${exclaim.pick()}`
    },
    function() {
        return `For the ${kind.pick()} who ##verb#${exclaim.pick()}`
    }
]);