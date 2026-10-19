// Small shared UI kit: text, big buttons, cards, chips, progress bar.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { C, DyslexiaFont, R, S } from '@/constants/theme';
import { useT } from '@/lib/store';

type TxtVariant = 'title' | 'h2' | 'body' | 'small' | 'big';

export function Txt({
  children,
  variant = 'body',
  style,
  center,
  color,
  bold,
  testID,
  accessibilityRole,
  selectable,
}: {
  children: ReactNode;
  variant?: TxtVariant;
  style?: StyleProp<TextStyle>;
  center?: boolean;
  color?: string;
  bold?: boolean;
  testID?: string;
  accessibilityRole?: 'header' | 'text' | 'alert';
  selectable?: boolean;
}) {
  const { align, rtl, dyslexia } = useT();
  const base = variants[variant];
  return (
    <Text
      testID={testID}
      selectable={selectable}
      accessibilityRole={accessibilityRole ?? (variant === 'title' || variant === 'h2' ? 'header' : undefined)}
      style={[
        base,
        { textAlign: center ? 'center' : align, writingDirection: rtl ? 'rtl' : 'ltr', color: color ?? base.color },
        bold && { fontWeight: '700' },
        dyslexia && {
          fontFamily: DyslexiaFont,
          letterSpacing: 0.6,
          lineHeight: Math.round((base.fontSize ?? 17) * 1.6),
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

const variants = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: C.text, lineHeight: 36 },
  h2: { fontSize: 21, fontWeight: '700', color: C.text, lineHeight: 28 },
  body: { fontSize: 18, color: C.text, lineHeight: 26 },
  big: { fontSize: 22, color: C.text, lineHeight: 32, fontWeight: '600' },
  small: { fontSize: 14, color: C.textSoft, lineHeight: 20 },
});

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'help' | 'success' | 'sun';

const BTN: Record<BtnVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: C.primary, fg: '#FFFFFF', border: C.primary },
  secondary: { bg: C.card, fg: C.primary, border: C.primary },
  ghost: { bg: 'transparent', fg: C.primary, border: 'transparent' },
  help: { bg: C.coral, fg: '#FFFFFF', border: C.coral },
  success: { bg: C.mint, fg: '#FFFFFF', border: C.mint },
  sun: { bg: C.sun, fg: C.text, border: '#E8B21C' },
};

export function Btn({
  title,
  onPress,
  variant = 'primary',
  big,
  small,
  icon,
  disabled,
  a11yLabel,
  style,
  testID,
}: {
  title: string;
  onPress?: () => void;
  variant?: BtnVariant;
  big?: boolean;
  small?: boolean;
  icon?: string;
  disabled?: boolean;
  a11yLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const v = BTN[variant];
  const { dyslexia } = useT();
  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border, minHeight: big ? 68 : small ? 44 : 56 },
        small && { paddingHorizontal: S.md, paddingVertical: S.xs },
        pressed && !disabled && { transform: [{ scale: 0.97 }], opacity: 0.92 },
        disabled && { opacity: 0.45 },
        style,
      ]}>
      {icon ? <Text style={{ fontSize: big ? 26 : small ? 16 : 22 }}>{icon}</Text> : null}
      <Text
        style={[
          { color: v.fg, fontSize: big ? 22 : small ? 15 : 18, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
          dyslexia && { fontFamily: DyslexiaFont, letterSpacing: 0.5 },
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Card({ children, style, tone, testID }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'mint' | 'sun' | 'lilac' | 'coral' | 'primary'; testID?: string }) {
  const bg = tone ? { mint: C.mintSoft, sun: C.sunSoft, lilac: C.lilacSoft, coral: C.coralSoft, primary: C.primarySoft }[tone] : C.card;
  return <View testID={testID} style={[styles.card, { backgroundColor: bg }, style]}>{children}</View>;
}

export function Row({ children, style, gap = S.sm, wrap, testID }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number; wrap?: boolean; testID?: string }) {
  return <View testID={testID} style={[{ flexDirection: 'row', alignItems: 'center', gap }, wrap && { flexWrap: 'wrap' }, style]}>{children}</View>;
}

export function Chip({ label, selected, onPress, a11yLabel, testID }: { label: string; selected?: boolean; onPress?: () => void; a11yLabel?: string; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={a11yLabel ?? label}
      style={[styles.chip, selected && { backgroundColor: C.primary, borderColor: C.primary }]}>
      <Text style={{ color: selected ? '#FFFFFF' : C.primary, fontWeight: '700', fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = C.mint, height = 18, label }: { value: number; color?: string; height?: number; label?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height / 2, backgroundColor: '#E3ECF7', overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <Row gap={4} style={{ backgroundColor: C.sunSoft, paddingHorizontal: S.md, paddingVertical: 6, borderRadius: R.pill }}>
      <Text style={{ fontSize: 18 }}>⭐</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>{n}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    borderRadius: R.lg,
    borderWidth: 2,
    paddingHorizontal: S.xl,
    paddingVertical: S.md,
  },
  card: {
    borderRadius: R.lg,
    padding: S.lg,
    gap: S.sm,
    borderWidth: 1,
    borderColor: C.border,
  },
  chip: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: S.lg,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
