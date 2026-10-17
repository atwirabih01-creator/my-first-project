// Ready check: "Are you in a quiet place and ready to focus?" (never "are you alone").
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { S } from '@/constants/theme';
import { useChild, useT } from '@/lib/store';

export default function Ready() {
  const { child } = useChild();
  const { t } = useT();
  const [notYet, setNotYet] = useState(false);

  return (
    <Screen child back="/">
      <View style={{ alignItems: 'center', gap: S.md, paddingTop: S.lg }}>
        {child ? <Avatar id={child.avatar} size={72} /> : null}
        <Txt variant="title" center>
          {t('readyHi', { name: child?.nickname ?? '' })}
        </Txt>
        <Mascot size={150} />
        <Card tone="lilac" style={{ alignSelf: 'stretch' }}>
          <Txt variant="small" center>
            🤖 {t('aiIntro')}
          </Txt>
        </Card>
        <Txt variant="big" center testID="ready-question">
          {t('readyQ')}
        </Txt>
      </View>
      {notYet ? (
        <Card tone="sun">
          <Txt center>{t('readyLater')}</Txt>
        </Card>
      ) : null}
      <View style={{ gap: S.md }}>
        <Btn title={t('readyYes')} icon="✅" big variant="success" onPress={() => router.replace('/home')} testID="ready-yes" />
        <Btn title={t('readyNotYet')} variant="secondary" onPress={() => setNotYet(true)} testID="ready-not-yet" />
      </View>
    </Screen>
  );
}
