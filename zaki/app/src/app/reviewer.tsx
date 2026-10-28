// SAFETY REVIEWER INBOX: for the independent reviewer (not a family member), protected by a
// reviewer code. Online: flags come from the server (/api/review/flags). Demo/offline: flags
// kept on this device. Shows category, time, route, childRef and a scrubbed excerpt: never names.
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { fetchReviewerFlags, updateReviewerFlag, type ServerReviewerFlag } from '@/lib/api';
import { normalizeDigits, type StringKey } from '@/lib/i18n';
import { useApp, useT } from '@/lib/store';

const DEMO_CODE = '2468';

const LOCAL_CATEGORY: Record<string, string> = { home: 'disclosure_harm', fear: 'violence_fear', general: 'help_button' };
const KNOWN = ['disclosure_harm', 'self_harm', 'violence_fear', 'help_request', 'sexual', 'personal_data', 'adult_topic', 'prompt_injection', 'off_topic', 'politics', 'help_button', 'server'];

/** Human-readable category (en/ar) instead of a raw code. */
function categoryKey(category: string): StringKey {
  const c = LOCAL_CATEGORY[category] ?? category;
  return (KNOWN.includes(c) ? `cat_${c}` : 'cat_other') as StringKey;
}

function routeKey(f: { route: 'reviewer' | 'parent'; involvement?: string; involvesHome?: boolean }): StringKey {
  const involvement = f.involvement ?? (f.involvesHome ? 'home' : undefined);
  if (f.route === 'reviewer') return involvement === 'home' ? 'routeReviewer' : 'routeReviewerUnclear';
  return involvement === 'outside' ? 'routeParentOutside' : 'routeParent';
}

function localTime(ts: string, lang: string): string {
  try {
    return new Date(ts).toLocaleString(lang === 'ar' ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts.slice(0, 16).replace('T', ' ');
  }
}
type Flag = ServerReviewerFlag;
type Status = Flag['status'];

export default function Reviewer() {
  const app = useApp();
  const { t, align, lang } = useT();
  const [code, setCode] = useState('');
  const [open, setOpen] = useState<null | 'local' | 'server'>(null);
  const [serverFlags, setServerFlags] = useState<Flag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function unlock() {
    const c = normalizeDigits(code.trim());
    setError(null);
    if (app.demo !== false) {
      // Demo/offline: the fixed demo code opens the flags kept on this device.
      if (c === DEMO_CODE) setOpen('local');
      else setError(t('reviewerWrong'));
      return;
    }
    try {
      setServerFlags(await fetchReviewerFlags(c));
      setOpen('server');
    } catch (e) {
      setError((e as Error).message === 'wrong_code' ? t('reviewerWrong') : t('reviewerUnavailable'));
    }
  }

  const flags: Flag[] =
    open === 'local'
      ? [...(app.flags ?? [])].reverse().map((f) => ({ id: f.id, ts: f.ts, category: f.category, route: f.route, involvement: f.involvement, childRef: f.childRef, excerpt: f.excerpt, status: f.status, note: f.note }))
      : serverFlags;

  async function setStatus(f: Flag, status: Status) {
    const note = notes[f.id] ?? f.note;
    if (open === 'local') {
      app.reviewLocalFlag(f.id, status, note);
      return;
    }
    try {
      const { flag } = await updateReviewerFlag(normalizeDigits(code.trim()), f.id, status, note);
      setServerFlags((list) => list.map((x) => (x.id === f.id ? flag : x)));
    } catch {
      setError(t('reviewerUnavailable'));
    }
  }

  return (
    <Screen back="/" title={`🛡️ ${t('reviewerTitle')}`}>
      <Card tone="lilac">
        <Txt>{t('reviewerIntro')}</Txt>
      </Card>
      {!open ? (
        <Card>
          <Txt bold>{t('reviewerCode')}</Txt>
          <TextInput value={code} onChangeText={setCode} secureTextEntry keyboardType="number-pad" accessibilityLabel={t('reviewerCode')} onSubmitEditing={unlock} style={styles.input} testID="reviewer-code" />
          {error ? (
            <Txt color={C.wrong} testID="reviewer-error">
              {error}
            </Txt>
          ) : null}
          <Btn title={t('reviewerOpen')} onPress={unlock} testID="reviewer-open" />
        </Card>
      ) : (
        <View style={{ gap: S.md }} testID="reviewer-inbox">
          {open === 'local' ? <Txt variant="small">🧪 {t('reviewerDemoNote')}</Txt> : null}
          {flags.length === 0 ? <Txt>{t('reviewerNone')}</Txt> : null}
          {flags.map((f) => (
            <Card key={f.id} tone={f.route === 'reviewer' ? 'coral' : undefined} testID="reviewer-flag">
              <Row wrap>
                <Txt bold testID="reviewer-category">{t(categoryKey(f.category))}</Txt>
                <Txt variant="small">{localTime(f.ts, lang)}</Txt>
              </Row>
              <Txt variant="small" bold>
                {t(routeKey(f))}
              </Txt>
              <Txt variant="small">childRef: {f.childRef ?? '—'}</Txt>
              {f.excerpt ? <Txt testID="reviewer-excerpt">“{f.excerpt}”</Txt> : null}
              <Row wrap>
                {(['new', 'seen', 'referred', 'resolved'] as Status[]).map((s) => (
                  <Chip key={s} label={t(s === 'new' ? 'statusNew' : s === 'seen' ? 'statusSeen' : s === 'referred' ? 'statusReferred' : 'statusResolved')} selected={f.status === s} onPress={() => setStatus(f, s)} testID={`flag-status-${s}`} />
                ))}
              </Row>
              <TextInput
                value={notes[f.id] ?? f.note ?? ''}
                onChangeText={(v) => setNotes((n) => ({ ...n, [f.id]: v }))}
                placeholder={t('reviewerNote')}
                placeholderTextColor="#8893AA"
                maxLength={1000}
                accessibilityLabel={t('reviewerNote')}
                style={[styles.note, { textAlign: align }]}
                testID="flag-note"
              />
              <Btn small variant="secondary" title={t('saveNote')} onPress={() => setStatus(f, f.status === 'new' ? 'seen' : f.status)} testID="flag-save-note" />
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 56, borderRadius: R.md, borderWidth: 2, borderColor: C.border, fontSize: 24, textAlign: 'center', backgroundColor: '#FFFFFF', color: C.text },
  note: { minHeight: 48, borderRadius: R.md, borderWidth: 2, borderColor: C.border, paddingHorizontal: S.md, fontSize: 16, backgroundColor: '#FFFFFF', color: C.text },
});
