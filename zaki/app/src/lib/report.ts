// Builds the WhatsApp-style session report (plan section 3.3) from LOCAL progress.
import { translate, type StringKey } from './i18n';
import { todayStr } from './store';
import type { CachedPack, ChildProfile, ChildProgress, Lang } from './types';

export function buildReport(
  child: ChildProfile,
  progress: ChildProgress,
  packs: Record<string, CachedPack>,
  lang: Lang,
): string {
  const t = (k: StringKey, p?: Record<string, string | number>) => translate(lang, k, p);
  // Use today, or the most recent day with activity.
  const days = [...new Set([...progress.tests.map((x) => x.date), ...progress.sessions.map((s) => s.date)])].sort();
  const today = todayStr();
  const day = days.includes(today) ? today : days[days.length - 1];

  const lines: string[] = [t('repGreeting', { name: child.nickname })];
  if (!day) {
    lines.push(t('repNone'));
    lines.push(t('repPlan'));
    return lines.join('\n');
  }

  const dayTests = progress.tests.filter((x) => x.date === day);
  const keys = [...new Set(dayTests.map((x) => x.lessonKey))];
  const topicOf = (key: string) => progress.lessons[key]?.topic ?? packs[key]?.pack.topic ?? key.split(':')[1];

  const finished = keys.map((key) => {
    const tests = dayTests.filter((x) => x.lessonKey === key);
    const passed = tests.find((x) => x.passed);
    const last = passed ?? tests[tests.length - 1];
    const how = passed
      ? passed.attempt <= 1
        ? t('repFirstTry')
        : t('repNthTry', { n: passed.attempt })
      : t('repNotPassed');
    return t('repTest', { topic: topicOf(key), score: last.score, total: last.total, how });
  });
  const sessionLessons = progress.sessions
    .filter((s) => s.date === day && s.lessonKey && !keys.includes(s.lessonKey))
    .map((s) => t('repLessonOnly', { topic: topicOf(s.lessonKey as string) }));
  const allFinished = [...finished, ...new Set(sessionLessons)];
  lines.push(allFinished.length ? t('repFinished', { items: allFinished.join('; ') }) : t('repNone'));

  const strong = keys.filter((k) => dayTests.some((x) => x.lessonKey === k && x.passed)).map(topicOf);
  const weak = Object.values(progress.lessons)
    .filter((r) => r.needsGrownUp || (r.passDates.length === 0 && r.wrongChecks >= 2) || dayTests.some((x) => x.lessonKey === r.key && !x.passed && !dayTests.some((y) => y.lessonKey === r.key && y.passed)))
    .map((r) => r.topic);
  if (strong.length) lines.push(t('repStrong', { items: strong.join(', ') }));
  if (weak.length) lines.push(t('repWeak', { items: [...new Set(weak)].join(', ') }));

  const subj = keys[0]?.split(':')[0] ?? Object.values(progress.lessons)[0]?.subject;
  const ideaKey: StringKey = subj === 'math' ? 'idea_math' : subj === 'science' ? 'idea_science' : 'idea_default';
  lines.push(t('repIdea', { idea: t(ideaKey) }));
  lines.push(t('repPlan'));
  return lines.join('\n');
}
