// FREE PICTURE FALLBACK (founder: every lesson has pictures). After the pack is validated, a
// pack with fewer than MIN_PACK_VISUALS pictures borrows checked pictures from the matched
// teacher notes (server/knowledge), with no extra AI call:
//  - each suggested picture is re-checked by validateVisual against the step it would join and
//    against every check/test/retest question (no give-aways), like a writer's picture;
//  - it only joins a teach step that has no picture and that it FITS:
//      * pictures with words (sequence, labeled, wordCard, bars, shape labels): the step's
//        title/text/example shares at least one content word with the picture's labels (so an
//        English-labelled picture never lands in an Arabic step);
//      * pictures with numbers (fraction, fractionCompare, equation, numberLine, objects, clock,
//        placeValue): EVERY number the picture shows is written in that step (the existing
//        number-consistency rule, made strict: nothing is attached on a guess);
//  - a picture is used once (never one the pack already shows); nothing fits: nothing is attached.

import { knowledgeTokens, type KnowledgeEntry } from "./knowledge";
import type { LessonPack, Question, TeachStep, Visual } from "./types";
import { validateVisual, visualTexts } from "./visuals";
import { normalizeMathText } from "./verify";

export const MIN_PACK_VISUALS = 3;

const stepText = (s: TeachStep) => `${s.title ?? ""}\n${s.text}\n${s.example ?? ""}`;

/** Numbers a picture shows (as written: "3/4", "7", "12"), or null for a picture of words. */
function visualNumbers(v: Visual): string[] | null {
  switch (v.type) {
    case "fraction":
      return [`${v.shaded}/${v.parts}`];
    case "fractionCompare":
      return [`${v.a.shaded}/${v.a.parts}`, `${v.b.shaded}/${v.b.parts}`];
    case "equation":
      return v.parts.flatMap((p) => normalizeMathText(p).match(/\d+(?:[.,]\d+)?(?:\/\d+)?/g) ?? []);
    case "numberLine":
      return [String(v.from), String(v.to), ...(v.marks ?? []).map(String), ...(v.jumps ?? []).flatMap((j) => [String(j.from), String(j.to)])];
    case "objects":
      return [String(v.count)];
    case "clock":
      return [String(v.hour)];
    case "placeValue":
      return [String(v.number)];
    default:
      return null;
  }
}

/** Numbers written in a step, normalized ("3 / 4" -> "3/4", Eastern digits -> Western). */
function numbersInStep(text: string): Set<string> {
  const t = normalizeMathText(text).replace(/(\d)\s*\/\s*(\d)/g, "$1/$2");
  const out = new Set<string>();
  for (const m of t.match(/\d+(?:[.,]\d+)?(?:\/\d+)?/g) ?? []) {
    out.add(m);
    for (const part of m.split("/")) out.add(part); // "3/4" also names 3 and 4
  }
  return out;
}

/** How well a picture fits a step: 0 = not at all. */
function fit(v: Visual, step: TeachStep): number {
  const text = stepText(step);
  const nums = visualNumbers(v);
  if (nums) {
    if (!nums.length) return 0;
    const inStep = numbersInStep(text);
    return nums.every((n) => inStep.has(n)) ? 1 + nums.length : 0;
  }
  const words = new Set(knowledgeTokens(visualTexts(v).join(" ")).filter((t) => !/^\d+$/.test(t)));
  if (!words.size) return 0;
  let shared = 0;
  for (const t of new Set(knowledgeTokens(text))) if (words.has(t)) shared++;
  return shared;
}

/**
 * Adds teacher-notes pictures to steps without one until the pack has MIN_PACK_VISUALS
 * pictures (or nothing else fits). Returns a new pack and how many were added.
 */
export function addNotesVisuals(pack: LessonPack, entry: KnowledgeEntry, min = MIN_PACK_VISUALS): { pack: LessonPack; added: number; notes: string[] } {
  const have = pack.teachSteps.filter((s) => s.visual).length;
  if (have >= min || !entry.visuals.length) return { pack, added: 0, notes: [] };
  const later: Question[] = [...pack.checks, ...pack.test, ...pack.retestPool];
  const steps = pack.teachSteps.map((s) => ({ ...s }));
  const notes: string[] = [];
  // A picture the pack already shows is never added a second time.
  const shown = new Set(steps.filter((s) => s.visual).map((s) => JSON.stringify(s.visual)));
  let added = 0;
  for (const suggested of entry.visuals) {
    if (have + added >= min) break;
    if (shown.has(JSON.stringify(validateVisual(structuredClone(suggested)).value ?? suggested))) continue;
    let best = -1;
    let bestFit = 0;
    let bestVisual: Visual | undefined;
    steps.forEach((s, i) => {
      if (s.visual) return;
      // Same checks as a picture from the writer, against THIS step (copy: checks may edit it).
      const checked = validateVisual(structuredClone(suggested), later, stepText(s));
      if (!checked.value) return;
      const f = fit(checked.value, s);
      if (f > bestFit) {
        bestFit = f;
        best = i;
        bestVisual = checked.value;
      }
    });
    if (best >= 0 && bestVisual) {
      steps[best].visual = bestVisual;
      shown.add(JSON.stringify(bestVisual));
      added++;
      notes.push(`teachSteps[${best}].visual from teacher notes (${bestVisual.type})`);
    }
  }
  return added ? { pack: { ...pack, teachSteps: steps }, added, notes } : { pack, added: 0, notes: [] };
}
