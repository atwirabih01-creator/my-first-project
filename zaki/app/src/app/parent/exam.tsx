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
import { randomId, todayStr, useChild, useT } from '@/lib/store';
import { SUBJECTS, subjectInfo } from '@/lib/subjects';
import type { Subject } from '@/lib/types';

const COUNTS = [10, 15, 20];

export default function ExamBuilder() {
  const { child, packs, progress, plan, exams, app } = useChild();
  const { t, lang, align } = useT();
  const [subject, setSubject] = useState<Subject>('math');
  const [picked, setPicked] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return todayStr(d);
  });
  const [count, setCount] = useState(15);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Saved lessons in this subject (full packs are stored on this device).
  const lessons = Object.entries(packs)
    .filter(([, cp]) => cp.pack.subject === subject)
    .map(([key, cp]) => ({ key, pack: cp.pack, topic: progress.lessons[key]?.topic ?? plan.find((p) => `${p.subject}:${p.topic.trim().toLowerCase().replace(/\s+/g, '-')}` === key)?.topic ?? cp.pack.topic }));
  const chosen = lessons.filter((l) => picked.includes(l.key));
  const defaultTitle = t('examDefaultTitle', { subject: t(subjectInfo(subject).key) });

  async function build() {
    if (!child || chosen.length === 0) return;
    setBusy(true);
    setMsg(null);
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
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayStr(),
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
              {lessons.map((l) => (
                <Chip
                  key={l.key}
                  label={`${picked.includes(l.key) ? '☑' : '☐'} ${l.topic}`}
                  selected={picked.includes(l.key)}
                  onPress={() => setPicked((p) => (p.includes(l.key) ? p.filter((k) => k !== l.key) : [...p, l.key]))}
                  testID={`exam-lesson-${l.topic}`}
                />
              ))}
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('examTitleLabel')}</Txt>
            <TextInput value={title} onChangeText={setTitle} placeholder={defaultTitle} placeholderTextColor="#8893AA" maxLength={50} accessibilityLabel={t('examTitleLabel')} style={[styles.input, { textAlign: align }]} testID="exam-title" />
            <Txt bold>{t('examDate')}</Txt>
            <TextInput value={date} onChangeText={setDate} maxLength={10} accessibilityLabel={t('examDate')} style={[styles.input, { textAlign: 'center' }]} testID="exam-date" />
            <Txt bold>{t('examCount')}</Txt>
            <Row wrap>
              {COUNTS.map((n) => (
                <Chip key={n} label={String(n)} selected={count === n} onPress={() => setCount(n)} testID={`exam-count-${n}`} />
              ))}
            </Row>
          </Card>
          {msg ? (
            <Card tone="mint">
              <Txt bold testID="exam-msg">
                {msg}
              </Txt>
            </Card>
          ) : null}
          <Btn title={t('examBuild')} big icon="✨" disabled={chosen.length === 0} onPress={build} testID="exam-build" />
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
