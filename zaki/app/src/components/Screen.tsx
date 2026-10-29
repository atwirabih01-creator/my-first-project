// Screen frame used by every page: language direction, demo banner, header,
// "grown-up can see" indicator, daily time tracking and the parental-gate guard.
import { Redirect, router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AppState, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C, MaxWidth, R, S } from '@/constants/theme';
import { goTo } from '@/lib/nav';
import { todayStr, useApp, useChild, useT } from '@/lib/store';
import { Btn, Txt } from './ui';

export function LangToggle({ alsoChild }: { alsoChild?: boolean }) {
  const { uiLang, setUiLang } = useApp();
  const { t } = useT();
  return (
    <Pressable
      testID="lang-toggle"
      onPress={() => setUiLang(uiLang === 'en' ? 'ar' : 'en', alsoChild)}
      accessibilityRole="button"
      accessibilityLabel={t('langToggleA11y')}
      style={styles.langBtn}>
      <Text style={{ color: C.primary, fontWeight: '800', fontSize: 15 }}>🌐 {t('langToggle')}</Text>
    </Pressable>
  );
}

export function WatchIndicator() {
  const { t } = useT();
  return (
    <View style={styles.watch} accessibilityRole="text" testID="watch-indicator">
      <Txt variant="small" center color={C.text}>
        {t('watching')}
      </Txt>
    </View>
  );
}

export function DemoBanner() {
  const { demo } = useApp();
  const { t } = useT();
  if (!demo) return null;
  return (
    <View style={styles.demo} testID="demo-banner">
      <Txt variant="small" center color="#6B4E00">
        🧪 {t('demoBanner')}
      </Txt>
    </View>
  );
}

/** Counts learning minutes on child screens and sends the child to the break screen at the cap. */
function useTimeTracking(enabled: boolean, lessonKey?: string) {
  const { child, settings, progress, app } = useChild();
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const childId = child?.id;
  useEffect(() => {
    if (!enabled || !focused || !childId) return;
    const TICK_S = 15;
    const id = setInterval(() => {
      if (AppState.currentState === 'active') app.addUsage(childId, TICK_S / 60, lessonKey);
    }, TICK_S * 1000);
    return () => clearInterval(id);
  }, [enabled, focused, childId, lessonKey, app]);

  const used = progress.usage[todayStr()] ?? 0;
  const over = enabled && !!child && used >= settings.dailyLimitMin;
  useEffect(() => {
    if (over && focused) goTo('/break');
  }, [over, focused]);
}

export function Screen({
  children,
  title,
  back,
  child,
  parent,
  scroll = true,
  footer,
  trackTime,
  lessonKey,
  headerRight,
  bg = C.bg,
  showLang = true,
  helpButton = true,
}: {
  children: ReactNode;
  title?: string;
  /** Logical parent screen (or a handler). Never browser history. */
  back?: Href | (() => void);
  child?: boolean;
  parent?: boolean;
  scroll?: boolean;
  footer?: ReactNode;
  trackTime?: boolean;
  lessonKey?: string;
  headerRight?: ReactNode;
  bg?: string;
  showLang?: boolean;
  /** Child screens show a big "I need help" button unless they have their own (footer) or are the help page. */
  helpButton?: boolean;
}) {
  const app = useApp();
  const { rtl, t } = useT();
  useTimeTracking(!!(child && trackTime), lessonKey);

  if (!app.loaded) return <View style={{ flex: 1, backgroundColor: bg }} />;
  if (parent && !app.parentUnlocked) return <Redirect href="/parent/gate" />;
  if (child && trackTime && !app.activeChildId) return <Redirect href="/" />;

  const dir = rtl ? 'rtl' : 'ltr';
  const webDir = Platform.OS === 'web' ? ({ dir } as object) : {};
  const onBack = () => {
    if (typeof back === 'function') back();
    else if (back) goTo(back);
  };

  const body = <View style={styles.inner}>{children}</View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'bottom', 'left', 'right']}>
      <View style={{ flex: 1, direction: dir }} {...webDir}>
        <DemoBanner />
        {title || back || showLang || headerRight ? (
          <View style={styles.header}>
            {back ? (
              <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={t('back')} style={styles.backBtn} testID="back-btn">
                <Text style={{ fontSize: 26, color: C.primary, fontWeight: '800' }}>{rtl ? '→' : '←'}</Text>
              </Pressable>
            ) : null}
            <View style={{ flex: 1 }}>{title ? <Txt variant="h2">{title}</Txt> : null}</View>
            {headerRight}
            {showLang ? <LangToggle alsoChild={child} /> : null}
          </View>
        ) : null}
        {scroll ? (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {body}
          </ScrollView>
        ) : (
          <View style={[styles.scroll, { flex: 1 }]}>{body}</View>
        )}
        {footer ? (
          <View style={styles.footer}>{footer}</View>
        ) : child && helpButton ? (
          <View style={styles.footer}>
            <Btn title={t('needHelp')} icon="🆘" variant="help" onPress={() => router.push('/help')} testID="need-help" />
          </View>
        ) : null}
        {child ? <WatchIndicator /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.xs,
    width: '100%',
    maxWidth: MaxWidth,
    alignSelf: 'center',
  },
  backBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card },
  langBtn: {
    minHeight: 48,
    paddingHorizontal: S.md,
    borderRadius: R.pill,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: S.lg, paddingVertical: S.md, flexGrow: 1 },
  inner: { width: '100%', maxWidth: MaxWidth, alignSelf: 'center', gap: S.lg, flexGrow: 1 },
  footer: { paddingHorizontal: S.lg, paddingBottom: S.sm, width: '100%', maxWidth: MaxWidth, alignSelf: 'center', gap: S.sm },
  watch: { backgroundColor: C.lilacSoft, paddingVertical: 8, paddingHorizontal: S.lg },
  demo: { backgroundColor: C.sunSoft, paddingVertical: 6, paddingHorizontal: S.lg, borderBottomWidth: 1, borderBottomColor: '#F2D27A' },
});
