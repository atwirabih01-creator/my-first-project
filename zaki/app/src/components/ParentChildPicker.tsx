import { useEffect } from 'react';

import { useApp, useT } from '@/lib/store';
import { Avatar } from './Avatar';
import { Chip, Row, Txt } from './ui';

/** Which child the grown-up is looking at. Keeps the grown-up's chosen language. */
export function ParentChildPicker() {
  const app = useApp();
  const { t } = useT();
  const first = app.profiles[0]?.id ?? null;
  const missing = !app.profiles.some((p) => p.id === app.activeChildId);
  useEffect(() => {
    if (missing && first) app.setActiveChild(first, true);
  }, [missing, first, app]);
  if (app.profiles.length === 0) return null;
  return (
    <Row wrap>
      <Txt variant="small" bold>
        {t('pChild')}:
      </Txt>
      {app.profiles.map((p) => (
        <Row key={p.id} gap={4}>
          <Avatar id={p.avatar} size={32} />
          <Chip label={p.nickname} selected={p.id === app.activeChildId} onPress={() => app.setActiveChild(p.id, true)} testID={`pchild-${p.nickname}`} />
        </Row>
      ))}
    </Row>
  );
}
