// Shuffles answer choices so the right answer is not always in the same place.
// Pure code (no AI, no secrets): used by the server and by the app's offline demo mode.
import type { LessonPack, Question } from "./types";

function randInt(n: number): number {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (c && c.getRandomValues) {
    const a = new Uint32Array(1);
    c.getRandomValues(a);
    return a[0] % n;
  }
  return Math.floor(Math.random() * n);
}

export function shuffleChoices<T extends { choices: string[]; answerIndex: number }>(item: T): T {
  // Keep the fixed order only for sign choices (>, <, =) so those screens stay predictable.
  if (item.choices.every((c) => [">", "<", "="].includes(c.trim()))) return item;
  const order = item.choices.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...item, choices: order.map((i) => item.choices[i]), answerIndex: order.indexOf(item.answerIndex) };
}

export function shufflePack(pack: LessonPack): LessonPack {
  const qs = (l: Question[]) => l.map(shuffleChoices);
  return {
    ...pack,
    recap: pack.recap.map(shuffleChoices),
    checks: qs(pack.checks),
    test: qs(pack.test),
    retestPool: qs(pack.retestPool),
  };
}
