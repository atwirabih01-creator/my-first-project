// Classes (memory): subjects -> lessons, each with its summary card and status.
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Btn, Card, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { openLesson } from '@/lib/nav';
import { lessonKeyOf, statusOf, useChild, useT } from '@/lib/store';
import { SUBJECTS } from '@/lib/subjects';
import { accessForKey } from '@/lib/unlock';
import type { LessonStatus } from '@/lib/types';

const STATUS_COLOR: Record<LessonStatus, { bg: string; fg: string }> = {
  new: { bg: C.primarySoft, fg: '#17656E' }, // 4.5:1 on the soft background
  learning: { bg: C.sunSoft, fg: '#8A6100' },
  learned: { bg: C.mintSoft, fg: '#1E6B41' },
  mastered: { bg: C.lilacSoft, fg: C.lilac },
};

function StatusPill({ status }: { status: LessonStatus }) {
  const { t } = useT();
  const c = STATUS_COLOR[status];
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: R.pill, paddingHorizontal: S.md, paddingVertical: 4 }} testID={`status-${status}`}>
      <Txt variant="small" bold color={c.fg}>
        {status === 'mastered' ? '🏆 ' : status === 'learned' ? '✓ ' : ''}
        {t(`status_${status}`)}
      </Txt>
    </View>
  );
}

export default function Classes() {
  const { progress, plan, packs } = useChild();
  const { t } = useT();
  const [open, setOpen] = useState<string | null>(null);

  // Lessons = everything started + everything in the plan.
  const items = new Map<string, { key: string; subject: (typeof SUBJECTS)[number]['id']; topic: string }>();
  Object.values(progress.lessons).forEach((r) => items.set(r.key, { key: r.key, subject: r.subject, topic: r.topic }));
  plan.forEach((p) => {
    const key = lessonKeyOf(p.subject, p.topic);
    if (!items.has(key)) items.set(key, { key, subject: p.subject, topic: p.topic });
  });
  const all = [...items.values()];

  return (
    <Screen child trackTime back="/home" title={`📚 ${t('myClasses')}`}>
      {all.length === 0 ? <Txt>{t('noLessons')}</Txt> : null}
      {SUBJECTS.filter((s) => all.some((x) => x.subject === s.id)).map((s) => (
        <View key={s.id} style={{ gap: S.sm }}>
          <Txt variant="h2">
            {s.icon} {t(s.key)}
          </Txt>
          {all
            .filter((x) => x.subject === s.id)
            .map((x) => {
              const status = statusOf(progress.lessons[x.key]);
              const pack = packs[x.key]?.pack;
              const isOpen = open === x.key;
              const acc = accessForKey(plan, progress, x.key);
              const learnedIt = status === 'learned' || status === 'mastered';
              return (
                <Card key={x.key}>
                  <Pressable
                    onPress={() => setOpen(isOpen ? null : x.key)}
                    accessibilityRole="button"
                    accessibilityLabel={x.topic}
                    accessibilityState={{ expanded: isOpen }}
                    style={{ minHeight: 48, justifyContent: 'center' }}
                    testID={`class-${x.topic}`}>
                    <Row>
                      <Txt bold style={{ flex: 1 }}>
                        {acc.open || acc.pending ? '' : '🔒 '}
                        {x.topic}
                      </Txt>
                      <StatusPill status={status} />
                    </Row>
                    {!acc.open && !acc.pending ? (
                      <Txt variant="small" testID={`class-locked-${x.topic}`}>
                        {t('lockedMsg', { topic: acc.blocker ?? '' })}
                      </Txt>
                    ) : null}
                  </Pressable>
                  {isOpen && acc.open ? (
                    <View style={{ gap: S.sm }}>
                      {pack ? (
                        <Card tone="mint">
                          <Txt variant="small" bold>
                            🗒️ {t('summaryTitle')}
                          </Txt>
                          {pack.summary.map((l, i) => (
                            <Txt key={i}>• {l}</Txt>
                          ))}
                        </Card>
                      ) : null}
                      <Row wrap>
                        {learnedIt && pack ? (
                          <>
                            {/* Full review from the saved lesson: no AI needed. */}
                            <Btn small title={t('reviewLesson')} onPress={() => openLesson(x, 'review')} testID={`review-${x.topic}`} />
                            <Btn small variant="secondary" title={t('retakeTest')} onPress={() => openLesson(x, 'test')} testID={`retake-${x.topic}`} />
                          </>
                        ) : (
                          <>
                            <Btn small title={status === 'new' ? t('learnIt') : t('practiseIt')} onPress={() => openLesson(x)} />
                            {pack ? <Btn small variant="secondary" title={t('takeTest')} onPress={() => openLesson(x, 'test')} /> : null}
                          </>
                        )}
                      </Row>
                    </View>
                  ) : null}
                </Card>
              );
            })}
        </View>
      ))}
    </Screen>
  );
}
