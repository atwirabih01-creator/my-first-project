// NO REGIONAL WORDS (founder decision): lesson content uses general, international examples
// only. This file finds country- or region-specific foods, places, people-words and money in
// AI-written text (EN + AR + Arabizi) and, when a retry did not fix it, swaps them for a
// general word. PURE code (no AI, no network), so tests and the app could share it.
//
// Deliberately NOT listed (too general, or a normal school word):
//  - falafel, hummus (known worldwide);
//  - كعكة / كعك (Arabic for "cake"/"cakes" - fine); only the Latin "kaak/ka'ak" bread is listed;
//  - bare قطر: in Arabic math it means "diameter" (قطر الدائرة), so only the country phrases
//    ("دولة قطر", "في قطر", "من قطر"...) and قطري/قطرية are listed;
//  - لبنة in "لبنة بناء"/"لبنة أساسية" ("building block", common in science texts).

import type { Lang } from "./types";

type Entry = {
  /** Shown in validator errors (for the AI retry note). */
  label: string;
  re: RegExp;
  /** General word used when the retry did not remove it. */
  en: string;
  ar: string;
  /** Custom replacement (keeps a preposition, e.g. "من قطر" -> "من البلد"). */
  replace?: (match: string) => string;
};

// Arabic "word" boundary: not preceded/followed by an Arabic letter. Optional clitics in front.
const AR_PRE = "(?<![\\u0621-\\u064A])(?<pre>(?:و|ف|ب|ل|ك)?)(?:ال)?";
const AR_POST = "(?![\\u0621-\\u064A])";
const ar = (body: string) => new RegExp(`${AR_PRE}(?:${body})${AR_POST}`, "gu");
const en = (body: string) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${body})(?![\\p{L}\\p{N}])`, "giu");

const ENTRIES: Entry[] = [
  // Foods
  { label: "manousheh", re: en("man(?:ou|u|2ou|2u)(?:sheh?|shi|che|cheh|sh)|mana(?:k|2|q)ish|manaeesh"), en: "pizza", ar: "بيتزا" },
  { label: "منقوشة", re: ar("منقوش[ةه]|مناقيش|مناقيشه"), en: "pizza", ar: "بيتزا" },
  { label: "kaak", re: en("ka(?:'|’|3)?ak(?:eh|e)?"), en: "bread", ar: "خبز" },
  { label: "tabbouleh", re: en("tabb?oul(?:eh|e|i|y)|tabb?ouleh"), en: "salad", ar: "سلطة" },
  { label: "تبولة", re: ar("تبول[ةه]"), en: "salad", ar: "سلطة" },
  { label: "kibbeh", re: en("kibb?eh|kibbe|kebbe|kebbeh|kubba"), en: "meatballs", ar: "كرات اللحم" },
  { label: "كبة", re: ar("كب[ةه]"), en: "meatballs", ar: "كرات اللحم" },
  { label: "labneh", re: en("labn(?:eh|e|a|ah)"), en: "yoghurt", ar: "لبن" },
  { label: "لبنة", re: new RegExp(`${AR_PRE}(?:لبن[ةه])${AR_POST}(?!\\s*(?:بناء|البناء|أساسية|اساسية|الأساس|الاساس))`, "gu"), en: "yoghurt", ar: "لبن" },
  { label: "zaatar", re: en("za(?:'|’|3)?atar|zatar|za3tar"), en: "herbs", ar: "أعشاب" },
  { label: "زعتر", re: ar("زعتر"), en: "herbs", ar: "أعشاب" },
  // Places and people-words
  { label: "Beirut", re: en("beirut|beyrouth|bayrut"), en: "the city", ar: "المدينة" },
  { label: "بيروت", re: ar("بيروت"), en: "the city", ar: "المدينة" },
  { label: "Doha", re: en("doha"), en: "the city", ar: "المدينة" },
  { label: "الدوحة", re: ar("دوح[ةه]"), en: "the city", ar: "المدينة" },
  { label: "Lebanon", re: en("lebanon|lebnen|libnan|liban"), en: "the country", ar: "البلد" },
  { label: "لبنان", re: ar("لبنان"), en: "the country", ar: "البلد" },
  { label: "Lebanese", re: en("lebanese|libanais(?:e)?|lebnene|lebneni"), en: "local", ar: "محلي" },
  { label: "لبناني", re: ar("لبناني(?:ة|ه|ون|ين|ات)?"), en: "local", ar: "محلي" },
  { label: "Qatar", re: en("qatar|katar|2atar"), en: "the country", ar: "البلد" },
  { label: "قطر", re: new RegExp(`(?<![\\u0621-\\u064A])(?:دولة|في|من|إلى|الى|بدولة)\\s+قطر${AR_POST}`, "gu"), en: "the country", ar: "البلد", replace: (m) => m.replace(/قطر$/u, "البلد") },
  { label: "Qatari", re: en("qatari|qataris"), en: "local", ar: "محلي" },
  { label: "قطري", re: ar("قطري(?:ة|ه|ون|ين|ات)?"), en: "local", ar: "محلي" },
  // Money
  { label: "lira", re: new RegExp("(?<![\\p{L}\\p{N}])(?:liras?|lire|LBP)(?![\\p{L}\\p{N}])", "gu"), en: "coins", ar: "قطع نقدية" },
  { label: "ليرة", re: ar("ليرة|ليره|ليرات"), en: "coins", ar: "قطع نقدية" },
  { label: "riyal", re: en("riy?als?"), en: "coins", ar: "قطع نقدية" },
  { label: "ريال", re: ar("ريال|ريالات"), en: "coins", ar: "قطع نقدية" },
];

const DIACRITICS = /[ً-ْٰـ]/g;

function prep(text: string): string {
  return text.replace(DIACRITICS, "");
}

/** Region-specific words found in the text (labels, de-duplicated). */
export function findRegionalWords(text: string): string[] {
  if (!text) return [];
  const t = prep(text);
  const hits = new Set<string>();
  for (const e of ENTRIES) {
    e.re.lastIndex = 0;
    if (e.re.test(t)) hits.add(e.label);
  }
  return [...hits];
}

/** Replaces every region-specific word with a general one (used after a failed retry). */
export function replaceRegionalWords(text: string, lang: Lang): string {
  if (!text) return text;
  let t = prep(text);
  if (!findRegionalWords(t).length) return text; // keep diacritics when nothing to change
  for (const e of ENTRIES) {
    e.re.lastIndex = 0;
    t = t.replace(e.re, (...args: unknown[]) => {
      const m = args[0] as string;
      const offset = args.find((a) => typeof a === "number") as number;
      const groups = args[args.length - 1] as { pre?: string } | undefined;
      if (e.replace) return e.replace(m);
      const isArabic = /[\u0621-\u064A]/.test(m);
      if (isArabic) return (groups?.pre ?? "") + e.ar;
      if (lang === "ar") return e.ar;
      const sentenceStart = offset === 0 || /[.!?:\n]\s*$/.test(t.slice(0, offset));
      return sentenceStart ? cap(e.en) : e.en;
    });
  }
  return t;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
