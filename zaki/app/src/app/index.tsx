// Start: pick a (fake) child profile or make a new one.
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Btn, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useApp, useT } from '@/lib/store';

export default function StartScreen() {
  const app = useApp();
  const { t } = useT();

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: S.sm }}>
        <Mascot size={130} />
        <Txt variant="title" center>
          {t('whoIsLearning')}
        </Txt>
      </View>

      <View style={styles.grid}>
        {app.profiles.map((p) => (
          <Pressable
            key={p.id}
            testID={`profile-${p.nickname}`}
            accessibilityRole="button"
            accessibilityLabel={`${p.nickname}, ${t('gradeN', { n: p.grade })}`}
            onPress={() => {
              app.setActiveChild(p.id);
              router.push('/ready');
            }}
            style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.97 }] }]}>
            <Avatar id={p.avatar} size={84} />
            <Txt variant="h2" center>
              {p.nickname}
            </Txt>
            <Txt variant="small" center>
              {t('gradeN', { n: p.grade })} · {p.lang === 'ar' ? 'العربية' : 'English'}
            </Txt>
          </Pressable>
        ))}
        <Pressable
          testID="new-learner"
          accessibilityRole="button"
          accessibilityLabel={t('newLearner')}
          onPress={() => router.push('/create-child')}
          style={({ pressed }) => [styles.tile, styles.newTile, pressed && { transform: [{ scale: 0.97 }] }]}>
          <View style={styles.plus}>
            <Txt variant="title" center color={C.primary}>
              +
            </Txt>
          </View>
          <Txt variant="h2" center color={C.primary}>
            {t('newLearner')}
          </Txt>
        </Pressable>
      </View>

      {app.profiles.length === 0 && app.demo ? (
        <Btn title={t('restoreDemo')} variant="ghost" onPress={app.restoreDemoChildren} testID="restore-demo" />
      ) : null}
      <View style={{ flexGrow: 1 }} />
      <Btn title={t('grownUps')} icon="🔒" variant="secondary" onPress={() => router.push('/parent/gate')} testID="grownups-btn" />
      <Btn title={t('reviewerArea')} icon="🛡️" small variant="ghost" onPress={() => router.push('/reviewer')} testID="reviewer-btn" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, justifyContent: 'center' },
  tile: {
    width: 160,
    minHeight: 180,
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    padding: S.md,
  },
  newTile: { borderStyle: 'dashed', borderColor: C.primary, backgroundColor: C.primarySoft },
  plus: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
});
