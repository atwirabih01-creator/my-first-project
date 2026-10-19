// WHATSAPP SIMULATOR: parent types or taps REPORT / PLAN / PAUSE / HELP.
// Nothing is sent to WhatsApp. Reports are generated from local progress (plan section 3.3).
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { sendParentMessage } from '@/lib/api';
import { translate } from '@/lib/i18n';
import { buildReport } from '@/lib/report';
import { useChild, useT } from '@/lib/store';

type Msg = { from: 'parent' | 'zaki'; text: string; time: string };

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function WhatsApp() {
  const { child, settings, progress, packs, app } = useChild();
  const { t } = useT();
  const rl = settings.reportLang;
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ from: 'zaki', text: translate(rl, 'waIntro'), time: nowTime() }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const push = (m: Msg) => {
    setMsgs((x) => [...x, m]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  async function send(raw: string, fromButton = false) {
    const body = raw.trim();
    if (!body || !child || busy) return;
    setText('');
    push({ from: 'parent', text: body, time: nowTime() });
    const cmd = body.toUpperCase();
    // Reply in the language the parent wrote in; button taps use the report language.
    const lang: 'en' | 'ar' = fromButton ? rl : /[\u0600-\u06FF]/.test(body) ? 'ar' : /[A-Za-z]/.test(body) ? 'en' : rl;
    const zaki = (s: string) => push({ from: 'zaki', text: s, time: nowTime() });

    if (cmd === 'REPORT' || cmd === 'تقرير') {
      zaki(buildReport(child, progress, packs, lang));
      return;
    }
    if (cmd === 'PAUSE' || cmd === 'إيقاف') {
      const paused = !settings.paused;
      app.updateSettings(child.id, { paused });
      zaki(translate(lang, paused ? 'waPauseOn' : 'waPauseOff', { name: child.nickname }));
      return;
    }
    setBusy(true);
    const res = await sendParentMessage(body, lang, settings.country);
    setBusy(false);
    let added: 'added' | 'already' | null = null;
    if (res.plan && res.plan.topic && res.plan.subject) {
      const item = app.addPlanItem(child.id, {
        subject: res.plan.subject,
        topic: res.plan.topic,
        kind: res.plan.dueDate ? 'test' : 'lesson',
        dueDate: res.plan.dueDate,
        sessions: res.plan.sessions,
      });
      added = item ? 'added' : 'already';
    }
    const planLine = () =>
      res.plan
        ? translate(lang, added === 'added' ? 'waPlanAdded' : 'waAlready', { topic: res.plan.topic, name: child.nickname })
        : '';
    if (res.reply) {
      zaki(res.reply);
      if (added) zaki(planLine());
      return;
    }
    // Demo replies (no server). Anything unclear gets the fixed polite redirect.
    if (cmd === 'PLAN' || cmd === 'خطة') zaki(translate(lang, 'waPlanReply'));
    else if (cmd === 'HELP' || cmd === 'مساعدة') zaki(translate(lang, 'waHelp'));
    else if (added) zaki(planLine());
    else zaki(translate(lang, 'waRedirect'));
  }

  return (
    <Screen parent back="/parent" title={`💬 ${t('pWhatsapp')}`} scroll={false} bg={C.waBg}>
      <ParentChildPicker />
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Mascot size={36} animate={false} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{translate(rl, 'waName')}</Text>
          <Text style={styles.headerSub}>{busy ? translate(rl, 'thinking') : translate(rl, 'waSub')}</Text>
        </View>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={{ padding: S.sm, gap: S.sm }} testID="wa-chat">
        {msgs.map((m, i) => (
          <View key={i} style={[styles.bubble, m.from === 'parent' ? styles.mine : styles.theirs]} testID={m.from === 'zaki' ? 'wa-zaki' : 'wa-parent'}>
            <Text style={[styles.msgText, { writingDirection: /[؀-ۿ]/.test(m.text) ? 'rtl' : 'ltr', textAlign: /[؀-ۿ]/.test(m.text) ? 'right' : 'left' }]}>
              {m.text}
            </Text>
            <Text style={styles.time}>{m.time}</Text>
          </View>
        ))}
      </ScrollView>
      <Row wrap style={{ paddingVertical: S.xs }}>
        {['REPORT', 'PLAN', 'PAUSE', 'HELP'].map((c) => (
          <Pressable key={c} onPress={() => send(c, true)} style={styles.quick} accessibilityRole="button" accessibilityLabel={c} testID={`wa-${c}`}>
            <Text style={{ color: C.waGreen, fontWeight: '800' }}>{c}</Text>
          </Pressable>
        ))}
      </Row>
      <Row>
        <TextInput
          testID="wa-input"
          value={text}
          onChangeText={setText}
          placeholder={translate(rl, 'waPlaceholder')}
          placeholderTextColor="#8893AA"
          onSubmitEditing={() => send(text)}
          accessibilityLabel={translate(rl, 'waPlaceholder')}
          style={styles.input}
        />
        <Pressable onPress={() => send(text)} style={styles.sendBtn} accessibilityRole="button" accessibilityLabel={t('send')} testID="wa-send">
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>➤</Text>
        </Pressable>
      </Row>
      <Txt variant="small" center>
        {t('waNote')}
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: C.waGreen, padding: S.sm, borderRadius: R.md },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  headerName: { color: '#FFFFFF', fontWeight: '800', fontSize: 17 },
  headerSub: { color: '#D7EFE9', fontSize: 13 },
  chat: { flex: 1, minHeight: 280, backgroundColor: C.waBg, borderRadius: R.md },
  bubble: { maxWidth: '86%', borderRadius: R.sm, paddingHorizontal: S.md, paddingVertical: S.sm, gap: 2 },
  mine: { alignSelf: 'flex-end', backgroundColor: C.waBubble },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF' },
  msgText: { fontSize: 16, color: '#111B21', lineHeight: 22 },
  time: { fontSize: 11, color: '#667781', alignSelf: 'flex-end' },
  quick: { backgroundColor: '#FFFFFF', borderRadius: R.pill, paddingHorizontal: S.md, minHeight: 40, justifyContent: 'center', borderWidth: 1, borderColor: '#CFE3DD' },
  input: { flex: 1, flexShrink: 1, minWidth: 0, width: '100%', minHeight: 48, backgroundColor: '#FFFFFF', borderRadius: R.pill, paddingHorizontal: S.lg, fontSize: 16, color: C.text },
  sendBtn: { flexShrink: 0, width: 48, height: 48, borderRadius: 24, backgroundColor: '#00A884', alignItems: 'center', justifyContent: 'center' },
});
