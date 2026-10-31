// Start: pick a (fake) child profile or make a new one.
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, AVATARS } from '@/components/Avatar';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Bubble, Btn, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useApp, useT } from '@/lib/store';

export default function StartScreen() {
  const app = useApp();
  const { t } = useT();

  return (
    <Screen playful>
      {/* Zaki waves hello and asks who is learning. */}
      <Row style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Mascot size={112} action="wave" />
        <Bubble style={{ flexShrink: 1 }}>
          <Txt variant="small" bold color={C.primary}>
            {t('zakiHello')}
          </Txt>
          <Txt variant="h2">{t('whoIsLearning')}</Txt>
        </Bubble>
      </Row>

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
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: AVATARS.find((a) => a.id === p.avatar)?.bg ?? C.card },
              pressed && styles.tilePressed,
            ]}>
            <View style={styles.avatarRing}>
              <Avatar id={p.avatar} size={76} />
            </View>
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
    width: 148, // two side by side on a 360px phone
    minHeight: 176,
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: 'rgba(30, 58, 76, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    padding: S.md,
  },
  // Press down into the darker edge (same total height).
  tilePressed: { borderBottomWidth: 2, marginTop: 4 },
  avatarRing: { padding: 4, borderRadius: 50, backgroundColor: C.card },
  newTile: { borderStyle: 'dashed', borderColor: C.primary, borderBottomWidth: 2, backgroundColor: C.primarySoft },
  plus: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
});
