// Pictures (`visual`) and quick questions (`tryIt`) on teach steps, pack version 4+.
// PURE code (no AI, no network). Used by server/packValidator.ts.
//
// Rules (a bad picture or tryIt is DROPPED; the teach step is always kept):
//  - every field is type- and range-checked (see the Visual types in server/types.ts);
//  - labels / words / meanings / tryIt text: links and phone numbers stripped, Eastern Arabic
//    digits turned into 0-9, length-limited; the pack-wide safety-word and regional-word scans
//    in packValidator.ts include this text too;
//  - emoji: exactly one emoji, no flags, no weapons / alcohol / scary / adult / religious ones;
//  - fraction: a fraction written in the label must equal `${shaded}/${parts}`;
//  - objects: `groups` must divide `count`; `crossedOut` <= count;
//  - equation: plain arithmetic (+ − × ÷, fractions, decimals, "=" or "<"/">") is re-computed
//    with OUR calculator (server/verify.ts); a wrong or broken sum drops the picture;
//  - numberLine: at most 20 steps, marks and jumps inside the line;
//  - tryIt: 2-4 unique choices, valid answerIndex, a plain sum in the question is re-computed,
//    and it must not give away a check/test/retest question (same question, the question
//    copied into it, or the same numbers with the same answer). An equation picture that is
//    exactly a check/test sum is dropped for the same reason.

import { easternToWesternDigits } from "./normalize";
import { stripLinksAndPhones } from "./textGuards";
import type { Question, TryIt, Visual, VisualItem, VisualType } from "./types";
import { MathError, evaluate, normalizeMathText, numbersIn, type Rational } from "./verify";

export const VISUAL_LIMITS = {
  label: 30,
  itemLabel: 30,
  barLabel: 24,
  sideLabel: 12,
  word: 30,
  meaning: 120,
  eqToken: 6,
  eqTokens: 9,
  items: { min: 2, max: 6 },
  fractionParts: { min: 2, max: 12 },
  objects: { min: 1, max: 20 },
  numberLineSteps: 20,
  numberLineAbs: 10000,
  marks: 21,
  jumps: 10,
  jsonChars: 800,
  tryIt: { q: 200, choice: 80, explain: 200, choicesMin: 2, choicesMax: 4 },
} as const;

/** value: the checked item; reason: why it was dropped; notes: small fixes made to a kept
 *  item (e.g. `interactive` removed), for the repair log. */
export type Checked<T> = { value?: T; reason?: string; notes?: string[] };

// ---------------------------------------------------------------------------------------
// Small field checkers
// ---------------------------------------------------------------------------------------

/** Arabic vowel marks (harakat, shadda, sukun, dagger alif), tatweel and emoji variation
 *  selectors take no space of their own on screen. */
const ZERO_WIDTH_MARKS = /[\u064B-\u065F\u0670\u0640\uFE0E\uFE0F]/g;

/** Visible length: a fully vowelled Arabic label ("الجوُّ جميلٌ") counts like the bare one. */
export function textLength(s: string): number {
  return s.replace(ZERO_WIDTH_MARKS, "").length;
}

/** A clean short string: trimmed, links/phones stripped, Western digits, 1..max visible chars. */
export function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = easternToWesternDigits(stripLinksAndPhones(v.trim()).text.trim());
  if (!t || textLength(t) > max || t.length > 2 * max) return null;
  return t;
}

/** Why cleanText refused a value (for the repair log). */
function textProblem(v: unknown, max: number): string {
  if (typeof v !== "string" || !v.trim()) return "missing";
  const t = v.trim();
  return `too long (${textLength(t)} > ${max})`;
}

/** Used instead of a missing, non-emoji ("←", "1️⃣") or blocked emoji on a list item. */
export const DEFAULT_ITEM_EMOJI = "🔹";
/** Used instead of a missing or not-allowed emoji on a word card. */
export const DEFAULT_WORD_EMOJI = "📝";

const isInt = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const isNum = (v: unknown, absMax: number): v is number => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= absMax;
/** Optional field: undefined / null = absent. */
const absent = (v: unknown) => v === undefined || v === null;

/** Emoji a child should not see in a lesson picture (weapons, alcohol, smoking, scary,
 *  rude, adult, religious or political symbols). Compared without variation selectors. */
const BLOCKED_EMOJI = new Set(
  [
    "🔫", "💣", "🧨", "🔪", "🗡", "⚔", "🪓", "🏹", "🛡", "🪖", "💥",
    "💀", "☠", "👻", "👹", "👺", "😈", "👿", "🤬", "🖕", "🩸", "⚰", "🪦", "🧟", "🧛",
    "💉", "💊", "🚬", "🍺", "🍻", "🍷", "🍸", "🍹", "🥃", "🍾", "🥂", "🎰", "🎲",
    "🍆", "🍑", "💋", "👙", "🔞", "💦", "🍌",
    "✝", "☪", "✡", "🕉", "☦", "🛐", "🕌", "⛪", "🕍", "📿", "☸", "☯", "🔯", "🕎", "⛩",
  ].map((e) => e.replace(/️/g, "")),
);

type SegmenterLike = { segment(s: string): Iterable<unknown> };
const segmenter: SegmenterLike | null = (() => {
  const S = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => SegmenterLike }).Segmenter;
  return S ? new S(undefined, { granularity: "grapheme" }) : null;
})();

function graphemeCount(s: string): number {
  if (segmenter) return Array.from(segmenter.segment(s)).length;
  // Fallback: count code points that are not joiners / variation selectors / skin tones.
  return Array.from(s).filter((c) => !/[‍︎️\u{1F3FB}-\u{1F3FF}⃣]/u.test(c)).length;
}

/** Exactly one allowed emoji, or null. */
export function emojiOf(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t || t.length > 16) return null;
  if (graphemeCount(t) !== 1) return null;
  if (!/\p{Extended_Pictographic}/u.test(t)) return null;
  if (/[\u{1F1E6}-\u{1F1FF}\u{E0060}-\u{E007F}]/u.test(t)) return null; // flags (country-specific)
  const bare = t.replace(/[️\u{1F3FB}-\u{1F3FF}]/gu, "");
  for (const cp of Array.from(bare)) if (BLOCKED_EMOJI.has(cp)) return null;
  if (BLOCKED_EMOJI.has(bare)) return null;
  return t;
}

/**
 * 2-6 items of { emoji, label }. A missing, non-emoji or not-allowed emoji is replaced by a
 * neutral one (noted), never kept; a bad label drops the picture with the item and the reason.
 */
function itemsOf(v: unknown): { items?: VisualItem[]; reason?: string; notes: string[] } {
  const notes: string[] = [];
  if (!Array.isArray(v)) return { reason: "items_missing", notes };
  if (v.length < VISUAL_LIMITS.items.min || v.length > VISUAL_LIMITS.items.max) return { reason: `items_count: ${v.length} (needs 2-6)`, notes };
  const out: VisualItem[] = [];
  for (const [i, it] of v.entries()) {
    if (!it || typeof it !== "object") return { reason: `item_${i + 1}_not_object`, notes };
    const o = it as Record<string, unknown>;
    const label = cleanText(o.label, VISUAL_LIMITS.itemLabel);
    if (!label) return { reason: `item_${i + 1}_label ${textProblem(o.label, VISUAL_LIMITS.itemLabel)}`, notes };
    let emoji = emojiOf(o.emoji);
    if (!emoji) {
      emoji = DEFAULT_ITEM_EMOJI;
      notes.push(`item ${i + 1}: emoji ${JSON.stringify(String(o.emoji ?? "")).slice(0, 16)} replaced`);
    }
    out.push({ emoji, label });
  }
  return { items: out, notes };
}

const FRACTION_IN_TEXT = /(\d+)\s*\/\s*(\d+)/g;

// ---------------------------------------------------------------------------------------
// Equations: re-computed by our own calculator
// ---------------------------------------------------------------------------------------

export type EquationCheck = { status: "ok" | "wrong" | "unchecked"; lhs?: string };

/**
 * Checks equation tokens like ["3","+","4","=","7"] or ["3/4", ">", "1/2"].
 *  - "ok": plain arithmetic and it is correct;
 *  - "wrong": plain arithmetic and it is wrong (or broken, e.g. "3 + = 7");
 *  - "unchecked": it has a blank ("?", "□"), a letter or no "=" / "<" / ">" (nothing to check).
 */
export function checkEquation(parts: string[]): EquationCheck {
  const toks: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const t = normalizeMathText(parts[i]).trim();
    if (/^\d+(?:\.\d+)?$/.test(t) || /^\d+\s*\/\s*\d+$/.test(t) || /^\d+ \d+\/\d+$/.test(t)) toks.push(t.replace(/\s*\/\s*/, "/"));
    else if (["+", "-", "*", "/", "(", ")", "=", "<", ">"].includes(t)) toks.push(t);
    else if (/^[xX]$/.test(t) && i > 0 && i < parts.length - 1) toks.push("*"); // "3 x 4"
    else return { status: "unchecked" };
  }
  const cmpCount = toks.filter((t) => t === "<" || t === ">").length;
  const eqCount = toks.filter((t) => t === "=").length;
  if (!eqCount && !cmpCount) return { status: "unchecked" };
  // Keep fractions as one number: "(3/4)" so "1 + 3/4" is never read as a mixed number.
  const piece = (ts: string[]) => ts.map((t) => (/^\d+\/\d+$/.test(t) ? `(${t})` : t)).join(" ");
  try {
    if (cmpCount) {
      if (cmpCount !== 1 || eqCount) return { status: "wrong" };
      const r = evaluate(piece(toks));
      return { status: r.type === "bool" && r.value ? "ok" : "wrong" };
    }
    const segs: string[][] = [[]];
    for (const t of toks) {
      if (t === "=") segs.push([]);
      else segs[segs.length - 1].push(t);
    }
    if (segs.some((s) => !s.length)) return { status: "wrong" };
    const vals: Rational[] = segs.map((s) => {
      const r = evaluate(piece(s));
      if (r.type !== "num") throw new MathError("not a number");
      return r.value;
    });
    const same = vals.every((v) => v.n * vals[0].d === vals[0].n * v.d);
    return { status: same ? "ok" : "wrong", lhs: segs[0].join("") };
  } catch {
    return { status: "wrong" };
  }
}

const mathKey = (s: string) => normalizeMathText(s).replace(/[()\s]/g, "");

// ---------------------------------------------------------------------------------------
// Visual
// ---------------------------------------------------------------------------------------

const fractionsIn = (text: string) => new Set(Array.from(normalizeMathText(text).matchAll(FRACTION_IN_TEXT), (m) => `${Number(m[1])}/${Number(m[2])}`));
const integersIn = (text: string) => new Set(Array.from(normalizeMathText(text).matchAll(/\d+/g), (m) => Number(m[0])));

/**
 * Checks that need the step's own words (`stepText` = its text + example):
 *  - a fraction / fractionCompare picture must show at least one fraction the step names
 *    (when the step names any), otherwise the picture is dropped;
 *  - an interactive fraction needs a real target (1 <= shaded < parts) and the step must say
 *    what to colour (both numbers appear in it); an interactive objects picture needs count
 *    >= 2. Otherwise only `interactive` is removed (the plain picture stays).
 */
function checkAgainstStep(v: Visual, stepText: string | undefined): Checked<Visual> {
  const notes: string[] = [];
  if (stepText !== undefined && (v.type === "fraction" || v.type === "fractionCompare")) {
    const named = fractionsIn(stepText);
    const shown = v.type === "fraction" ? [`${v.shaded}/${v.parts}`] : [`${v.a.shaded}/${v.a.parts}`, `${v.b.shaded}/${v.b.parts}`];
    if (named.size && !shown.some((f) => named.has(f))) {
      return { reason: `${v.type}: shows ${shown.join(" and ")} but the step talks about ${[...named].slice(0, 4).join(", ")}` };
    }
  }
  if (v.type === "fraction" && v.interactive) {
    if (v.shaded < 1 || v.shaded >= v.parts) {
      delete v.interactive;
      notes.push(`fraction: interactive removed (target ${v.shaded} of ${v.parts} is not 1..parts-1)`);
    } else if (stepText !== undefined) {
      const ints = integersIn(stepText);
      if (!ints.has(v.shaded) || !ints.has(v.parts)) {
        delete v.interactive;
        notes.push(`fraction: interactive removed (the step does not say to colour ${v.shaded} of ${v.parts} parts)`);
      }
    }
  }
  if (v.type === "objects" && v.interactive && v.count < 2) {
    delete v.interactive;
    notes.push("objects: interactive removed (needs at least 2 to count)");
  }
  return notes.length ? { value: v, notes } : { value: v };
}

/**
 * Validates one picture. `later`: the pack's check/test/retest questions (give-away check).
 * `stepText`: the step's text + example (checks that the picture matches the step).
 */
export function validateVisual(raw: unknown, later: Question[] = [], stepText?: string): Checked<Visual> {
  const r = validateVisualShape(raw, later);
  if (!r.value) return r;
  const c = checkAgainstStep(r.value, stepText);
  const notes = [...(r.notes ?? []), ...(c.notes ?? [])];
  return c.value && notes.length ? { ...c, notes } : c;
}

function validateVisualShape(raw: unknown, later: Question[]): Checked<Visual> {
  if (absent(raw)) return {};
  // The lesson writer sends the picture as a JSON string (small schema); samples and packs
  // sent back by the app carry the object itself.
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t || /^null$/i.test(t)) return {};
    // The raw string may escape Arabic as \u0627 (6 characters per letter): the size limit is
    // checked on the parsed picture, the raw string only gets a generous ceiling.
    if (t.length > VISUAL_LIMITS.jsonChars * 6) return { reason: "json_too_long: visual JSON is too long" };
    try {
      raw = JSON.parse(t);
    } catch {
      return { reason: "json_invalid: visual is not valid JSON" };
    }
    if (absent(raw)) return {};
    if (JSON.stringify(raw).length > VISUAL_LIMITS.jsonChars) return { reason: "json_too_long: visual JSON is too long" };
  }
  if (typeof raw !== "object" || Array.isArray(raw)) return { reason: "visual is not an object" };
  const o = raw as Record<string, unknown>;
  const type = o.type as VisualType;
  const bad = (why: string): Checked<Visual> => ({ reason: `${String(type)}: ${why}` });
  const optBool = (k: string) => (absent(o[k]) ? undefined : typeof o[k] === "boolean" ? (o[k] as boolean) : null);
  const optLabel = () => (absent(o.label) ? undefined : cleanText(o.label, VISUAL_LIMITS.label));

  switch (type) {
    case "fraction": {
      const { min, max } = VISUAL_LIMITS.fractionParts;
      if (o.shape !== "circle" && o.shape !== "bar") return bad("bad shape");
      if (!isInt(o.parts, min, max)) return bad("parts must be 2-12");
      if (!isInt(o.shaded, 0, o.parts)) return bad("shaded must be 0..parts");
      const label = optLabel();
      const interactive = optBool("interactive");
      if (label === null || interactive === null) return bad("bad label or interactive");
      if (label) {
        for (const m of label.matchAll(FRACTION_IN_TEXT)) {
          if (Number(m[1]) !== o.shaded || Number(m[2]) !== o.parts) return bad(`label ${m[0]} does not match ${o.shaded}/${o.parts}`);
        }
      }
      const v: Visual = { type, shape: o.shape, parts: o.parts, shaded: o.shaded };
      if (label) v.label = label;
      if (interactive) v.interactive = true;
      return { value: v };
    }
    case "fractionCompare": {
      if (o.shape !== "circle" && o.shape !== "bar") return bad("bad shape");
      const part = (p: unknown) => {
        const q = (p ?? {}) as Record<string, unknown>;
        const { min, max } = VISUAL_LIMITS.fractionParts;
        return isInt(q.parts, min, max) && isInt(q.shaded, 0, q.parts) ? { parts: q.parts, shaded: q.shaded } : null;
      };
      const a = part(o.a);
      const b = part(o.b);
      if (!a || !b) return bad("a and b need parts 2-12 and shaded 0..parts");
      return { value: { type, a, b, shape: o.shape } };
    }
    case "objects": {
      const emoji = emojiOf(o.emoji);
      if (!emoji) return bad("needs exactly one allowed emoji");
      if (!isInt(o.count, VISUAL_LIMITS.objects.min, VISUAL_LIMITS.objects.max)) return bad("count must be 1-20");
      const count = o.count;
      if (!absent(o.groups) && !(isInt(o.groups, 1, count) && count % o.groups === 0)) return bad(`groups must divide ${count}`);
      if (!absent(o.crossedOut) && !isInt(o.crossedOut, 0, count)) return bad("crossedOut must be 0..count");
      const label = optLabel();
      const interactive = optBool("interactive");
      if (label === null || interactive === null) return bad("bad label or interactive");
      const v: Visual = { type, emoji, count };
      if (!absent(o.groups) && (o.groups as number) > 1) v.groups = o.groups as number;
      if (!absent(o.crossedOut) && (o.crossedOut as number) > 0) v.crossedOut = o.crossedOut as number;
      if (label) v.label = label;
      if (interactive) v.interactive = true;
      return { value: v };
    }
    case "equation": {
      if (!Array.isArray(o.parts) || o.parts.length < 2 || o.parts.length > VISUAL_LIMITS.eqTokens) return bad("needs 2-9 parts");
      const parts: string[] = [];
      for (const p of o.parts) {
        const t = cleanText(typeof p === "number" ? String(p) : p, VISUAL_LIMITS.eqToken);
        if (!t) return bad("each part must be 1-6 characters");
        parts.push(t);
      }
      if (!absent(o.highlight) && !isInt(o.highlight, 0, parts.length - 1)) return bad("highlight out of range");
      const check = checkEquation(parts);
      if (check.status === "wrong") return bad(`wrong or broken sum: ${parts.join(" ")}`);
      if (check.lhs) {
        const k = mathKey(check.lhs);
        if (later.some((q) => q.mathExpr && mathKey(q.mathExpr) === k)) return bad(`gives away the answer of a check/test question (${parts.join(" ")})`);
      }
      const v: Visual = { type, parts };
      if (!absent(o.highlight)) v.highlight = o.highlight as number;
      return { value: v };
    }
    case "numberLine": {
      const A = VISUAL_LIMITS.numberLineAbs;
      if (!isNum(o.from, A) || !isNum(o.to, A) || !isNum(o.step, A)) return bad("from, to and step must be numbers");
      const { from, to, step } = o;
      if (!(to > from) || !(step > 0)) return bad("needs from < to and step > 0");
      const steps = (to - from) / step;
      if (steps > VISUAL_LIMITS.numberLineSteps || Math.abs(steps - Math.round(steps)) > 1e-9) return bad("at most 20 whole steps");
      const inside = (x: unknown): x is number => isNum(x, A) && x >= from - 1e-9 && x <= to + 1e-9;
      const v: Visual = { type, from, to, step };
      if (!absent(o.marks)) {
        if (!Array.isArray(o.marks) || o.marks.length > VISUAL_LIMITS.marks || !o.marks.every(inside)) return bad("marks must be inside the line");
        if (o.marks.length) v.marks = o.marks as number[];
      }
      if (!absent(o.jumps)) {
        if (!Array.isArray(o.jumps) || o.jumps.length > VISUAL_LIMITS.jumps) return bad("too many jumps");
        const jumps: { from: number; to: number }[] = [];
        for (const j of o.jumps) {
          const jo = (j ?? {}) as Record<string, unknown>;
          if (!inside(jo.from) || !inside(jo.to) || jo.from === jo.to) return bad("jumps must stay inside the line");
          jumps.push({ from: jo.from, to: jo.to });
        }
        if (jumps.length) v.jumps = jumps;
      }
      return { value: v };
    }
    case "sequence":
    case "labeled": {
      const r = itemsOf(o.items);
      if (!r.items) return bad(r.reason ?? "items");
      return r.notes.length ? { value: { type, items: r.items }, notes: r.notes } : { value: { type, items: r.items } };
    }
    case "bars": {
      if (!Array.isArray(o.bars) || o.bars.length < VISUAL_LIMITS.items.min || o.bars.length > VISUAL_LIMITS.items.max) return bad("needs 2-6 bars");
      const bars: { label: string; value: number; emoji?: string }[] = [];
      for (const b of o.bars) {
        const bo = (b ?? {}) as Record<string, unknown>;
        const label = cleanText(bo.label, VISUAL_LIMITS.barLabel);
        if (!label || !isNum(bo.value, 100) || bo.value < 0) return bad("each bar needs a label and a value 0-100");
        const bar: { label: string; value: number; emoji?: string } = { label, value: bo.value };
        if (!absent(bo.emoji)) {
          const e = emojiOf(bo.emoji);
          if (!e) return bad("bad bar emoji");
          bar.emoji = e;
        }
        bars.push(bar);
      }
      return { value: { type, bars } };
    }
    case "clock": {
      if (!isInt(o.hour, 1, 12)) return bad("hour must be 1-12");
      if (!isInt(o.minute, 0, 55) || o.minute % 5 !== 0) return bad("minute must be 0, 5, ... 55");
      return { value: { type, hour: o.hour, minute: o.minute } };
    }
    case "shape": {
      const sides: Record<string, number> = { triangle: 3, square: 4, rectangle: 4, circle: 1, pentagon: 5, hexagon: 6 };
      const shape = o.shape as keyof typeof sides;
      if (typeof o.shape !== "string" || !(o.shape in sides)) return bad("unknown shape");
      const v: Visual = { type, shape: shape as Extract<Visual, { type: "shape" }>["shape"] };
      if (!absent(o.sideLabels)) {
        if (!Array.isArray(o.sideLabels) || o.sideLabels.length > sides[shape]) return bad("too many side labels");
        const labels: string[] = [];
        for (const s of o.sideLabels) {
          const t = cleanText(typeof s === "number" ? String(s) : s, VISUAL_LIMITS.sideLabel);
          if (!t) return bad("bad side label");
          labels.push(t);
        }
        if (labels.length) v.sideLabels = labels;
      }
      return { value: v };
    }
    case "placeValue": {
      if (!isInt(o.number, 1, 999)) return bad("number must be 1-999");
      return { value: { type, number: o.number } };
    }
    case "wordCard": {
      const word = cleanText(o.word, VISUAL_LIMITS.word);
      const meaning = cleanText(o.meaning, VISUAL_LIMITS.meaning);
      if (!word) return bad(`word ${textProblem(o.word, VISUAL_LIMITS.word)}`);
      if (!meaning) return bad(`meaning ${textProblem(o.meaning, VISUAL_LIMITS.meaning)}`);
      const emoji = emojiOf(o.emoji);
      const value: Visual = { type, word, emoji: emoji ?? DEFAULT_WORD_EMOJI, meaning };
      return emoji ? { value } : { value, notes: [`emoji ${JSON.stringify(String(o.emoji ?? "")).slice(0, 16)} replaced`] };
    }
    default:
      return { reason: `unknown visual type ${String(type).slice(0, 20)}` };
  }
}

// ---------------------------------------------------------------------------------------
// tryIt
// ---------------------------------------------------------------------------------------

/** Lower-case, Western digits, unicode operators, punctuation removed, single spaces. */
export function compareKey(s: string): string {
  return normalizeMathText(s.toLowerCase())
    .replace(/[^\p{L}\p{N}+\-*/=<>]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const numKey = (text: string) =>
  numbersIn(text)
    .map((r) => `${r.n}/${r.d}`)
    .sort()
    .join(",");

/** The ONE plain sum in a question ("What is 3 + 4?"), or null when there is none or several. */
function plainSumIn(q: string): string | null {
  const s = normalizeMathText(q);
  const num = String.raw`\d+(?:\.\d+)?(?:\/\d+)?`;
  const op = String.raw`(?:\s*[-+*]\s*|\s+\/\s+|\s+[xX]\s+)`;
  const re = new RegExp(`(?<![\\d/.])${num}(?:${op}${num})+(?![\\d/.])`, "g");
  const found = s.match(re) ?? [];
  if (found.length !== 1) return null;
  return found[0].replace(/\s+[xX]\s+/g, " * ").replace(/(\d+)\/(\d+)/g, "($1/$2)");
}

/** Validates a tryIt. `later`: the pack's check/test/retest questions. */
export function validateTryIt(raw: unknown, later: Question[] = []): Checked<TryIt> {
  if (absent(raw)) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return { reason: "tryIt is not an object" };
  const o = raw as Record<string, unknown>;
  const L = VISUAL_LIMITS.tryIt;
  const q = cleanText(o.q, L.q);
  const explain = cleanText(o.explain, L.explain);
  if (!q) return { reason: `tryIt_q ${textProblem(o.q, L.q)}` };
  if (!explain) return { reason: `tryIt_explain ${textProblem(o.explain, L.explain)}` };
  if (!Array.isArray(o.choices) || o.choices.length < L.choicesMin || o.choices.length > L.choicesMax) return { reason: "tryIt needs 2-4 choices" };
  const choices: string[] = [];
  for (const c of o.choices) {
    const t = cleanText(typeof c === "number" ? String(c) : c, L.choice);
    if (!t) return { reason: `tryIt_choice ${textProblem(c, L.choice)}` };
    choices.push(t);
  }
  if (new Set(choices.map(compareKey)).size !== choices.length) return { reason: "tryIt choices are not unique" };
  if (!isInt(o.answerIndex, 0, choices.length - 1)) return { reason: "tryIt answerIndex is not a valid choice" };
  const answerIndex = o.answerIndex;

  // A plain sum in the question is re-computed: exactly the marked choice must be right.
  const sum = plainSumIn(q);
  if (sum) {
    const nums = choices.map((c) => numbersIn(c));
    if (nums.every((n) => n.length === 1)) {
      try {
        const r = evaluate(sum);
        if (r.type === "num") {
          const right = nums.map((n, i) => (n[0].n * r.value.d === r.value.n * n[0].d ? i : -1)).filter((i) => i >= 0);
          if (right.length !== 1 || right[0] !== answerIndex) return { reason: `tryIt answer is wrong for ${sum}` };
        }
      } catch {
        // Not a calculation our checker reads: nothing to re-check.
      }
    }
  }

  // No give-away of a later check/test/retest question.
  const qKey = compareKey(q);
  const allKey = compareKey(`${q} ${explain}`);
  const qNums = numKey(q);
  const answerKey = compareKey(choices[answerIndex]);
  for (const lq of later) {
    const lKey = compareKey(lq.q);
    if (lKey === qKey || (lKey.length >= 12 && allKey.includes(lKey))) return { reason: `tryIt repeats ${lq.id || "a check/test question"}` };
    const lNums = numKey(lq.q);
    const lAnswer = lq.choices[lq.answerIndex];
    if (qNums.includes(",") && qNums === lNums && lAnswer !== undefined && compareKey(lAnswer) === answerKey) {
      return { reason: `tryIt gives away the answer of ${lq.id || "a check/test question"}` };
    }
  }
  return { value: { q, choices, answerIndex, explain } };
}

// ---------------------------------------------------------------------------------------
// Text helpers (safety scans, regional-word replacement, tutor captions)
// ---------------------------------------------------------------------------------------

/** Every human-readable string in a picture (for the safety and regional-word scans). */
export function visualTexts(v: Visual | undefined): string[] {
  if (!v) return [];
  switch (v.type) {
    case "fraction":
    case "objects":
      return v.label ? [v.label] : [];
    case "equation":
      return [v.parts.join(" ")];
    case "sequence":
    case "labeled":
      return v.items.map((i) => i.label);
    case "bars":
      return v.bars.map((b) => b.label);
    case "shape":
      return v.sideLabels ?? [];
    case "wordCard":
      return [v.word, v.meaning];
    default:
      return [];
  }
}

export function tryItTexts(t: TryIt | undefined): string[] {
  return t ? [t.q, ...t.choices, t.explain] : [];
}

/** The same picture with every human-readable string passed through `fn`. */
export function mapVisualText(v: Visual, fn: (s: string) => string): Visual {
  switch (v.type) {
    case "fraction":
    case "objects":
      return v.label ? { ...v, label: fn(v.label) } : { ...v };
    case "sequence":
    case "labeled":
      return { ...v, items: v.items.map((i) => ({ ...i, label: fn(i.label) })) };
    case "bars":
      return { ...v, bars: v.bars.map((b) => ({ ...b, label: fn(b.label) })) };
    case "shape":
      return v.sideLabels ? { ...v, sideLabels: v.sideLabels.map(fn) } : { ...v };
    case "wordCard":
      return { ...v, word: fn(v.word), meaning: fn(v.meaning) };
    default:
      return JSON.parse(JSON.stringify(v)) as Visual;
  }
}

/** A short English description of a picture, so the tutor knows what the child sees. */
export function visualCaption(v: Visual): string {
  switch (v.type) {
    case "fraction":
      return `${v.shape} cut into ${v.parts} equal parts, ${v.shaded} coloured${v.label ? ` (${v.label})` : ""}${v.interactive ? "; the child taps to colour them" : ""}`;
    case "fractionCompare":
      return `two same-size ${v.shape}s: ${v.a.shaded} of ${v.a.parts} parts coloured vs ${v.b.shaded} of ${v.b.parts}`;
    case "objects":
      return `${v.count} ${v.emoji}${v.groups ? ` in ${v.groups} equal groups` : ""}${v.crossedOut ? `, ${v.crossedOut} crossed out` : ""}${v.label ? ` (${v.label})` : ""}`;
    case "equation":
      return `equation: ${v.parts.join(" ")}`;
    case "numberLine":
      return `number line ${v.from} to ${v.to}${v.marks?.length ? `, marks at ${v.marks.join(", ")}` : ""}${v.jumps?.length ? `, jumps ${v.jumps.map((j) => `${j.from}→${j.to}`).join(", ")}` : ""}`;
    case "sequence":
      return `steps: ${v.items.map((i) => `${i.emoji} ${i.label}`).join(" → ")}`;
    case "labeled":
      return `labelled: ${v.items.map((i) => `${i.emoji} ${i.label}`).join(", ")}`;
    case "bars":
      return `bar chart: ${v.bars.map((b) => `${b.label} ${b.value}`).join(", ")}`;
    case "clock":
      return `clock showing ${v.hour}:${String(v.minute).padStart(2, "0")}`;
    case "shape":
      return `${v.shape}${v.sideLabels?.length ? ` with sides ${v.sideLabels.join(", ")}` : ""}`;
    case "placeValue":
      return `place-value blocks for ${v.number}`;
    case "wordCard":
      return `word card: ${v.emoji} ${v.word} = ${v.meaning}`;
  }
}

// ---------------------------------------------------------------------------------------
// JSON schema pieces for the lesson writer (structured outputs). Kept SMALL on purpose: a
// 12-way union of picture objects made the compiled grammar too large (API 400). So the
// writer sends `visual` as a compact JSON STRING (the contract is described in the prompt,
// LESSON_VISUAL_RULES) and validateVisual() parses and checks it; `tryIt` is one small
// fixed object. Ranges are enforced by the checks above, not by the schema.
// ---------------------------------------------------------------------------------------

/** `visual` on a teach step: a JSON string of one picture, or null. */
export const VISUAL_FIELD_SCHEMA = { type: ["string", "null"] };

/** `tryIt` on a teach step: one quick question or null. */
export const TRY_IT_FIELD_SCHEMA = {
  anyOf: [
    {
      type: "object",
      properties: { q: { type: "string" }, choices: { type: "array", items: { type: "string" } }, answerIndex: { type: "integer" }, explain: { type: "string" } },
      required: ["q", "choices", "answerIndex", "explain"],
      additionalProperties: false,
    },
    { type: "null" },
  ],
};
