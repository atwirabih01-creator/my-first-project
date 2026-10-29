// "I need help": never behind the parental gate, works offline (no network calls).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { ReadAloud } from '@/components/ReadAloud';
import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { S } from '@/constants/theme';
import { reportSafety } from '@/lib/api';
import { getHelpReturn, goTo, isHelpInTest } from '@/lib/nav';
import { useChild, useT } from '@/lib/store';

export default function Help() {
  const { t } = useT();
  const { app, child, settings } = useChild();
  const backTo = getHelpReturn() ?? (app.activeChildId ? '/home' : '/');
  const [lessonHelp, setLessonHelp] = useState(false);
  return (
    <Screen child back={backTo} title={t('helpTitle')} helpButton={false}>
      <View style={{ alignItems: 'center' }}>
        <Mascot size={120} mood="calm" />
      </View>
      <ReadAloud text={[t('helpTitle'), t('helpLesson'), t('helpFeel')].join('. ')} />
      <Btn title={t('helpLesson')} icon="📘" big onPress={() => setLessonHelp(true)} testID="help-lesson" />
      {lessonHelp ? (
        <Card tone="sun">
          <Txt>{isHelpInTest() ? t('helpTestText') : t('helpLessonText')}</Txt>
          <Btn title={t('back')} variant="secondary" onPress={() => goTo(backTo)} />
        </Card>
      ) : null}
      <Btn
        title={t('helpFeel')}
        icon="💛"
        big
        variant="calm"
        onPress={() => {
          if (child) {
            app.addLocalFlag({ category: 'general', route: 'reviewer', involvement: 'unclear', childRef: child.id, excerpt: '' });
            reportSafety({ kind: 'general', childRef: child.id, lang: child.lang, country: settings.country });
          }
          router.replace({ pathname: '/safety', params: { kind: 'general' } });
        }}
        testID="help-feel"
      />
      <View style={{ height: S.lg }} />
    </Screen>
  );
}
