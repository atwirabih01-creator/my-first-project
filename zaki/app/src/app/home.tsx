// Home / Today: today's plan from the grown-up, one big Start, stars, and the other sections.
import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Btn, Card, Row, Stars, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { todayStr, useChild, useT } from '@/lib/store';
import { formatDate, openLesson, useHelpReturn } from '@/lib/nav';
import { currentLesson, planAccess } from '@/lib/unlock';
import { subjectInfo } from '@/lib/subjects';
import type { PlanItem } from '@/lib/types';

export default function Home() {
  const { child, settings, progress, plan } = useChild();
  const { t, lang } = useT();
  useHelpReturn(null);
  if (!child) return <Redirect href="/" />;

  const young = child.grade <= 3;
  const used = progress.usage[todayStr()] ?? 0;
  const left = Math.max(0, Math.round(settings.dailyLimitMin - used));
  const access = planAccess(plan, progress);
  const isDone = (p: PlanItem) => access[p.id]?.passed ?? false;
  // Start always opens the current lesson: the first open one not yet passed.
  const next = currentLesson(plan, progress);

  const tiles = [
    { key: 'classes', icon: '📚', label: t('myClasses'), href: '/classes' as const },
    { key: 'tests', icon: '📝', label: t('tests'), href: '/tests' as const },
    { key: 'flashcards', icon: '🃏', label: t('flashcards'), href: '/flashcards' as const },
    { key: 'practice', icon: '💬', label: t('practice'), href: '/practice' as const },
  ];

  return (
    <Screen
      child
      trackTime
      back="/"
      headerRight={<Stars n={progress.stars} />}>
      <Row>
        <Avatar id={child.avatar} size={56} />
        <View style={{ flex: 1 }}>
          <Txt variant="h2">{t('readyHi', { name: child.nickname })}</Txt>
          <Txt variant="small">
            {t('minutesLeft', { n: left })} · {t('nextStudy', { time: settings.studyTime })}
          </Txt>
        </View>
      </Row>

      {settings.paused ? (
        <Card tone="sun" style={{ alignItems: 'center' }}>
          <Mascot size={100} mood="calm" />
          <Txt variant="big" center>
            {t('paused')}
          </Txt>
        </Card>
      ) : (
        <>
          <Card>
            <Txt variant="h2">📅 {t('todayPlan')}</Txt>
            {plan.length === 0 ? <Txt>{t('noPlan')}</Txt> : null}
            {plan.map((p) => {
              const s = subjectInfo(p.subject);
              const done = isDone(p);
              const lockedRow = !access[p.id]?.open && !access[p.id]?.pending;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => (lockedRow ? undefined : openLesson(p, p.kind === 'test' && done ? 'test' : 'full'))}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(s.key)}: ${p.topic}${lockedRow ? ` (${t('lockedMsg', { topic: access[p.id]?.blocker ?? '' })})` : ''}`}
                  accessibilityState={{ disabled: lockedRow }}
                  style={[styles.planRow, done && { backgroundColor: C.mintSoft }, lockedRow && { backgroundColor: '#EEF1F4' }]}
                  testID={`plan-${p.topic}`}>
                  <Txt variant="big">{s.icon}</Txt>
                  <View style={{ flex: 1 }}>
                    <Txt bold>{p.topic}</Txt>
                    <Txt variant="small">
                      {t(s.key)} · {p.kind === 'test' && p.dueDate ? t('planTest', { date: formatDate(p.dueDate, lang) }) : t('planLesson')}
                    </Txt>
                    {lockedRow ? (
                      <Txt variant="small" testID={`locked-${p.topic}`}>
                        {t('lockedMsg', { topic: access[p.id]?.blocker ?? '' })}
                      </Txt>
                    ) : null}
                  </View>
                  {done ? <Txt variant="small" color={C.mint} bold>{t('planDone')}</Txt> : null}
                  {lockedRow ? <Txt variant="big">🔒</Txt> : null}
                  {p.pending ? <Txt variant="small" bold>⏳ {t('pendingTag')}</Txt> : null}
                </Pressable>
              );
            })}
          </Card>

          <View style={{ alignItems: 'center', gap: S.sm }}>
            <Mascot size={young ? 110 : 90} />
            <Btn
              title={next ? `${t('start')}: ${next.topic}` : t('start')}
              icon="🚀"
              big
              disabled={!next}
              onPress={() => next && openLesson(next)}
              style={{ alignSelf: 'stretch', minHeight: young ? 84 : 68 }}
              testID="start-lesson"
            />
          </View>
        </>
      )}

      <View style={styles.tiles}>
        {tiles.map((x) => (
          <Pressable
            key={x.key}
            testID={`tile-${x.key}`}
            onPress={() => router.push(x.href)}
            accessibilityRole="button"
            accessibilityLabel={x.label}
            style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.97 }] }]}>
            <Txt variant="title" center>
              {x.icon}
            </Txt>
            <Txt bold center>
              {x.label}
            </Txt>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    padding: S.md,
    borderRadius: R.md,
    backgroundColor: C.primarySoft,
    minHeight: 64,
  },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, justifyContent: 'space-between' },
  tile: {
    width: '47%',
    minHeight: 104,
    borderRadius: R.lg,
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    padding: S.sm,
  },
});
