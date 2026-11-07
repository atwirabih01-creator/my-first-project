// "Read to me": the phone's own voice reads the text aloud (for children who can't read yet).
// Uses the device's built-in text-to-speech: works offline and sends nothing to any server.
import * as Speech from 'expo-speech';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';

import { C, R, S } from '@/constants/theme';
import { useT } from '@/lib/store';

/** `label`: what the button says next to 🔊 (default "Read to me"), e.g. the word on a word card. */
export function ReadAloud({ text, label, testID = 'read-aloud' }: { text: string; label?: string; testID?: string }) {
  const { t, lang } = useT();
  // Stop talking when the child leaves the screen.
  useEffect(() => () => void Speech.stop(), []);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label ? `${t('readAloud')}: ${label}` : t('readAloud')}
      onPress={() => {
        Speech.stop();
        Speech.speak(text, { language: lang === 'ar' ? 'ar' : 'en', rate: 0.9 });
      }}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: S.md,
        borderRadius: R.pill,
        backgroundColor: pressed ? C.primarySoft : C.card,
        borderWidth: 2,
        borderColor: C.primary,
      })}>
      <Text style={{ color: C.primary, fontWeight: '800', fontSize: 17 }}>🔊 {label ?? t('readAloud')}</Text>
    </Pressable>
  );
}
