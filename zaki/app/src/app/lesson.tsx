// LESSON LOOP: loading -> intro -> recap -> teach -> check -> ask Zaki -> summary -> test
// -> pass ("Learned!") or fail (summary again -> retest from retestPool, max 2 retries a day).
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { AskZaki, Choice, LessonHelpBar, QuestionWithHints } from '@/components/lesson';
import { Btn, Card, ProgressBar, Row, Txt } from '@/components/ui';
import { C, S } from '@/constants/theme';
import { fetchLessonPack } from '@/lib/api';
import { goTo, setHelpReturn } from '@/lib/nav';
import { lessonKeyOf, MAX_TESTS_PER_DAY, todayStr, useChild, useT } from '@/lib/store';
import type { CachedPack, Question, Subject } from '@/lib/types';

type Phase =
  | 'loading'
  | 'error'
  | 'intro'
  | 'recap'
  | 'teach'
  | 'check'
  | 'ask'
  | 'summary'
  | 'testIntro'
  | 'test'
  | 'result'
  | 'resummary'
  | 'limit';

const TEST_SIZE = 5;
const nowMs = () => Date.now();
const PASS_RATIO = 0.8;

export default function Lesson() {
  const params = useLocalSearchParams<{ subject?: string; topic?: string; mode?: string }>();
  const subject = (params.subject ?? 'math') as Subject;
  const topic = params.topic ?? '';
  const key = lessonKeyOf(subject, topic);
  const { child, settings, progress, packs, app } = useChild();
  const { t } = useT();

  const [cp, setCp] = useState<CachedPack | null>(packs[key] ?? null);
  const [phase, setPhase] = useState<Phase>(packs[key] ? (params.mode === 'test' ? 'testIntro' : 'intro') : 'loading');
  const [idx, setIdx] = useState(0);
  const [recapWrong, setRecapWrong] = useState<number | null>(null);
  const [reload, setReload] = useState(0);

  // Test state
  const [testQs, setTestQs] = useState<Question[]>([]);
  const [testIdx, setTestIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [lastResult, setLastResult] = useState<{ score: number; total: number; passed: boolean; seconds: number; record: boolean } | null>(null);

  const childId = child?.id;
  const today = todayStr();
  const testsToday = progress.tests.filter((x) => x.lessonKey === key && x.date === today);
  const passedToday = testsToday.some((x) => x.passed);
  const young = (child?.grade ?? 3) <= 3;
  const timed = !young;

  // Load (or reuse) the lesson pack.
  useEffect(() => {
    if (!child || cp) return;
    let alive = true;
    fetchLessonPack({ childRef: child.id, grade: child.grade, lang: child.lang, country: settings.country, subject, topic })
      .then((res) => {
        if (!alive) return;
        if (res.safetyStopped) return; // safety screen already shown
        const cached: CachedPack = { pack: res.pack, sources: res.sources, savedAt: new Date().toISOString(), demo: res.demo };
        app.savePack(child.id, key, cached);
        setCp(cached);
        setPhase(params.mode === 'test' ? 'testIntro' : 'intro');
      })
      .catch(() => alive && setPhase('error'));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, key, reload]);

  // Mark the lesson as started.
  useEffect(() => {
    if (childId && cp) app.touchLesson(childId, key, subject, topic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, key, !!cp]);

  // Stopwatch for grades 4-6 ("beat your own score"; counts up, never a countdown).
  useEffect(() => {
    if (phase !== 'test' || !timed) return;
    const id = setInterval(() => setNow(nowMs()), 1000);
    return () => clearInterval(id);
  }, [phase, timed]);

  const pack = cp?.pack ?? null;

  const helpContext = useMemo(() => {
    if (!pack) return '';
    if (phase === 'teach') return pack.teachSteps[idx]?.text ?? '';
    if (phase === 'check') return pack.checks[idx]?.q ?? '';
    if (phase === 'recap') return pack.recap[idx]?.q ?? '';
    if (phase === 'summary' || phase === 'resummary') return pack.summary.join(' ');
    return '';
  }, [pack, phase, idx]);

  if (!child) return <Screen child>{null}</Screen>;

  const goHome = () => goTo('/home');
  setHelpReturn({ pathname: '/lesson', params: { subject, topic } });

  function startTest() {
    if (!pack) return;
    const attempt = testsToday.length + 1;
    if (!passedToday && testsToday.length >= MAX_TESTS_PER_DAY) {
      setPhase('limit');
      return;
    }
    let qs: Question[];
    if (attempt <= 1 || pack.retestPool.length === 0) {
      qs = pack.test.slice(0, TEST_SIZE);
    } else {
      const pool = pack.retestPool;
      const start = ((attempt - 2) * TEST_SIZE) % pool.length;
      qs = [...pool.slice(start), ...pool.slice(0, start)].slice(0, Math.min(TEST_SIZE, pool.length));
    }
    setTestQs(qs);
    setTestIdx(0);
    setCorrect(0);
    const ts = nowMs();
    setStartedAt(ts);
    setNow(ts);
    setPhase('test');
  }

  function answerTest(i: number) {
    const q = testQs[testIdx];
    const nextCorrect = correct + (i === q.answerIndex ? 1 : 0);
    if (testIdx + 1 < testQs.length) {
      setCorrect(nextCorrect);
      setTestIdx(testIdx + 1);
      return;
    }
    // Finished.
    const total = testQs.length;
    const passed = nextCorrect / total >= PASS_RATIO;
    const seconds = Math.max(1, Math.round((nowMs() - startedAt) / 1000));
    const best = progress.bestTestSeconds[key];
    const record = passed && timed && best !== undefined && seconds < best;
    app.recordTest(child!.id, { lessonKey: key, score: nextCorrect, total, passed, seconds, attempt: testsToday.length + 1 });
    if (passed) app.addStars(child!.id, nextCorrect + 2);
    setCorrect(nextCorrect);
    setLastResult({ score: nextCorrect, total, passed, seconds, record });
    if (!passed && testsToday.length + 1 >= MAX_TESTS_PER_DAY) {
      app.markNeedsGrownUp(child!.id, key);
      setPhase('limit');
    } else {
      setPhase('result');
    }
  }

  const showHelpBar = phase !== 'loading' && phase !== 'error';
  const sources = cp?.sources ?? [];

  return (
    <Screen
      child
      trackTime
      lessonKey={key}
      back={goHome}
      title={topic}
      footer={showHelpBar ? <LessonHelpBar lessonKey={key} context={helpContext} /> : undefined}>
      {settings.paused ? (
        <Card tone="sun" style={{ alignItems: 'center' }}>
          <Mascot size={100} mood="calm" />
          <Txt variant="big" center>
            {t('paused')}
          </Txt>
          <Btn title={t('backHome')} onPress={goHome} />
        </Card>
      ) : null}

      {!settings.paused && phase === 'loading' ? (
        <View style={{ alignItems: 'center', gap: S.lg, paddingTop: S.xxl }} testID="lesson-loading">
          <Mascot size={170} mood="thinking" />
          <Txt variant="h2" center>
            {t('researching')}
          </Txt>
          <Txt variant="small" center>
            🔎 {t('researchingSub')}
          </Txt>
        </View>
      ) : null}

      {!settings.paused && phase === 'error' ? (
        <Card tone="sun" style={{ alignItems: 'center' }}>
          <Mascot size={90} mood="calm" />
          <Txt center>{t('loadError')}</Txt>
          <Btn
            title={t('retry')}
            onPress={() => {
              setPhase('loading');
              setReload((r) => r + 1);
            }}
          />
        </Card>
      ) : null}

      {!settings.paused && pack && phase === 'intro' ? (
        <View style={{ alignItems: 'center', gap: S.lg }}>
          <Mascot size={150} />
          <Card tone="lilac" style={{ alignSelf: 'stretch' }}>
            <Txt variant="big" center testID="ai-intro">
              {t('aiIntro')}
            </Txt>
          </Card>
          <Btn
            title={t('start')}
            icon="🚀"
            big
            style={{ alignSelf: 'stretch' }}
            testID="intro-start"
            onPress={() => {
              setIdx(0);
              setPhase(pack.recap.length ? 'recap' : 'teach');
            }}
          />
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'recap' && pack.recap[idx] ? (
        <View style={{ gap: S.md }}>
          <Txt variant="h2">🧠 {t('recapTitle')}</Txt>
          <ProgressBar value={(idx + 1) / pack.recap.length} color={C.lilac} label={t('stepOf', { n: idx + 1, m: pack.recap.length })} />
          <Card tone="primary">
            <Txt variant="big" testID="question-text">
              {pack.recap[idx].q}
            </Txt>
          </Card>
          {pack.recap[idx].choices.map((c, i) => (
            <Choice
              key={`r${idx}-${i}`}
              testID={`choice-${i}`}
              label={c}
              big={young}
              state={recapWrong === i ? 'wrong' : 'idle'}
              onPress={() => {
                if (i === pack.recap[idx].answerIndex) {
                  setRecapWrong(null);
                  if (idx + 1 < pack.recap.length) setIdx(idx + 1);
                  else {
                    setIdx(0);
                    setPhase('teach');
                  }
                } else setRecapWrong(i);
              }}
            />
          ))}
          {recapWrong !== null ? (
            <Card tone="sun">
              <Txt>{t('recapWrong')}</Txt>
            </Card>
          ) : null}
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'teach' && pack.teachSteps[idx] ? (
        <View style={{ gap: S.md }}>
          <Txt variant="h2">📘 {t('teachTitle')}</Txt>
          <ProgressBar value={(idx + 1) / pack.teachSteps.length} label={t('stepOf', { n: idx + 1, m: pack.teachSteps.length })} />
          <Txt variant="small">{t('stepOf', { n: idx + 1, m: pack.teachSteps.length })}</Txt>
          <Row style={{ alignItems: 'flex-start' }}>
            <Mascot size={70} />
            <Card style={{ flex: 1 }}>
              <Txt variant="big" testID="teach-text">
                {pack.teachSteps[idx].text}
              </Txt>
            </Card>
          </Row>
          {pack.teachSteps[idx].example ? (
            <Card tone="sun">
              <Txt>✨ {pack.teachSteps[idx].example}</Txt>
            </Card>
          ) : null}
          <Btn
            title={t('next')}
            big
            testID="next-btn"
            onPress={() => {
              if (idx + 1 < pack.teachSteps.length) setIdx(idx + 1);
              else {
                setIdx(0);
                setPhase(pack.checks.length ? 'check' : 'ask');
              }
            }}
          />
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'check' && pack.checks[idx] ? (
        <View style={{ gap: S.md }}>
          <Txt variant="h2">✏️ {t('checkTitle')}</Txt>
          <ProgressBar value={(idx + 1) / pack.checks.length} color={C.sun} label={t('questionOf', { n: idx + 1, m: pack.checks.length })} />
          <QuestionWithHints
            key={pack.checks[idx].id}
            pack={pack}
            question={pack.checks[idx]}
            onWrong={() => app.recordWrongCheck(child.id, key)}
            onDone={() => {
              app.addStars(child.id, 1);
              if (idx + 1 < pack.checks.length) setIdx(idx + 1);
              else setPhase('ask');
            }}
          />
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'ask' ? (
        <View style={{ gap: S.md }}>
          <AskZaki pack={pack} />
          <Btn title={t('askSkip')} big variant="secondary" onPress={() => setPhase('summary')} testID="ask-skip" />
        </View>
      ) : null}

      {!settings.paused && pack && (phase === 'summary' || phase === 'resummary') ? (
        <View style={{ gap: S.md }}>
          {phase === 'resummary' ? <Txt variant="h2">{t('summaryAgain')}</Txt> : null}
          <Card tone="mint" style={{ gap: S.sm }}>
            <Row>
              <Txt variant="h2" style={{ flex: 1 }}>
                🗒️ {t('summaryTitle')}
              </Txt>
            </Row>
            {pack.summary.map((line, i) => (
              <Txt key={i} testID="summary-line">
                • {line}
              </Txt>
            ))}
            <Txt variant="small" color={C.mint} bold>
              ✓ {t('summarySaved')}
            </Txt>
          </Card>
          {sources.length ? (
            <Card>
              <Txt variant="small" bold>
                🔎 {t('sourcesTitle')}
              </Txt>
              {sources.map((s, i) => (
                <Txt key={i} variant="small" testID="source-title">
                  • {s.title}
                </Txt>
              ))}
            </Card>
          ) : null}
          <Btn
            title={phase === 'resummary' ? t('retest') : t('testStart')}
            big
            icon="📝"
            testID="to-test"
            onPress={() => (phase === 'resummary' ? startTest() : setPhase('testIntro'))}
          />
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'testIntro' ? (
        <View style={{ alignItems: 'center', gap: S.lg }}>
          <Mascot size={130} mood="cheer" />
          <Txt variant="title" center>
            {t('testTitle')}
          </Txt>
          <Txt variant="big" center>
            {timed ? t('testIntroTimed') : t('testIntro')}
          </Txt>
          {timed && progress.bestTestSeconds[key] !== undefined ? (
            <Txt center>🏅 {t('bestTime', { s: progress.bestTestSeconds[key] })}</Txt>
          ) : null}
          <Btn title={t('testStart')} big style={{ alignSelf: 'stretch' }} onPress={startTest} testID="test-start" />
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'test' && testQs[testIdx] ? (
        <View style={{ gap: S.md }}>
          <Row>
            <Txt variant="h2" style={{ flex: 1 }}>
              📝 {t('questionOf', { n: testIdx + 1, m: testQs.length })}
            </Txt>
            {timed ? (
              <Txt bold testID="test-timer">
                ⏱️ {t('timeNow', { s: Math.max(0, Math.round((now - startedAt) / 1000)) })}
              </Txt>
            ) : null}
          </Row>
          {/* Grades 1-3: a friendly filling bar and no clock at all. */}
          <ProgressBar value={testIdx / testQs.length} color={C.mint} height={young ? 24 : 14} label={t('questionOf', { n: testIdx + 1, m: testQs.length })} />
          <Card tone="primary">
            <Txt variant="big" testID="question-text">
              {testQs[testIdx].q}
            </Txt>
          </Card>
          {testQs[testIdx].choices.map((c, i) => (
            <Choice key={`${testQs[testIdx].id}-${i}`} testID={`choice-${i}`} label={c} big={young} onPress={() => answerTest(i)} />
          ))}
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'result' && lastResult ? (
        lastResult.passed ? (
          <View style={{ alignItems: 'center', gap: S.lg }} testID="result-pass">
            <Mascot size={160} mood="cheer" />
            <Txt variant="title" center>
              🎉 {t('learned')}
            </Txt>
            <Txt variant="big" center>
              {t('passedText', { score: lastResult.score, total: lastResult.total })}
            </Txt>
            <Txt variant="h2" center color="#9A6B00">
              ⭐ {t('starsEarned', { n: lastResult.score + 2 })}
            </Txt>
            {lastResult.record ? <Txt center>🏅 {t('newRecord')}</Txt> : null}
            <Btn title={t('backHome')} big style={{ alignSelf: 'stretch' }} onPress={goHome} testID="back-home" />
          </View>
        ) : (
          <View style={{ alignItems: 'center', gap: S.lg }} testID="result-fail">
            <Mascot size={140} mood="calm" />
            <Txt variant="title" center>
              💪 {t('failTitle')}
            </Txt>
            <Txt variant="big" center>
              {t('failText', { score: lastResult.score, total: lastResult.total })}
            </Txt>
            <Btn title={t('seeSummary')} big style={{ alignSelf: 'stretch' }} onPress={() => setPhase('resummary')} testID="see-summary" />
          </View>
        )
      ) : null}

      {!settings.paused && phase === 'limit' ? (
        <View style={{ alignItems: 'center', gap: S.lg }} testID="result-limit">
          <Mascot size={140} mood="calm" />
          {lastResult ? (
            <Txt variant="big" center>
              {t('passedText', { score: lastResult.score, total: lastResult.total })}
            </Txt>
          ) : null}
          <Card tone="lilac">
            <Txt variant="big" center>
              {t('maxRetries')}
            </Txt>
          </Card>
          <Btn title={t('backHome')} big style={{ alignSelf: 'stretch' }} onPress={goHome} testID="back-home" />
        </View>
      ) : null}
    </Screen>
  );
}
