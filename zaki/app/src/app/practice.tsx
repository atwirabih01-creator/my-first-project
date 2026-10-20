// Practice: "explain it again", extra questions, and Ask Zaki about a learned lesson.
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { AskZaki, LessonHelpBar, QuestionWithHints } from '@/components/lesson';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useHelpReturn } from '@/lib/nav';
import { statusOf, useChild, useT } from '@/lib/store';
import { subjectInfo } from '@/lib/subjects';

export default function Practice() {
  const { packs, progress, child, app } = useChild();
  const { t } = useT();
  const learned = Object.values(progress.lessons).filter((r) => statusOf(r) === 'learned' || statusOf(r) === 'mastered' || packs[r.key]);
  const [key, setKey] = useState<string | null>(null);
  const [tab, setTab] = useState<'explain' | 'questions' | 'ask'>('explain');
  const [step, setStep] = useState(0);
  const [qi, setQi] = useState(0);
  useHelpReturn('/practice');

  const cp = key ? packs[key] : undefined;
  const pack = cp?.pack ?? null;
  const extra = pack ? [...pack.checks, ...pack.retestPool.slice(0, 3)] : [];

  return (
    <Screen
      child
      trackTime
      back={key ? () => setKey(null) : '/home'}
      title={`💬 ${t('practice')}`}
      lessonKey={key ?? undefined}
      footer={key ? <LessonHelpBar lessonKey={key} /> : undefined}>
      {!key ? (
        <>
          <Txt variant="h2">{t('pickLesson')}</Txt>
          {learned.filter((r) => packs[r.key]).length === 0 ? <Txt>{t('noLearned')}</Txt> : null}
          {learned
            .filter((r) => packs[r.key])
            .map((r) => (
              <Pressable
                key={r.key}
                testID={`practice-${r.topic}`}
                onPress={() => {
                  setKey(r.key);
                  setStep(0);
                  setQi(0);
                  setTab('explain');
                }}
                accessibilityRole="button"
                accessibilityLabel={r.topic}
                style={{ backgroundColor: C.card, borderRadius: R.lg, padding: S.lg, borderWidth: 2, borderColor: C.border, minHeight: 64 }}>
                <Row>
                  <Txt variant="big">{subjectInfo(r.subject).icon}</Txt>
                  <Txt bold style={{ flex: 1 }}>
                    {r.topic}
                  </Txt>
                </Row>
              </Pressable>
            ))}
        </>
      ) : pack ? (
        <>
          <Row wrap>
            <Chip label={t('explainAgain')} selected={tab === 'explain'} onPress={() => setTab('explain')} testID="tab-explain" />
            <Chip label={t('extraQs')} selected={tab === 'questions'} onPress={() => setTab('questions')} testID="tab-questions" />
            <Chip label={t('askTitle')} selected={tab === 'ask'} onPress={() => setTab('ask')} testID="tab-ask" />
          </Row>
          {tab === 'explain' ? (
            <View style={{ gap: S.md }}>
              <Txt variant="small">{t('stepOf', { n: step + 1, m: pack.teachSteps.length })}</Txt>
              <Row style={{ alignItems: 'flex-start' }}>
                <Mascot size={64} />
                <Card style={{ flex: 1 }}>
                  <Txt variant="big">{pack.teachSteps[step]?.text}</Txt>
                </Card>
              </Row>
              {pack.teachSteps[step]?.example ? (
                <Card tone="sun">
                  <Txt>✨ {pack.teachSteps[step].example}</Txt>
                </Card>
              ) : null}
              <Btn title={t('next')} big onPress={() => setStep((step + 1) % pack.teachSteps.length)} />
            </View>
          ) : tab === 'questions' ? (
            qi < extra.length ? (
              <QuestionWithHints
                key={`${extra[qi].id}-${qi}`}
                pack={pack}
                question={extra[qi]}
                onWrong={() => child && app.recordWrongCheck(child.id, key)}
                onDone={() => setQi(qi + 1)}
              />
            ) : (
              <Card tone="mint" style={{ alignItems: 'center' }}>
                <Mascot size={90} mood="cheer" />
                <Txt variant="big" center>
                  {t('allDone')}
                </Txt>
                <Btn title={t('fcAgain')} onPress={() => setQi(0)} />
              </Card>
            )
          ) : (
            <AskZaki pack={pack} />
          )}
        </>
      ) : null}
    </Screen>
  );
}
