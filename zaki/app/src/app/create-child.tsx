// Create a learner: nickname, grade 1-6, language, preset cartoon avatar (never a photo).
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { AVATARS, Avatar } from '@/components/Avatar';
import { Screen } from '@/components/Screen';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useApp, useT } from '@/lib/store';
import type { AvatarId, Lang } from '@/lib/types';

export default function CreateChild() {
  const app = useApp();
  const { t, align } = useT();
  const [nickname, setNickname] = useState('');
  const [grade, setGrade] = useState(3);
  const [lang, setLang] = useState<Lang>(app.uiLang);
  const [avatar, setAvatar] = useState<AvatarId>('owl');

  // Nickname only: letters, max 16 chars, no digits (keeps out phone numbers etc.).
  const clean = nickname.replace(/[0-9@/\\:.]/g, '').slice(0, 16);
  const ok = clean.trim().length >= 2;

  return (
    <Screen title={t('createTitle')} back>
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

      <Card>
        <Txt bold>{t('grade')}</Txt>
        <Row wrap>
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <Chip key={g} label={String(g)} selected={grade === g} onPress={() => setGrade(g)} a11yLabel={t('gradeN', { n: g })} testID={`grade-${g}`} />
          ))}
        </Row>
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
        title={t('create')}
        big
        disabled={!ok}
        testID="create-btn"
        onPress={() => {
          const child = app.addChild({ nickname: clean.trim(), grade, lang, avatar });
          app.setActiveChild(child.id);
          router.replace('/ready');
        }}
      />
    </Screen>
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
