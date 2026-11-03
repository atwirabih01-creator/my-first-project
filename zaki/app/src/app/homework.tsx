// HOMEWORK HELP (child): pick a subject (the child's grade only) -> type the homework question
// (up to 1000 letters) -> chat with Zaki. Zaki helps the child think, one small step at a time,
// and never gives the final answer (server/homework.ts). The whole chat so far is sent each turn.
// Safety: worrying words open the safety screen (phone check first, then the server) and the
// chat stops. Today's limit: Zaki's friendly "let's rest" message, and the chat stops.
// No photos from the child side.
// HOMEWORK FROM THE GROWN-UP (route param taskId): the grown-up took up to 3 photos in the
// parent area. The chat starts straight away with the photos as small thumbnails on top; the
// photos and the grown-up's note are sent with EVERY turn (the server keeps nothing between
// turns). "I finished" removes the task and deletes its photos.
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Burst, PopIn } from '@/components/Celebrate';
import { Mascot } from '@/components/Mascot';
import { ReadAloud } from '@/components/ReadAloud';
import { Screen } from '@/components/Screen';
import { SubjectBadge, SubjectPicker } from '@/components/SubjectPicker';
import { flagRouteFor, goToSafety, recordQuietFlag, sanitizeReply, scrubExcerpt } from '@/components/lesson';
import { Bubble, Btn, Card, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { askHomework, ConsentRequiredError, reportSafety, type ChatTurn } from '@/lib/api';
import { loadPhoto, type Photo } from '@/lib/homeworkPhotos';
import { localSafetyCheck } from '@/lib/localSafety';
import { goTo, useHelpReturn } from '@/lib/nav';
import { useChild, useT } from '@/lib/store';
import { subjectInfo } from '@/lib/subjects';
import type { Subject } from '@/lib/types';

const MAX_QUESTION = 1000;
const MAX_REPLY = 300;
const MAX_HISTORY = 40; // the server takes at most 50 turns

export default function Homework() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { child, settings, app, homework } = useChild();
  const { t, lang, align, rtl } = useT();
  // Homework photos from the grown-up (null = normal homework help, the child types the question).
  const task = taskId ? (homework.find((x) => x.id === taskId) ?? null) : null;
  const taskMode = !!taskId;
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [bigPhoto, setBigPhoto] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const startedRef = useRef(false);
  const [picked, setSubject] = useState<Subject | null>(null);
  const subject: Subject | null = task ? task.subject : picked;
  const [typedQuestion, setQuestion] = useState('');
  const question = taskMode ? t('hwTaskQuestion') : typedQuestion;
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [stopped, setStopped] = useState<'safety' | 'limit' | 'consent' | null>(null);
  const [limitMsg, setLimitMsg] = useState('');
  const endRef = useRef<ComponentRef<typeof View>>(null);
  useHelpReturn(taskId ? { pathname: '/homework', params: { taskId } } : '/homework');


  // Keep the newest message (or "Zaki is thinking") in view.
  useEffect(() => {
    if (Platform.OS !== 'web' || !started) return;
    const el = endRef.current as unknown as { scrollIntoView?: (o: object) => void } | null;
    const id = setTimeout(() => el?.scrollIntoView?.({ behavior: 'smooth', block: 'end' }), 60);
    return () => clearTimeout(id);
  }, [history.length, busy, started, stopped]);

  const inputDir = { textAlign: align, writingDirection: rtl ? 'rtl' : 'ltr' } as const;

  /** Phone's own safety word check (works offline). True = the safety screen was opened. */
  function safetyStop(words: string): boolean {
    if (!child) return false;
    const kind = localSafetyCheck(words);
    if (!kind) return false;
    app.addLocalFlag({ category: kind, ...flagRouteFor(kind, words), childRef: child.id, excerpt: scrubExcerpt(words) });
    reportSafety({ kind, message: words, childRef: child.id, lang, country: settings.country });
    setStopped('safety');
    goToSafety(kind);
    return true;
  }

  async function turn(message: string | undefined, prior: ChatTurn[], images: Photo[] | null = photos) {
    if (!child || !subject) return;
    setBusy(true);
    let res: Awaited<ReturnType<typeof askHomework>>;
    try {
      res = await askHomework({
        childRef: child.id,
        grade: child.grade,
        age: child.age,
        lang,
        country: settings.country,
        subject,
        question: question.trim().slice(0, MAX_QUESTION),
        message,
        history: prior.slice(-MAX_HISTORY),
        // Grown-up homework: the photos + note travel with every turn (the server is stateless).
        pageImages: images?.length ? images.map((p) => p.base64) : undefined,
        parentNote: task?.note,
      });
    } catch (e) {
      setBusy(false);
      if (e instanceof ConsentRequiredError) setStopped('consent');
      return;
    }
    setBusy(false);
    if (res.safetyStopped) {
      // The server's safety check stopped it: the safety screen is already open.
      if (res.flag) recordQuietFlag(app, child.id, res.flag, message ?? question);
      else app.addLocalFlag({ category: 'server', ...flagRouteFor('home', message ?? question), childRef: child.id, excerpt: scrubExcerpt(message ?? question) });
      setStopped('safety');
      return;
    }
    if (res.budgetReached) {
      // Today's limit (per child, or the whole server): Zaki's fixed, friendly message.
      setLimitMsg(res.reply);
      setStopped('limit');
      return;
    }
    // Quietly flagged (e.g. a sensitive topic): the child only sees Zaki's calm reply.
    if (res.flag) recordQuietFlag(app, child.id, res.flag, message ?? question);
    setHistory((h) => [...h, { role: 'zaki', text: sanitizeReply(res.reply, lang) }]);
  }

  function finish() {
    if (!child || !task) return;
    app.removeHomeworkTask(child.id, task.id); // the task and its photos are deleted
    setFinished(true);
  }

  function begin() {
    const q = question.trim();
    if (q.length < 2 || busy) return;
    if (safetyStop(q)) {
      setQuestion('');
      return;
    }
    setStarted(true);
    setHistory([]);
    void turn(undefined, []);
  }

  function send() {
    const msg = text.trim().slice(0, MAX_REPLY);
    if (!msg || busy || stopped) return;
    setText('');
    if (safetyStop(msg)) return;
    const prior = history;
    setHistory([...prior, { role: 'child', text: msg }]);
    void turn(msg, prior);
  }

  function reset() {
    setStarted(false);
    setHistory([]);
    setQuestion('');
    setText('');
    setStopped(null);
    setLimitMsg('');
  }

  // Load the grown-up's photos (kept on this device), then Zaki starts helping straight away.
  const taskRefs = task?.photos.join('|') ?? '';
  useEffect(() => {
    if (!taskRefs) return;
    let alive = true;
    Promise.all(taskRefs.split('|').map(loadPhoto)).then((list) => {
      if (!alive || startedRef.current) return;
      const ok = list.filter((p): p is Photo => !!p);
      startedRef.current = true;
      setPhotos(ok);
      setStarted(true);
      void turn(undefined, [], ok);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskRefs]);

  if (!child) return <Redirect href="/" />;

  const info = subject ? subjectInfo(subject) : null;
  const canReply = started && !stopped && !finished;

  return (
    <Screen
      child
      trackTime
      back={taskMode ? '/home' : started ? reset : subject ? () => setSubject(null) : '/home'}
      title={`✏️ ${t('hwTitle')}`}
      footer={
        canReply ? (
          <Row style={{ width: '100%' }}>
            <TextInput
              testID="hw-input"
              value={text}
              onChangeText={setText}
              placeholder={t('hwReplyPh')}
              placeholderTextColor="#8893AA"
              onSubmitEditing={send}
              editable={!busy}
              returnKeyType="send"
              accessibilityLabel={t('hwReplyPh')}
              maxLength={MAX_REPLY}
              style={[styles.input, inputDir]}
            />
            <Btn title={t('send')} onPress={send} disabled={busy || !text.trim()} testID="hw-send" style={{ flexShrink: 0, paddingHorizontal: S.md }} />
          </Row>
        ) : undefined
      }>
      {taskMode && finished ? (
        <View style={{ gap: S.md }}>
          <Card tone="mint" style={{ alignItems: 'center', gap: S.md, overflow: 'hidden' }} testID="hw-finished-card">
            <Burst big />
            <PopIn bounce>
              <Mascot size={130} mood="cheer" action="hop" />
            </PopIn>
            <Txt variant="title" center>
              {t('hwFinishedTitle')}
            </Txt>
            <Txt variant="big" center>
              {t('hwFinishedText')}
            </Txt>
          </Card>
          <Btn title={t('backHome')} icon="🏠" big onPress={() => goTo('/home')} testID="hw-finished-home" />
        </View>
      ) : taskMode && !task ? (
        <Card tone="lilac" style={{ alignItems: 'center' }} testID="hw-task-gone">
          <Mascot size={90} mood="calm" />
          <Txt center>{t('hwTaskGone')}</Txt>
          <Btn title={t('backHome')} onPress={() => goTo('/home')} />
        </Card>
      ) : taskMode && !started ? (
        <View style={{ alignItems: 'center', gap: S.lg, paddingTop: S.xl }} testID="hw-photos-loading">
          <Mascot size={140} mood="thinking" />
          <Txt variant="h2" center>
            {t('hwPhotosLoading')}
          </Txt>
        </View>
      ) : !subject ? (
        <>
          <Row style={{ alignItems: 'center' }}>
            <Mascot size={84} action="wave" />
            <Bubble style={{ flex: 1 }}>
              <Txt bold>{t('hwNote')}</Txt>
            </Bubble>
          </Row>
          <Card style={{ gap: S.md }}>
            <Txt variant="h2">{t('hwPickSubject')}</Txt>
            <SubjectPicker grade={child.grade} onPick={setSubject} />
          </Card>
        </>
      ) : !started ? (
        <>
          {info ? <SubjectBadge info={info} /> : null}
          <Card style={{ gap: S.sm }}>
            <Txt variant="h2">{t('hwTypeQ')}</Txt>
            <TextInput
              testID="hw-question-input"
              value={question}
              onChangeText={(v) => setQuestion(v.slice(0, MAX_QUESTION))}
              placeholder={t('hwTypePh')}
              placeholderTextColor="#8893AA"
              accessibilityLabel={t('hwTypeQ')}
              multiline
              maxLength={MAX_QUESTION}
              style={[styles.input, styles.multi, inputDir]}
            />
            <Txt variant="small">
              {question.length} / {MAX_QUESTION}
            </Txt>
          </Card>
          <Card tone="sun">
            <Txt bold testID="hw-note">
              {t('hwNote')}
            </Txt>
          </Card>
          <Btn title={t('hwStart')} icon="🦉" big disabled={question.trim().length < 2} onPress={begin} testID="hw-start" />
        </>
      ) : (
        <>
          {!task ? (
            <Card tone="sun">
              <Txt bold testID="hw-note">
                {t('hwNote')}
              </Txt>
            </Card>
          ) : null}
          {task ? (
            <Card tone="primary" style={{ gap: S.sm }} testID="hw-task-top">
              <Txt variant="small" bold>
                {info ? `${info.icon} ${t(info.key)} · ` : ''}📸 {t('hwFromGrownUp')}
              </Txt>
              <Row wrap>
                {(photos ?? []).map((p, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setBigPhoto(i)}
                    accessibilityRole="imagebutton"
                    accessibilityLabel={t('hwThumbA11y', { n: i + 1 })}
                    testID="hw-thumb"
                    style={({ pressed }) => [styles.thumbWrap, pressed && { transform: [{ scale: 0.96 }] }]}>
                    <Image source={{ uri: p.uri }} style={styles.thumb} />
                  </Pressable>
                ))}
              </Row>
              {task.note ? (
                <Txt testID="hw-parent-note">
                  📝 {t('hwGrownUpNote', { note: task.note })}
                </Txt>
              ) : null}
            </Card>
          ) : null}
          {task ? (
            <Card tone="sun">
              <Txt bold testID="hw-note">
                {t('hwNote')}
              </Txt>
            </Card>
          ) : (
            <Card tone="primary" style={{ gap: S.xs }}>
              <Row wrap style={{ justifyContent: 'space-between' }}>
                <Txt variant="small" bold>
                  {info ? `${info.icon} ${t(info.key)} · ` : ''}
                  {t('hwYourQ')}
                </Txt>
              </Row>
              <Txt testID="hw-question">{question}</Txt>
            </Card>
          )}
          <Modal visible={bigPhoto !== null} transparent animationType="fade" onRequestClose={() => setBigPhoto(null)}>
            <Pressable style={styles.photoBackdrop} onPress={() => setBigPhoto(null)} accessibilityRole="button" accessibilityLabel={t('close')} testID="hw-photo-close">
              {bigPhoto !== null && photos?.[bigPhoto] ? <Image source={{ uri: photos[bigPhoto].uri }} style={styles.bigPhoto} resizeMode="contain" testID="hw-photo-big" /> : null}
              <View style={styles.closePill}>
                <Txt bold color="#FFFFFF">
                  ✕ {t('close')}
                </Txt>
              </View>
            </Pressable>
          </Modal>

          <View style={{ gap: S.md }} testID="hw-chat">
            {history.map((m, i) =>
              m.role === 'zaki' ? (
                <Row key={i} style={styles.zakiRow} testID="hw-zaki">
                  <Mascot size={44} animate={i === history.length - 1} mood="happy" />
                  <View style={[styles.bubble, styles.zakiBubble]}>
                    <Txt testID="hw-zaki-text">{m.text}</Txt>
                    <ReadAloud text={m.text} testID="hw-read-aloud" />
                  </View>
                </Row>
              ) : (
                <View key={i} style={[styles.bubble, styles.childBubble]} testID="hw-child" accessibilityLabel={`${t('hwYou')}: ${m.text}`}>
                  <Txt>{m.text}</Txt>
                </View>
              ),
            )}
            {busy ? (
              <Row style={styles.zakiRow} testID="hw-thinking">
                <Mascot size={44} mood="thinking" />
                <View style={[styles.bubble, styles.zakiBubble]}>
                  <Txt variant="small" bold>
                    {t('thinking')}
                  </Txt>
                </View>
              </Row>
            ) : null}
          </View>

          {stopped === 'limit' ? (
            <Card tone="sun" style={{ alignItems: 'center' }} testID="hw-limit">
              <Mascot size={90} mood="calm" />
              <Txt variant="h2" center>
                {t('hwLimitTitle')}
              </Txt>
              <Txt center>{limitMsg || t('hwLimitText')}</Txt>
              <Btn title={`🃏 ${t('flashcards')}`} onPress={() => goTo('/flashcards')} testID="hw-to-flashcards" />
              <Btn title={t('backHome')} variant="secondary" onPress={() => goTo('/home')} />
            </Card>
          ) : null}
          {stopped === 'safety' ? (
            <Card tone="lilac" style={{ alignItems: 'center' }} testID="hw-stopped">
              <Mascot size={80} mood="calm" />
              <Txt center>{t('hwStopped')}</Txt>
              <Btn title={t('backHome')} onPress={() => goTo('/home')} />
            </Card>
          ) : null}
          {stopped === 'consent' ? (
            <Card tone="sun" testID="hw-consent">
              <Txt variant="h2" center>
                {t('consentNeededTitle')}
              </Txt>
              <Txt center>{t('consentNeededText')}</Txt>
            </Card>
          ) : null}
          {task && !busy ? <Btn title={t('hwFinished')} icon="✅" big variant="success" onPress={finish} testID="hw-finished" /> : null}
          {!busy && !taskMode ? <Btn title={t('hwNewQ')} icon="📝" variant="secondary" small onPress={reset} testID="hw-new" /> : null}
          <View ref={endRef} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Zaki on the start side with the owl, the child on the end side (flips in Arabic).
  zakiRow: { alignItems: 'flex-end', alignSelf: 'flex-start', maxWidth: '94%', minWidth: 0 },
  bubble: { flexShrink: 1, minWidth: 0, borderRadius: R.lg, paddingHorizontal: S.md, paddingVertical: S.sm, gap: S.sm, borderWidth: 2 },
  zakiBubble: { backgroundColor: C.mintSoft, borderColor: '#BFE3CD', borderBottomStartRadius: 6 },
  childBubble: { alignSelf: 'flex-end', maxWidth: '85%', backgroundColor: C.primarySoft, borderColor: '#A9DDE2', borderBottomEndRadius: 6 },
  input: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // lets the box shrink on narrow phones so Send always fits
    minHeight: 52,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: S.md,
    fontSize: 18,
    color: C.text,
  },
  multi: { flex: 0, minHeight: 140, paddingTop: S.sm, textAlignVertical: 'top' },
  thumbWrap: { borderRadius: R.sm, borderWidth: 2, borderColor: C.primary, overflow: 'hidden', backgroundColor: C.card },
  thumb: { width: 64, height: 84 },
  photoBackdrop: { flex: 1, backgroundColor: 'rgba(30,58,76,0.85)', alignItems: 'center', justifyContent: 'center', padding: S.md, gap: S.md },
  bigPhoto: { width: '100%', height: '80%' },
  closePill: { backgroundColor: C.primary, borderRadius: R.pill, paddingHorizontal: S.lg, paddingVertical: S.sm },
});
