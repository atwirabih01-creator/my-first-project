// Deterministic checks on every AI tutor reply before a child sees it:
//  1. strip links, emails and phone numbers (the AI never writes them);
//  2. block forbidden phrases (secrecy, "I love you", asking for personal data, "I'm human");
//  3. block replies that give away the final answer to the current check/test item;
//  4. max 4 short lines, max 1 emoji.

import { normalizeBase } from "./normalize";
import { hasForbiddenPhrase, limitEmojis, limitLines, stripLinksAndPhones } from "./textGuards";
import type { LessonPack, Question } from "./types";
import { evaluate, normalizeMathText, numbersIn, ratToString, type Rational } from "./verify";

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
    // Any fraction/decimal equal to the answer (3/6 also catches 1/2).
    return numbersIn(text).some((n) => eqR(n, value));
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

function textLeak(reply: string, item: Question): boolean {
  const base = " " + normalizeBase(reply) + " ";
  const has = (s: string) => {
    const n = normalizeBase(s);
    return n.length >= 2 && base.includes(" " + n + " ");
  };
  const correct = item.choices[item.answerIndex];
  if (!has(correct)) return false;
  const qBase = " " + normalizeBase(item.q) + " ";
  const inQuestion = qBase.includes(" " + normalizeBase(correct) + " ");
  if (!inQuestion) return true;
  // The answer word is part of the question sentence (e.g. "Find the adjective: The big cat").
  // Quoting the sentence or listing the options is fine; naming only the right one is a leak.
  const others = item.choices.filter((_, i) => i !== item.answerIndex);
  return !others.some(has);
}

/** Returns the first item whose final answer the reply gives away, or null. */
export function leakedItem(reply: string, items: Question[]): Question | null {
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
    if (textLeak(reply, item)) return item;
  }
  return null;
}

export type PostCheck = {
  text: string;
  blocked: "forbidden" | "answer_leak" | "empty" | null;
  leakedId?: string;
  strippedLinksOrPhones: number;
};

/** Run all deterministic reply checks. */
export function postCheckReply(raw: string, items: Question[]): PostCheck {
  const stripped = stripLinksAndPhones(raw);
  let text = stripped.text;
  if (!text.trim()) return { text: "", blocked: "empty", strippedLinksOrPhones: stripped.removed };
  if (hasForbiddenPhrase(text)) return { text: "", blocked: "forbidden", strippedLinksOrPhones: stripped.removed };
  const leak = leakedItem(text, items);
  if (leak) return { text: "", blocked: "answer_leak", leakedId: leak.id, strippedLinksOrPhones: stripped.removed };
  text = limitLines(limitEmojis(text, 1), 4);
  return { text, blocked: null, strippedLinksOrPhones: stripped.removed };
}
