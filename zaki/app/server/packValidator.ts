// Strict validator + light repair for LessonPack JSON (from the AI, from samples, or sent
// back by the app). Rules:
//  - wrong-shaped items are DROPPED (never guessed at); top-level fields are forced to the
//    requested subject/grade/lang; ids are made unique;
//  - links, emails and phone numbers are stripped from every string;
//  - a pack is rejected if it falls below the minimum counts, if an Arabic pack is not
//    mostly Arabic, or if any text trips the hard safety keywords.

import { keywordScan } from "./safety";
import { stripLinksAndPhones } from "./textGuards";
import { SUBJECTS, type Lang, type LessonPack, type Question, type RecapItem, type Subject } from "./types";

export const PACK_LIMITS = {
  recap: { min: 0, max: 3 },
  teachSteps: { min: 1, max: 8 },
  checks: { min: 1, max: 9 },
  test: { min: 3, max: 10 },
  retestPool: { min: 0, max: 15 },
  summary: { min: 1, max: 8 },
  flashcards: { min: 1, max: 12 },
  choices: { min: 2, max: 4 },
  len: { q: 300, choice: 80, hint: 300, example: 500, teach: 700, summary: 220, card: 160, topic: 80, mathExpr: 200 },
} as const;

export type ValidationResult = {
  ok: boolean;
  pack?: LessonPack;
  errors: string[];
  repairs: string[];
};

type Expect = { subject: Subject; grade: number; lang: Lang; topic?: string; id?: string };

const ARABIC = /[؀-ۿ]/;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = stripLinksAndPhones(v.trim()).text.trim();
  if (!t || t.length > max) return null;
  return t;
}

function choicesOf(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out: string[] = [];
  for (const c of v) {
    const s = str(c, PACK_LIMITS.len.choice);
    if (s === null) return null;
    out.push(s);
  }
  if (out.length < PACK_LIMITS.choices.min || out.length > PACK_LIMITS.choices.max) return null;
  const lower = out.map((c) => c.toLowerCase());
  if (new Set(lower).size !== lower.length) return null; // duplicate choices
  return out;
}

function answerIndexOf(v: unknown, n: number): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v < n ? v : null;
}

function questionOf(v: unknown, where: string, errors: string[]): Question | null {
  if (!v || typeof v !== "object") {
    errors.push(`${where}: not an object`);
    return null;
  }
  const o = v as Record<string, unknown>;
  const q = str(o.q, PACK_LIMITS.len.q);
  const choices = choicesOf(o.choices);
  const answerIndex = choices ? answerIndexOf(o.answerIndex, choices.length) : null;
  const hint1 = str(o.hint1, PACK_LIMITS.len.hint);
  const hint2 = str(o.hint2, PACK_LIMITS.len.hint);
  const similarExample = str(o.similarExample, PACK_LIMITS.len.example);
  const missing = [
    !q && "q",
    !choices && "choices",
    answerIndex === null && "answerIndex",
    !hint1 && "hint1",
    !hint2 && "hint2",
    !similarExample && "similarExample",
  ].filter(Boolean);
  if (missing.length) {
    errors.push(`${where}: bad or missing ${missing.join(", ")}`);
    return null;
  }
  const kind = o.kind === "math" || o.kind === "text" ? o.kind : undefined;
  const mathExpr = typeof o.mathExpr === "string" && o.mathExpr.trim() ? o.mathExpr.trim().slice(0, PACK_LIMITS.len.mathExpr) : undefined;
  const id = typeof o.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(o.id) ? o.id : "";
  const out: Question = { id, q: q!, choices: choices!, answerIndex: answerIndex!, hint1: hint1!, hint2: hint2!, similarExample: similarExample! };
  if (kind) out.kind = kind;
  if (mathExpr) out.mathExpr = mathExpr;
  return out;
}

function recapOf(v: unknown, where: string, errors: string[]): RecapItem | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const q = str(o.q, PACK_LIMITS.len.q);
  const choices = choicesOf(o.choices);
  const answerIndex = choices ? answerIndexOf(o.answerIndex, choices.length) : null;
  if (!q || !choices || answerIndex === null) {
    errors.push(`${where}: bad recap item`);
    return null;
  }
  return { q, choices, answerIndex };
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export function validatePack(raw: unknown, expect: Expect): ValidationResult {
  const errors: string[] = [];
  const repairs: string[] = [];
  if (!raw || typeof raw !== "object") return { ok: false, errors: ["pack is not an object"], repairs };
  const o = raw as Record<string, unknown>;

  if (!SUBJECTS.includes(expect.subject)) errors.push("unknown subject");
  if (o.subject !== undefined && o.subject !== expect.subject) repairs.push("subject forced to request value");
  if (o.lang !== undefined && o.lang !== expect.lang) repairs.push("lang forced to request value");
  if (o.grade !== undefined && o.grade !== expect.grade) repairs.push("grade forced to request value");

  const topic = str(o.topic, PACK_LIMITS.len.topic) ?? (expect.topic ? str(expect.topic, PACK_LIMITS.len.topic) : null);
  if (!topic) errors.push("topic missing");

  const softErrors: string[] = [];
  const recap = arr(o.recap)
    .map((r, i) => recapOf(r, `recap[${i}]`, softErrors))
    .filter((x): x is RecapItem => !!x)
    .slice(0, PACK_LIMITS.recap.max);

  const teachSteps = arr(o.teachSteps)
    .map((s, i) => {
      const so = (s ?? {}) as Record<string, unknown>;
      const text = str(so.text, PACK_LIMITS.len.teach);
      if (!text) {
        softErrors.push(`teachSteps[${i}]: bad text`);
        return null;
      }
      const example = so.example === undefined ? undefined : str(so.example, PACK_LIMITS.len.example) ?? undefined;
      return example ? { text, example } : { text };
    })
    .filter((x): x is { text: string; example?: string } => !!x)
    .slice(0, PACK_LIMITS.teachSteps.max);

  const qs = (name: "checks" | "test" | "retestPool") =>
    arr(o[name])
      .map((q, i) => questionOf(q, `${name}[${i}]`, softErrors))
      .filter((x): x is Question => !!x)
      .slice(0, PACK_LIMITS[name].max);
  const checks = qs("checks");
  const test = qs("test");
  const retestPool = qs("retestPool");

  const summary = arr(o.summary)
    .map((s) => str(s, PACK_LIMITS.len.summary))
    .filter((x): x is string => !!x)
    .slice(0, PACK_LIMITS.summary.max);
  const flashcards = arr(o.flashcards)
    .map((f) => {
      const fo = (f ?? {}) as Record<string, unknown>;
      const front = str(fo.front, PACK_LIMITS.len.card);
      const back = str(fo.back, PACK_LIMITS.len.card);
      return front && back ? { front, back } : null;
    })
    .filter((x): x is { front: string; back: string } => !!x)
    .slice(0, PACK_LIMITS.flashcards.max);

  if (softErrors.length) repairs.push(...softErrors.map((e) => `dropped ${e}`));

  // Unique ids across all question lists.
  const used = new Set<string>();
  const prefix: Record<string, string> = { checks: "c", test: "t", retestPool: "r" };
  for (const [name, list] of [["checks", checks], ["test", test], ["retestPool", retestPool]] as const) {
    list.forEach((q, i) => {
      if (!q.id || used.has(q.id)) {
        let n = i + 1;
        let id = `${prefix[name]}${n}`;
        while (used.has(id)) id = `${prefix[name]}${++n}`;
        if (q.id) repairs.push(`duplicate id ${q.id} renamed ${id}`);
        q.id = id;
      }
      used.add(q.id);
    });
  }

  const counts = { recap, teachSteps, checks, test, retestPool, summary, flashcards };
  for (const [k, list] of Object.entries(counts)) {
    const min = PACK_LIMITS[k as keyof typeof counts].min;
    if (list.length < min) errors.push(`${k}: needs at least ${min}, has ${list.length}`);
  }

  // Language check: an Arabic pack must be mostly Arabic.
  const allQ = [...checks, ...test, ...retestPool];
  if (expect.lang === "ar" && allQ.length) {
    const arabicShare = allQ.filter((q) => ARABIC.test(q.q)).length / allQ.length;
    const teachArabic = teachSteps.filter((s) => ARABIC.test(s.text)).length / Math.max(1, teachSteps.length);
    if (arabicShare < 0.7 || teachArabic < 0.7) errors.push("lang ar: pack text is not mostly Arabic");
  }

  // Hard safety keywords anywhere in the pack text => reject (no exceptions, no auto-fix).
  const allText = [
    topic ?? "",
    ...recap.flatMap((r) => [r.q, ...r.choices]),
    ...teachSteps.flatMap((s) => [s.text, s.example ?? ""]),
    ...allQ.flatMap((q) => [q.q, ...q.choices, q.hint1, q.hint2, q.similarExample]),
    ...summary,
    ...flashcards.flatMap((f) => [f.front, f.back]),
  ].join("\n");
  const scan = keywordScan(allText);
  if (scan.selfHarm || scan.disclosure || scan.secrecy || scan.adult || scan.injection || scan.politics) {
    errors.push("pack text contains blocked safety words");
  }

  if (errors.length) return { ok: false, errors, repairs };

  const id = expect.id ?? (typeof o.id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(o.id) ? o.id : `pack_${crypto.randomUUID()}`);
  const pack: LessonPack = {
    id,
    subject: expect.subject,
    topic: topic!,
    grade: expect.grade,
    lang: expect.lang,
    recap,
    teachSteps,
    checks,
    test,
    retestPool,
    summary,
    flashcards,
  };
  return { ok: true, pack, errors, repairs };
}

/** JSON schema sent to Claude (structured outputs). The validator above still runs after. */
export const LESSON_PACK_JSON_SCHEMA = (() => {
  const question = {
    type: "object",
    properties: {
      id: { type: "string" },
      q: { type: "string" },
      choices: { type: "array", items: { type: "string" } },
      answerIndex: { type: "integer" },
      hint1: { type: "string" },
      hint2: { type: "string" },
      similarExample: { type: "string" },
      kind: { type: "string", enum: ["math", "text"] },
      mathExpr: { type: "string" },
    },
    required: ["id", "q", "choices", "answerIndex", "hint1", "hint2", "similarExample", "kind"],
    additionalProperties: false,
  };
  return {
    type: "object",
    properties: {
      topic: { type: "string" },
      recap: {
        type: "array",
        items: {
          type: "object",
          properties: { q: { type: "string" }, choices: { type: "array", items: { type: "string" } }, answerIndex: { type: "integer" } },
          required: ["q", "choices", "answerIndex"],
          additionalProperties: false,
        },
      },
      teachSteps: {
        type: "array",
        items: {
          type: "object",
          properties: { text: { type: "string" }, example: { type: "string" } },
          required: ["text"],
          additionalProperties: false,
        },
      },
      checks: { type: "array", items: question },
      test: { type: "array", items: question },
      retestPool: { type: "array", items: question },
      summary: { type: "array", items: { type: "string" } },
      flashcards: {
        type: "array",
        items: {
          type: "object",
          properties: { front: { type: "string" }, back: { type: "string" } },
          required: ["front", "back"],
          additionalProperties: false,
        },
      },
    },
    required: ["topic", "recap", "teachSteps", "checks", "test", "retestPool", "summary", "flashcards"],
    additionalProperties: false,
  };
})();
