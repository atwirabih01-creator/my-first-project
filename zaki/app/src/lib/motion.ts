// Motion helpers: one place that knows whether the child's phone asks for "reduce motion".
// When it does, every bounce, wave and confetti burst in the app is switched off.
import { useSyncExternalStore } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** The native driver runs animations off the JS thread on phones (not available on web). */
export const NATIVE_DRIVER = Platform.OS !== 'web';

// Read once at start-up so the very first screen already knows (no flash of animation).
let reduced = false;
const listeners = new Set<() => void>();
const set = (v: boolean) => {
  reduced = !!v;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const read = () => reduced;
try {
  AccessibilityInfo.isReduceMotionEnabled?.().then(set, () => {});
  AccessibilityInfo.addEventListener?.('reduceMotionChanged', set);
} catch {
  // Older platforms: keep animations on.
}

/** True when the device asks for less motion. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, read, read);
}
