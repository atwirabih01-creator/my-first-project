import type { Question } from "../types";

/** Compact question builder for hand-written sample packs. */
export function Q(
  id: string,
  q: string,
  choices: string[],
  answerIndex: number,
  hint1: string,
  hint2: string,
  similarExample: string,
  math?: string,
): Question {
  const item: Question = { id, q, choices, answerIndex, hint1, hint2, similarExample, kind: math ? "math" : "text" };
  if (math) item.mathExpr = math;
  return item;
}
