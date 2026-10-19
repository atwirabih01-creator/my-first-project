// EXAM BUILDER (pure code, no AI): mixes questions from several saved lessons into one
// combined exam, balanced per lesson, de-duplicated, with fresh answer positions.
// Shared by the server (/api/exam) and the app's offline/demo mode.
import { shuffleChoices } from "./shuffle";
import type { LessonPack, Question } from "./types";

export type ExamQuestion = Question & { lessonKey: string };
export type ExamLessonInput = { lessonKey: string; pack: LessonPack };

export const EXAM_MIN_QUESTIONS = 5;
export const EXAM_MAX_QUESTIONS = 30;
export const EXAM_DEFAULT_QUESTIONS = 15;

function shuffled<T>(list: T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Round-robin over lessons so each lesson gets a fair share (e.g. 15 questions from 4 lessons
 * -> 4,4,4,3). Within a lesson: test questions first, then retest pool, then checks.
 * A lesson that runs out simply gives its turn to the others.
 */
export function mixExamQuestions(lessons: ExamLessonInput[], count: number, rand: () => number = Math.random): ExamQuestion[] {
  const n = Math.max(1, Math.min(EXAM_MAX_QUESTIONS, Math.round(count)));
  const queues = lessons.map(({ lessonKey, pack }) => {
    const seen = new Set<string>();
    const pool: ExamQuestion[] = [];
    for (const group of [pack.test, pack.retestPool, pack.checks]) {
      for (const q of shuffled(group ?? [], rand)) {
        const sig = q.q.trim().toLowerCase();
        if (seen.has(sig)) continue;
        seen.add(sig);
        pool.push({ ...q, lessonKey });
      }
    }
    return pool;
  });
  const out: ExamQuestion[] = [];
  let progress = true;
  while (out.length < n && progress) {
    progress = false;
    for (const queue of queues) {
      if (out.length >= n) break;
      const q = queue.shift();
      if (q) {
        out.push(q);
        progress = true;
      }
    }
  }
  // Unique ids across lessons, fresh answer positions, mixed order.
  return shuffled(out, rand).map((q, i) => shuffleChoices({ ...q, id: `e${i + 1}_${q.id}` }));
}

/** Per-lesson results: { lessonKey: { correct, total } }. */
export function examBreakdown(questions: ExamQuestion[], answers: number[]): Record<string, { correct: number; total: number }> {
  const out: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    const r = (out[q.lessonKey] ??= { correct: 0, total: 0 });
    r.total++;
    if (answers[i] === q.answerIndex) r.correct++;
  });
  return out;
}
