// Progress dashboard: sessions, minutes, scores, weak topics, reported answers.
import { View } from 'react-native';

import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Card, Row, Txt } from '@/components/ui';
import { C, S } from '@/constants/theme';
import type { StringKey } from '@/lib/i18n';
import { formatDate } from '@/lib/nav';
import { statusOf, useChild, useT } from '@/lib/store';

/**
 * Parent wording for a safety note: what happened in calm words, never the child's own words.
 * Categories come from the phone's check (fear, self_harm, home, general) or the server
 * (violence_fear, self_harm, sensitive_topic, ...).
 */
function parentNoteText(category: string, noScreen: boolean, date: string, t: ReturnType<typeof useT>['t']): string {
  const c = category.toLowerCase();
  // Asked about war / politics / religion: no help screen was shown, Zaki just steered back.
  if (c === 'sensitive_topic') return t('safetyNoteRowCalm', { date, kind: t('kind_sensitive_topic') });
  const kind: StringKey =
    c === 'fear' || c === 'violence_fear' ? 'kind_fear' : c === 'self_harm' ? 'kind_self_harm' : c === 'general' || c === 'help_request' ? 'kind_general' : 'kind_home';
  // The child's own fear with nobody named: a calm line only, no help screen.
  return t(noScreen ? 'safetyNoteRowCalm' : 'safetyNoteRow', { date, kind: t(kind) });
}

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
                {parentNoteText(f.category, !!f.noScreen, formatDate(f.ts.slice(0, 10), lang), t)}
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
