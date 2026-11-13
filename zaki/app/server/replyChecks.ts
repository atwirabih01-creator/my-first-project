// Deterministic checks on every AI tutor reply before a child sees it:
//  1. strip links, emails and phone numbers (the AI never writes them);
//  2. block forbidden phrases (secrecy, "I love you", asking for personal data, "I'm human");
//  3. block replies that give away the final answer to the current check/test item;
//  4. max 4 short lines, max 1 emoji.

import { normalizeBase } from "./normalize";
import { hasForbiddenPhrase, limitEmojis, limitLines, stripLinksAndPhones } from "./textGuards";
import type { LessonPack, Question } from "./types";
import { decimalCommaToDot, evaluate, normalizeMathText, numbersIn, ratToString, type Rational } from "./verify";

/** Items whose answers must not appear in this reply. */
export function protectedItems(pack: LessonPack, step: string, questionId?: string): Question[] {
  const all = [...pack.checks, ...pack.test, ...pack.retestPool];
  if (questionId) {
    const q = all.find((x) => x.id === questionId);
    if (q) return [q];
  }
  const items = [...pack.test, ...pack.retestPool];
  if (step === "check" || step === "chat") items.push(...pack.checks);
  return items;
}

function eqR(a: Rational, b: Rational) {
  return a.n * b.d === b.n * a.d;
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ANSWER_LEAD =
  "(?:=|equals?|is|are|makes|gives|answer(?: is)?|result(?: is)?|يساوي|تساوي|الجواب(?: هو)?|الإجابة(?: هي)?|النتيجة(?: هي)?|هو|هي|est|egal|font)";

function numericLeak(reply: string, item: Question, value: Rational): boolean {
  const text = normalizeMathText(reply);
  const isInteger = value.d === 1n;
  if (!isInteger) {
    // Any fraction/decimal equal to the answer (3/6 also catches 1/2), also written with a
    // decimal comma (3,5: French school program).
    return [...numbersIn(text), ...numbersIn(decimalCommaToDot(text))].some((n) => eqR(n, value));
  }
  const v = ratToString(value);
  // "= 6", "is 6", "answer is 6", "يساوي 6"
  if (new RegExp(`${ANSWER_LEAD}\\s*:?\\s*${escapeRe(v)}(?![\\d/]|[.,]\\d)`, "iu").test(text)) return true;
  // The full correct choice text, e.g. "6 km" / "6 كم"
  const choice = normalizeMathText(item.choices[item.answerIndex]).trim();
  if (/\s/.test(choice) && text.toLowerCase().includes(choice.toLowerCase())) return true;
  return false;
}

function cmpLeak(reply: string, expr: string, sym: "<" | ">" | "="): boolean {
  const m = normalizeMathText(expr).match(/cmp\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/i);
  if (!m) return false;
  const [a, b] = [escapeRe(m[1]), escapeRe(m[2])];
  const text = normalizeMathText(reply);
  const rev = sym === "<" ? ">" : sym === ">" ? "<" : "=";
  const word = sym === ">" ? "(?:is )?(?:bigger|greater|larger|more) than|أكبر من|اكبر من" : sym === "<" ? "(?:is )?(?:smaller|less) than|أصغر من|اصغر من|أقل من" : "(?:is )?(?:equal to|the same as)|يساوي";
  return (
    new RegExp(`${a}\\s*${escapeRe(sym)}\\s*${b}`).test(text) ||
    new RegExp(`${b}\\s*${escapeRe(rev)}\\s*${a}`).test(text) ||
    new RegExp(`${a}\\s*(?:${word})\\s*${b}`, "iu").test(text)
  );
}

// Arabic prefixes stripped before comparing words ("الأشجار" = "أشجار", "وبالأشجار").
const AR_CLITIC = /^(?:وال|بال|فال|كال|لل|ال|و|ب|ف|ل|ك)(?=[\u0621-\u064A]{2,})/;

/** Words normalized for answer matching: case, punctuation, diacritics, hamza/ta-marbuta, ال. */
export function answerWords(text: string): string[] {
  return normalizeBase(text)
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (/[\u0621-\u064A]/.test(w) ? w.replace(AR_CLITIC, "") : w));
}

function containsWords(hay: string[], needle: string[]): boolean {
  if (!needle.length) return false;
  for (let i = 0; i + needle.length <= hay.length; i++) {
    if (needle.every((w, j) => hay[i + j] === w)) return true;
  }
  return false;
}

/** Text answers shorter than this are not guarded (too many false hits: "a", "b", "لا"). */
export const MIN_TEXT_ANSWER_CHARS = 3;

function textLeak(reply: string, item: Question, childTexts: string[] = []): boolean {
  const replyW = answerWords(reply);
  const has = (s: string) => {
    const n = answerWords(s);
    return n.join(" ").length >= MIN_TEXT_ANSWER_CHARS && containsWords(replyW, n);
  };
  const correct = item.choices[item.answerIndex];
  if (!has(correct)) return false;
  // The child already wrote the answer: Zaki may confirm it.
  const childW = answerWords(childTexts.join(" \n "));
  if (childTexts.length && containsWords(childW, answerWords(correct))) return false;
  const inQuestion = containsWords(answerWords(item.q), answerWords(correct));
  if (!inQuestion) return true;
  // The answer word is part of the question sentence (e.g. "Find the adjective: The big cat").
  // Quoting the sentence or listing the options is fine; naming only the right one is a leak.
  const others = item.choices.filter((_, i) => i !== item.answerIndex);
  return !others.some(has);
}

/** Returns the first item whose final answer the reply gives away, or null. */
export function leakedItem(reply: string, items: Question[], childTexts: string[] = []): Question | null {
  for (const item of items) {
    if (item.mathExpr) {
      try {
        const v = evaluate(item.mathExpr);
        if (v.type === "num" && numericLeak(reply, item, v.value)) return item;
        if (v.type === "cmp" && cmpLeak(reply, item.mathExpr, v.value)) return item;
        if (v.type === "bool") continue; // yes/no: can't tell from text; golden rule in prompt
        continue;
      } catch {
        /* fall through to text check */
      }
    }
    if (textLeak(reply, item, childTexts)) return item;
  }
  return null;
}

// ---------------------------------------------------------------------------------------
// Health: no diagnosis words; any body pain/symptom -> "tell a grown-up at home or a doctor"
// ---------------------------------------------------------------------------------------

const AR_DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;
/** Diagnosis words Zaki must never write (red-team R15). */
export const DIAGNOSIS_RE = /diagnos|تشخيص|التشخيص|يشخص|تشخص|شخصك الطبيب|diagnostic/i;

export function hasDiagnosisWord(text: string): boolean {
  return DIAGNOSIS_RE.test(text.replace(AR_DIACRITICS, ""));
}

const SYMPTOM_WORDS = [
  "pain", "painful", "hurts", "hurt", "ache", "aches", "headache", "stomachache", "tummy ache", "sick", "ill", "fever", "dizzy",
  "cough", "coughing", "vomit", "vomited", "threw up", "corona", "covid", "virus", "medicine", "pills", "allergy", "allergic", "asthma", "bleeding", "rash",
  "mal", "malade", "fievre", "toux", "vomi", "medicament", "douleur",
  "wej3", "waja3", "woja3", "bewja3", "byewja3", "3am yewja3", "s5oune", "sokhne", "s5ouneh", "mrid", "mrida", "mared", "dawa", "korona", "corona",
  "وجع", "بيوجعني", "يوجعني", "عم يوجعني", "بتوجعني", "الم", "يؤلمني", "مريض", "مريضه", "حراره", "سخونه", "كورونا", "الكورونا", "دوا", "دواء", "حساسيه", "سعال", "صداع", "استفرغت", "دوخه", "مصاب",
];
const SYMPTOM_SET = new Set(SYMPTOM_WORDS.map((w) => normalizeBase(w)));

/** The child mentions a body pain, a symptom, an illness or medicine. */
export function mentionsBodySymptom(text: string): boolean {
  const base = " " + normalizeBase(text).replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/g, " ") + " ";
  const words = answerWords(text);
  for (const w of SYMPTOM_SET) {
    if (w.includes(" ") ? base.includes(" " + w + " ") : words.includes(w) || base.includes(" " + w + " ")) return true;
  }
  return false;
}

const GROWN_UP_CUE = /grown[- ]?up|doctor|adult|parent|nurse|شخص كبير|طبيب|الطبيب|اهلك|الممرض|adulte|medecin|docteur/i;

/** True when the reply already sends the child to a grown-up or a doctor. */
export function hasGrownUpCue(reply: string): boolean {
  return GROWN_UP_CUE.test(normalizeBase(reply));
}

export type PostCheck = {
  text: string;
  blocked: "forbidden" | "answer_leak" | "empty" | "health" | null;
  leakedId?: string;
  strippedLinksOrPhones: number;
};

/** Run all deterministic reply checks. */
export function postCheckReply(raw: string, items: Question[], childTexts: string[] = []): PostCheck {
  const stripped = stripLinksAndPhones(raw);
  let text = stripped.text;
  if (!text.trim()) return { text: "", blocked: "empty", strippedLinksOrPhones: stripped.removed };
  if (hasForbiddenPhrase(text)) return { text: "", blocked: "forbidden", strippedLinksOrPhones: stripped.removed };
  if (hasDiagnosisWord(text)) return { text: "", blocked: "health", strippedLinksOrPhones: stripped.removed };
  const leak = leakedItem(text, items, childTexts);
  if (leak) return { text: "", blocked: "answer_leak", leakedId: leak.id, strippedLinksOrPhones: stripped.removed };
  text = limitLines(limitEmojis(text, 1), 4);
  return { text, blocked: null, strippedLinksOrPhones: stripped.removed };
}
