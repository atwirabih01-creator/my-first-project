// Lesson help page. Children no longer have an "I need help" button (founder's decision), so
// nothing in the app links here now; the route is kept so old links still open safely.
// Safety is automatic: worrying words a child types open the /safety screen.
import { View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { ReadAloud } from '@/components/ReadAloud';
import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { S } from '@/constants/theme';
import { getHelpReturn, goTo, isHelpInTest } from '@/lib/nav';
import { useChild, useT } from '@/lib/store';

export default function Help() {
  const { t } = useT();
  const { app } = useChild();
  const backTo = getHelpReturn() ?? (app.activeChildId ? '/home' : '/');
  const text = isHelpInTest() ? t('helpTestText') : t('helpLessonText');
  return (
    <Screen child back={backTo} title={t('helpLesson')}>
      <View style={{ alignItems: 'center' }}>
        <Mascot size={120} mood="calm" />
      </View>
      <ReadAloud text={text} />
      <Card tone="sun" testID="help-lesson-text">
        <Txt variant="big">{text}</Txt>
      </Card>
      <Btn title={t('back')} big variant="secondary" onPress={() => goTo(backTo)} testID="help-back" />
      <View style={{ height: S.lg }} />
    </Screen>
  );
}
