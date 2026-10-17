import { useEffect } from 'react';
import { View } from 'react-native';

import { C, S } from '@/constants/theme';
import { useApp, useT } from '@/lib/store';
import { Avatar } from './Avatar';
import { Card, Chip, Row, Txt } from './ui';

/** Which child the grown-up is working on: shown big, with a switch. Keeps the grown-up's language. */
export function ParentChildPicker() {
  const app = useApp();
  const { t } = useT();
  const first = app.profiles[0]?.id ?? null;
  const missing = !app.profiles.some((p) => p.id === app.activeChildId);
  useEffect(() => {
    if (missing && first) app.setActiveChild(first, true);
  }, [missing, first, app]);
  const current = app.profiles.find((p) => p.id === app.activeChildId);
  if (app.profiles.length === 0) return null;
  return (
    <Card tone="primary" style={{ gap: S.sm }}>
      {current ? (
        <Row testID="parent-current-child">
          <Avatar id={current.avatar} size={48} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt variant="h2" color={C.primary}>
              {t('pNowFor', { name: current.nickname, n: current.grade })}
            </Txt>
          </View>
        </Row>
      ) : null}
      {app.profiles.length > 1 ? (
        <Row wrap>
          <Txt variant="small" bold>
            {t('pSwitch')}
          </Txt>
          {app.profiles.map((p) => (
            <Chip
              key={p.id}
              label={p.nickname}
              selected={p.id === app.activeChildId}
              onPress={() => app.setActiveChild(p.id, true)}
              testID={`pchild-${p.nickname}`}
            />
          ))}
        </Row>
      ) : null}
    </Card>
  );
}
