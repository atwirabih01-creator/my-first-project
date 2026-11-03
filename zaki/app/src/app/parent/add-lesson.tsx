// Add a lesson: subject (for the child's grade) + typed lesson name + optional up to 3 photos of
// today's class -> /api/lesson-pack. Zaki re-explains the page simply, then asks questions.
// A topic that fails the safety check is never saved.
import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { fetchLessonPack } from '@/lib/api';
import { pickHomeworkPhotos, type Photo } from '@/lib/homeworkPhotos';
import { lessonKeyOf, todayStr, useChild, useT } from '@/lib/store';
import { subjectsForChild } from '@/lib/subjects';
import type { Subject } from '@/lib/types';

export default function AddLesson() {
  const { child, settings, app } = useChild();
  const { t, align } = useT();
  const [chosen, setSubject] = useState<Subject>('math');
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
  const [demoUsed, setDemoUsed] = useState<string | null>(null);
  const [fromLibrary, setFromLibrary] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  const subjectList = subjectsForChild(child?.grade ?? 1);
  // Switching to a younger child: keep the chosen subject only if that grade has it.
  const subject: Subject = subjectList.some((s) => s.id === chosen) ? chosen : 'math';

  async function pick() {
    // Same as homework photos: resized to max 1600px and saved as a JPEG (quality 0.7).
    const res = await pickHomeworkPhotos('library', 3 - photos.length);
    if (res.skipped) setMsg(t('hwpSkipped'));
    if (res.photos.length) setPhotos((p) => [...p, ...res.photos].slice(0, 3));
  }

  async function prepare() {
    if (!child) return;
    if (!topic.trim()) {
      setMsg(t('needName'));
      return;
    }
    setBusy(true);
    setMsg(null);
    setBlockedMsg(null);
    const name = topic.trim();
    const res = await fetchLessonPack({
      childRef: child.id,
      grade: child.grade,
      age: child.age,
      lang: child.lang,
      country: settings.country,
      subject,
      topic: name,
      pageImages: photos.length ? photos.map((p) => p.base64) : undefined,
    });
    const key = lessonKeyOf(subject, name);
    const planBase = { subject, topic: name, kind: hasTest ? ('test' as const) : ('lesson' as const), dueDate: hasTest ? dueDate : undefined, packKey: key };
    setBusy(false);
    if (!res.budgetReached && res.safetyStopped) {
      // The topic did not pass the safety check: the placeholder pack is NOT saved, nothing is
      // added to the plan. (If the safety screen applies, it is already showing.)
      setDemoUsed(null);
      setFromLibrary(false);
      setBlockedMsg(res.blockedReply ?? t('lessonBlockedParent'));
      setTopic('');
      return;
    }
    if (res.budgetReached) {
      // Daily AI limit: queue it; the app prepares it automatically on a later day.
      app.addPlanItem(child.id, { ...planBase, pending: true });
      setDemoUsed(null);
      setFromLibrary(false);
      setMsg(res.unavailable ? t('lessonUnavailableQueued') : t('budgetQueued'));
    } else {
      app.savePack(child.id, key, { pack: res.pack, sources: res.sources, savedAt: new Date().toISOString(), demo: res.demo, packVersion: res.packVersion, fromPhotos: photos.length > 0 || undefined });
      app.addPlanItem(child.id, planBase);
      setDemoUsed(res.demo ? res.pack.topic : null);
      setFromLibrary(!!res.fromLibrary);
      setMsg(t('lessonReady', { name: child.nickname }));
    }
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
            {child ? <Txt variant="small">{t('subjectsForGradeN', { n: child.grade })}</Txt> : null}
            <Row wrap>
              {subjectList.map((s) => (
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
            <Txt bold testID="photos-label">
              📷 {t('photosClass')}
            </Txt>
            <Txt variant="small">{t('photosClassHint')}</Txt>
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
          {blockedMsg ? (
            <Card tone="lilac" testID="add-lesson-blocked">
              <Txt bold>{t('lessonBlockedParent')}</Txt>
              {blockedMsg !== t('lessonBlockedParent') ? <Txt testID="add-lesson-blocked-reply">{blockedMsg}</Txt> : null}
            </Card>
          ) : null}
          {msg ? (
            <Card tone="mint">
              <Txt bold testID="add-lesson-msg">
                {msg}
              </Txt>
              {demoUsed ? <Txt variant="small">{t('demoUsedSampleNamed', { topic: demoUsed })}</Txt> : null}
              {fromLibrary ? <Txt variant="small" testID="from-library">⚡ {t('fromLibrary')}</Txt> : null}
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
