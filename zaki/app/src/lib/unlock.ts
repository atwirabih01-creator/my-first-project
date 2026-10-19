// PASS-TO-UNLOCK (core product rule): within each subject, the grown-up's lessons form an
// ordered queue. Only the first lesson not yet passed is open; later ones stay locked until
// the one before is passed (test >= 80%). Passed lessons always stay open for review.
// A grown-up can unlock a lesson early (behind the parental gate).
import type { ChildProgress, PlanItem } from './types';

export type LessonAccess = { open: boolean; passed: boolean; blocker?: string };

const keyOf = (p: Pick<PlanItem, 'subject' | 'topic'>) => `${p.subject}:${p.topic.trim().toLowerCase().replace(/\s+/g, '-')}`;

export function isPassed(progress: ChildProgress, key: string): boolean {
  return (progress.lessons[key]?.passDates.length ?? 0) > 0;
}

/** Access for every plan item, by plan item id. */
export function planAccess(plan: PlanItem[], progress: ChildProgress): Record<string, LessonAccess> {
  const out: Record<string, LessonAccess> = {};
  const state: Record<string, { allPassed: boolean; lastNotPassed?: string }> = {};
  for (const item of plan) {
    const s = (state[item.subject] ??= { allPassed: true });
    const passed = isPassed(progress, keyOf(item));
    const open = passed || !!item.unlocked || s.allPassed;
    out[item.id] = { open, passed, blocker: open ? undefined : s.lastNotPassed };
    if (!passed) {
      s.allPassed = false;
      s.lastNotPassed = item.topic;
    }
  }
  return out;
}

/** Access for one lesson key. Lessons that aren't in the plan (older/learned ones) are open. */
export function accessForKey(plan: PlanItem[], progress: ChildProgress, key: string): LessonAccess {
  const item = plan.find((p) => keyOf(p) === key);
  if (!item) return { open: true, passed: isPassed(progress, key) };
  return planAccess(plan, progress)[item.id];
}

/** The lesson Home's big Start button should open: the first open lesson not yet passed. */
export function currentLesson(plan: PlanItem[], progress: ChildProgress): PlanItem | undefined {
  const acc = planAccess(plan, progress);
  return plan.find((p) => acc[p.id].open && !acc[p.id].passed && !p.pending) ?? plan.find((p) => acc[p.id].open && !p.pending);
}
