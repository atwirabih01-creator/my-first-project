// Tests: upcoming tests from the grown-up's plan, results history, retry when ready.
import { View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Btn, Card, Row, Txt } from '@/components/ui';
import { C, S } from '@/constants/theme';
import { formatDate, openLesson } from '@/lib/nav';
import { lessonKeyOf, MAX_TESTS_PER_DAY, todayStr, useChild, useT } from '@/lib/store';
import { subjectInfo } from '@/lib/subjects';

export default function Tests() {
  const { progress, plan } = useChild();
  const { t, lang } = useT();
  const today = todayStr();
  const upcoming = plan.filter((p) => p.kind === 'test' && (!p.dueDate || p.dueDate >= today));
  const results = [...progress.tests].reverse();

  const triesLeft = (key: string) => {
    const todays = progress.tests.filter((x) => x.lessonKey === key && x.date === today);
    return todays.some((x) => x.passed) || todays.length < MAX_TESTS_PER_DAY;
  };

  return (
    <Screen child trackTime back="/home" title={`📝 ${t('tests')}`}>
      <Txt variant="h2">⏳ {t('upcoming')}</Txt>
      {upcoming.length === 0 ? <Txt>{t('noUpcoming')}</Txt> : null}
      {upcoming.map((p) => {
        const s = subjectInfo(p.subject);
        return (
          <Card key={p.id} tone="sun">
            <Row>
              <Txt variant="big">{s.icon}</Txt>
              <View style={{ flex: 1 }}>
                <Txt bold>{p.topic}</Txt>
                <Txt variant="small">{p.dueDate ? t('planTest', { date: formatDate(p.dueDate, lang) }) : t(s.key)}</Txt>
              </View>
            </Row>
            <Btn small title={t('practiseIt')} onPress={() => openLesson(p)} />
          </Card>
        );
      })}

      <Txt variant="h2">🏅 {t('results')}</Txt>
      {results.length === 0 ? <Txt>{t('noResults')}</Txt> : null}
      {results.map((r, i) => {
        const rec = progress.lessons[r.lessonKey];
        const topic = rec?.topic ?? r.lessonKey.split(':')[1];
        const subject = rec?.subject ?? (r.lessonKey.split(':')[0] as 'math');
        const canRetry = !r.passed && triesLeft(lessonKeyOf(subject, topic));
        return (
          <Card key={`${r.at}-${i}`} tone={r.passed ? 'mint' : undefined}>
            <Row>
              <View style={{ flex: 1 }}>
                <Txt bold>{topic}</Txt>
                <Txt variant="small">{formatDate(r.date, lang)}</Txt>
              </View>
              <Txt variant="h2" color={r.passed ? C.mint : C.textSoft}>
                {r.score}/{r.total}
              </Txt>
            </Row>
            <Txt variant="small" bold color={r.passed ? C.mint : C.textSoft}>
              {r.passed ? `✓ ${t('passedShort')}` : t('notYetShort')}
            </Txt>
            {!r.passed && i === results.findIndex((x) => x.lessonKey === r.lessonKey) ? (
              canRetry ? (
                <Btn small title={t('retry')} onPress={() => openLesson({ subject, topic }, 'test')} />
              ) : (
                <Txt variant="small">{t('tryAgainTomorrow')}</Txt>
              )
            ) : null}
          </Card>
        );
      })}
      <View style={{ height: S.md }} />
    </Screen>
  );
}
