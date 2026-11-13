// LESSON LOOP: loading -> intro -> teach (the full explanation, step by step) -> check questions
// (hints / similar example where the child is stuck) -> ask Zaki -> summary -> test
// -> pass ("Learned!") or fail (summary again -> retest from retestPool, max 2 retries a day).
// Teaching always comes FIRST: no questions before the lesson is explained. (Packs may still
// contain "recap" warm-up questions; they are kept in the data but not shown in the flow.)
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { Burst, PopIn } from '@/components/Celebrate';
import { TryItCard } from '@/components/TryIt';
import { LessonVisual, useVisualLabel } from '@/components/visuals/LessonVisual';
import { Mascot } from '@/components/Mascot';
import { ReadAloud } from '@/components/ReadAloud';
import { Screen } from '@/components/Screen';
import { AskZaki, Choice, LessonHelpBar, QuestionWithHints, recordQuietFlag } from '@/components/lesson';
import { Btn, Card, ProgressBar, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { fetchLessonPack, MIN_PACK_VERSION, schoolOf } from '@/lib/api';
import { clearInProgress, loadInProgress, saveInProgress } from '@/lib/inProgress';
import { accessForKey } from '@/lib/unlock';
import { shuffleChoices } from '../../server/shuffle';
import { goTo, useHelpReturn } from '@/lib/nav';
import { consentActive, lessonKeyOf, MAX_TESTS_PER_DAY, todayStr, useChild, useT } from '@/lib/store';
import { subjectInfo } from '@/lib/subjects';
import type { CachedPack, Question, Subject, TeachStep } from '@/lib/types';
import { cleanTryIt } from '@/lib/visuals';

type Phase =
  | 'loading'
  | 'error'
  | 'intro'
  | 'teach'
  | 'check'
  | 'ask'
  | 'summary'
  | 'testIntro'
  | 'test'
  | 'result'
  | 'resummary'
  | 'limit'
  | 'notReady'
  | 'blocked';

const TEST_SIZE = 5;
const nowMs = () => Date.now();
const PASS_RATIO = 0.8;

export default function Lesson() {
  const params = useLocalSearchParams<{ subject?: string; topic?: string; mode?: string }>();
  const subject = (params.subject ?? 'math') as Subject;
  const topic = params.topic ?? '';
  const key = lessonKeyOf(subject, topic);
  const { child, settings, progress, packs, plan, app } = useChild();
  const { t, rtl } = useT();

  // Resume an unfinished test (e.g. after leaving the app) at the same question.
  const progressKey = `test:${child?.id}:${key}`;
  type SavedTest = { testQs: Question[]; testIdx: number; correct: number; startedAt: number };
  const [savedTest] = useState(() => (packs[key] ? loadInProgress<SavedTest>(progressKey) : null));
  // A lesson saved under OLDER lesson rules is re-made once (fresh pack) if the child has not
  // passed it yet. Passed lessons keep their pack so scores and history stay consistent.
  // Photo lessons are never re-made (the photos are not kept); nor is a test in progress.
  const [stale] = useState(() => {
    const old = packs[key];
    if (!old || savedTest || old.fromPhotos) return null;
    const passed = (progress.lessons[key]?.passDates.length ?? 0) > 0 || progress.tests.some((x) => x.lessonKey === key && x.passed);
    const outdated = (old.packVersion ?? 1) < MIN_PACK_VERSION && (old.refreshedFor ?? 0) < MIN_PACK_VERSION;
    return outdated && !passed ? old : null;
  });
  const [cp, setCp] = useState<CachedPack | null>(stale ? null : (packs[key] ?? null));
  const startPhase: Phase = savedTest ? 'test' : params.mode === 'test' ? 'testIntro' : params.mode === 'review' ? 'teach' : 'intro';
  const [phase, setPhase] = useState<Phase>(packs[key] && !stale ? startPhase : 'loading');
  const [idx, setIdx] = useState(0);
  const [reload, setReload] = useState(0);
  const [askLeave, setAskLeave] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);

  // Test state
  const [testQs, setTestQs] = useState<Question[]>(savedTest?.testQs ?? []);
  const [testIdx, setTestIdx] = useState(savedTest?.testIdx ?? 0);
  const [correct, setCorrect] = useState(savedTest?.correct ?? 0);
  const [startedAt, setStartedAt] = useState(savedTest?.startedAt ?? 0);
  const [now, setNow] = useState(savedTest?.startedAt ?? 0);

  useEffect(() => {
    if (phase === 'test') saveInProgress(progressKey, { testQs, testIdx, correct, startedAt });
  }, [phase, testQs, testIdx, correct, startedAt, progressKey]);
  const [lastResult, setLastResult] = useState<{ score: number; total: number; passed: boolean; seconds: number; record: boolean } | null>(null);

  const childId = child?.id;
  const today = todayStr();
  const testsToday = progress.tests.filter((x) => x.lessonKey === key && x.date === today);
  const passedToday = testsToday.some((x) => x.passed);
  const young = (child?.grade ?? 3) <= 3;
  const timed = !young;
  useHelpReturn({ pathname: '/lesson', params: { subject, topic } }, phase === 'test');
  // Pass-to-unlock: a later lesson stays locked until the one before it is passed.
  const access = accessForKey(plan, progress, key);
  const noConsent = !consentActive(app.consent);
  const locked = noConsent || (!access.open && !access.pending); // a pending lesson tries to load (or says 'tomorrow')

  // Load (or reuse) the lesson pack.
  useEffect(() => {
    if (!child || cp || locked) return;
    let alive = true;
    /** Re-making an old lesson didn't work (limit, offline, error): quietly keep the old one. */
    const keepOld = () => {
      if (!stale) return false;
      setCp(stale);
      setPhase(startPhase);
      return true;
    };
    fetchLessonPack({ childRef: child.id, grade: child.grade, age: child.age, lang: child.lang, country: settings.country, ...schoolOf(child), subject, topic })
      .then((res) => {
        if (!alive) return;
        // Old lesson + limit / offline / demo sample / refused: quietly keep the old lesson.
        if (stale && (res.budgetReached || res.safetyStopped || (res.demo && !stale.demo))) {
          keepOld();
          return;
        }
        if (res.budgetReached) {
          setPhase('notReady'); // today's AI limit: the lesson is prepared tomorrow
          return;
        }
        if (res.safetyStopped) {
          // The topic didn't pass the safety check: nothing is saved. If the safety screen
          // applies it is already open; otherwise show the calm fixed reply with a Back button.
          if (res.flag) recordQuietFlag(app, child.id, res.flag, topic);
          if (res.blockedReply) {
            setBlocked(res.blockedReply);
            setPhase('blocked');
          }
          return;
        }
        const cached: CachedPack = {
          pack: res.pack,
          sources: res.sources,
          savedAt: new Date().toISOString(),
          demo: res.demo,
          packVersion: res.packVersion,
          refreshedFor: stale ? MIN_PACK_VERSION : undefined,
        };
        app.savePack(child.id, key, cached);
        setCp(cached);
        setPhase(startPhase);
      })
      .catch(() => {
        if (alive && !keepOld()) setPhase('error');
      });
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
    if (phase === 'summary' || phase === 'resummary') return pack.summary.join(' ');
    return '';
  }, [pack, phase, idx]);

  if (!child) return <Screen child>{null}</Screen>;

  const goHome = () => goTo('/home');

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
    } else if (attempt === 2 || pack.retestPool.length > TEST_SIZE) {
      const pool = pack.retestPool;
      const start = ((attempt - 2) * TEST_SIZE) % pool.length;
      qs = [...pool.slice(start), ...pool.slice(0, start)].slice(0, Math.min(TEST_SIZE, pool.length));
    } else {
      // Second retest the same day with a small pool: don't repeat the first retest.
      // Reuse the original test questions in a new order with the answers moved around.
      qs = [...pack.test].reverse().slice(0, TEST_SIZE).map((q) => shuffleChoices(q));
    }
    // Every test attempt gets a fresh answer order (retakes never look the same).
    setTestQs(qs.map((q) => shuffleChoices(q)));
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
    clearInProgress(progressKey);
    if (!passed && testsToday.length + 1 >= MAX_TESTS_PER_DAY) {
      app.markNeedsGrownUp(child!.id, key);
      setPhase('limit');
    } else {
      setPhase('result');
    }
  }

  const showHelpBar = phase !== 'loading' && phase !== 'error' && phase !== 'blocked' && !locked;
  // Demo mode: if the sample lesson isn't what the grown-up typed, show the sample's real topic.
  const norm = (x: string) => x.trim().toLowerCase();
  const sampleMismatch =
    !!cp?.demo && !!pack && norm(pack.topic) !== norm(topic) && !norm(pack.topic).includes(norm(topic)) && !norm(topic).includes(norm(pack.topic));
  const onBack = () => (phase === 'test' ? setAskLeave(true) : goHome());
  const sources = cp?.sources ?? [];
  const subj = subjectInfo(subject);

  return (
    <Screen
      child
      trackTime
      lessonKey={key}
      back={onBack}
      title={sampleMismatch && pack ? pack.topic : topic}
      footer={showHelpBar ? <LessonHelpBar lessonKey={key} context={helpContext} /> : undefined}>
      {sampleMismatch && pack ? (
        <Txt variant="small" testID="sample-note">
          🧪 {t('sampleNote', { topic: pack.topic })}
        </Txt>
      ) : null}

      {/* N5: leaving in the middle of a test asks first (in-app, no browser dialog). */}
      <Modal visible={askLeave} transparent animationType="fade" onRequestClose={() => setAskLeave(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(30,58,76,0.45)', alignItems: 'center', justifyContent: 'center', padding: S.lg }}>
          <Card style={{ width: '100%', maxWidth: 420, gap: S.md }}>
            <Txt variant="h2" center testID="leave-title">
              {t('leaveTitle')}
            </Txt>
            <Txt center>{t('leaveText')}</Txt>
            <Btn title={t('stay')} big onPress={() => setAskLeave(false)} testID="leave-stay" />
            <Btn
              title={t('leave')}
              variant="secondary"
              onPress={() => {
                setAskLeave(false);
                clearInProgress(progressKey);
                goHome();
              }}
              testID="leave-go"
            />
          </Card>
        </View>
      </Modal>

      {settings.paused ? (
        <Card tone="sun" style={{ alignItems: 'center' }}>
          <Mascot size={100} mood="calm" />
          <Txt variant="big" center>
            {t('paused')}
          </Txt>
          <Btn title={t('backHome')} onPress={goHome} />
        </Card>
      ) : null}

      {locked ? (
        <Card tone="lilac" style={{ alignItems: 'center' }}>
          <Mascot size={100} mood="calm" />
          <Txt variant="h2" center testID="locked-title">
            {noConsent ? t('consentNeededTitle') : t('lockedTitle')}
          </Txt>
          <Txt center testID="locked-msg">
            {noConsent ? t('consentNeededText') : `🔒 ${t('lockedMsg', { topic: access.blocker ?? '' })}`}
          </Txt>
          <Btn title={t('backHome')} onPress={goHome} testID="back-home" />
        </Card>
      ) : null}

      {!locked && phase === 'notReady' ? (
        <Card tone="sun" style={{ alignItems: 'center' }} testID="lesson-not-ready">
          <Mascot size={100} mood="calm" />
          <Txt variant="h2" center>
            {t('notReadyTitle')}
          </Txt>
          <Txt center>{t('notReadyText')}</Txt>
          <Btn title={t('backHome')} onPress={goHome} />
        </Card>
      ) : null}

      {!locked && phase === 'blocked' ? (
        <Card tone="lilac" style={{ alignItems: 'center' }} testID="lesson-blocked">
          <Mascot size={100} mood="calm" />
          <Txt variant="h2" center>
            {t('blockedTitle')}
          </Txt>
          <Txt center testID="blocked-reply">
            {blocked ?? t('blockedText')}
          </Txt>
          <Btn title={t('back')} icon={rtl ? '→' : '←'} onPress={goHome} testID="blocked-back" />
        </Card>
      ) : null}

      {!locked && !settings.paused && phase === 'loading' ? (
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
          <Mascot size={150} action="wave" />
          <PopIn bounce delay={150}>
            <View style={[styles.subjectBadge, { backgroundColor: subj.soft, borderColor: subj.accent }]}>
              <Txt bold>
                {subj.icon} {t(subj.key)}
              </Txt>
            </View>
          </PopIn>
          <Card tone="lilac" style={{ alignSelf: 'stretch' }}>
            <Txt variant="h2" center>
              {t('readyHi', { name: child.nickname })} 👋
            </Txt>
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
              setPhase('teach');
            }}
          />
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'teach' && pack.teachSteps[idx] ? (
        <TeachStepView
          key={idx}
          step={pack.teachSteps[idx]}
          idx={idx}
          total={pack.teachSteps.length}
          subject={subject}
          onNext={() => {
            if (idx + 1 < pack.teachSteps.length) setIdx(idx + 1);
            else {
              setIdx(0);
              setPhase(pack.checks.length ? 'check' : 'ask');
            }
          }}
          onBack={() => setIdx(idx - 1)}
        />
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
          <ReadAloud text={[testQs[testIdx].q, ...testQs[testIdx].choices].join('. ')} />
          {testQs[testIdx].choices.map((c, i) => (
            <Choice key={`${testQs[testIdx].id}-${i}`} testID={`choice-${i}`} label={c} big={young} onPress={() => answerTest(i)} />
          ))}
        </View>
      ) : null}

      {!settings.paused && pack && phase === 'result' && lastResult ? (
        lastResult.passed ? (
          <View style={{ alignItems: 'center', gap: S.lg }} testID="result-pass">
            <Mascot size={160} mood="cheer" />
            <PopIn bounce>
              <Txt variant="title" center>
                🎉 {t('learned')}
              </Txt>
            </PopIn>
            <Txt variant="big" center>
              {t('passedText', { score: lastResult.score, total: lastResult.total })}
            </Txt>
            <PopIn bounce delay={350}>
              <View style={styles.starsBadge}>
                <Txt variant="h2" center color="#7A5500">
                  ⭐ {t('starsEarned', { n: lastResult.score + 2 })}
                </Txt>
              </View>
            </PopIn>
            <Txt center>{t('lessonCheer')}</Txt>
            {lastResult.record ? <Txt center>🏅 {t('newRecord')}</Txt> : null}
            <Btn title={t('backHome')} big style={{ alignSelf: 'stretch' }} onPress={goHome} testID="back-home" />
            {/* The big celebration on top (never takes taps): confetti + stars while Zaki hops. */}
            <Burst big originY="22%" />
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

/**
 * One teach step: title + text (with the owl) -> the picture (soft card) -> example ->
 * "Try it!" (if the step has one). "I understand, next" always works; it only becomes the
 * big main button once the Try it question is answered (or when there is none).
 */
function TeachStepView({
  step,
  idx,
  total,
  subject,
  onNext,
  onBack,
}: {
  step: TeachStep;
  idx: number;
  total: number;
  subject: Subject;
  onNext: () => void;
  onBack: () => void;
}) {
  const { t } = useT();
  const subj = subjectInfo(subject);
  const tryIt = useMemo(() => cleanTryIt(step.tryIt), [step.tryIt]);
  const [tried, setTried] = useState(false);
  const visualLabel = useVisualLabel(step.visual);
  const last = idx + 1 === total;
  const nextMain = !tryIt || tried;
  return (
    <View style={{ gap: S.md }} testID="teach-step">
      <Txt variant="h2">📘 {t('teachTitle')}</Txt>
      <ProgressBar value={(idx + 1) / total} color={subj.accent} label={t('stepOf', { n: idx + 1, m: total })} />
      <Txt variant="small" bold>
        {t('stepOf', { n: idx + 1, m: total })}
      </Txt>
      <Row style={{ alignItems: 'flex-start' }}>
        <Mascot size={64} mood={tried ? 'cheer' : 'happy'} />
        <Card style={{ flex: 1, minWidth: 0, borderWidth: 2, borderColor: C.primary }}>
          {step.title?.trim() ? (
            <Txt variant="h2" bold accessibilityRole="header" testID="teach-title" color={C.primary} style={{ fontSize: 26, lineHeight: 34 }}>
              {step.title?.trim()}
            </Txt>
          ) : null}
          <Txt variant="big" testID="teach-text" style={{ fontSize: 24, lineHeight: 34 }}>
            {step.text}
          </Txt>
        </Card>
      </Row>
      <LessonVisual visual={step.visual} subject={subject} />
      {step.example ? (
        <View style={styles.example} testID="teach-example">
          <Txt bold color="#8A4B00">
            ✨ {t('forExample')}
          </Txt>
          <Txt variant="big">{step.example}</Txt>
        </View>
      ) : null}
      <ReadAloud text={[step.title, step.text, visualLabel, step.example].map((x) => x?.trim()).filter(Boolean).map((x) => (/[.!?؟]$/.test(x!) ? x : `${x}.`)).join(' ')} />
      {tryIt ? <TryItCard tryIt={tryIt} onFinished={() => setTried(true)} /> : null}
      {last ? (
        <PopIn bounce>
          <Card tone="mint">
            <Txt center>🎉 {t('teachDoneNote')}</Txt>
          </Card>
        </PopIn>
      ) : null}
      <Btn
        title={!last ? t('understoodNext') : t('teachToQuestions')}
        icon={!last ? '✅' : '✏️'}
        big={nextMain}
        variant={nextMain ? 'primary' : 'secondary'}
        testID="next-btn"
        onPress={onNext}
      />
      {/* "Explain again": go back to the step before (no new AI call). */}
      {idx > 0 ? <Btn title={t('stepBack')} icon="🔁" variant="secondary" testID="prev-btn" onPress={onBack} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // The example sits in its own warm, highlighted card so it stands out from the explanation.
  example: { backgroundColor: '#FFF1D0', borderColor: '#F0A830', borderWidth: 3, borderRadius: R.lg, padding: S.lg, gap: S.xs },
  subjectBadge: { borderRadius: R.pill, borderWidth: 2, paddingHorizontal: S.lg, paddingVertical: S.xs },
  starsBadge: { backgroundColor: C.sunSoft, borderColor: C.sun, borderWidth: 3, borderRadius: R.pill, paddingHorizontal: S.xl, paddingVertical: S.sm },
});
