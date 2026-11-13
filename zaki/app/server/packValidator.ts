// Strict validator + light repair for LessonPack JSON (from the AI, from samples, or sent
// back by the app). Rules:
//  - wrong-shaped items are DROPPED (never guessed at); top-level fields are forced to the
//    requested subject/grade/lang; ids are made unique;
//  - links, emails and phone numbers are stripped from every string;
//  - a pack is rejected if it falls below the minimum counts, if an Arabic pack is not
//    mostly Arabic, or if any text trips the hard safety keywords;
//  - region-specific foods/places/money (server/regionalWords.ts) are an error too, so the
//    builder's retry rewrites them. The result then still carries the built pack and
//    `regionalOnly: true`, so the builder can replace the words itself after the last retry
//    (a lesson is never failed for a regional word).
//  - teach-step pictures (`visual`) and quick questions (`tryIt`, pack version 4+) are checked
//    by server/visuals.ts: a bad one is dropped (the step is kept) and counted in
//    `visualStats`; their text is part of the safety-word and regional-word scans.

import { keywordScan } from "./safety";
import { findRegionalWords, replaceRegionalWords } from "./regionalWords";
import { normalizeBase } from "./normalize";
import { stripLinksAndPhones } from "./textGuards";
import { SUBJECTS, type Lang, type LessonPack, type Question, type RecapItem, type Subject, type TeachStep } from "./types";
import { TRY_IT_FIELD_SCHEMA, VISUAL_FIELD_SCHEMA, mapVisualText, tryItTexts, validateTryIt, validateVisual, visualTexts } from "./visuals";

export const PACK_LIMITS = {
  recap: { min: 0, max: 3 },
  teachSteps: { min: 1, max: 10 }, // the AI is asked for 5-8; a little extra is kept, not cut mid-explanation
  checks: { min: 1, max: 9 },
  test: { min: 3, max: 10 },
  retestPool: { min: 0, max: 15 },
  summary: { min: 1, max: 8 },
  flashcards: { min: 1, max: 12 },
  choices: { min: 2, max: 4 },
  len: { q: 300, choice: 80, hint: 300, example: 500, teach: 700, title: 80, summary: 220, card: 160, topic: 80, mathExpr: 200 },
} as const;

export type ValidationResult = {
  ok: boolean;
  pack?: LessonPack;
  errors: string[];
  repairs: string[];
  /** Region-specific words found (labels). Non-empty => an error unless lenient. */
  regionalWords?: string[];
  /** true when the ONLY errors are regional words: `pack` is still returned (not ok). */
  regionalOnly?: boolean;
  /** Teach-step pictures and quick questions kept / dropped (pack version 4+). */
  visualStats: VisualStats;
};

export type VisualStats = {
  visuals: number;
  visualsDropped: number;
  tryIts: number;
  tryItsDropped: number;
  /** Why pictures / quick questions were dropped ("visual teachSteps[2]: sequence: item_1_label
   *  too long (34 > 30)"), max 10. Also in the repair log. No child data: AI-written text only. */
  dropReasons?: string[];
  /** Pictures taken from the matched teacher notes because the writer gave too few. */
  visualsFromNotes?: number;
};

const MAX_DROP_REASONS = 10;

/**
 * An example that "answers" a question with the same sentence after "No:" / "لا:" contradicts
 * itself ("كان المعلمان حاضرَين؟ لا: كان المعلمان حاضرَين."). Compared normalized (case,
 * diacritics, punctuation).
 */
export function selfContradictoryExample(text: string): boolean {
  // A sentence that trails off and "corrects itself" ("ما زالَ الحديقةُ... لا؛ نقول: ...",
  // "... بل نقول ...", "... no, we say ...") shows a wrong sentence without a clear Wrong/Right label.
  if (/(?:\.\.\.|…)\s*(?:لا|no)\b/i.test(text)) return true;
  if (/(?:\.\.\.|…)\s*(?:بل|but)\s+(?:نقول|we say)/i.test(text)) return true;
  if (/(?:^|[\s.؛;،,])(?:لا|no)\s*[؛;]\s*(?:نقول|we say)/i.test(text)) return true;
  const m = text.match(/^(.*?)(?:^|[\s.?!؟،,:;])(?:no|لا)\s*[:،,]\s*(.+)$/is);
  if (!m) return false;
  const key = (s: string) => normalizeBase(s).replace(/^(?:yes|هل)\s+/, "").trim();
  const before = key(m[1]);
  return before.length > 0 && before === key(m[2]);
}

type Expect = {
  subject: Subject;
  grade: number;
  lang: Lang;
  topic?: string;
  id?: string;
  /**
   * Lenient = shape check only (for packs the app sends back to /api/tutor and
   * /api/check-answer): bad items are dropped, but minimum counts, the Arabic-share rule and
   * the safety-word scan are skipped. Pack text is still treated as DATA by the tutor and
   * every reply is still post-checked and moderated.
   */
  lenient?: boolean;
};

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
  if (!raw || typeof raw !== "object") return { ok: false, errors: ["pack is not an object"], repairs, visualStats: { visuals: 0, visualsDropped: 0, tryIts: 0, tryItsDropped: 0 } };
  const o = raw as Record<string, unknown>;

  if (!SUBJECTS.includes(expect.subject)) errors.push("unknown subject");
  if (o.subject !== undefined && o.subject !== expect.subject) repairs.push("subject forced to request value");
  if (o.lang !== undefined && o.lang !== expect.lang) repairs.push("lang forced to request value");
  if (o.grade !== undefined && o.grade !== expect.grade) repairs.push("grade forced to request value");

  const topic = str(o.topic, PACK_LIMITS.len.topic) ?? (expect.topic ? str(expect.topic, PACK_LIMITS.len.topic) : null);
  if (!topic && !expect.lenient) errors.push("topic missing");

  const softErrors: string[] = [];
  const recap = arr(o.recap)
    .map((r, i) => recapOf(r, `recap[${i}]`, softErrors))
    .filter((x): x is RecapItem => !!x)
    .slice(0, PACK_LIMITS.recap.max);

  const qs = (name: "checks" | "test" | "retestPool") =>
    arr(o[name])
      .map((q, i) => questionOf(q, `${name}[${i}]`, softErrors))
      .filter((x): x is Question => !!x)
      .slice(0, PACK_LIMITS[name].max);
  const checks = qs("checks");
  const test = qs("test");
  const retestPool = qs("retestPool");

  // Pictures and quick questions are checked against every question that comes later
  // (a tryIt or an equation must not give away a check/test answer).
  const later = [...checks, ...test, ...retestPool];
  const visualStats: VisualStats = { visuals: 0, visualsDropped: 0, tryIts: 0, tryItsDropped: 0 };
  const dropReasons: string[] = [];
  const teachSteps = arr(o.teachSteps)
    .map((s, i) => {
      const so = (s ?? {}) as Record<string, unknown>;
      const text = str(so.text, PACK_LIMITS.len.teach);
      if (!text) {
        softErrors.push(`teachSteps[${i}]: bad text`);
        return null;
      }
      let example = so.example === undefined ? undefined : str(so.example, PACK_LIMITS.len.example) ?? undefined;
      if (example && selfContradictoryExample(example)) {
        repairs.push(`dropped teachSteps[${i}].example (contradicts itself: same sentence before and after "No:")`);
        example = undefined;
      }
      // title: optional short heading (pack version 3+); a bad or too-long title is dropped, not the step
      const title = so.title === undefined ? undefined : str(so.title, PACK_LIMITS.len.title) ?? undefined;
      const step: TeachStep = { text };
      if (title) step.title = title;
      if (example) step.example = example;
      const visual = validateVisual(so.visual, later, `${title ?? ""}\n${text}\n${example ?? ""}`);
      if (visual.value) {
        step.visual = visual.value;
        visualStats.visuals++;
        for (const n of visual.notes ?? []) repairs.push(`teachSteps[${i}].visual: ${n}`);
      } else if (visual.reason) {
        visualStats.visualsDropped++;
        repairs.push(`dropped teachSteps[${i}].visual (${visual.reason})`);
        dropReasons.push(`visual teachSteps[${i}]: ${visual.reason}`);
      }
      const tryIt = validateTryIt(so.tryIt, later);
      if (tryIt.value) {
        step.tryIt = tryIt.value;
        visualStats.tryIts++;
      } else if (tryIt.reason) {
        visualStats.tryItsDropped++;
        repairs.push(`dropped teachSteps[${i}].tryIt (${tryIt.reason})`);
        dropReasons.push(`tryIt teachSteps[${i}]: ${tryIt.reason}`);
      }
      return step;
    })
    .filter((x): x is TeachStep => !!x)
    .slice(0, PACK_LIMITS.teachSteps.max);
  if (dropReasons.length) visualStats.dropReasons = dropReasons.slice(0, MAX_DROP_REASONS).map((r) => r.slice(0, 160));


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
  if (expect.lenient) {
    const id = typeof o.id === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(o.id) ? o.id : expect.id ?? `pack_${crypto.randomUUID()}`;
    const pack: LessonPack = { id, subject: expect.subject, topic: topic ?? "lesson", grade: expect.grade, lang: expect.lang, ...counts };
    return { ok: true, pack, errors, repairs, visualStats };
  }
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
  // Scanned as LESSON CONTENT: school words such as "limestone", "under teacher supervision"
  // or "sex chromosomes" are not mistaken for a child's disclosure (keywordScan lessonContent).
  const allText = [
    topic ?? "",
    ...recap.flatMap((r) => [r.q, ...r.choices]),
    ...teachSteps.flatMap((s) => [s.title ?? "", s.text, s.example ?? "", ...visualTexts(s.visual), ...tryItTexts(s.tryIt)]),
    ...allQ.flatMap((q) => [q.q, ...q.choices, q.hint1, q.hint2, q.similarExample]),
    ...summary,
    ...flashcards.flatMap((f) => [f.front, f.back]),
  ].join("\n");
  const scan = keywordScan(allText, { lessonContent: true });
  if (scan.selfHarm || scan.disclosure || scan.secrecy || scan.adult || scan.injection || scan.politics) {
    errors.push("pack text contains blocked safety words");
  }

  // No regional words (founder decision): an error, so the builder's retry rewrites them.
  const regionalWords = findRegionalWords(allText);
  const hardErrors = errors.length;
  if (regionalWords.length) {
    errors.push(`region-specific words are not allowed (use general international examples instead): ${regionalWords.join(", ")}`);
  }

  if (hardErrors) return { ok: false, errors, repairs, regionalWords, visualStats };

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
  if (regionalWords.length) return { ok: false, pack, errors, repairs, regionalWords, regionalOnly: true, visualStats };
  return { ok: true, pack, errors, repairs, visualStats };
}

/**
 * Last resort after the retry: every region-specific word in the pack is replaced with a
 * general one ("manousheh" -> "pizza", "Beirut" -> "the city", "lira" -> "coins"). Choices
 * that would become identical are left alone by the caller's later checks (verifyPack).
 */
export function replaceRegionalInPack(pack: LessonPack): LessonPack {
  const r = (t: string) => replaceRegionalWords(t, pack.lang);
  const q = (x: Question): Question => ({ ...x, q: r(x.q), choices: x.choices.map(r), hint1: r(x.hint1), hint2: r(x.hint2), similarExample: r(x.similarExample) });
  return {
    ...pack,
    topic: r(pack.topic),
    recap: pack.recap.map((x) => ({ ...x, q: r(x.q), choices: x.choices.map(r) })),
    teachSteps: pack.teachSteps.map((s) => {
      const out: TeachStep = { text: r(s.text) };
      if (s.title) out.title = r(s.title);
      if (s.example) out.example = r(s.example);
      if (s.visual) out.visual = mapVisualText(s.visual, r);
      if (s.tryIt) out.tryIt = { ...s.tryIt, q: r(s.tryIt.q), choices: s.tryIt.choices.map(r), explain: r(s.tryIt.explain) };
      return out;
    }),
    checks: pack.checks.map(q),
    test: pack.test.map(q),
    retestPool: pack.retestPool.map(q),
    summary: pack.summary.map(r),
    flashcards: pack.flashcards.map((f) => ({ front: r(f.front), back: r(f.back) })),
  };
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
          // title: short kid-friendly heading ("What is a fraction?"); required for the AI,
          // optional in the validator (older packs have none).
          // visual / tryIt (pack version 4): required for the AI but may be null, so the writer
          // decides for every step; optional in the validator. `visual` is a JSON STRING here
          // (a 12-way union made the compiled grammar too large); the validator parses it.
          properties: {
            title: { type: "string" },
            text: { type: "string" },
            example: { type: "string" },
            visual: VISUAL_FIELD_SCHEMA,
            tryIt: TRY_IT_FIELD_SCHEMA,
          },
          required: ["title", "text", "example", "visual", "tryIt"],
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
