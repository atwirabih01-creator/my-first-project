// Text normalizer for keyword safety checks.
// Goal: the same keyword list catches Arabic script, Lebanese/Gulf spellings and Arabizi
// (Arabic typed with Latin letters and digits, e.g. "bi2tolni", "3am", "khayfe").
//
// Three views of a text are produced:
//  - base:      lowercase, Unicode-normalized, Arabic diacritics/tatweel removed, letter
//               variants unified, Eastern digits -> Western, repeated letters collapsed.
//               Used for English / French keyword matching.
//  - arabicish: Latin (Arabizi) words transliterated into Arabic letters
//               (3->ع, 7->ح, 2->ء, 5->خ, 6->ط, 9->ق, 8->غ, sh->ش, kh->خ, gh->غ ...).
//  - skeleton:  a "consonant skeleton" of every word (Arabic or transliterated), with
//               weak letters (ا و ي) and short vowels dropped and sound-alike letters folded
//               (ض->د, ص->س, ط->ت, ظ/ذ->ز, ث->ت, ح->ه, ق->ء). Arabic and Arabizi keywords
//               are matched on this view, so "byedrabne" and "بيضربني" both match.
// This is a cheap extra layer, NOT proof of safety. It must be tested on the Lebanese
// moderation set (safety review gate G5).

const ARABIC_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;
const TATWEEL = /ـ/g;
const EASTERN_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function easternToWesternDigits(s: string): string {
  let out = "";
  for (const ch of s) {
    const e = EASTERN_DIGITS.indexOf(ch);
    const p = PERSIAN_DIGITS.indexOf(ch);
    out += e >= 0 ? String(e) : p >= 0 ? String(p) : ch;
  }
  return out;
}

function unifyArabicLetters(s: string): string {
  return s
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "ء")
    .replace(/ئ/g, "ء")
    .replace(/ة/g, "ه")
    .replace(/[گ]/g, "ك")
    .replace(/[ڤ]/g, "ف")
    .replace(/[پ]/g, "ب")
    .replace(/[چ]/g, "ج");
}

/** Collapse any run of the same letter to one ("heeelp" -> "help", "kill" -> "kil"). */
function collapseRepeats(s: string): string {
  return s.replace(/(\p{L})\1+/gu, "$1");
}

/** Lowercase + NFKC + Arabic cleanup + digits + collapsed repeats + punctuation to spaces. */
export function normalizeBase(text: string): string {
  let s = text.normalize("NFKC").toLowerCase();
  s = s.replace(ARABIC_DIACRITICS, "").replace(TATWEEL, "");
  s = unifyArabicLetters(s);
  s = easternToWesternDigits(s);
  // French accents: fold to plain letters so "blessé" == "blesse".
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
  // Keep letters, digits and apostrophes (used in Arabizi like 3' = غ); everything else -> space.
  s = s.replace(/[^\p{L}\p{N}']+/gu, " ");
  s = collapseRepeats(s);
  return s.replace(/\s+/g, " ").trim();
}

// --- Arabizi transliteration -------------------------------------------------------------

const DIGRAPHS: [string, string][] = [
  ["3'", "غ"],
  ["7'", "خ"],
  ["9'", "ض"],
  ["6'", "ظ"],
  ["sh", "ش"],
  ["ch", "ش"],
  ["kh", "خ"],
  ["gh", "غ"],
  ["th", "ث"],
  ["dh", "ذ"],
];

const SINGLE: Record<string, string> = {
  "2": "ء",
  "3": "ع",
  "5": "خ",
  "6": "ط",
  "7": "ح",
  "8": "غ",
  "9": "ق",
  b: "ب",
  t: "ت",
  j: "ج",
  g: "ج",
  d: "د",
  r: "ر",
  z: "ز",
  s: "س",
  f: "ف",
  v: "ف",
  q: "ق",
  k: "ك",
  c: "ك",
  l: "ل",
  m: "م",
  n: "ن",
  h: "ه",
  w: "و",
  y: "ي",
  p: "ب",
  x: "كس",
  // vowels are dropped: Arabizi short vowels are not written in Arabic script.
  a: "",
  e: "",
  i: "",
  o: "",
  u: "",
};

const HAS_LATIN = /[a-z]/;

/** Transliterate one Latin/Arabizi word into Arabic letters. Returns variants (9 = ق or ص; g = ج or ق). */
export function arabiziWordToArabic(word: string): string[] {
  if (!HAS_LATIN.test(word)) return [word];
  let variants: string[] = [""];
  let i = 0;
  while (i < word.length) {
    const two = word.slice(i, i + 2);
    const di = DIGRAPHS.find(([k]) => k === two);
    if (di) {
      variants = variants.map((v) => v + di[1]);
      i += 2;
      continue;
    }
    const ch = word[i];
    if (ch === "9") {
      variants = variants.flatMap((v) => [v + "ق", v + "ص"]);
    } else if (ch === "g") {
      variants = variants.flatMap((v) => [v + "ج", v + "ق"]);
    } else if (ch in SINGLE) {
      variants = variants.map((v) => v + SINGLE[ch]);
    } else if (ch === "'") {
      // stray apostrophe: ignore
    } else {
      variants = variants.map((v) => v + ch);
    }
    if (variants.length > 8) variants = variants.slice(0, 8);
    i += 1;
  }
  return Array.from(new Set(variants));
}

/** Arabic-ish view of a text: every Latin word transliterated (first variant). */
export function toArabicish(text: string): string {
  return normalizeBase(text)
    .split(" ")
    .map((w) => arabiziWordToArabic(w)[0])
    .join(" ");
}

// --- Consonant skeleton ------------------------------------------------------------------

const FOLD: Record<string, string> = {
  ض: "د",
  ص: "س",
  ط: "ت",
  ظ: "ز",
  ذ: "ز",
  ث: "ت",
  ح: "ه",
  ق: "ء",
  ا: "",
  و: "",
  ي: "",
  ه: "ه",
};

/** Skeleton of one Arabic-script word: fold sound-alikes, drop weak letters, drop leading hamza. */
export function arabicSkeleton(word: string): string {
  let out = "";
  for (const ch of word) {
    if (ch in FOLD) out += FOLD[ch];
    else if (/[ء-ي]/.test(ch)) out += ch;
    // anything else (latin leftovers, digits) is dropped from the skeleton
  }
  out = out.replace(/^ء+/, "");
  // final ه is usually a vowel ending (ة / -e / -a): drop it.
  out = out.replace(/ه$/, "");
  return collapseRepeats(out);
}

/** All skeleton variants for one (base-normalized) word. */
export function wordSkeletons(word: string): string[] {
  return Array.from(new Set(arabiziWordToArabic(word).map(arabicSkeleton))).filter(Boolean);
}

export type NormalizedViews = {
  base: string;
  arabicish: string;
  /** One entry per word: the set of skeleton variants for that word. */
  skeletonWords: string[][];
};

export function normalizeViews(text: string): NormalizedViews {
  const base = normalizeBase(text);
  const words = base ? base.split(" ") : [];
  return {
    base,
    arabicish: words.map((w) => arabiziWordToArabic(w)[0]).join(" "),
    skeletonWords: words.map(wordSkeletons),
  };
}

/** Skeleton of a keyword phrase: one skeleton (first variant) per word. */
export function phraseSkeleton(phrase: string): string[] {
  const base = normalizeBase(phrase);
  return base
    .split(" ")
    .map((w) => wordSkeletons(w)[0] ?? "")
    .filter(Boolean);
}
