// "Help me with today's lesson": the child picks a subject (only their grade's subjects), then
// taps a topic from their grade's usual topics OR types what they learned today (max 120).
// Zaki then makes the normal teach-first lesson, exactly like a lesson a grown-up added:
// the pack is saved, the lesson goes into the plan (open straight away) and the lesson opens.
// Safety: a worrying or personal topic never becomes a lesson (nothing is saved). The safety
// screen opens, or Zaki's calm fixed reply is shown. Today's AI limit: the lesson is queued.
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { SubjectBadge, SubjectPicker } from '@/components/SubjectPicker';
import { flagRouteFor, goToSafety, recordQuietFlag, scrubExcerpt } from '@/components/lesson';
import { Bubble, Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { ConsentRequiredError, fetchLessonPack, reportSafety } from '@/lib/api';
import { topicsFor } from '@/lib/curriculum';
import { localSafetyCheck } from '@/lib/localSafety';
import { goTo, openLesson, useHelpReturn } from '@/lib/nav';
import { lessonKeyOf, useChild, useT } from '@/lib/store';
import { subjectInfo } from '@/lib/subjects';
import type { Subject } from '@/lib/types';

const MAX_TYPED = 120;

export default function TodayLesson() {
  const { child, settings, plan, app } = useChild();
  const { t, align, rtl } = useT();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  useHelpReturn('/today-lesson');
  if (!child) return <Redirect href="/" />;

  // Topics in the child's own language (the lesson is made in that language too).
  const topics = subject ? topicsFor(child.grade, subject) : [];
  const topicText = (x: { en: string; ar: string }) => (child.lang === 'ar' ? x.ar : x.en);

  async function start(raw: string) {
    if (!child || !subject || busy) return;
    const name = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_TYPED);
    if (name.length < 2) {
      setNote(t('thTooShort'));
      return;
    }
    setNote(null);
    setBlocked(null);
    // The phone's own safety word check first (works offline), exactly like Ask Zaki.
    const kind = localSafetyCheck(name, { asTopic: true });
    if (kind) {
      setTyped('');
      app.addLocalFlag({ category: kind, ...flagRouteFor(kind, name), childRef: child.id, excerpt: scrubExcerpt(name) });
      reportSafety({ kind, message: name, childRef: child.id, lang: child.lang, country: settings.country });
      goToSafety(kind);
      return;
    }
    setBusy(true);
    let res: Awaited<ReturnType<typeof fetchLessonPack>>;
    try {
      res = await fetchLessonPack({ childRef: child.id, grade: child.grade, age: child.age, lang: child.lang, country: settings.country, subject, topic: name });
    } catch (e) {
      setBusy(false);
      setNote(e instanceof ConsentRequiredError ? t('consentNeededText') : t('loadError'));
      return;
    }
    setBusy(false);
    if (!res.budgetReached && res.safetyStopped) {
      // Not a lesson: nothing is saved. The safety screen is already open, or we show the calm reply.
      setTyped('');
      if (res.flag) recordQuietFlag(app, child.id, res.flag, name);
      if (res.blockedReply) setBlocked(res.blockedReply);
      return;
    }
    const key = lessonKeyOf(subject, name);
    const same = plan.find((p) => lessonKeyOf(p.subject, p.topic) === key);
    // The child chose this lesson themselves: it is open straight away (not behind the queue).
    const item = { subject, topic: name, kind: 'lesson' as const, packKey: key, unlocked: true };
    if (res.budgetReached) {
      if (!same) app.addPlanItem(child.id, { ...item, pending: true });
      setQueued(true);
      return;
    }
    app.savePack(child.id, key, { pack: res.pack, sources: res.sources, savedAt: new Date().toISOString(), demo: res.demo, packVersion: res.packVersion });
    if (same) app.setPlanItem(child.id, same.id, { unlocked: true, pending: false });
    else app.addPlanItem(child.id, item);
    openLesson({ subject, topic: name });
  }

  const info = subject ? subjectInfo(subject) : null;

  return (
    <Screen child trackTime back={subject && !busy ? () => setSubject(null) : '/home'} title={`📚 ${t('thTitle')}`}>
      {busy ? (
        <View style={{ alignItems: 'center', gap: S.lg, paddingTop: S.xl }} testID="today-preparing">
          <Mascot size={160} mood="thinking" />
          <Txt variant="h2" center>
            {t('researching')}
          </Txt>
          <Txt variant="small" center>
            🔎 {t('researchingSub')}
          </Txt>
        </View>
      ) : queued ? (
        <Card tone="sun" style={{ alignItems: 'center' }} testID="today-queued">
          <Mascot size={100} mood="calm" />
          <Txt variant="h2" center>
            {t('notReadyTitle')}
          </Txt>
          <Txt center>{t('thQueued')}</Txt>
          <Btn title={t('backHome')} onPress={() => goTo('/home')} testID="back-home" />
        </Card>
      ) : (
        <>
          <Row style={{ alignItems: 'center' }}>
            <Mascot size={84} action="wave" />
            <Bubble style={{ flex: 1 }}>
              <Txt bold>{t('thIntro')}</Txt>
            </Bubble>
          </Row>

          {blocked ? (
            <Card tone="lilac" style={{ alignItems: 'center' }} testID="today-blocked">
              <Mascot size={80} mood="calm" />
              <Txt variant="h2" center>
                {t('blockedTitle')}
              </Txt>
              <Txt center testID="today-blocked-reply">
                {blocked}
              </Txt>
              <Btn title={t('back')} icon={rtl ? '→' : '←'} variant="secondary" onPress={() => setBlocked(null)} testID="today-blocked-back" />
            </Card>
          ) : null}

          {!subject ? (
            <Card style={{ gap: S.md }}>
              <Txt variant="h2">{t('thPickSubject')}</Txt>
              <SubjectPicker grade={child.grade} onPick={setSubject} />
            </Card>
          ) : (
            <>
              <Row wrap style={{ justifyContent: 'space-between' }}>
                {info ? <SubjectBadge info={info} /> : null}
                <Btn small variant="ghost" title={t('thChangeSubject')} onPress={() => setSubject(null)} testID="change-subject" />
              </Row>
              {topics.length ? (
                <Card style={{ gap: S.md }} testID="topic-list">
                  <Txt variant="h2">{t('thPickTopic')}</Txt>
                  <Row wrap>
                    {topics.map((x, i) => (
                      <Chip key={x.en} label={topicText(x)} onPress={() => start(topicText(x))} testID={`topic-${i}`} />
                    ))}
                  </Row>
                </Card>
              ) : null}
              <Card style={{ gap: S.sm }}>
                <Txt bold>✏️ {t('thOrType')}</Txt>
                <TextInput
                  testID="today-input"
                  value={typed}
                  onChangeText={(v) => setTyped(v.slice(0, MAX_TYPED))}
                  placeholder={t('thTypePh')}
                  placeholderTextColor="#8893AA"
                  accessibilityLabel={t('thTypePh')}
                  maxLength={MAX_TYPED}
                  onSubmitEditing={() => start(typed)}
                  returnKeyType="go"
                  style={[styles.input, { textAlign: align, writingDirection: rtl ? 'rtl' : 'ltr' }]}
                />
                <Txt variant="small">
                  {typed.length} / {MAX_TYPED}
                </Txt>
                <Btn title={t('thGo')} icon="✨" big disabled={typed.trim().length < 2} onPress={() => start(typed)} testID="today-go" />
              </Card>
            </>
          )}
          {note ? (
            <Card tone="sun">
              <Txt bold testID="today-note">
                {note}
              </Txt>
            </Card>
          ) : null}
          <Btn title={t('backHome')} variant="ghost" onPress={() => router.replace('/home')} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 56,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.border,
    paddingHorizontal: S.md,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
    color: C.text,
  },
});
