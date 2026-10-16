import { LocaleProvider, Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { C } from '@/constants/theme';
import { setSafetyHandler } from '@/lib/api';
import { AppProvider, useApp } from '@/lib/store';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Navigator() {
  const { uiLang, loaded } = useApp();

  useEffect(() => {
    // Any API response with safety.showSafetyScreen opens the fixed, offline safety screen.
    setSafetyHandler((kind) => router.push({ pathname: '/safety', params: { kind } }));
    return () => setSafetyHandler(null);
  }, []);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  return (
    <LocaleProvider direction={uiLang === 'ar' ? 'rtl' : 'ltr'}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="safety" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="break" options={{ gestureEnabled: false }} />
      </Stack>
    </LocaleProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <Navigator />
    </AppProvider>
  );
}
