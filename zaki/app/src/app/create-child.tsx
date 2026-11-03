// Create a learner: first name or nickname, age 5-16, grade 1-9, language, preset cartoon avatar (never a photo).
import { router } from 'expo-router';

import { ChildForm } from '@/components/ChildForm';
import { Screen } from '@/components/Screen';
import { useApp, useT } from '@/lib/store';

export default function CreateChild() {
  const app = useApp();
  const { t } = useT();

  return (
    <Screen title={t('createTitle')} back="/">
      <ChildForm
        requireAge
        initial={{ nickname: '', age: undefined, grade: 3, lang: app.uiLang, avatar: 'owl' }}
        submitTitle={t('create')}
        onSubmit={(v) => {
          const child = app.addChild(v);
          app.setActiveChild(child.id);
          router.replace('/ready');
        }}
      />
    </Screen>
  );
}
