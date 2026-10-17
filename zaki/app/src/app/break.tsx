// Friendly break screen when today's time limit (set by the grown-up) is used up.
import { router } from 'expo-router';
import { View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { S } from '@/constants/theme';
import { useT } from '@/lib/store';

export default function Break() {
  const { t } = useT();
  return (
    <Screen child back="/">
      <View style={{ alignItems: 'center', gap: S.lg, paddingTop: S.xl }} testID="break-screen">
        <Mascot size={170} mood="calm" />
        <Txt variant="title" center>
          🌿 {t('breakTitle')}
        </Txt>
        <Card tone="mint">
          <Txt variant="big" center>
            {t('breakText')}
          </Txt>
        </Card>
      </View>
      <View style={{ flexGrow: 1 }} />
      <Btn title={t('needHelp')} icon="🆘" variant="help" onPress={() => router.push('/help')} />
      <Btn title={t('breakParent')} icon="🔒" variant="secondary" onPress={() => router.push({ pathname: '/parent/gate', params: { next: 'settings' } })} />
    </Screen>
  );
}
