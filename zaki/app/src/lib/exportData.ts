import type { useApp } from './store';

/** Everything the family may download. Reviewer-only safety reports are never included. */
export function buildExport(app: ReturnType<typeof useApp>) {
  return {
    app: 'Zaki',
    exportedAt: new Date().toISOString(),
    consent: app.consent ?? null,
    profiles: app.profiles,
    settings: app.settings,
    plans: app.plans,
    progress: app.progress,
    lessons: app.packs,
    exams: app.exams ?? {},
    // Only notes meant for parents. Reviewer-only safety reports are never exported to the family.
    safetyNotes: (app.flags ?? []).filter((f) => f.route === 'parent').map((f) => ({ ts: f.ts, category: f.category })),
  };
}

