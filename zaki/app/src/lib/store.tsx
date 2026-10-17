// App state: fake child profiles, settings, plans, progress and cached lesson packs.
// Local only (Phase 1). Saved to device storage after every change.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { getHealth, setDemoMode } from './api';
import { getDemoPack } from './demoPacks';
import { isRTLLang, textAlignFor, translate, type StringKey } from './i18n';
import { loadJSON, saveJSON } from './storage';
import type {
  AvatarId,
  CachedPack,
  ChildProfile,
  ChildProgress,
  ChildSettings,
  Lang,
  LessonRecord,
  LessonStatus,
  PlanItem,
  Subject,
  TestResult,
} from './types';

// ---------- helpers ----------
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayStr(d);
}
function daysAhead(n: number): string {
  return daysAgo(-n);
}
export function randomId(prefix = 'c'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
export function lessonKeyOf(subject: Subject, topic: string): string {
  return `${subject}:${topic.trim().toLowerCase().replace(/\s+/g, '-')}`;
}
export function statusOf(rec: LessonRecord | undefined): LessonStatus {
  if (!rec) return 'new';
  if (rec.passDates.length >= 2) return 'mastered';
  if (rec.passDates.length >= 1) return 'learned';
  return 'learning';
}
export const MAX_TESTS_PER_DAY = 3; // first test + 2 retries

export const DEFAULT_SETTINGS: ChildSettings = {
  dailyLimitMin: 30,
  studyTime: '17:00',
  reportLang: 'ar',
  country: 'LB',
  dyslexiaFont: false,
  paused: false,
};

const emptyProgress = (): ChildProgress => ({
  stars: 0,
  lessons: {},
  tests: [],
  sessions: [],
  usage: {},
  reports: [],
  bestTestSeconds: {},
});

type Persisted = {
  version: 1;
  profiles: ChildProfile[];
  settings: Record<string, ChildSettings>;
  progress: Record<string, ChildProgress>;
  plans: Record<string, PlanItem[]>;
  packs: Record<string, Record<string, CachedPack>>; // childId -> lessonKey -> pack
};

function seed(): Persisted {
  const now = new Date().toISOString();
  const ali: ChildProfile = { id: randomId('c'), nickname: 'Ali', grade: 3, lang: 'ar', avatar: 'lion', createdAt: now };
  const maya: ChildProfile = { id: randomId('c'), nickname: 'Maya', grade: 5, lang: 'en', avatar: 'fox', createdAt: now };

  const waterAr = getDemoPack('science', 'ar', 3);
  const waterEn = getDemoPack('science', 'en', 5);
  const keyWaterAr = lessonKeyOf('science', waterAr.pack.topic);
  const keyWaterEn = lessonKeyOf('science', waterEn.pack.topic);

  const aliProgress = emptyProgress();
  aliProgress.stars = 6;
  aliProgress.lessons[keyWaterAr] = {
    key: keyWaterAr, subject: 'science', topic: waterAr.pack.topic, startedAt: daysAgo(1),
    passDates: [daysAgo(1)], wrongChecks: 1, lastActivity: daysAgo(1),
  };
  aliProgress.tests.push({ lessonKey: keyWaterAr, date: daysAgo(1), at: now, score: 4, total: 5, passed: true, seconds: 140, attempt: 1 });
  aliProgress.sessions.push({ date: daysAgo(1), minutes: 14, lessonKey: keyWaterAr, at: now });
  aliProgress.usage[daysAgo(1)] = 14;

  const mayaProgress = emptyProgress();
  mayaProgress.stars = 14;
  mayaProgress.lessons[keyWaterEn] = {
    key: keyWaterEn, subject: 'science', topic: waterEn.pack.topic, startedAt: daysAgo(4),
    passDates: [daysAgo(3), daysAgo(1)], wrongChecks: 2, lastActivity: daysAgo(1),
  };
  mayaProgress.tests.push(
    { lessonKey: keyWaterEn, date: daysAgo(3), at: now, score: 3, total: 5, passed: false, seconds: 95, attempt: 1 },
    { lessonKey: keyWaterEn, date: daysAgo(3), at: now, score: 4, total: 5, passed: true, seconds: 88, attempt: 2 },
    { lessonKey: keyWaterEn, date: daysAgo(1), at: now, score: 5, total: 5, passed: true, seconds: 71, attempt: 1 },
  );
  mayaProgress.bestTestSeconds[keyWaterEn] = 71;
  mayaProgress.sessions.push(
    { date: daysAgo(3), minutes: 22, lessonKey: keyWaterEn, at: now },
    { date: daysAgo(1), minutes: 12, lessonKey: keyWaterEn, at: now },
  );
  mayaProgress.usage[daysAgo(3)] = 22;
  mayaProgress.usage[daysAgo(1)] = 12;

  return {
    version: 1,
    profiles: [ali, maya],
    settings: {
      [ali.id]: { ...DEFAULT_SETTINGS, reportLang: 'ar' },
      [maya.id]: { ...DEFAULT_SETTINGS, reportLang: 'en' },
    },
    progress: { [ali.id]: aliProgress, [maya.id]: mayaProgress },
    plans: {
      [ali.id]: [
        { id: randomId('p'), subject: 'math', topic: 'الكسور', kind: 'lesson', addedAt: now },
      ],
      [maya.id]: [
        { id: randomId('p'), subject: 'math', topic: 'Fractions', kind: 'test', dueDate: daysAhead(3), addedAt: now, sessions: 2 },
      ],
    },
    packs: {
      [ali.id]: { [keyWaterAr]: { pack: waterAr.pack, sources: waterAr.sources, savedAt: now, demo: true } },
      [maya.id]: { [keyWaterEn]: { pack: waterEn.pack, sources: waterEn.sources, savedAt: now, demo: true } },
    },
  };
}

// ---------- context ----------
type AppState = Persisted & {
  loaded: boolean;
  activeChildId: string | null;
  uiLang: Lang;
  demo: boolean | null; // null = still checking
  parentUnlocked: boolean;
};

type Actions = {
  setActiveChild: (id: string | null, keepLang?: boolean) => void;
  setUiLang: (lang: Lang, alsoChild?: boolean) => void;
  addChild: (p: { nickname: string; grade: number; lang: Lang; avatar: AvatarId }) => ChildProfile;
  deleteChild: (id: string) => void;
  updateChild: (id: string, patch: Partial<ChildProfile>) => void;
  updateSettings: (id: string, patch: Partial<ChildSettings>) => void;
  /** Adds to the plan; returns null when the same subject + topic is already there (any case). */
  addPlanItem: (id: string, item: Omit<PlanItem, 'id' | 'addedAt'>) => PlanItem | null;
  savePack: (id: string, key: string, cp: CachedPack) => void;
  touchLesson: (id: string, key: string, subject: Subject, topic: string) => void;
  recordWrongCheck: (id: string, key: string) => void;
  recordTest: (id: string, r: Omit<TestResult, 'date' | 'at'>) => void;
  markNeedsGrownUp: (id: string, key: string) => void;
  addStars: (id: string, n: number) => void;
  addUsage: (id: string, minutes: number, lessonKey?: string) => void;
  addReport: (id: string, text: string, lessonKey?: string) => void;
  unlockParent: () => void;
  lockParent: () => void;
  recheckHealth: () => Promise<void>;
};

const Ctx = createContext<(AppState & Actions) | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    ...emptyPersisted(),
    loaded: false,
    activeChildId: null,
    uiLang: 'en',
    demo: null,
    parentUnlocked: false,
  }));
  const sessionStartRef = useRef<Record<string, string>>({});
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load once.
  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = await loadJSON<Persisted | null>('state', null);
      const data = saved && saved.version === 1 && Array.isArray(saved.profiles) ? saved : seed();
      if (!saved) await saveJSON('state', data);
      const lastLang = await loadJSON<Lang>('uiLang', 'en');
      if (alive) setState((s) => ({ ...s, ...data, uiLang: lastLang, loaded: true }));
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Persist after changes.
  useEffect(() => {
    if (!state.loaded) return;
    const { version, profiles, settings, progress, plans, packs } = state;
    saveJSON('state', { version, profiles, settings, progress, plans, packs });
  }, [state]);

  useEffect(() => {
    if (state.loaded) saveJSON('uiLang', state.uiLang);
  }, [state.loaded, state.uiLang]);

  const recheckHealth = useCallback(async () => {
    const h = await getHealth();
    const demo = !h || !h.ai;
    setDemoMode(demo);
    setState((s) => ({ ...s, demo }));
  }, []);

  useEffect(() => {
    let alive = true;
    getHealth().then((h) => {
      if (!alive) return;
      const demo = !h || !h.ai;
      setDemoMode(demo);
      setState((s) => ({ ...s, demo }));
    });
    return () => {
      alive = false;
    };
  }, []);

  // The grown-up area locks itself again after 15 minutes.
  useEffect(() => {
    if (!state.parentUnlocked) return;
    const id = setTimeout(() => setState((s) => ({ ...s, parentUnlocked: false })), 15 * 60 * 1000);
    return () => clearTimeout(id);
  }, [state.parentUnlocked]);

  const updateProgress = useCallback((id: string, fn: (p: ChildProgress) => ChildProgress) => {
    setState((s) => ({ ...s, progress: { ...s.progress, [id]: fn(s.progress[id] ?? emptyProgress()) } }));
  }, []);

  const actions: Actions = useMemo(
    () => ({
      setActiveChild: (id, keepLang) =>
        setState((s) => {
          const child = s.profiles.find((p) => p.id === id);
          return { ...s, activeChildId: id, uiLang: child && !keepLang ? child.lang : s.uiLang };
        }),
      setUiLang: (lang, alsoChild) =>
        setState((s) => ({
          ...s,
          uiLang: lang,
          profiles:
            alsoChild && s.activeChildId
              ? s.profiles.map((p) => (p.id === s.activeChildId ? { ...p, lang } : p))
              : s.profiles,
        })),
      addChild: (p) => {
        const child: ChildProfile = { id: randomId('c'), createdAt: new Date().toISOString(), ...p };
        setState((s) => ({
          ...s,
          profiles: [...s.profiles, child],
          settings: { ...s.settings, [child.id]: { ...DEFAULT_SETTINGS, reportLang: p.lang } },
          progress: { ...s.progress, [child.id]: emptyProgress() },
          plans: { ...s.plans, [child.id]: [] },
          packs: { ...s.packs, [child.id]: {} },
        }));
        return child;
      },
      deleteChild: (id) =>
        setState((s) => {
          const omit = <T,>(r: Record<string, T>) => {
            const c = { ...r };
            delete c[id];
            return c;
          };
          return {
            ...s,
            profiles: s.profiles.filter((p) => p.id !== id),
            settings: omit(s.settings),
            progress: omit(s.progress),
            plans: omit(s.plans),
            packs: omit(s.packs),
            activeChildId: s.activeChildId === id ? null : s.activeChildId,
          };
        }),
      updateChild: (id, patch) =>
        setState((s) => ({
          ...s,
          profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          uiLang: s.activeChildId === id && patch.lang ? patch.lang : s.uiLang,
        })),
      updateSettings: (id, patch) =>
        setState((s) => ({ ...s, settings: { ...s.settings, [id]: { ...(s.settings[id] ?? DEFAULT_SETTINGS), ...patch } } })),
      addPlanItem: (id, item) => {
        const same = (p: PlanItem) => p.subject === item.subject && p.topic.trim().toLowerCase() === item.topic.trim().toLowerCase();
        if ((stateRef.current.plans[id] ?? []).some(same)) {
          // Already planned: only upgrade it to a test / update the date if asked.
          if (item.kind === 'test') {
            setState((s) => ({
              ...s,
              plans: { ...s.plans, [id]: (s.plans[id] ?? []).map((p) => (same(p) ? { ...p, kind: 'test', dueDate: item.dueDate ?? p.dueDate } : p)) },
            }));
          }
          return null;
        }
        const full: PlanItem = { ...item, id: randomId('p'), addedAt: new Date().toISOString() };
        setState((s) => ({ ...s, plans: { ...s.plans, [id]: [...(s.plans[id] ?? []), full] } }));
        return full;
      },
      savePack: (id, key, cp) =>
        setState((s) => ({ ...s, packs: { ...s.packs, [id]: { ...(s.packs[id] ?? {}), [key]: cp } } })),
      touchLesson: (id, key, subject, topic) =>
        updateProgress(id, (p) => {
          const rec = p.lessons[key];
          const now = todayStr();
          return {
            ...p,
            lessons: {
              ...p.lessons,
              [key]: rec
                ? { ...rec, lastActivity: now }
                : { key, subject, topic, startedAt: now, passDates: [], wrongChecks: 0, lastActivity: now },
            },
          };
        }),
      recordWrongCheck: (id, key) =>
        updateProgress(id, (p) => {
          const rec = p.lessons[key];
          if (!rec) return p;
          return { ...p, lessons: { ...p.lessons, [key]: { ...rec, wrongChecks: rec.wrongChecks + 1 } } };
        }),
      recordTest: (id, r) => {
        const date = todayStr();
        const result: TestResult = { ...r, date, at: new Date().toISOString() };
        updateProgress(id, (p) => {
          const rec = p.lessons[r.lessonKey];
          const lessons = { ...p.lessons };
          if (rec && r.passed && !rec.passDates.includes(date)) {
            lessons[r.lessonKey] = { ...rec, passDates: [...rec.passDates, date], needsGrownUp: false };
          }
          const best = p.bestTestSeconds[r.lessonKey];
          const bestTestSeconds =
            r.passed && (best === undefined || r.seconds < best)
              ? { ...p.bestTestSeconds, [r.lessonKey]: r.seconds }
              : p.bestTestSeconds;
          return { ...p, tests: [...p.tests, result], lessons, bestTestSeconds };
        });
      },
      markNeedsGrownUp: (id, key) =>
        updateProgress(id, (p) => {
          const rec = p.lessons[key];
          if (!rec) return p;
          return { ...p, lessons: { ...p.lessons, [key]: { ...rec, needsGrownUp: true } } };
        }),
      addStars: (id, n) => updateProgress(id, (p) => ({ ...p, stars: p.stars + n })),
      addUsage: (id, minutes, lessonKey) => {
        const date = todayStr();
        // One "session" per child per app run per day.
        const sessKey = `${id}:${date}`;
        if (!sessionStartRef.current[sessKey]) sessionStartRef.current[sessKey] = new Date().toISOString();
        const at = sessionStartRef.current[sessKey];
        updateProgress(id, (p) => {
          const usage = { ...p.usage, [date]: Math.round(((p.usage[date] ?? 0) + minutes) * 100) / 100 };
          const exists = p.sessions.some((s) => s.at === at);
          const sessions = exists
            ? p.sessions.map((s) =>
                s.at === at
                  ? { ...s, minutes: Math.round((s.minutes + minutes) * 100) / 100, lessonKey: lessonKey ?? s.lessonKey }
                  : s,
              )
            : [...p.sessions, { date, minutes, lessonKey, at }];
          return { ...p, usage, sessions };
        });
      },
      addReport: (id, text, lessonKey) =>
        updateProgress(id, (p) => ({ ...p, reports: [...p.reports, { at: new Date().toISOString(), text, lessonKey }] })),
      unlockParent: () => setState((s) => ({ ...s, parentUnlocked: true })),
      lockParent: () => setState((s) => ({ ...s, parentUnlocked: false })),
      recheckHealth,
    }),
    [updateProgress, recheckHealth],
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function emptyPersisted(): Persisted {
  return { version: 1, profiles: [], settings: {}, progress: {}, plans: {}, packs: {} };
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}

/** Active child + its data (or nulls). */
export function useChild() {
  const app = useApp();
  const child = app.profiles.find((p) => p.id === app.activeChildId) ?? null;
  const settings = child ? (app.settings[child.id] ?? DEFAULT_SETTINGS) : DEFAULT_SETTINGS;
  const progress = child ? (app.progress[child.id] ?? emptyProgress()) : emptyProgress();
  const plan = child ? (app.plans[child.id] ?? []) : [];
  const packs = child ? (app.packs[child.id] ?? {}) : {};
  return { app, child, settings, progress, plan, packs };
}

/** Translation helpers for the current UI language. */
export function useT() {
  const { uiLang, settings, profiles, activeChildId } = useApp();
  const childSettings = activeChildId ? settings[activeChildId] : undefined;
  const dyslexia = !!childSettings?.dyslexiaFont;
  return useMemo(
    () => ({
      lang: uiLang,
      rtl: isRTLLang(uiLang),
      align: textAlignFor(uiLang),
      dyslexia,
      hasChild: !!profiles.find((p) => p.id === activeChildId),
      t: (key: StringKey, params?: Record<string, string | number>) => translate(uiLang, key, params),
    }),
    [uiLang, dyslexia, profiles, activeChildId],
  );
}
