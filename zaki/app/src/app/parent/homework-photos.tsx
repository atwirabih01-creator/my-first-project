// HOMEWORK PHOTOS (grown-up, behind the parental gate): choose the child -> take a photo or
// choose from the gallery (up to 3, small JPEGs) -> subject (the child's grade only) -> optional
// note for Zaki (max 300, e.g. "only exercise 3") -> saved as a homework task ON THIS DEVICE.
// The child sees it on their home screen and gets step-by-step help (never the answer).
// Photos are deleted when the child taps "I finished", when the grown-up deletes the task,
// or after 30 days (the consent text says book-page photos are kept about 30 days).
import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { MAX_HOMEWORK_PHOTOS, MAX_PARENT_NOTE } from '@/lib/api';
import { adultSafetyMessage } from '@/lib/helpRoutes';
import { pickHomeworkPhotos, savePhotos, type Photo } from '@/lib/homeworkPhotos';
import { formatDate } from '@/lib/nav';
import { randomId, useChild, useT } from '@/lib/store';
import { subjectInfo, subjectsForChild } from '@/lib/subjects';
import type { Subject } from '@/lib/types';
import { parentConcernScan } from '../../../server/keywordScan';

export default function HomeworkPhotos() {
  const { child, settings, homework, app } = useChild();
  const { t, lang, align, rtl } = useT();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [chosen, setSubject] = useState<Subject>('math');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'mint' | 'sun' | 'coral'; text: string } | null>(null);
  const subjectList = subjectsForChild(child?.grade ?? 1);
  // Switching to a younger child: keep the chosen subject only if that grade has it.
  const subject: Subject = subjectList.some((s) => s.id === chosen) ? chosen : 'math';
  const room = MAX_HOMEWORK_PHOTOS - photos.length;

  async function add(source: 'camera' | 'library') {
    if (busy || room <= 0) return;
    setMsg(null);
    const res = await pickHomeworkPhotos(source, room);
    if (res.denied) setMsg({ tone: 'sun', text: t('hwpCameraDenied') });
    else if (res.skipped) setMsg({ tone: 'sun', text: t('hwpSkipped') });
    if (res.photos.length) setPhotos((p) => [...p, ...res.photos].slice(0, MAX_HOMEWORK_PHOTOS));
  }

  async function save() {
    if (!child || busy) return;
    if (!photos.length) {
      setMsg({ tone: 'sun', text: t('hwpNeedPhoto') });
      return;
    }
    const cleanNote = note.replace(/\s+/g, ' ').trim().slice(0, MAX_PARENT_NOTE);
    // A worry written in the note gets the fixed grown-up help text (numbers from the table), not a task.
    const worry = cleanNote ? parentConcernScan(cleanNote) : null;
    if (worry) {
      setMsg({ tone: 'coral', text: `${t('hwpNoteWorry')}\n${adultSafetyMessage(lang, settings.country, worry)}` });
      return;
    }
    setBusy(true);
    setMsg(null);
    const id = randomId('hw');
    try {
      const refs = await savePhotos(id, photos);
      app.addHomeworkTask(child.id, { id, subject, note: cleanNote || undefined, photos: refs, createdAt: new Date().toISOString() });
      setPhotos([]);
      setNote('');
      setMsg({ tone: 'mint', text: t('hwpSaved', { name: child.nickname }) });
    } catch {
      setMsg({ tone: 'sun', text: t('hwpSaveFailed') });
    }
    setBusy(false);
  }

  return (
    <Screen parent back="/parent" title={`📸 ${t('pHomeworkPhotos')}`}>
      <ParentChildPicker />
      {child ? (
        <>
          <Row style={{ alignItems: 'center' }}>
            <Mascot size={72} action="wave" />
            <Card style={{ flex: 1, minWidth: 0 }}>
              <Txt testID="hwp-intro">{t('hwpIntro', { name: child.nickname })}</Txt>
            </Card>
          </Row>

          <Card>
            <Txt bold testID="hwp-photos-label">
              📷 {t('hwpPhotos')}
            </Txt>
            <Card tone="coral">
              <Txt bold testID="hwp-privacy">
                ⚠️ {t('hwpPrivacy')}
              </Txt>
            </Card>
            {photos.length ? (
              <Row wrap>
                {photos.map((p, i) => (
                  <View key={`${i}-${p.uri.slice(-12)}`} style={{ alignItems: 'center', gap: 4 }} testID="hwp-thumb">
                    <Image source={{ uri: p.uri }} style={styles.thumb} accessibilityLabel={t('hwpPhotoN', { n: i + 1 })} />
                    <Btn small variant="ghost" title={t('removePhoto')} onPress={() => setPhotos(photos.filter((_, j) => j !== i))} testID={`hwp-remove-${i}`} />
                  </View>
                ))}
              </Row>
            ) : null}
            {room > 0 ? (
              <Row wrap>
                <Btn small variant="secondary" icon="📷" title={t('hwpTakePhoto')} onPress={() => add('camera')} testID="hwp-camera" />
                <Btn small variant="secondary" icon="🖼️" title={t('hwpChoosePhoto')} onPress={() => add('library')} testID="hwp-gallery" />
              </Row>
            ) : null}
          </Card>

          <Card>
            <Txt bold>{t('hwpSubject')}</Txt>
            <Txt variant="small">{t('subjectsForGradeN', { n: child.grade })}</Txt>
            <Row wrap>
              {subjectList.map((s) => (
                <Chip key={s.id} label={`${s.icon} ${t(s.key)}`} selected={subject === s.id} onPress={() => setSubject(s.id)} testID={`hwp-subject-${s.id}`} />
              ))}
            </Row>
          </Card>

          <Card>
            <Txt bold>{t('hwpNote')}</Txt>
            <TextInput
              testID="hwp-note"
              value={note}
              onChangeText={(v) => setNote(v.slice(0, MAX_PARENT_NOTE))}
              placeholder={t('hwpNotePh')}
              placeholderTextColor="#8893AA"
              accessibilityLabel={t('hwpNote')}
              maxLength={MAX_PARENT_NOTE}
              multiline
              style={[styles.input, { textAlign: align, writingDirection: rtl ? 'rtl' : 'ltr' }]}
            />
            <Txt variant="small">
              {note.length} / {MAX_PARENT_NOTE}
            </Txt>
          </Card>

          {msg ? (
            <Card tone={msg.tone}>
              <Txt bold testID="hwp-msg">
                {msg.text}
              </Txt>
            </Card>
          ) : null}
          <Btn
            title={t('hwpSave', { name: child.nickname })}
            icon="✨"
            big
            disabled={busy}
            onPress={save}
            testID="hwp-save"
          />

          <Card tone="primary" testID="hwp-list">
            <Txt variant="h2">{t('hwpList', { name: child.nickname })}</Txt>
            {homework.length === 0 ? <Txt testID="hwp-none">{t('hwpNone')}</Txt> : null}
            {homework.map((task, i) => {
              const s = subjectInfo(task.subject);
              return (
                <View key={task.id} style={[styles.task, { backgroundColor: s.soft, borderColor: s.accent }]} testID="hwp-task">
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Txt bold>
                      {s.icon} {t(s.key)}
                    </Txt>
                    {task.note ? <Txt testID="hwp-task-note">{lang === 'ar' ? `«${task.note}»` : `“${task.note}”`}</Txt> : null}
                    <Txt variant="small">
                      {t('hwpAdded', { date: formatDate(task.createdAt.slice(0, 10), lang) })} · {t('hwpPhotosCount', { n: task.photos.length })}
                    </Txt>
                  </View>
                  <Btn small variant="ghost" icon="🗑️" title={t('hwpDelete')} onPress={() => app.removeHomeworkTask(child.id, task.id)} testID={`hwp-delete-${i}`} />
                </View>
              );
            })}
            <Txt variant="small" testID="hwp-keep">
              🔒 {t('hwpKeep', { name: child.nickname })}
            </Txt>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 96,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.border,
    paddingHorizontal: S.md,
    paddingTop: S.sm,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
    color: C.text,
    textAlignVertical: 'top',
  },
  thumb: { width: 84, height: 110, borderRadius: R.sm, backgroundColor: C.border },
  task: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: S.sm, padding: S.md, borderRadius: R.md, borderWidth: 2 },
});
