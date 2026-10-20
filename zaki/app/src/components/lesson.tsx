// Lesson building blocks shared by the lesson loop and practice screens.
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { C, R, S } from '@/constants/theme';
import { askTutor, checkAnswer, type ChatTurn, type FeedbackKey } from '@/lib/api';
import { localSafetyCheck } from '@/lib/localSafety';
import { useChild, useT } from '@/lib/store';
import type { LessonPack, Question } from '@/lib/types';
import { Mascot } from './Mascot';
import { Btn, Card, Row, Txt } from './ui';

export function goToSafety(kind: string) {
  router.push({ pathname: '/safety', params: { kind } });
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
  const { child, settings } = useChild();
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    const message = text.trim();
    if (!message || busy || !child) return;
    const kind = localSafetyCheck(message);
    if (kind) {
      setText('');
      goToSafety(kind);
      return;
    }
    setHistory((h) => [...h, { role: 'child', text: message }]);
    setText('');
    setBusy(true);
    const res = await askTutor({
      childRef: child.id,
      grade: child.grade,
      lang,
      country: settings.country,
      pack,
      step,
      history,
      message,
    });
    setBusy(false);
    if (res.safetyStopped) return;
    setHistory((h) => [...h, { role: 'zaki', text: sanitizeReply(res.reply, lang) }]);
  }

  return (
    <Card style={{ gap: S.md }}>
      <Row>
        <Mascot size={44} mood={busy ? 'thinking' : 'happy'} />
        <Txt variant="h2">{t('askTitle')}</Txt>
      </Row>
      <View style={{ gap: S.sm }} testID="chat-log">
        {history.map((m, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              m.role === 'child'
                ? { alignSelf: 'flex-end', backgroundColor: C.primarySoft }
                : { alignSelf: 'flex-start', backgroundColor: C.mintSoft },
            ]}>
            <Txt>{m.text}</Txt>
          </View>
        ))}
        {busy ? <Txt variant="small">{t('thinking')}</Txt> : null}
      </View>
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
