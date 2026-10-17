// Add a lesson: subject + typed lesson name + optional up to 3 page photos -> /api/lesson-pack.
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { fetchLessonPack } from '@/lib/api';
import { lessonKeyOf, todayStr, useChild, useT } from '@/lib/store';
import { SUBJECTS } from '@/lib/subjects';
import type { Subject } from '@/lib/types';

type Photo = { uri: string; base64: string };

export default function AddLesson() {
  const { child, settings, app } = useChild();
  const { t, align } = useT();
  const [subject, setSubject] = useState<Subject>('math');
  const [topic, setTopic] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hasTest, setHasTest] = useState(false);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return todayStr(d);
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [demoUsed, setDemoUsed] = useState(false);

  async function pick() {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 3 - photos.length,
        base64: true,
        quality: 0.5,
      });
      if (res.canceled) return;
      const added = res.assets
        .filter((a) => a.base64)
        .map((a) => ({ uri: a.uri, base64: (a.base64 as string).replace(/^data:image\/\w+;base64,/, '') }));
      setPhotos((p) => [...p, ...added].slice(0, 3));
    } catch {
      // picker unavailable: ignore
    }
  }

  async function prepare() {
    if (!child) return;
    if (!topic.trim()) {
      setMsg(t('needName'));
      return;
    }
    setBusy(true);
    setMsg(null);
    const name = topic.trim();
    const res = await fetchLessonPack({
      childRef: child.id,
      grade: child.grade,
      lang: child.lang,
      country: settings.country,
      subject,
      topic: name,
      pageImages: photos.length ? photos.map((p) => p.base64) : undefined,
    });
    const key = lessonKeyOf(subject, name);
    app.savePack(child.id, key, { pack: res.pack, sources: res.sources, savedAt: new Date().toISOString(), demo: res.demo });
    app.addPlanItem(child.id, { subject, topic: name, kind: hasTest ? 'test' : 'lesson', dueDate: hasTest ? dueDate : undefined, packKey: key });
    setBusy(false);
    setDemoUsed(res.demo);
    setMsg(t('lessonReady', { name: child.nickname }));
    setTopic('');
    setPhotos([]);
  }

  return (
    <Screen parent back="/parent" title={`➕ ${t('pAddLesson')}`}>
      <ParentChildPicker />
      {busy ? (
        <View style={{ alignItems: 'center', gap: S.md, paddingVertical: S.xl }} testID="preparing">
          <Mascot size={140} mood="thinking" />
          <Txt variant="h2" center>
            {t('preparing')}
          </Txt>
        </View>
      ) : (
        <>
          <Card>
            <Txt bold>{t('subject')}</Txt>
            <Row wrap>
              {SUBJECTS.map((s) => (
                <Chip key={s.id} label={`${s.icon} ${t(s.key)}`} selected={subject === s.id} onPress={() => setSubject(s.id)} testID={`subject-${s.id}`} />
              ))}
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('lessonName')}</Txt>
            <TextInput
              testID="lesson-name"
              value={topic}
              onChangeText={setTopic}
              placeholder={t('lessonNamePh')}
              placeholderTextColor="#8893AA"
              accessibilityLabel={t('lessonName')}
              maxLength={60}
              style={[styles.input, { textAlign: align }]}
            />
          </Card>
          <Card>
            <Txt bold>{t('hasTest')}</Txt>
            <Row wrap>
              <Chip label={t('yes')} selected={hasTest} onPress={() => setHasTest(true)} testID="has-test-yes" />
              <Chip label={t('no')} selected={!hasTest} onPress={() => setHasTest(false)} />
            </Row>
            {hasTest ? (
              <>
                <Txt variant="small">{t('testDate')}</Txt>
                <TextInput value={dueDate} onChangeText={setDueDate} maxLength={10} accessibilityLabel={t('testDate')} style={[styles.input, { textAlign: 'center' }]} />
              </>
            ) : null}
          </Card>
          <Card>
            <Txt bold>📷 {t('photos')}</Txt>
            <Card tone="coral">
              <Txt bold testID="photo-reminder">
                ⚠️ {t('photosReminder')}
              </Txt>
            </Card>
            <Row wrap>
              {photos.map((p, i) => (
                <View key={i} style={{ alignItems: 'center', gap: 4 }}>
                  <Image source={{ uri: p.uri }} style={styles.thumb} accessibilityLabel={`${t('photos')} ${i + 1}`} />
                  <Btn small variant="ghost" title={t('removePhoto')} onPress={() => setPhotos(photos.filter((_, j) => j !== i))} />
                </View>
              ))}
            </Row>
            {photos.length < 3 ? <Btn small variant="secondary" icon="🖼️" title={t('addPhoto')} onPress={pick} testID="add-photo" /> : null}
          </Card>
          {msg ? (
            <Card tone="mint">
              <Txt bold testID="add-lesson-msg">
                {msg}
              </Txt>
              {demoUsed ? <Txt variant="small">{t('demoUsedSample')}</Txt> : null}
            </Card>
          ) : null}
          <Btn title={child ? t('prepareFor', { name: child.nickname }) : t('prepare')} big icon="✨" onPress={prepare} testID="prepare-lesson" />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 54,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.border,
    paddingHorizontal: S.md,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
    color: C.text,
  },
  thumb: { width: 84, height: 110, borderRadius: R.sm, backgroundColor: C.border },
});
