// EXPORT & DELETE (grown-ups, behind the gate).
// Download: one JSON file with profiles, lessons, results, exams and the consent record
// (safety reports meant only for the reviewer are NOT included). Web = file download,
// phone = share sheet. Delete: typed confirmation; the server deletes what it stores for
// these childRefs (safety flags kept only anonymised), then this device is wiped.
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { deleteFamilyOnServer } from '@/lib/api';
import { buildExport } from '@/lib/exportData';
import { goTo } from '@/lib/nav';
import { todayStr, useApp, useT } from '@/lib/store';

async function saveFile(name: string, text: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return;
  }
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(text);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: name });
}

export default function OurData() {
  const app = useApp();
  const { t } = useT();
  const [typed, setTyped] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function exportAll() {
    await saveFile(`zaki-data-${todayStr()}.json`, JSON.stringify(buildExport(app), null, 2));
    setMsg(t('exportDone'));
  }

  async function deleteAll() {
    const word = typed.trim();
    if (word !== 'DELETE' && word !== 'احذف') {
      setMsg(t('deleteWrongWord'));
      return;
    }
    setBusy(true);
    try {
      await deleteFamilyOnServer(app.profiles.map((p) => p.id));
    } catch {
      setBusy(false);
      setMsg(t('deleteServerFail'));
      return; // nothing deleted locally either, so the family can retry
    }
    app.wipeAll();
    setBusy(false);
    goTo('/');
  }

  return (
    <Screen parent back="/parent" title={`🗂️ ${t('pData')}`}>
      <Card>
        <Txt variant="h2">⬇️ {t('exportTitle')}</Txt>
        <Txt>{t('exportText')}</Txt>
        <Btn title={t('exportBtn')} onPress={exportAll} testID="export-btn" />
      </Card>
      <Card tone="coral">
        <Txt variant="h2">🗑️ {t('deleteTitle')}</Txt>
        <Txt>{t('deleteText')}</Txt>
        <Txt bold>{t('deleteTypeHint')}</Txt>
        <TextInput value={typed} onChangeText={setTyped} autoCapitalize="characters" autoCorrect={false} accessibilityLabel={t('deleteTypeHint')} placeholder={t('deleteWord')} placeholderTextColor="#B08880" style={styles.input} testID="delete-input" />
        <Btn title={t('deleteBtn')} variant="help" disabled={busy} onPress={deleteAll} testID="delete-btn" />
      </Card>
      {msg ? (
        <Card tone="sun">
          <Txt bold testID="data-msg">
            {msg}
          </Txt>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 52, borderRadius: R.md, borderWidth: 2, borderColor: C.coral, paddingHorizontal: S.md, fontSize: 20, backgroundColor: '#FFFFFF', color: C.text, textAlign: 'center' },
});
