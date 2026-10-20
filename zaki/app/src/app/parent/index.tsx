// Grown-up area menu (behind the parental gate).
import { router } from 'expo-router';

import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { goTo } from '@/lib/nav';
import { useApp, useT } from '@/lib/store';

export default function ParentHome() {
  const app = useApp();
  const { t } = useT();
  const leave = () => {
    app.lockParent();
    goTo('/');
  };
  return (
    <Screen parent back={leave} title={`👪 ${t('parentTitle')}`}>
      <ParentChildPicker />
      <Btn title={t('pSettings')} icon="⚙️" big onPress={() => router.push('/parent/settings')} testID="p-settings" />
      <Btn title={t('pAddLesson')} icon="➕" big onPress={() => router.push('/parent/add-lesson')} testID="p-add" />
      <Btn title={t('pProgress')} icon="📊" big onPress={() => router.push('/parent/progress')} testID="p-progress" />
      <Btn title={t('pExam')} icon="🏆" big onPress={() => router.push('/parent/exam')} testID="p-exam" />
      <Btn title={t('pAsk')} icon="💡" big onPress={() => router.push('/parent/ask')} testID="p-ask" />
      <Btn title={t('pData')} icon="🗂️" big variant="secondary" onPress={() => router.push('/parent/data')} testID="p-data" />
      <Btn title={t('pWhatsapp')} icon="💬" big variant="success" onPress={() => router.push('/parent/whatsapp')} testID="p-whatsapp" />
      <Card tone="sun">
        <Txt variant="small">{t('waNote')}</Txt>
      </Card>
      <Btn title={t('pBackChild')} variant="secondary" onPress={leave} testID="p-back-child" />
    </Screen>
  );
}
