// Learner card form (create + edit): first name or nickname, age 5-16, grade 1-9,
// language and a preset cartoon avatar (never a photo).
// Picking an age preselects the usual grade for that age; the grown-up can change it.
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { C, R, S } from '@/constants/theme';
import { GRADES, MAX_AGE, MIN_AGE, clampGrade } from '@/lib/curriculum';
import { useT } from '@/lib/store';
import type { AvatarId, Lang } from '@/lib/types';
import { AVATARS, Avatar } from './Avatar';
import { Btn, Card, Chip, Row, Txt } from './ui';

export type ChildFormValue = { nickname: string; age?: number; grade: number; lang: Lang; avatar: AvatarId };

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

/** Nickname only: letters, max 16 chars, no digits (keeps out phone numbers etc.). */
export const cleanNickname = (s: string) => s.replace(/[0-9@/\\:.]/g, '').slice(0, 16);

/** The grade most children of this age are in (age 6 -> grade 1, age 13 -> grade 8). */
export const gradeForAge = (age: number) => clampGrade(age - 5);

export function ChildForm({
  initial,
  submitTitle,
  onSubmit,
  requireAge,
}: {
  initial: ChildFormValue;
  submitTitle: string;
  onSubmit: (v: ChildFormValue) => void;
  /** New learners must pick an age; older profiles without one can still be saved. */
  requireAge?: boolean;
}) {
  const { t, align } = useT();
  const [nickname, setNickname] = useState(initial.nickname);
  const [age, setAge] = useState<number | undefined>(initial.age);
  const [grade, setGrade] = useState(initial.grade);
  const [autoGrade, setAutoGrade] = useState(false);
  const [lang, setLang] = useState<Lang>(initial.lang);
  const [avatar, setAvatar] = useState<AvatarId>(initial.avatar);

  const clean = cleanNickname(nickname);
  const ok = clean.trim().length >= 2 && (!requireAge || age !== undefined);

  return (
    <>
      <Card>
        <Txt bold>{t('nickname')}</Txt>
        <TextInput
          testID="nickname-input"
          value={clean}
          onChangeText={setNickname}
          accessibilityLabel={t('nickname')}
          autoCorrect={false}
          autoComplete="off"
          style={[styles.input, { textAlign: align }]}
        />
        <Txt variant="small">{t('nicknameHint')}</Txt>
      </Card>

      <Card testID="age-card">
        <Txt bold>{t('age')}</Txt>
        <Txt variant="small">{t('ageHint')}</Txt>
        <Row wrap>
          {AGES.map((a) => (
            <Chip
              key={a}
              label={String(a)}
              selected={age === a}
              onPress={() => {
                setAge(a);
                setGrade(gradeForAge(a));
                setAutoGrade(true);
              }}
              a11yLabel={t('ageA11y', { n: a })}
              testID={`age-${a}`}
            />
          ))}
        </Row>
      </Card>

      <Card>
        <Txt bold>{t('grade')}</Txt>
        <Row wrap>
          {GRADES.map((g) => (
            <Chip
              key={g}
              label={String(g)}
              selected={grade === g}
              onPress={() => {
                setGrade(g);
                setAutoGrade(false);
              }}
              a11yLabel={t('gradeN', { n: g })}
              testID={`grade-${g}`}
            />
          ))}
        </Row>
        {autoGrade ? (
          <Txt variant="small" testID="grade-auto-note">
            ✨ {t('gradeAutoNote', { n: grade })}
          </Txt>
        ) : null}
      </Card>

      <Card>
        <Txt bold>{t('language')}</Txt>
        <Row wrap>
          <Chip label="English" selected={lang === 'en'} onPress={() => setLang('en')} testID="lang-en" />
          <Chip label="العربية" selected={lang === 'ar'} onPress={() => setLang('ar')} testID="lang-ar" />
        </Row>
      </Card>

      <Card>
        <Txt bold>{t('pickAvatar')}</Txt>
        <Row wrap gap={S.sm}>
          {AVATARS.map((a) => (
            <Pressable
              key={a.id}
              testID={`avatar-${a.id}`}
              onPress={() => setAvatar(a.id)}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              accessibilityState={{ selected: avatar === a.id }}
              style={[styles.avatarPick, avatar === a.id && { borderColor: C.primary }]}>
              <Avatar id={a.id} size={56} />
            </Pressable>
          ))}
        </Row>
      </Card>

      <Btn
        title={submitTitle}
        big
        disabled={!ok}
        testID="create-btn"
        onPress={() => onSubmit({ nickname: clean.trim(), age, grade, lang, avatar })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 56,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.border,
    paddingHorizontal: S.md,
    fontSize: 20,
    backgroundColor: '#FFFFFF',
    color: C.text,
  },
  avatarPick: { borderWidth: 3, borderColor: 'transparent', borderRadius: 40, padding: 2 },
});
