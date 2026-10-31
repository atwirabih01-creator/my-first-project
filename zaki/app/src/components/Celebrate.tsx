// Celebrations: a light burst of stars and confetti (plain views + emoji, one animation each),
// and a "pop in" wrapper for things that should arrive with a little bounce.
// Both do nothing when the phone asks for reduced motion. Never used on the safety screen.
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { NATIVE_DRIVER, useReducedMotion } from '@/lib/motion';

const CONFETTI = ['#FFC857', '#FF8A65', '#2A9DAA', '#6A55A8', '#3BB273', '#F25F9C'];
const EMOJI = ['⭐', '✨', '🌟', '🎉'];

type Particle = { dx: number; dy: number; delay: number; spin: number; emoji?: string; color?: string; w: number; h: number };

function makeParticles(count: number, reach: number, emojiShare: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    // Spread evenly round the circle, with a little randomness, biased upwards.
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = reach * (0.55 + Math.random() * 0.45);
    const isEmoji = i % Math.round(1 / emojiShare) === 0;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist * 0.8 - reach * 0.25,
      delay: Math.random() * 0.18,
      spin: (Math.random() - 0.5) * 720,
      emoji: isEmoji ? EMOJI[i % EMOJI.length] : undefined,
      color: CONFETTI[i % CONFETTI.length],
      w: 6 + Math.random() * 5,
      h: 10 + Math.random() * 6,
    };
  });
}

/**
 * A burst of stars + confetti from a point (default: the middle, a bit high).
 * Sits on top of its parent (absolute), never takes taps, clipped to the parent's box.
 * It plays once when it appears (give it a new `key` to play it again).
 */
export function Burst({
  big,
  originX = '50%',
  originY = '35%',
}: {
  big?: boolean;
  originX?: `${number}%`;
  originY?: `${number}%`;
}) {
  const reduced = useReducedMotion();
  const [t] = useState(() => new Animated.Value(0));
  const [parts] = useState<Particle[]>(() => makeParticles(big ? 22 : 10, big ? 170 : 90, big ? 0.34 : 0.5));

  useEffect(() => {
    if (reduced) return;
    t.setValue(0);
    const anim = Animated.timing(t, { toValue: 1, duration: big ? 1500 : 950, easing: Easing.linear, useNativeDriver: NATIVE_DRIVER });
    anim.start();
    return () => anim.stop();
  }, [reduced, big, t]);

  if (reduced) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { overflow: 'hidden', pointerEvents: 'none' }]}
      accessible={false}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden>
      <View style={{ position: 'absolute', left: originX, top: originY, width: 0, height: 0 }}>
        {parts.map((p, i) => {
          // Each particle flies out, then drifts down a little and fades.
          const a = p.delay;
          const b = Math.min(1, a + 0.5);
          const local = (v0: number, v1: number, v2: number) =>
            t.interpolate({ inputRange: [0, a, b, 1], outputRange: [v0, v0, v1, v2], extrapolate: 'clamp' });
          const style = {
            opacity: t.interpolate({ inputRange: [0, a, a + 0.05, 0.75, 1], outputRange: [0, 0, 1, 1, 0], extrapolate: 'clamp' }),
            transform: [
              { translateX: local(0, p.dx, p.dx * 1.08) },
              { translateY: local(0, p.dy, p.dy + (big ? 60 : 30)) },
              { rotate: t.interpolate({ inputRange: [0, a, b, 1], outputRange: ['0deg', '0deg', `${p.spin * 0.6}deg`, `${p.spin}deg`], extrapolate: 'clamp' }) },
              { scale: local(0.3, 1.1, 0.85) },
            ],
          };
          return p.emoji ? (
            <Animated.Text key={i} style={[styles.p, { fontSize: big ? 26 : 18, marginLeft: -10, marginTop: -12 }, style]}>
              {p.emoji}
            </Animated.Text>
          ) : (
            <Animated.View key={i} style={[styles.p, { width: p.w, height: p.h, borderRadius: 2, backgroundColor: p.color }, style]} />
          );
        })}
      </View>
    </View>
  );
}

/** Content that arrives with a soft fade + grow (bouncy when `bounce`). */
export function PopIn({ children, bounce, delay = 0, style }: { children: ReactNode; bounce?: boolean; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const [v] = useState(() => new Animated.Value(reduced ? 1 : 0));
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    const anim = bounce
      ? Animated.sequence([Animated.delay(delay), Animated.spring(v, { toValue: 1, friction: 5, tension: 120, useNativeDriver: NATIVE_DRIVER })])
      : Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE_DRIVER })]);
    anim.start();
    return () => anim.stop();
  }, [reduced, bounce, delay, v]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [bounce ? 0.6 : 0.97, 1] }) }],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  p: { position: 'absolute', left: 0, top: 0 },
});
