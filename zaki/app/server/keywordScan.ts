// Layer B of the safety stack: keyword matching. PURE code (no AI, no secrets, no network).
// Shared by the server (server/safety.ts re-exports it) and the app's offline safety check
// (src/lib/localSafety.ts), so both always use the same normalizer and keyword lists.
import * as KW from "./data/safetyKeywords";
import type { KeywordGroup } from "./data/safetyKeywords";
import { normalizeBase, normalizeViews, phraseSkeleton, type NormalizedViews } from "./normalize";
import type { SafetyCategory } from "./types";

// ---------------------------------------------------------------------------------------
// Layer B: keyword matching
// ---------------------------------------------------------------------------------------

type KwWord = { skel: string; lit: string; litStripped: string };
type CompiledGroup = { latin: string[]; arabic: KwWord[][] };

const ARABIC_SCRIPT = /[\u0600-\u06FF]/;
const ARABIC_CLITICS = /^(?:وال|بال|فال|لل|ال|و|ب|ف|ل)(?=[\u0621-\u064A]{2,})/;
const stripClitic = (w: string) => w.replace(ARABIC_CLITICS, "");

function compileArabicPhrase(phrase: string): KwWord[] {
  const base = normalizeBase(phrase);
  const skels = phraseSkeleton(phrase);
  const words = base.split(" ").filter(Boolean);
  if (skels.length !== words.length) {
    // a word with an empty skeleton: fall back to literal-only matching
    return words.map((w) => ({ skel: "", lit: w, litStripped: stripClitic(w) }));
  }
  return words.map((w, i) => ({ skel: skels[i], lit: w, litStripped: stripClitic(w) }));
}

function compile(group: KeywordGroup): CompiledGroup {
  const latin = [...(group.en ?? []), ...(group.fr ?? []), ...(group.arabizi ?? [])]
    .map(normalizeBase)
    .filter(Boolean);
  const arabic = [...(group.ar ?? []), ...(group.arabizi ?? [])]
    .map(compileArabicPhrase)
    .filter((s) => s.length > 0);
  return { latin: Array.from(new Set(latin)), arabic };
}

const COMPILED = {
  selfHarm: compile(KW.SELF_HARM),
  disclosure: compile(KW.DISCLOSURE_HARM),
  secrecy: compile(KW.SECRECY),
  fear: compile(KW.FEAR_DISTRESS),
  home: compile(KW.HOME_TERMS),
  outside: compile(KW.OUTSIDE_TERMS),
  personal: compile(KW.PERSONAL_DATA),
  adult: compile(KW.ADULT_TOPIC),
  politics: compile(KW.POLITICS),
  injection: compile(KW.PROMPT_INJECTION),
  war: compile(KW.WAR_WORDS),
  threatIdiom: compile(KW.THREAT_IDIOMS),
  death: compile(KW.DEATH_WORDS),
};

/**
 * One text word vs one keyword word.
 *  - Arabic script: literal match (with clitics like و/ب/ال stripped); the fuzzy skeleton is
 *    used only for long keywords (4+ consonants), because short skeletons collide with common
 *    words (e.g. قصف "bombing" and سوف "will" share the skeleton "سف").
 *  - Arabizi (Latin word containing a digit, e.g. "2asf", "bi2tolni"): skeleton match.
 *  - Plain Latin words: skeleton match only for long keywords (so "safe" never matches قصف).
 */
function wordMatches(textWordBase: string, variants: string[], k: KwWord, multiWord = false): boolean {
  if (ARABIC_SCRIPT.test(textWordBase)) {
    if (textWordBase === k.lit || stripClitic(textWordBase) === k.litStripped) return true;
    if (k.skel.length >= 4) return variants.some((v) => v === k.skel || v.includes(k.skel));
    return false;
  }
  if (!k.skel) return textWordBase === k.lit;
  const looksArabizi = /\d/.test(textWordBase);
  // Inside a multi-word Arabizi phrase ("bde mut"), short words may match their exact skeleton.
  if (!looksArabizi && k.skel.length < 4) return multiWord && k.skel.length >= 2 && variants.some((v) => v === k.skel);
  return variants.some((v) => v === k.skel || (k.skel.length >= 4 && v.includes(k.skel)));
}

function skeletonPhraseIn(views: NormalizedViews, words: string[], phrase: KwWord[]): boolean {
  const n = phrase.length;
  for (let i = 0; i + n <= views.skeletonWords.length; i++) {
    let ok = true;
    for (let j = 0; j < n; j++) {
      if (!wordMatches(words[i + j], views.skeletonWords[i + j], phrase[j], n >= 2)) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

function latinPhraseIn(base: string, phrase: string): boolean {
  return (" " + base + " ").includes(" " + phrase + " ");
}

/** Whole-word match for home/outside terms (no skeleton: too many short words). */
function wordListIn(base: string, words: string[], group: KeywordGroup): boolean {
  const list = [...(group.en ?? []), ...(group.fr ?? []), ...(group.ar ?? []), ...(group.arabizi ?? [])].map(normalizeBase);
  const padded = " " + base + " ";
  const stripped = " " + words.map(stripClitic).join(" ") + " ";
  return list.some((t) => t && (padded.includes(" " + t + " ") || stripped.includes(" " + t + " ")));
}

function groupIn(views: NormalizedViews, g: CompiledGroup): boolean {
  const words = views.base ? views.base.split(" ") : [];
  if (g.latin.some((p) => latinPhraseIn(views.base, p))) return true;
  // Phrases typed without spaces ("killmyself", or "b a d e m o u t" after de-spacing).
  if (
    g.latin.some((p) => {
      if (!p.includes(" ")) return false;
      const compact = p.replace(/ /g, "");
      return compact.length >= 7 && words.some((w) => w.length >= compact.length && w.includes(compact));
    })
  )
    return true;
  return g.arabic.some((p) => skeletonPhraseIn(views, words, p));
}

export const PHONE_RE = /(?:\+|00)?[0-9٠-٩][0-9٠-٩\s\-().]{5,}[0-9٠-٩]/g;
export const EMAIL_RE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;

export function containsPhoneNumber(text: string): boolean {
  const m = text.match(PHONE_RE) ?? [];
  return m.some((s) => s.replace(/[^0-9٠-٩]/g, "").length >= 7);
}

export type KeywordScan = {
  selfHarm: boolean;
  disclosure: boolean;
  secrecy: boolean;
  fear: boolean;
  home: boolean;
  outside: boolean;
  personal: boolean;
  adult: boolean;
  politics: boolean;
  injection: boolean;
};

/** Join runs of single letters: "b a d e m o u t" -> "bademout", "k i l l" -> "kill", "م و ت" -> "موت". */
export function despace(text: string): string {
  const words = normalizeBase(text).split(" ");
  const out: string[] = [];
  let run = "";
  const flush = () => {
    if (run.length >= 2) out.push(run);
    else if (run) out.push(run);
    run = "";
  };
  for (const w of words) {
    if ([...w].length === 1 && /\p{L}/u.test(w)) run += w;
    else {
      flush();
      out.push(w);
    }
  }
  flush();
  return out.join(" ");
}

/** Leetspeak for English/French: "w4nt t0 d1e" -> "want to die", "i want 2 die". */
export function unleet(text: string): string {
  return normalizeBase(text)
    .split(" ")
    .map((w) => {
      if (w === "2") return "to";
      if (w === "4") return "for";
      if (!/[a-z]/.test(w) || !/\d/.test(w)) return w;
      return w.replace(/4/g, "a").replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/5/g, "s").replace(/7/g, "t");
    })
    .join(" ");
}

function scanStrong(text: string) {
  const views = normalizeViews(text);
  return {
    selfHarm: groupIn(views, COMPILED.selfHarm),
    disclosure: groupIn(views, COMPILED.disclosure),
    secrecy: groupIn(views, COMPILED.secrecy),
    fear: groupIn(views, COMPILED.fear),
    war: groupIn(views, COMPILED.war),
    threatIdiom: groupIn(views, COMPILED.threatIdiom),
    death: groupIn(views, COMPILED.death),
  };
}

export function keywordScan(text: string): KeywordScan {
  const views = normalizeViews(text);
  const words = views.base ? views.base.split(" ") : [];
  // Strong lists are checked on the text, its de-spaced form and its leetspeak-decoded form.
  const variants = Array.from(new Set([text, despace(text), unleet(text), unleet(despace(text))]));
  const hits = variants.map(scanStrong);
  const any = (k: keyof ReturnType<typeof scanStrong>) => hits.some((h) => h[k]);

  const home = wordListIn(views.base, words, KW.HOME_TERMS);
  const school = wordListIn(views.base, words, KW.SCHOOL_CONTEXT);
  const exam = wordListIn(views.base, words, KW.EXAM_WORDS);
  const griefPerson = home || wordListIn(views.base, words, KW.GRIEF_PERSON) || wordListIn(views.base, words, KW.OUTSIDE_TERMS);

  // Fear: strong fear words, except normal exam worry ("scared of the science exam");
  // war words only outside school talk ("the war of 1812 in history"); grief with a person.
  const strongFear = any("fear") && !(exam && !any("war"));
  const warFear = any("war") && !school;
  const grief = any("death") && griefPerson;
  const threat = any("threatIdiom") && !school;

  return {
    selfHarm: any("selfHarm"),
    disclosure: any("disclosure") || threat,
    secrecy: any("secrecy"),
    fear: strongFear || warFear || grief,
    home,
    outside: wordListIn(views.base, words, KW.OUTSIDE_TERMS),
    personal: groupIn(views, COMPILED.personal) || containsPhoneNumber(text) || EMAIL_RE.test(text),
    adult: groupIn(views, COMPILED.adult),
    politics: groupIn(views, COMPILED.politics),
    injection: groupIn(views, COMPILED.injection),
  };
}

/** Category from keywords alone (priority order). Used offline-style and as a floor. */
export function keywordCategory(scan: KeywordScan): SafetyCategory {
  if (scan.selfHarm) return "self_harm";
  if (scan.disclosure || scan.secrecy) return "disclosure_harm";
  if (scan.fear) return "violence_fear";
  if (scan.adult) return "adult_topic";
  if (scan.personal) return "personal_data";
  if (scan.injection) return "prompt_injection";
  if (scan.politics) return "off_topic";
  return "none";
}
