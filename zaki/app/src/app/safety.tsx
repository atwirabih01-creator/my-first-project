// FIXED SAFETY SCREEN. Calm, bundled text only (never AI text), never promises secrecy,
// works offline, never behind the parental gate. Numbers are plain big text (no tel: links).
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Btn, Card, Txt } from '@/components/ui';
import { C, S } from '@/constants/theme';
import { getChildHelpRoutes, type HelpKind } from '@/lib/helpRoutes';
import { useChild, useT } from '@/lib/store';

const KINDS: HelpKind[] = ['home', 'self_harm', 'fear', 'general'];

export default function Safety() {
  const { kind: rawKind } = useLocalSearchParams<{ kind?: string }>();
  const kind: HelpKind = KINDS.includes(rawKind as HelpKind) ? (rawKind as HelpKind) : 'general';
  const { child, settings, app } = useChild();
  const { t, lang } = useT();
  // Country comes from the parent's setting. No child selected -> unknown -> trusted adult only.
  const country = child ? settings.country : undefined;
  const routes = getChildHelpRoutes(country, kind);
  // Keep the bundled emergency fallback visible even if a route's own fallback isn't listed.
  const fallbacks = [...new Set(routes.map((r) => r.fallback?.[lang]).filter(Boolean) as string[])];

  return (
    <Screen
      back={() => (router.canGoBack() ? router.back() : router.replace(app.activeChildId ? '/home' : '/'))}
      bg="#F4F8FF"
      showLang>
      <View style={{ alignItems: 'center', gap: S.sm }} testID="safety-screen">
        <Mascot size={80} mood="calm" animate={false} />
        <Txt variant="title" center>
          {t('safetyTitle')}
        </Txt>
        <Txt center>{t('safetyBody')}</Txt>
      </View>

      <Card tone="lilac">
        <Txt bold center>
          {t('safetyNoSecret')}
        </Txt>
        <Txt center>{t('safetyFlag')}</Txt>
      </Card>

      <Txt variant="h2">{t('safetyWhat')}</Txt>
      {routes.map((r) => (
        <Card key={r.id} tone={r.number ? undefined : 'mint'} style={{ gap: S.sm }}>
          <Txt variant="big">{r.text[lang]}</Txt>
          {r.number ? (
            <Txt
              variant="title"
              center
              selectable
              color={C.primary}
              style={{ fontSize: 40, lineHeight: 50, writingDirection: 'ltr' }}
              testID="help-number">
              {r.number}
            </Txt>
          ) : null}
        </Card>
      ))}
      {fallbacks.map((f) => (
        <Card key={f} tone="coral">
          <Txt variant="big" bold>
            {f}
          </Txt>
        </Card>
      ))}

      <Btn
        title={t('safetyBack')}
        variant="secondary"
        onPress={() => (router.canGoBack() ? router.back() : router.dismissTo('/'))}
        testID="safety-back"
      />
    </Screen>
  );
}
