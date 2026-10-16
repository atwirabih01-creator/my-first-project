// PARENTAL GATE: an adult task (type a number written in words, randomised).
// Emergency help is never behind this gate.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { normalizeDigits, numberInWords } from '@/lib/i18n';
import { useApp, useT } from '@/lib/store';

const newNumber = () => 21 + Math.floor(Math.random() * 79); // 21..99

export default function Gate() {
  const app = useApp();
  const { t, lang } = useT();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [n, setN] = useState(newNumber);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);

  function submit() {
    const typed = parseInt(normalizeDigits(value).replace(/\D/g, ''), 10);
    if (typed === n) {
      app.unlockParent();
      router.replace(next === 'settings' ? '/parent/settings' : '/parent');
    } else {
      setWrong(true);
      setValue('');
      setN(newNumber());
    }
  }

  return (
    <Screen back title={`🔒 ${t('gateTitle')}`}>
      <Card>
        <Txt>{t('gateText')}</Txt>
        <Txt variant="title" center testID="gate-words">
          {numberInWords(n, lang)}
        </Txt>
        <TextInput
          testID="gate-input"
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          accessibilityLabel={t('gateInputA11y')}
          onSubmitEditing={submit}
          maxLength={3}
          style={styles.input}
        />
        {wrong ? (
          <Txt color={C.wrong} testID="gate-wrong">
            {t('gateWrong')}
          </Txt>
        ) : null}
        <Btn title={t('gateOpen')} onPress={submit} disabled={!value} testID="gate-open" />
      </Card>
      <Txt variant="small" center>
        {t('gateHint')}
      </Txt>
      <View style={{ flexGrow: 1 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 60,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.border,
    fontSize: 28,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    color: C.text,
    marginVertical: S.sm,
  },
});
