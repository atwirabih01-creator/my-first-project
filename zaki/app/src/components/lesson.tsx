// Lesson building blocks shared by the lesson loop and practice screens.
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { C, R, S } from '@/constants/theme';
import { askTutor, checkAnswer, reportSafety, type ChatTurn, type FeedbackKey } from '@/lib/api';
import { localSafetyCheck } from '@/lib/localSafety';
import { keywordScan } from '../../server/keywordScan';
import { useChild, useT } from '@/lib/store';
import type { LessonPack, Question } from '@/lib/types';
import { Mascot } from './Mascot';
import { ReadAloud } from './ReadAloud';
import { Btn, Card, Row, Txt } from './ui';

export function goToSafety(kind: string) {
  router.push({ pathname: '/safety', params: { kind } });
}

/** Short excerpt for the safety reviewer: numbers and emails removed, max 160 characters. */
export function scrubExcerpt(text: string): string {
  return text
    .replace(/[^\s@]+@[^\s@]+/g, '[email]')
    .replace(/\d[\d\s-]{4,}\d/g, '[number]')
    .replace(/\s+/g, ' ')
    .slice(0, 160);
}

/**
 * Routing rule (safety review R3/R4): someone at home involved, or a harm disclosure where it
 * is UNCLEAR who is involved -> reviewer only. Clearly outside the home (stranger, online,
 * school) -> parent is told too. Self-harm/fear with nobody at home named -> parent too.
 */
export function flagRouteFor(kind: string, text: string): { route: 'reviewer' | 'parent'; involvement: 'home' | 'outside' | 'unclear' } {
  let home = false;
  let outside = false;
  try {
    const s = keywordScan(text);
    home = s.home;
    outside = s.outside;
  } catch {
    // treat as unclear
  }
  const involvement = home ? 'home' : outside ? 'outside' : 'unclear';
  if (kind === 'general' || home) return { route: 'reviewer', involvement };
  if (kind === 'home') return { route: outside ? 'parent' : 'reviewer', involvement };
  return { route: 'parent', involvement };
}

/** Big tappable answer choice. */
export function Choice({
  label,
  onPress,
  state,
  big,
  testID,
}: {
  label: string;
  onPress: () => void;
  state?: 'idle' | 'wrong' | 'right';
  big?: boolean;
  testID?: string;
}) {
  const { dyslexia } = useT();
  const bg = state === 'wrong' ? C.wrongSoft : state === 'right' ? C.mintSoft : C.card;
  const border = state === 'wrong' ? '#F2B57A' : state === 'right' ? C.mint : C.border;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: state === 'right' }}
      style={({ pressed }) => [
        styles.choice,
        { backgroundColor: bg, borderColor: border, minHeight: big ? 72 : 60 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}>
      <Text
        style={[
          { fontSize: big ? 26 : 20, fontWeight: '700', color: state === 'wrong' ? '#9A6B3D' : C.text, textAlign: 'center' },
          state === 'wrong' && { textDecorationLine: 'line-through' },
          dyslexia && { letterSpacing: 0.6 },
        ]}>
        {state === 'right' ? '✓ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * One check question with the hint ladder:
 * wrong -> hint1 -> hint2 -> similar example -> retry. The answer is never revealed.
 */
export function QuestionWithHints({
  pack,
  question,
  onDone,
  onWrong,
  nextLabel,
}: {
  pack: LessonPack;
  question: Question;
  onDone: () => void;
  onWrong?: () => void;
  nextLabel?: string;
}) {
  const { t } = useT();
  const { child } = useChild();
  const young = (child?.grade ?? 3) <= 3;
  const [wrong, setWrong] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<FeedbackKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function tap(i: number) {
    if (busy || feedback === 'right') return;
    setBusy(true);
    const res = await checkAnswer(pack, question, i, wrong.length);
    setBusy(false);
    if (res.correct) {
      setFeedback('right');
    } else {
      setWrong((w) => [...w, i]);
      setFeedback(res.feedbackKey);
      onWrong?.();
    }
  }

  // Only the most recent wrong tap is marked, so the child can't finish by elimination
  // and always reaches hint1 -> hint2 -> similar example first.
  const lastWrong = feedback !== 'right' ? wrong[wrong.length - 1] : undefined;

  return (
    <View style={{ gap: S.md }}>
      <Card tone="primary">
        <Txt variant="big" testID="question-text">
          {question.q}
        </Txt>
      </Card>
      <ReadAloud text={[question.q, ...question.choices].join('. ')} />
      <View style={{ gap: S.sm }}>
        {question.choices.map((c, i) => (
          <Choice
            key={`${question.id}-${i}`}
            testID={`choice-${i}`}
            label={c}
            big={young}
            state={feedback === 'right' && i === question.answerIndex ? 'right' : i === lastWrong ? 'wrong' : 'idle'}
            onPress={() => tap(i)}
          />
        ))}
      </View>
      {feedback === 'right' ? (
        <Card tone="mint">
          <Row>
            <Mascot size={56} mood="cheer" />
            <Txt variant="big" style={{ flex: 1 }} testID="feedback-right">
              {t('right')}
            </Txt>
          </Row>
          <Btn title={nextLabel ?? t('next')} onPress={onDone} big testID="next-btn" />
        </Card>
      ) : feedback ? (
        <Card tone="sun" style={{ gap: S.sm }}>
          <Row style={{ alignItems: 'flex-start' }}>
            <Mascot size={48} mood="thinking" animate={false} />
            <View style={{ flex: 1, gap: 4 }} testID="feedback-hint">
              {feedback === 'example' ? (
                <>
                  <Txt bold>💡 {t('similarExample')}</Txt>
                  <Txt>{question.similarExample}</Txt>
                  <Txt bold>{t('tryAgainNow')}</Txt>
                </>
              ) : (
                <>
                  <Txt bold>💡 {t('hint')}</Txt>
                  <Txt>{feedback === 'hint1' ? question.hint1 : question.hint2}</Txt>
                </>
              )}
            </View>
          </Row>
        </Card>
      ) : null}
    </View>
  );
}

/** Make sure no AI reply ever shows something that looks like a phone number or a link. */
function sanitizeReply(text: string, lang: 'en' | 'ar'): string {
  if (/(\d[\d\s-]{5,}\d)|(https?:\/\/)|(www\.)/i.test(text)) {
    return lang === 'ar' ? 'هيّا نعود إلى درسنا.' : "Let's get back to our lesson.";
  }
  return text;
}

/** "Ask Zaki" free chat box. Local safety words are checked before anything is sent. */
export function AskZaki({ pack, step = 'chat' }: { pack: LessonPack | null; step?: 'recap' | 'teach' | 'check' | 'chat' }) {
  const { t, lang } = useT();
  const { child, settings, app } = useChild();
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    const message = text.trim();
    if (!message || busy || !child) return;
    const kind = localSafetyCheck(message);
    if (kind) {
      setText('');
      // Kept on this device for the safety reviewer (demo/offline). Reviewer-route flags are never shown to parents.
      app.addLocalFlag({ category: kind, ...flagRouteFor(kind, message), childRef: child.id, excerpt: scrubExcerpt(message) });
      reportSafety({ kind, message, childRef: child.id, lang, country: settings.country });
      goToSafety(kind);
      return;
    }
    setHistory((h) => [...h, { role: 'child', text: message }]);
    setText('');
    setBusy(true);
    let res: Awaited<ReturnType<typeof askTutor>>;
    try {
      res = await askTutor({
        childRef: child.id,
        grade: child.grade,
        lang,
        country: settings.country,
        pack,
        step,
        history,
        message,
      });
    } catch {
      setBusy(false);
      return; // e.g. consent withdrawn: no AI call is made
    }
    setBusy(false);
    if (res.safetyStopped) {
      app.addLocalFlag({ category: 'server', ...flagRouteFor('home', message), childRef: child.id, excerpt: scrubExcerpt(message) });
      return;
    }
    setHistory((h) => [...h, { role: 'zaki', text: sanitizeReply(res.reply, lang) }]);
  }

  return (
    <Card style={{ gap: S.md }}>
      <Row>
        <Mascot size={44} mood={busy ? 'thinking' : 'happy'} />
        <Txt variant="h2">{t('askTitle')}</Txt>
      </Row>
      <Row style={{ width: '100%' }}>
        <TextInput
          testID="chat-input"
          value={text}
          onChangeText={setText}
          placeholder={t('askPlaceholder')}
          placeholderTextColor="#8893AA"
          onSubmitEditing={send}
          editable={!busy}
          returnKeyType="send"
          accessibilityLabel={t('askPlaceholder')}
          maxLength={300}
          style={[styles.input, { textAlign: lang === 'ar' ? 'right' : 'left', writingDirection: lang === 'ar' ? 'rtl' : 'ltr' }]}
        />
        <Btn title={t('send')} onPress={send} disabled={busy || !text.trim()} testID="chat-send" style={{ flexShrink: 0, paddingHorizontal: S.md }} />
      </Row>
      <View style={{ gap: S.sm }} testID="chat-log">
        {/* Newest first, right under the typing box: a young child never has to scroll to find Zaki's answer. */}
        {busy ? <Txt variant="small">{t('thinking')}</Txt> : null}
        {[...history].reverse().map((m, i) => (
          <View
            key={history.length - i}
            style={[
              styles.bubble,
              m.role === 'child'
                ? { alignSelf: 'flex-end', backgroundColor: C.primarySoft }
                : { alignSelf: 'flex-start', backgroundColor: C.mintSoft },
            ]}>
            <Txt>{m.text}</Txt>
            {m.role === 'zaki' && i === 0 ? <ReadAloud text={m.text} testID="read-reply" /> : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

/** "I need help" (big) + "Report this answer" (small), shown on lesson screens. */
export function LessonHelpBar({ lessonKey, context }: { lessonKey?: string; context?: string }) {
  const { t } = useT();
  const { child, app } = useChild();
  const [reported, setReported] = useState(false);
  return (
    <View style={{ gap: S.sm }}>
      <Btn title={t('needHelp')} icon="🆘" variant="help" big onPress={() => router.push('/help')} testID="need-help" />
      <Pressable
        testID="report-answer"
        accessibilityRole="button"
        accessibilityLabel={t('report')}
        onPress={() => {
          if (child && !reported) app.addReport(child.id, context ?? '', lessonKey);
          setReported(true);
        }}
        style={{ alignSelf: 'center', padding: S.sm, minHeight: 44, justifyContent: 'center' }}>
        <Txt variant="small" center color={reported ? C.mint : C.textSoft}>
          {reported ? `✓ ${t('reported')}` : `🚩 ${t('report')}`}
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  choice: {
    borderRadius: R.lg,
    borderWidth: 2,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { maxWidth: '85%', flexShrink: 1, minWidth: 0, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: S.sm },
  input: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // lets the box shrink on narrow phones so Send always fits
    width: '100%',
    minHeight: 52,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: S.md,
    fontSize: 18,
    color: C.text,
  },
});

/** "Leave the test?" box. "I need help" is always inside it too (never blocked). */
export function LeaveTestModal({ visible, onStay, onLeave }: { visible: boolean; onStay: () => void; onLeave: () => void }) {
  const { t } = useT();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onStay}>
      <View style={{ flex: 1, backgroundColor: 'rgba(30,58,76,0.45)', alignItems: 'center', justifyContent: 'center', padding: S.lg }}>
        <Card style={{ width: '100%', maxWidth: 420, gap: S.md }}>
          <Txt variant="h2" center testID="leave-title">
            {t('leaveTitle')}
          </Txt>
          <Txt center>{t('leaveText')}</Txt>
          <Btn title={t('stay')} big onPress={onStay} testID="leave-stay" />
          <Btn title={t('leave')} variant="secondary" onPress={onLeave} testID="leave-go" />
          <Btn
            title={t('needHelp')}
            icon="🆘"
            variant="help"
            big
            onPress={() => {
              onStay();
              router.push('/help');
            }}
            testID="leave-need-help"
          />
        </Card>
      </View>
    </Modal>
  );
}
