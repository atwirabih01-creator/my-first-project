// Home / Today: a warm hello, today's plan from the grown-up, Zaki with a tip, one big Start,
// stars, and the other sections.
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { PopIn } from '@/components/Celebrate';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Bubble, Btn, Card, Row, Stars, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import type { StringKey } from '@/lib/i18n';
import { todayStr, useChild, useT } from '@/lib/store';
import { formatDate, openLesson, useHelpReturn } from '@/lib/nav';
import { currentLesson, planAccess } from '@/lib/unlock';
import { subjectInfo } from '@/lib/subjects';
import type { PlanItem } from '@/lib/types';

const TIPS: StringKey[] = ['tip1', 'tip2', 'tip3', 'tip4', 'tip5', 'tip6', 'tip7', 'tip8'];

/** Morning / afternoon / evening, from the phone's own clock. */
function greetingKey(hour: number): StringKey {
  if (hour >= 4 && hour < 12) return 'greetMorning';
  if (hour >= 12 && hour < 17) return 'greetAfternoon';
  return 'greetEvening';
}

/** Days in a row with some learning time, from the minutes the app already counts (today or up to yesterday). */
function streakDays(usage: Record<string, number>, now = new Date()): number {
  const d = new Date(now);
  if (!((usage[todayStr(d)] ?? 0) > 0)) d.setDate(d.getDate() - 1);
  let n = 0;
  while ((usage[todayStr(d)] ?? 0) > 0) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

const TILE_COLORS: Record<string, { bg: string; edge: string }> = {
  classes: { bg: '#E5EDFF', edge: '#3D6FD9' },
  tests: { bg: C.lilacSoft, edge: C.lilac },
  flashcards: { bg: C.sunSoft, edge: C.sunDeep },
  practice: { bg: C.mintSoft, edge: C.mint },
};

export default function Home() {
  const { child, settings, progress, plan } = useChild();
  const { t, lang } = useT();
  const [tip, setTip] = useState(() => Math.floor(Math.random() * (TIPS.length - 1)));
  const [hops, setHops] = useState(0);
  useHelpReturn(null);
  if (!child) return <Redirect href="/" />;

  const young = child.grade <= 3;
  const used = progress.usage[todayStr()] ?? 0;
  const left = Math.max(0, Math.round(settings.dailyLimitMin - used));
  const access = planAccess(plan, progress);
  const isDone = (p: PlanItem) => access[p.id]?.passed ?? false;
  // Start always opens the current lesson: the first open one not yet passed.
  const next = currentLesson(plan, progress);
  const streak = streakDays(progress.usage);
  const nextTip = () => {
    setTip((n) => (n + 1) % TIPS.length);
    setHops((n) => n + 1);
  };

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
        <Avatar id={child.avatar} size={60} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt variant="h2" testID="home-greeting">
            {t(greetingKey(new Date().getHours()), { name: child.nickname })}
          </Txt>
          <Txt variant="small">
            {t('minutesLeft', { n: left })} · {t('nextStudy', { time: settings.studyTime })}
          </Txt>
        </View>
      </Row>
      {streak >= 2 ? (
        <PopIn bounce style={{ alignSelf: 'flex-start' }}>
          <View style={styles.streak} testID="streak">
            <Txt variant="small" bold color={C.text}>
              {t('streakDays', { n: streak })}
            </Txt>
          </View>
        </PopIn>
      ) : null}

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
                  style={({ pressed }) => [
                    styles.planRow,
                    { backgroundColor: s.soft, borderColor: s.accent },
                    done && { backgroundColor: C.mintSoft, borderColor: C.mint },
                    lockedRow && { backgroundColor: '#EEF1F4', borderColor: '#C9D3DC' },
                    pressed && !lockedRow && { transform: [{ scale: 0.98 }] },
                  ]}
                  testID={`plan-${p.topic}`}>
                  <View style={[styles.planIcon, { borderColor: lockedRow ? '#C9D3DC' : s.accent }]}>
                    <Txt variant="big" center>
                      {s.icon}
                    </Txt>
                  </View>
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

          <View style={{ gap: S.md }}>
            <Row style={{ alignItems: 'center' }}>
              {/* Tap Zaki: a little hop and a new tip. */}
              <Pressable onPress={nextTip} accessibilityRole="button" accessibilityLabel={t('owlTapA11y')} testID="home-owl" hitSlop={8}>
                <Mascot size={young ? 96 : 84} action={hops ? 'hop' : 'wave'} actionKey={hops} />
              </Pressable>
              <Bubble style={{ flex: 1 }} testID="owl-tip">
                <PopIn key={tip}>
                  <Txt bold>{t(TIPS[tip])}</Txt>
                </PopIn>
              </Bubble>
            </Row>
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
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: TILE_COLORS[x.key].bg, borderColor: TILE_COLORS[x.key].edge },
              pressed && styles.tilePressed,
            ]}>
            <View style={styles.tileIcon}>
              <Txt variant="title" center>
                {x.icon}
              </Txt>
            </View>
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
    borderWidth: 2,
    borderBottomWidth: 4,
    minHeight: 64,
  },
  planIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  streak: { backgroundColor: '#FFE3C4', borderRadius: R.pill, paddingHorizontal: S.md, paddingVertical: 6, borderWidth: 2, borderColor: '#F5B26B' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, justifyContent: 'space-between' },
  tile: {
    width: '47%',
    minHeight: 112,
    borderRadius: R.lg,
    borderWidth: 2,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    padding: S.sm,
  },
  // Press down into the coloured edge (same total height, so nothing jumps).
  tilePressed: { borderBottomWidth: 2, marginTop: 4 },
  tileIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
});
