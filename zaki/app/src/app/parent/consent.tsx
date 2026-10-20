// FAMILY CONSENT (grown-ups, behind the gate). Once per family, before any lesson or AI use.
// Two guardians each agree, OR one guardian explicitly confirms the other agrees (or that
// they are the only legal guardian). Only first names + relationship are stored.
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { CONSENT_SECTIONS, CONSENT_VERSION } from '@/lib/consentText';
import { formatDate } from '@/lib/nav';
import { todayStr, useApp, useT } from '@/lib/store';

type G = { firstName: string; relationship: string; agree: boolean };
const emptyG = (): G => ({ firstName: '', relationship: '', agree: false });
const firstOnly = (s: string) => s.trim().split(/\s+/)[0]?.slice(0, 30) ?? '';

function Check({ checked, onPress, label, testID }: { checked: boolean; onPress: () => void; label: string; testID?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label} style={styles.check} testID={testID}>
      <Txt variant="big">{checked ? '☑' : '☐'}</Txt>
      <Txt style={{ flex: 1, minWidth: 0 }}>{label}</Txt>
    </Pressable>
  );
}

export default function Consent() {
  const app = useApp();
  const { t, lang, align } = useT();
  const [mode, setMode] = useState<'two-guardians' | 'one-with-agreement'>('two-guardians');
  const [g1, setG1] = useState<G>(emptyG);
  const [g2, setG2] = useState<G>(emptyG);
  const [otherAgrees, setOtherAgrees] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const today = todayStr();

  const ok = (g: G) => firstOnly(g.firstName).length >= 2 && g.relationship.trim().length >= 2 && g.agree;

  function save() {
    const valid = mode === 'two-guardians' ? ok(g1) && ok(g2) : ok(g1) && otherAgrees;
    if (!valid) {
      setError(t('consentMissing'));
      return;
    }
    const guardians = (mode === 'two-guardians' ? [g1, g2] : [g1]).map((g) => ({ firstName: firstOnly(g.firstName), relationship: g.relationship.trim().slice(0, 40) }));
    app.giveConsent({
      version: CONSENT_VERSION,
      at: new Date().toISOString(),
      date: today,
      mode,
      guardians,
      otherGuardianAgrees: mode === 'one-with-agreement' ? true : undefined,
    });
    setError(null);
    setSaved(t('consentSaved', { date: formatDate(today, lang) }));
  }

  const guardianFields = (g: G, set: (g: G) => void, n: number) => (
    <Card key={n} style={{ gap: S.sm }}>
      <Txt bold>{t('guardianN', { n })}</Txt>
      <TextInput value={g.firstName} onChangeText={(v) => set({ ...g, firstName: v })} placeholder={t('firstName')} placeholderTextColor="#8893AA" maxLength={30} accessibilityLabel={t('firstName')} style={[styles.input, { textAlign: align }]} testID={`g${n}-name`} />
      <TextInput value={g.relationship} onChangeText={(v) => set({ ...g, relationship: v })} placeholder={t('relationship')} placeholderTextColor="#8893AA" maxLength={40} accessibilityLabel={t('relationship')} style={[styles.input, { textAlign: align }]} testID={`g${n}-rel`} />
      <Check checked={g.agree} onPress={() => set({ ...g, agree: !g.agree })} label={t('iAgree')} testID={`g${n}-agree`} />
    </Card>
  );

  return (
    <Screen parent back="/parent" title={`📝 ${t('consentTitle')}`}>
      <ParentChildPicker />
      <Txt>{t('consentIntro')}</Txt>
      {CONSENT_SECTIONS[lang].map((s) => (
        <Card key={s.title} tone="primary">
          <Txt bold>{s.title}</Txt>
          <Txt>{s.body}</Txt>
        </Card>
      ))}
      <Row wrap>
        <Chip label={t('consentModeTwo')} selected={mode === 'two-guardians'} onPress={() => setMode('two-guardians')} testID="consent-mode-two" />
        <Chip label={t('consentModeOne')} selected={mode === 'one-with-agreement'} onPress={() => setMode('one-with-agreement')} testID="consent-mode-one" />
      </Row>
      {guardianFields(g1, setG1, 1)}
      {mode === 'two-guardians' ? (
        guardianFields(g2, setG2, 2)
      ) : (
        <Card tone="sun">
          <Check checked={otherAgrees} onPress={() => setOtherAgrees(!otherAgrees)} label={t('otherAgrees')} testID="consent-other-agrees" />
        </Card>
      )}
      <Txt>{t('consentDate', { date: formatDate(today, lang) })}</Txt>
      {app.demo ? (
        <Btn
          small
          variant="ghost"
          title={`🧪 ${t('consentDemoFill')}`}
          onPress={() => {
            setMode('two-guardians');
            setG1({ firstName: 'Rami', relationship: lang === 'ar' ? 'أب' : 'father', agree: true });
            setG2({ firstName: 'Lina', relationship: lang === 'ar' ? 'أم' : 'mother', agree: true });
          }}
          testID="consent-demo-fill"
        />
      ) : null}
      {error ? (
        <Card tone="coral">
          <Txt bold testID="consent-error">
            {error}
          </Txt>
        </Card>
      ) : null}
      {saved ? (
        <Card tone="mint">
          <Txt bold testID="consent-saved">
            {saved}
          </Txt>
        </Card>
      ) : null}
      <Btn title={t('consentSave')} big icon="✅" onPress={save} testID="consent-save" />
      <View style={{ height: S.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 50, borderRadius: R.md, borderWidth: 2, borderColor: C.border, paddingHorizontal: S.md, fontSize: 17, backgroundColor: '#FFFFFF', color: C.text },
  check: { flexDirection: 'row', alignItems: 'center', gap: S.sm, minHeight: 48 },
});
