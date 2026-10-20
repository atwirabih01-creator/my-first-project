// PARENT "ASK ZAKI" (grown-ups, behind the gate): explain a school topic or a photographed
// book page TO THE PARENT, so they can help their child. Never sends child names.
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Btn, Card, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { askZakiAsParent, type ParentTurn } from '@/lib/api';
import { useChild, useT } from '@/lib/store';

type Photo = { uri: string; base64: string };
type Turn = ParentTurn & { concern?: boolean };

export default function ParentAsk() {
  const { settings } = useChild();
  const { t, lang, align } = useT();
  const [history, setHistory] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);

  async function pick() {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 3 - photos.length, base64: true, quality: 0.5 });
      if (res.canceled) return;
      const added = res.assets.filter((a) => a.base64).map((a) => ({ uri: a.uri, base64: (a.base64 as string).replace(/^data:image\/\w+;base64,/, '') }));
      setPhotos((p) => [...p, ...added].slice(0, 3));
    } catch {
      // picker unavailable
    }
  }

  async function send() {
    const message = text.trim();
    if (!message || busy) return; // input is locked while Zaki answers, so nothing is dropped
    const prior = history.map(({ role, text: tx }) => ({ role, text: tx }));
    setHistory((h) => [...h, { role: 'parent', text: message }]);
    setText('');
    setBusy(true);
    const res = await askZakiAsParent({ message, lang, country: settings.country, history: prior, pageImages: photos.length ? photos.map((p) => p.base64) : undefined });
    setBusy(false);
    setPhotos([]);
    setHistory((h) => [...h, { role: 'zaki', text: res.reply, concern: !!res.concern }]);
  }

  return (
    <Screen parent back="/parent" title={`💡 ${t('pAsk')}`}>
      <Card tone="primary">
        <Row style={{ alignItems: 'flex-start' }}>
          <Mascot size={52} animate={false} />
          <Txt style={{ flex: 1, minWidth: 0 }}>{t('parentAskIntro')}</Txt>
        </Row>
      </Card>
      <View style={{ gap: S.sm }} testID="parent-ask-log">
        {history.map((m, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              m.role === 'parent' ? { alignSelf: 'flex-end', backgroundColor: C.primarySoft } : { alignSelf: 'flex-start', backgroundColor: '#FFFFFF' },
              m.concern && { backgroundColor: C.coralSoft, borderColor: C.coral, borderWidth: 2 },
            ]}
            testID={m.role === 'zaki' ? (m.concern ? 'parent-ask-concern' : 'parent-ask-zaki') : undefined}>
            <Txt>{m.text}</Txt>
          </View>
        ))}
        {busy ? <Txt variant="small">{t('thinking')}</Txt> : null}
      </View>
      <Card>
        <Txt bold>📷 {t('parentAskPhotos')}</Txt>
        <Txt variant="small" color={C.coral}>
          ⚠️ {t('photosReminder')}
        </Txt>
        <Row wrap>
          {photos.map((p, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 4 }}>
              <Image source={{ uri: p.uri }} style={styles.thumb} accessibilityLabel={`${t('photos')} ${i + 1}`} />
              <Btn small variant="ghost" title={t('removePhoto')} onPress={() => setPhotos(photos.filter((_, j) => j !== i))} testID={`parent-ask-remove-photo-${i}`} />
            </View>
          ))}
        </Row>
        {photos.length < 3 ? <Btn small variant="secondary" icon="🖼️" title={t('addPhoto')} onPress={pick} /> : null}
      </Card>
      <Row style={{ width: '100%' }}>
        <TextInput
          testID="parent-ask-input"
          value={text}
          onChangeText={setText}
          placeholder={t('parentAskPh')}
          placeholderTextColor="#8893AA"
          onSubmitEditing={send}
          editable={!busy}
          maxLength={1500}
          accessibilityLabel={t('parentAskPh')}
          style={[styles.input, { textAlign: align }]}
        />
        <Btn title={t('send')} onPress={send} disabled={busy || !text.trim()} testID="parent-ask-send" style={{ flexShrink: 0, paddingHorizontal: S.md }} />
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '90%', flexShrink: 1, minWidth: 0, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: S.sm, borderWidth: 1, borderColor: C.border },
  input: { flex: 1, flexShrink: 1, minWidth: 0, width: '100%', minHeight: 52, borderRadius: R.md, borderWidth: 2, borderColor: C.border, paddingHorizontal: S.md, fontSize: 17, backgroundColor: '#FFFFFF', color: C.text },
  thumb: { width: 70, height: 90, borderRadius: R.sm, backgroundColor: C.border },
});
