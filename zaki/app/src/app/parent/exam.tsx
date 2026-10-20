// EXAM BUILDER (grown-ups, behind the gate): pick a subject, tick saved lessons, set a date and
// number of questions. Zaki mixes questions from those lessons (balanced, shuffled, no AI);
// with AI on and budget left, the server may add a few new checked questions.
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { buildExamQuestions } from '@/lib/api';
import { formatDate } from '@/lib/nav';
import { randomId, useChild, useT } from '@/lib/store';
import { SUBJECTS, subjectInfo } from '@/lib/subjects';
import { accessForKey } from '@/lib/unlock';
import { examDateFrom } from '@/lib/examDate';

import type { Subject } from '@/lib/types';

const COUNTS = [10, 15, 20];

export default function ExamBuilder() {
  const { child, packs, progress, plan, exams, app } = useChild();
  const { t, lang, align } = useT();
  const [subject, setSubject] = useState<Subject>('math');
  const [picked, setPicked] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [initialDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [day, setDay] = useState(String(initialDate.getDate()));
  const [month, setMonth] = useState(String(initialDate.getMonth() + 1));
  const [year, setYear] = useState(String(initialDate.getFullYear()));
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(15);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Lessons in this subject: saved packs + the grown-up's plan. Only lessons the child can
  // open (passed or the current one) AND that are prepared can go into an exam.
  const keyOf = (s: string, tp: string) => `${s}:${tp.trim().toLowerCase().replace(/\s+/g, '-')}`;
  const keys = new Map<string, string>();
  for (const [key, cp] of Object.entries(packs)) if (cp.pack.subject === subject) keys.set(key, progress.lessons[key]?.topic ?? cp.pack.topic);
  for (const p of plan) if (p.subject === subject) keys.set(keyOf(p.subject, p.topic), p.topic);
  const lessons = [...keys.entries()].map(([key, topic]) => {
    const acc = accessForKey(plan, progress, key);
    const pack = packs[key]?.pack;
    return { key, topic, pack, locked: !acc.open && !acc.passed, prepared: !!pack };
  });
  const chosen = lessons.filter((l) => picked.includes(l.key) && l.pack && !l.locked) as { key: string; topic: string; pack: NonNullable<(typeof lessons)[number]['pack']> }[];
  const defaultTitle = t('examDefaultTitle', { subject: t(subjectInfo(subject).key) });

  async function build() {
    if (!child) return;
    setMsg(null);
    if (chosen.length === 0) {
      setError(t('examPickFirst'));
      return;
    }
    const date = examDateFrom(day, month, year);
    if (!date) {
      setError(t('examDateBad'));
      return;
    }
    setError(null);
    setBusy(true);
    const res = await buildExamQuestions({
      subject,
      lang: child.lang,
      grade: child.grade,
      count,
      lessons: chosen.map((l) => ({ lessonKey: l.key, pack: l.pack })),
    });
    const name = title.trim() || defaultTitle;
    app.addExam(child.id, {
      id: randomId('x'),
      subject,
      title: name,
      date,
      lessonKeys: chosen.map((l) => l.key),
      lessonTopics: Object.fromEntries(chosen.map((l) => [l.key, l.topic])),
      questions: res.questions,
      createdAt: new Date().toISOString(),
      addedByAi: res.added,
    });
    setBusy(false);
    setPicked([]);
    setTitle('');
    setMsg(`${t('examReady', { title: name, n: res.questions.length, name: child.nickname })}${res.added ? `\n${t('examAiAdded', { n: res.added })}` : ''}`);
  }

  return (
    <Screen parent back="/parent" title={`🏆 ${t('pExam')}`}>
      <ParentChildPicker />
      {busy ? (
        <View style={{ alignItems: 'center', gap: S.md, paddingVertical: S.xl }}>
          <Mascot size={120} mood="thinking" />
          <Txt variant="h2" center>
            {t('examBuilding')}
          </Txt>
        </View>
      ) : (
        <>
          <Card>
            <Txt bold>{t('subject')}</Txt>
            <Row wrap>
              {SUBJECTS.map((s) => (
                <Chip
                  key={s.id}
                  label={`${s.icon} ${t(s.key)}`}
                  selected={subject === s.id}
                  onPress={() => {
                    setSubject(s.id);
                    setPicked([]);
                  }}
                  testID={`exam-subject-${s.id}`}
                />
              ))}
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('examPickLessons')}</Txt>
            {lessons.length === 0 ? <Txt variant="small">{t('examNoLessons')}</Txt> : null}
            <Row wrap>
              {lessons
                .filter((l) => l.prepared && !l.locked)
                .map((l) => (
                  <Chip
                    key={l.key}
                    label={`${picked.includes(l.key) ? '☑' : '☐'} ${l.topic}`}
                    selected={picked.includes(l.key)}
                    onPress={() => setPicked((p) => (p.includes(l.key) ? p.filter((k) => k !== l.key) : [...p, l.key]))}
                    testID={`exam-lesson-${l.topic}`}
                  />
                ))}
            </Row>
            {lessons
              .filter((l) => !l.prepared || l.locked)
              .map((l) => (
                <Txt key={l.key} variant="small" testID={`exam-unavailable-${l.topic}`}>
                  {l.locked ? '🔒' : '⏳'} {l.topic}: {l.locked ? t('examLockedLesson', { name: child?.nickname ?? '' }) : t('examNotPrepared')}
                </Txt>
              ))}
          </Card>
          <Card>
            <Txt bold>{t('examTitleLabel')}</Txt>
            <TextInput value={title} onChangeText={setTitle} placeholder={defaultTitle} placeholderTextColor="#8893AA" maxLength={50} accessibilityLabel={t('examTitleLabel')} style={[styles.input, { textAlign: align }]} testID="exam-title" />
            <Txt bold>{t('examDate')}</Txt>
            <Row>
              {[
                { v: day, set: setDay, label: t('day'), id: 'exam-day', max: 2 },
                { v: month, set: setMonth, label: t('month'), id: 'exam-month', max: 2 },
                { v: year, set: setYear, label: t('year'), id: 'exam-year', max: 4 },
              ].map((f) => (
                <View key={f.id} style={{ flex: f.max === 4 ? 1.4 : 1, minWidth: 0, gap: 2 }}>
                  <Txt variant="small">{f.label}</Txt>
                  <TextInput value={f.v} onChangeText={(x) => f.set(x.replace(/[^0-9٠-٩]/g, ''))} keyboardType="number-pad" maxLength={f.max} accessibilityLabel={f.label} style={[styles.input, { textAlign: 'center', paddingHorizontal: 4 }]} testID={f.id} />
                </View>
              ))}
            </Row>
            <Txt bold>{t('examCount')}</Txt>
            <Row wrap>
              {COUNTS.map((n) => (
                <Chip key={n} label={String(n)} selected={count === n} onPress={() => setCount(n)} testID={`exam-count-${n}`} />
              ))}
            </Row>
          </Card>
          {error ? (
            <Card tone="coral">
              <Txt bold testID="exam-error">
                {error}
              </Txt>
            </Card>
          ) : null}
          {msg ? (
            <Card tone="mint">
              <Txt bold testID="exam-msg">
                {msg}
              </Txt>
            </Card>
          ) : null}
          <Btn title={t('examBuild')} big icon="✨" onPress={build} testID="exam-build" />
          {exams.length ? (
            <Card testID="exam-report">
              <Txt variant="h2">{t('examExisting')}</Txt>
              {exams.map((e) => {
                const last = [...(progress.examResults ?? [])].reverse().find((r) => r.examId === e.id && !r.practice) ?? [...(progress.examResults ?? [])].reverse().find((r) => r.examId === e.id);
                return (
                  <View key={e.id} style={{ gap: 2, paddingVertical: S.xs }}>
                    <Txt bold>
                      {e.title} · {formatDate(e.date, lang)}
                    </Txt>
                    {last ? (
                      <>
                        <Txt variant="small">
                          {t('examLast', { score: last.score, total: last.total })} {last.practice ? t('practiceTag') : ''}
                        </Txt>
                        {Object.entries(last.perLesson).map(([k, r]) => (
                          <Txt key={k} variant="small" color={r.correct / r.total >= 0.7 ? C.mint : C.wrong}>
                            • {e.lessonTopics[k] ?? k}: {r.correct}/{r.total}
                          </Txt>
                        ))}
                      </>
                    ) : (
                      <Txt variant="small">{t('examNoResult')}</Txt>
                    )}
                  </View>
                );
              })}
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 52, borderRadius: R.md, borderWidth: 2, borderColor: C.border, paddingHorizontal: S.md, fontSize: 18, backgroundColor: '#FFFFFF', color: C.text },
});
