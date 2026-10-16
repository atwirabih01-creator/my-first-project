// "I need help": never behind the parental gate, works offline (no network calls).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { S } from '@/constants/theme';
import { useT } from '@/lib/store';

export default function Help() {
  const { t } = useT();
  const [lessonHelp, setLessonHelp] = useState(false);
  return (
    <Screen child back title={t('helpTitle')}>
      <View style={{ alignItems: 'center' }}>
        <Mascot size={120} mood="calm" />
      </View>
      <Btn title={t('helpLesson')} icon="📘" big onPress={() => setLessonHelp(true)} testID="help-lesson" />
      {lessonHelp ? (
        <Card tone="sun">
          <Txt>{t('helpLessonText')}</Txt>
          <Btn title={t('back')} variant="secondary" onPress={() => router.back()} />
        </Card>
      ) : null}
      <Btn
        title={t('helpFeel')}
        icon="💛"
        big
        variant="help"
        onPress={() => router.replace({ pathname: '/safety', params: { kind: 'general' } })}
        testID="help-feel"
      />
      <View style={{ height: S.lg }} />
    </Screen>
  );
}
