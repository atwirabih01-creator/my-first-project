// Edit the current learner card (behind the parental gate): name, age, grade, school country
// and program, language, avatar.
// Older profiles have no age yet: they keep working, and the grown-up can add one here.
import { router } from 'expo-router';

import { ChildForm } from '@/components/ChildForm';
import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/ui';
import { useChild, useT } from '@/lib/store';

export default function EditChild() {
  const { child, app } = useChild();
  const { t } = useT();

  return (
    <Screen parent back="/parent/settings" title={`✏️ ${t('editTitle')}`}>
      <ParentChildPicker />
      {child ? (
        <>
          {child.age === undefined ? (
            <Txt variant="small" testID="no-age-yet">
              {t('noAgeYet')}
            </Txt>
          ) : null}
          <ChildForm
            key={child.id}
            initial={{ nickname: child.nickname, age: child.age, grade: child.grade, lang: child.lang, avatar: child.avatar, schoolCountry: child.schoolCountry, program: child.program }}
            submitTitle={t('save')}
            onSubmit={(v) => {
              app.updateChild(child.id, v);
              router.replace('/parent/settings');
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}
