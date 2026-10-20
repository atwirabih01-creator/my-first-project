// Progress dashboard: sessions, minutes, scores, weak topics, reported answers.
import { View } from 'react-native';

import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Card, Row, Txt } from '@/components/ui';
import { C, S } from '@/constants/theme';
import { formatDate } from '@/lib/nav';
import { statusOf, useChild, useT } from '@/lib/store';

function Stat({ label, value, testID }: { label: string; value: string | number; testID?: string }) {
  return (
    <Card style={{ flex: 1, minWidth: 140, alignItems: 'center' }}>
      <Txt variant="title" center testID={testID}>
        {value}
      </Txt>
      <Txt variant="small" center>
        {label}
      </Txt>
    </Card>
  );
}

export default function Progress() {
  const { child, progress, app } = useChild();
  // Parent view: ONLY flags routed to the parent. Reviewer-route flags (possible home involvement) never appear here.
  const notes = (app.flags ?? []).filter((f) => f.route === 'parent' && f.childRef === child?.id);
  const { t, lang } = useT();
  const minutes = Math.round(Object.values(progress.usage).reduce((a, b) => a + b, 0));
  const avg = progress.tests.length
    ? Math.round((progress.tests.reduce((a, x) => a + x.score / x.total, 0) / progress.tests.length) * 100)
    : null;
  const weak = Object.values(progress.lessons).filter(
    (r) => r.needsGrownUp || (statusOf(r) === 'learning' && (r.wrongChecks >= 2 || progress.tests.some((x) => x.lessonKey === r.key && !x.passed))),
  );
  const topicOf = (key: string) => progress.lessons[key]?.topic ?? key.split(':')[1];

  return (
    <Screen parent back="/parent" title={`📊 ${t('pProgress')}`}>
      <ParentChildPicker />
      {child ? (
        <View style={{ gap: S.md }}>
          <Row wrap gap={S.md}>
            <Stat label={t('progSessions')} value={progress.sessions.length} testID="stat-sessions" />
            <Stat label={t('progMinutes')} value={minutes} />
            <Stat label={t('progAvg')} value={avg === null ? '–' : `${avg}%`} />
          </Row>
          <Card>
            <Txt variant="h2">{t('progScores')}</Txt>
            {progress.tests.length === 0 ? <Txt>{t('progNone')}</Txt> : null}
            {[...progress.tests].reverse().map((x, i) => (
              <Row key={i}>
                <Txt style={{ flex: 1 }}>
                  {topicOf(x.lessonKey)} · {formatDate(x.date, lang)}
                </Txt>
                <Txt bold color={x.passed ? C.mint : C.wrong}>
                  {x.score}/{x.total} {x.passed ? '✓' : ''}
                </Txt>
              </Row>
            ))}
          </Card>
          <Card tone="sun">
            <Txt variant="h2">🤔 {t('progWeak')}</Txt>
            {weak.length === 0 ? <Txt>{t('progNone')}</Txt> : null}
            {weak.map((r) => (
              <Txt key={r.key}>
                • {r.topic}
                {r.needsGrownUp ? ` (${t('progNeedsGrownUp')})` : ''}
              </Txt>
            ))}
          </Card>
          <Card tone="lilac" testID="safety-notes">
            <Txt variant="h2">💛 {t('safetyNotes')}</Txt>
            {notes.length === 0 ? <Txt>{t('safetyNotesNone')}</Txt> : null}
            {notes.map((f) => (
              <Txt key={f.id} variant="small" testID="safety-note">
                {t('safetyNoteRow', {
                  date: formatDate(f.ts.slice(0, 10), lang),
                  kind: t(f.category === 'fear' ? 'kind_fear' : f.category === 'self_harm' ? 'kind_self_harm' : f.category === 'general' ? 'kind_general' : 'kind_home'),
                })}
              </Txt>
            ))}
          </Card>
          <Card>
            <Txt variant="h2">🚩 {t('progReports')}</Txt>
            {progress.reports.length === 0 ? <Txt>{t('progNone')}</Txt> : null}
            {progress.reports.map((r, i) => (
              <Txt key={i} variant="small">
                • {r.lessonKey ? topicOf(r.lessonKey) : ''}: {r.text || '—'}
              </Txt>
            ))}
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
