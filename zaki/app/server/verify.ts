// Re-check every math answer key with OUR OWN code (no eval(), no AI, no code-execution tool).
// A tiny exact-fraction calculator: + − × ÷ (and * /), parentheses, fractions (3/4),
// mixed numbers (1 1/2), decimals (0.5, ٠٫٥), Eastern Arabic digits, comparisons
// (<, >, =, ≤, ≥, ≠) and cmp(a, b) which returns "<", ">" or "=".
// If our result disagrees with the answer key (or two choices are both "right"), the item is dropped.

import { easternToWesternDigits } from "./normalize";
import type { LessonPack, Question } from "./types";

// ---------------------------------------------------------------------------------------
// Exact rational numbers (BigInt)
// ---------------------------------------------------------------------------------------

export type Rational = { n: bigint; d: bigint };

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

export function rat(n: bigint, d: bigint = 1n): Rational {
  if (d === 0n) throw new MathError("division by zero");
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}

const add = (a: Rational, b: Rational) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Rational, b: Rational) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Rational, b: Rational) => rat(a.n * b.n, a.d * b.d);
const div = (a: Rational, b: Rational) => {
  if (b.n === 0n) throw new MathError("division by zero");
  return rat(a.n * b.d, a.d * b.n);
};
const cmpR = (a: Rational, b: Rational) => {
  const x = a.n * b.d - b.n * a.d;
  return x < 0n ? -1 : x > 0n ? 1 : 0;
};

export function ratToString(r: Rational): string {
  return r.d === 1n ? r.n.toString() : `${r.n}/${r.d}`;
}

export class MathError extends Error {}

// ---------------------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------------------

type Tok =
  | { t: "num"; v: Rational }
  | { t: "op"; v: "+" | "-" | "*" | "/" }
  | { t: "cmp"; v: "<" | ">" | "=" | "<=" | ">=" | "!=" }
  | { t: "(" }
  | { t: ")" }
  | { t: "," }
  | { t: "fn"; v: "cmp" };

function parseDecimal(s: string): Rational {
  const [ip, fp = ""] = s.split(".");
  const d = 10n ** BigInt(fp.length);
  return rat(BigInt(ip || "0") * d + BigInt(fp || "0"), d);
}

/** Normalize math text: digits, Arabic decimal mark, unicode operators. */
export function normalizeMathText(s: string): string {
  return easternToWesternDigits(s)
    .replace(/٫/g, ".")
    .replace(/[−–—]/g, "-")
    .replace(/[×✕·]/g, "*")
    .replace(/[÷∕⁄]/g, "/")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/≠/g, "!=")
    .replace(/==/g, "=");
}

export function tokenize(input: string): Tok[] {
  const s = normalizeMathText(input);
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    let m: RegExpMatchArray | null;
    if (/^\s/.test(rest)) {
      i++;
      continue;
    }
    // mixed number: 1 1/2
    if ((m = rest.match(/^(\d+)\s+(\d+)\/(\d+)(?!\d)/)) && !(toks.length && toks[toks.length - 1].t === "num")) {
      const whole = BigInt(m[1]);
      toks.push({ t: "num", v: add(rat(whole), rat(BigInt(m[2]), BigInt(m[3]))) });
      i += m[0].length;
      continue;
    }
    if ((m = rest.match(/^\d+(?:\.\d+)?/))) {
      toks.push({ t: "num", v: parseDecimal(m[0]) });
      i += m[0].length;
      continue;
    }
    if ((m = rest.match(/^cmp(?=\s*\()/i))) {
      toks.push({ t: "fn", v: "cmp" });
      i += 3;
      continue;
    }
    if ((m = rest.match(/^(<=|>=|!=|<|>|=)/))) {
      toks.push({ t: "cmp", v: m[1] as "<" | ">" | "=" | "<=" | ">=" | "!=" });
      i += m[0].length;
      continue;
    }
    const ch = rest[0];
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      toks.push({ t: "op", v: ch });
      i++;
      continue;
    }
    if (ch === "(" || ch === ")" || ch === ",") {
      toks.push({ t: ch });
      i++;
      continue;
    }
    throw new MathError(`unexpected character "${ch}"`);
  }
  return toks;
}

// ---------------------------------------------------------------------------------------
// Parser / evaluator (recursive descent)
// ---------------------------------------------------------------------------------------

export type MathValue =
  | { type: "num"; value: Rational }
  | { type: "bool"; value: boolean }
  | { type: "cmp"; value: "<" | ">" | "=" };

const MAX_TOKENS = 200;

export function evaluate(expr: string): MathValue {
  if (expr.length > 300) throw new MathError("expression too long");
  const toks = tokenize(expr);
  if (!toks.length || toks.length > MAX_TOKENS) throw new MathError("empty or too long");
  let pos = 0;
  const peek = () => toks[pos];
  const next = () => toks[pos++];

  function primary(depth: number): Rational {
    if (depth > 20) throw new MathError("too deep");
    const t = next();
    if (!t) throw new MathError("unexpected end");
    if (t.t === "num") return t.v;
    if (t.t === "op" && t.v === "-") return mul(rat(-1n), primary(depth + 1));
    if (t.t === "op" && t.v === "+") return primary(depth + 1);
    if (t.t === "(") {
      const v = addExpr(depth + 1);
      if (next()?.t !== ")") throw new MathError("missing )");
      return v;
    }
    throw new MathError("unexpected token");
  }
  function mulExpr(depth: number): Rational {
    let v = primary(depth);
    for (;;) {
      const t = peek();
      if (t?.t === "op" && (t.v === "*" || t.v === "/")) {
        next();
        const r = primary(depth);
        v = t.v === "*" ? mul(v, r) : div(v, r);
      } else if (t?.t === "(") {
        // implicit multiplication: 2(3+4)
        v = mul(v, primary(depth));
      } else return v;
    }
  }
  function addExpr(depth: number): Rational {
    let v = mulExpr(depth);
    for (;;) {
      const t = peek();
      if (t?.t === "op" && (t.v === "+" || t.v === "-")) {
        next();
        const r = mulExpr(depth);
        v = t.v === "+" ? add(v, r) : sub(v, r);
      } else return v;
    }
  }

  let result: MathValue;
  const first = peek();
  if (first?.t === "fn") {
    next();
    if (next()?.t !== "(") throw new MathError("cmp needs (");
    const a = addExpr(0);
    if (next()?.t !== ",") throw new MathError("cmp needs ,");
    const b = addExpr(0);
    if (next()?.t !== ")") throw new MathError("cmp needs )");
    const c = cmpR(a, b);
    result = { type: "cmp", value: c < 0 ? "<" : c > 0 ? ">" : "=" };
  } else {
    const left = addExpr(0);
    const t = peek();
    if (t?.t === "cmp") {
      next();
      const right = addExpr(0);
      const c = cmpR(left, right);
      const ok =
        t.v === "<" ? c < 0 : t.v === ">" ? c > 0 : t.v === "=" ? c === 0 : t.v === "<=" ? c <= 0 : t.v === ">=" ? c >= 0 : c !== 0;
      result = { type: "bool", value: ok };
    } else {
      result = { type: "num", value: left };
    }
  }
  if (pos !== toks.length) throw new MathError("extra input");
  return result;
}

// ---------------------------------------------------------------------------------------
// Reading an answer choice
// ---------------------------------------------------------------------------------------

const TRUE_WORDS = ["true", "yes", "correct", "right", "vrai", "oui", "صح", "صحيح", "نعم", "✓", "✔"];
const FALSE_WORDS = ["false", "no", "wrong", "incorrect", "faux", "non", "خطأ", "خطا", "خاطئ", "لا", "✗", "✘"];
const CMP_WORDS: Record<"<" | ">" | "=", string[]> = {
  ">": [">", "greater", "greater than", "bigger", "more", "larger", "أكبر", "اكبر", "أكبر من", "اكبر من"],
  "<": ["<", "less", "less than", "smaller", "fewer", "أصغر", "اصغر", "أصغر من", "اصغر من", "أقل", "اقل"],
  "=": ["=", "equal", "equals", "the same", "same", "يساوي", "متساويان", "متساوي", "تساوي"],
};

/** Every number in a text (mixed numbers and fractions count as one number). */
export function numbersIn(text: string): Rational[] {
  const s = normalizeMathText(text);
  const out: Rational[] = [];
  const re = /(\d+)\s+(\d+)\/(\d+)(?!\d)|(\d+)\s*\/\s*(\d+)(?!\d)|\d+(?:\.\d+)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    try {
      if (m[1] !== undefined) out.push(add(rat(BigInt(m[1])), rat(BigInt(m[2]), BigInt(m[3]))));
      else if (m[4] !== undefined) out.push(rat(BigInt(m[4]), BigInt(m[5])));
      else out.push(parseDecimal(m[0]));
    } catch {
      // n/0: skip
    }
  }
  return out;
}

function cleanWord(s: string): string {
  return s.trim().toLowerCase().replace(/[.!?،,]+$/g, "").trim();
}

/** Interpret a choice in the same "shape" as the expected value. Null = can't read it. */
export function parseChoiceValue(choice: string, shape: MathValue["type"]): MathValue | null {
  const w = cleanWord(normalizeMathText(choice));
  if (shape === "bool") {
    if (TRUE_WORDS.includes(w)) return { type: "bool", value: true };
    if (FALSE_WORDS.includes(w)) return { type: "bool", value: false };
    return null;
  }
  if (shape === "cmp") {
    for (const sym of ["<", ">", "="] as const) {
      if (CMP_WORDS[sym].includes(w)) return { type: "cmp", value: sym };
    }
    return null;
  }
  const nums = numbersIn(choice);
  if (nums.length !== 1) return null;
  return { type: "num", value: nums[0] };
}

function sameValue(a: MathValue, b: MathValue): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "num" && b.type === "num") return cmpR(a.value, b.value) === 0;
  return a.value === b.value;
}

// ---------------------------------------------------------------------------------------
// Item and pack verification
// ---------------------------------------------------------------------------------------

export type ItemCheck = { ok: boolean; reason?: string; expected?: string };

export function verifyQuestion(q: Question): ItemCheck {
  if (!q.mathExpr || !q.mathExpr.trim()) return { ok: false, reason: "math item without mathExpr" };
  let expected: MathValue;
  try {
    expected = evaluate(q.mathExpr);
  } catch (e) {
    return { ok: false, reason: `mathExpr not readable: ${(e as Error).message}` };
  }
  const shown = expected.type === "num" ? ratToString(expected.value) : String(expected.value);
  const matches = q.choices.map((c) => {
    const v = parseChoiceValue(c, expected.type);
    return v !== null && sameValue(v, expected);
  });
  const count = matches.filter(Boolean).length;
  if (!matches[q.answerIndex]) return { ok: false, reason: "answer key disagrees with our result", expected: shown };
  if (count > 1) return { ok: false, reason: "more than one choice equals the right result", expected: shown };

  // The expression should use the numbers in the question (catches a mathExpr written for a
  // different question). Compared as plain number literals ("3/4" -> 3 and 4).
  const literals = (t: string) => new Set(normalizeMathText(t).match(/\d+(?:\.\d+)?/g) ?? []);
  const qLits = literals(q.q);
  if (qLits.size) {
    const eLits = literals(q.mathExpr);
    const overlap = [...eLits].some((n) => qLits.has(n));
    if (!overlap) return { ok: false, reason: "mathExpr numbers don't match the question", expected: shown };
  }
  return { ok: true, expected: shown };
}

function needsMathCheck(q: Question, subject: LessonPack["subject"]): boolean {
  if (q.kind === "math" || (q.mathExpr && q.mathExpr.trim())) return true;
  if (q.kind === "text") return false;
  // No kind given: in a math pack, a question whose choices are all numbers is a math item.
  return subject === "math" && q.choices.length > 0 && q.choices.every((c) => numbersIn(c).length === 1);
}

export type VerifyResult = {
  pack: LessonPack;
  checked: number;
  removed: number;
  removedItems: { id: string; reason: string }[];
};

export function verifyPack(pack: LessonPack): VerifyResult {
  let checked = 0;
  const removedItems: { id: string; reason: string }[] = [];
  const filter = (list: Question[]) =>
    list.filter((q) => {
      if (!needsMathCheck(q, pack.subject)) return true;
      checked++;
      const r = verifyQuestion(q);
      if (!r.ok) removedItems.push({ id: q.id, reason: r.reason ?? "failed" });
      return r.ok;
    });
  const out: LessonPack = {
    ...pack,
    checks: filter(pack.checks),
    test: filter(pack.test),
    retestPool: filter(pack.retestPool),
  };
  return { pack: out, checked, removed: removedItems.length, removedItems };
}
