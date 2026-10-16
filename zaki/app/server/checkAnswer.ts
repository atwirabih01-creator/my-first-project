// Deterministic answer checking (no AI). The app sends the pack back, so we look the item up
// and compare. Wrong-answer feedback escalates: hint1 -> hint2 -> similar worked example.

import type { LessonPack, Question } from "./types";
import { normalizeBase } from "./normalize";

export type CheckAnswerResult = {
  correct: boolean;
  feedbackKey: "right" | "hint1" | "hint2" | "example";
};

export class CheckAnswerError extends Error {}

/** Find a question by id. Recap items have no id in the contract: use "recap-0", "recap-1"… */
export function findQuestion(pack: LessonPack, questionId: string): Pick<Question, "choices" | "answerIndex"> | null {
  const m = /^recap-(\d+)$/.exec(questionId);
  if (m) return pack.recap[Number(m[1])] ?? null;
  return [...pack.checks, ...pack.test, ...pack.retestPool].find((q) => q.id === questionId) ?? null;
}

/**
 * `answer` may be the choice index (number) or the choice text (string).
 * `attempt` (optional extension) = which try this is (1 = first try). Defaults to 1.
 */
export function checkAnswer(pack: LessonPack, questionId: string, answer: unknown, attempt = 1): CheckAnswerResult {
  const q = findQuestion(pack, questionId);
  if (!q) throw new CheckAnswerError("question not found");
  let index: number;
  if (typeof answer === "number" && Number.isInteger(answer)) {
    index = answer;
  } else if (typeof answer === "string") {
    // Exact text first (keeps signs like ">" and "<" apart), then a normalized comparison.
    const t = answer.trim();
    index = q.choices.findIndex((c) => c.trim() === t);
    const a = normalizeBase(answer);
    if (index < 0 && a) index = q.choices.findIndex((c) => normalizeBase(c) === a);
  } else {
    throw new CheckAnswerError("answer must be a choice index or choice text");
  }
  const correct = index === q.answerIndex;
  if (correct) return { correct, feedbackKey: "right" };
  const n = Number.isInteger(attempt) && attempt > 0 ? attempt : 1;
  return { correct, feedbackKey: n <= 1 ? "hint1" : n === 2 ? "hint2" : "example" };
}
