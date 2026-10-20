// A combined exam the grown-up prepared (several lessons). Same rules as lesson tests:
// grades 1-3 = friendly filling bar, no clock; grades 4-6 = count-up "beat your own score".
// Results are broken down per lesson; weak lessons are suggested for review. No AI needed.
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Choice, LeaveTestModal, LessonHelpBar } from '@/components/lesson';
import { Btn, Card, ProgressBar, Row, Txt } from '@/components/ui';
import { C, S } from '@/constants/theme';
import { clearInProgress, loadInProgress, saveInProgress } from '@/lib/inProgress';
import { formatDate, goTo, openLesson, useHelpReturn } from '@/lib/nav';
import { todayStr, useChild, useT } from '@/lib/store';
import type { ExamQuestion, ExamResult } from '@/lib/types';
import { examBreakdown } from '../../server/examMix';
import { shuffleChoices } from '../../server/shuffle';

const nowMs = () => Date.now();
function shuffleList<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const WEAK = 0.7;

export default function ExamScreen() {
  const { id, practice } = useLocalSearchParams<{ id?: string; practice?: string }>();
  const { child, exams, app, progress } = useChild();
  const { t, lang } = useT();
  const exam = exams.find((e) => e.id === id);
  const isPractice = practice === '1';
  // Resume an unfinished exam (e.g. after "I need help") at the same question.
  const progressKey = `exam:${child?.id}:${id}:${isPractice ? 'p' : 'r'}`;
  type Saved = { qs: ExamQuestion[]; idx: number; answers: number[]; startedAt: number };
  const [saved] = useState(() => loadInProgress<Saved>(progressKey));
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>(saved ? 'test' : 'intro');
  const [qs, setQs] = useState<ExamQuestion[]>(saved?.qs ?? []);
  const [idx, setIdx] = useState(saved?.idx ?? 0);
  const [answers, setAnswers] = useState<number[]>(saved?.answers ?? []);
  const [startedAt, setStartedAt] = useState(saved?.startedAt ?? 0);
  const [now, setNow] = useState(saved?.startedAt ?? 0);
  const [askLeave, setAskLeave] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const young = (child?.grade ?? 3) <= 3;
  const timed = !young;
  useHelpReturn({ pathname: '/exam', params: { id: id ?? '', practice: isPractice ? '1' : '0' } }, phase === 'test');

  useEffect(() => {
    if (phase === 'test') saveInProgress(progressKey, { qs, idx, answers, startedAt });
  }, [phase, qs, idx, answers, startedAt, progressKey]);

  useEffect(() => {
    if (phase !== 'test' || !timed) return;
    const h = setInterval(() => setNow(nowMs()), 1000);
    return () => clearInterval(h);
  }, [phase, timed]);

  if (!child || !exam) {
    return (
      <Screen child back="/tests">
        <Txt>{t('noResults')}</Txt>
      </Screen>
    );
  }

  const best = (progress.examResults ?? []).filter((r) => r.examId === exam.id && !r.practice).reduce<number | undefined>((b, r) => (b === undefined || r.seconds < b ? r.seconds : b), undefined);

  function start() {
    if (!exam) return;
    // Every attempt (and every practice run) gets a new order and new answer positions.
    setQs(shuffleList(exam.questions).map((q) => shuffleChoices(q)));
    setIdx(0);
    setAnswers([]);
    const ts = nowMs();
    setStartedAt(ts);
    setNow(ts);
    setPhase('test');
  }

  function answer(i: number) {
    const next = [...answers, i];
    if (idx + 1 < qs.length) {
      setAnswers(next);
      setIdx(idx + 1);
      return;
    }
    const perLesson = examBreakdown(qs, next);
    const score = Object.values(perLesson).reduce((a, r) => a + r.correct, 0);
    const r: ExamResult = {
      examId: exam!.id,
      date: todayStr(),
      at: new Date().toISOString(),
      score,
      total: qs.length,
      seconds: Math.max(1, Math.round((nowMs() - startedAt) / 1000)),
      practice: isPractice,
      perLesson,
    };
    clearInProgress(progressKey);
    app.recordExamResult(child!.id, r);
    if (!isPractice && score / qs.length >= 0.8) app.addStars(child!.id, 5);
    setAnswers(next);
    setResult(r);
    setPhase('result');
  }

  const weak = result ? Object.entries(result.perLesson).filter(([, r]) => r.correct / r.total < WEAK) : [];

  return (
    <Screen
      child
      trackTime
      back={() => (phase === 'test' ? setAskLeave(true) : goTo('/tests'))}
      title={`📝 ${exam.title}${isPractice ? ` ${t('practiceTag')}` : ''}`}
      footer={<LessonHelpBar context={exam.title} />}>
      <LeaveTestModal
        visible={askLeave}
        onStay={() => setAskLeave(false)}
        onLeave={() => {
          setAskLeave(false);
          clearInProgress(progressKey);
          goTo('/tests');
        }}
      />
      {phase === 'intro' ? (
        <View style={{ alignItems: 'center', gap: S.lg }} testID="exam-intro">
          <Mascot size={130} mood="cheer" />
          <Txt variant="title" center>
            {exam.title}
          </Txt>
          <Txt center>{t('examOn', { date: formatDate(exam.date, lang) })}</Txt>
          <Txt variant="big" center>
            {t('examIntro', { n: exam.questions.length, k: exam.lessonKeys.length })} {timed ? t('examTimed') : t('examUntimed')}
          </Txt>
          {timed && best !== undefined ? <Txt center>🏅 {t('bestTime', { s: best })}</Txt> : null}
          <Btn title={t('testStart')} big style={{ alignSelf: 'stretch' }} onPress={start} testID="exam-start" />
        </View>
      ) : null}

      {phase === 'test' && qs[idx] ? (
        <View style={{ gap: S.md }}>
          <Row>
            <Txt variant="h2" style={{ flex: 1 }}>
              {t('questionOf', { n: idx + 1, m: qs.length })}
            </Txt>
            {timed ? (
              <Txt bold testID="test-timer">
                ⏱️ {t('timeNow', { s: Math.max(0, Math.round((now - startedAt) / 1000)) })}
              </Txt>
            ) : null}
          </Row>
          <ProgressBar value={idx / qs.length} color={C.mint} height={young ? 24 : 14} />
          <Card tone="primary">
            <Txt variant="big" testID="question-text">
              {qs[idx].q}
            </Txt>
          </Card>
          {qs[idx].choices.map((c, i) => (
            <Choice key={`${qs[idx].id}-${i}`} testID={`choice-${i}`} label={c} big={young} onPress={() => answer(i)} />
          ))}
        </View>
      ) : null}

      {phase === 'result' && result ? (
        <View style={{ gap: S.md }} testID="exam-result">
          <View style={{ alignItems: 'center', gap: S.sm }}>
            <Mascot size={120} mood={result.score / result.total >= 0.8 ? 'cheer' : 'calm'} />
            <Txt variant="title" center>
              {t('examResultTitle')}
            </Txt>
            <Txt variant="big" center testID="exam-score">
              {t('passedText', { score: result.score, total: result.total })}
            </Txt>
          </View>
          <Card>
            <Txt bold>{t('examPerLesson')}</Txt>
            {Object.entries(result.perLesson).map(([key, r]) => (
              <Row key={key} testID="exam-lesson-row">
                <Txt style={{ flex: 1 }}>{exam.lessonTopics[key] ?? key}</Txt>
                <Txt bold color={r.correct / r.total >= WEAK ? C.mint : C.wrong}>
                  {r.correct}/{r.total}
                </Txt>
              </Row>
            ))}
          </Card>
          {weak.length ? (
            <Card tone="sun" testID="exam-weak">
              <Txt bold>{t('examWeak')}</Txt>
              {weak.map(([key]) => {
                const [subject] = key.split(':');
                return <Btn key={key} small title={`${t('reviewLesson')}: ${exam.lessonTopics[key] ?? key}`} onPress={() => openLesson({ subject, topic: exam.lessonTopics[key] ?? key }, 'review')} />;
              })}
            </Card>
          ) : null}
          <Btn title={t('practiceExam')} variant="secondary" onPress={start} />
          <Btn title={t('backHome')} onPress={() => goTo('/home')} testID="back-home" />
        </View>
      ) : null}
    </Screen>
  );
}
