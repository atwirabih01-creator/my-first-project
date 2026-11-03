// Big, colourful subject buttons for child screens: only the subjects of the child's grade
// (physics, chemistry and biology from grade 7). Two per row on a phone.
import { Pressable, StyleSheet, View } from 'react-native';

import { C, R, S } from '@/constants/theme';
import { useT } from '@/lib/store';
import { subjectsForChild, type SubjectInfo } from '@/lib/subjects';
import type { Subject } from '@/lib/types';
import { Txt } from './ui';

export function SubjectPicker({ grade, onPick }: { grade: number; onPick: (s: Subject) => void }) {
  const { t } = useT();
  return (
    <View style={styles.grid} testID="subject-picker">
      {subjectsForChild(grade).map((s: SubjectInfo) => (
        <Pressable
          key={s.id}
          testID={`pick-subject-${s.id}`}
          onPress={() => onPick(s.id)}
          accessibilityRole="button"
          accessibilityLabel={t(s.key)}
          style={({ pressed }) => [styles.tile, { backgroundColor: s.soft, borderColor: s.accent }, pressed && styles.pressed]}>
          <View style={[styles.icon, { borderColor: s.accent }]}>
            <Txt variant="big" center>
              {s.icon}
            </Txt>
          </View>
          <Txt bold center>
            {t(s.key)}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}

/** Small coloured badge showing the chosen subject. */
export function SubjectBadge({ info }: { info: SubjectInfo }) {
  const { t } = useT();
  return (
    <View style={[styles.badge, { backgroundColor: info.soft, borderColor: info.accent }]} testID="subject-badge">
      <Txt bold>
        {info.icon} {t(info.key)}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, justifyContent: 'space-between' },
  tile: {
    width: '47%',
    minHeight: 96,
    borderRadius: R.lg,
    borderWidth: 2,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    padding: S.sm,
  },
  // Press down into the coloured edge (same total height, so nothing jumps).
  pressed: { borderBottomWidth: 2, marginTop: 4 },
  icon: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', borderRadius: R.pill, borderWidth: 2, paddingHorizontal: S.lg, paddingVertical: S.xs },
});
