// Small shared pieces for the lesson pictures.
import { useState, type ReactNode } from 'react';
import { Platform, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { C } from '@/constants/theme';

/** Colours of the lesson's subject (src/lib/subjects.ts). */
export type Tint = { accent: string; soft: string };

/** Size of the picture area; every picture fits inside it (no sideways scrolling on a 360px phone). */
export type VisualProps = Tint & { width: number };

const webLtr = Platform.OS === 'web' ? ({ dir: 'ltr' } as object) : {};

/**
 * Maths stays left-to-right, also inside an Arabic lesson: numbers, number lines, sums and
 * fractions read the way they are written in the child's maths book.
 */
export function Ltr({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ direction: 'ltr' }, style]} {...webLtr}>
      {children}
    </View>
  );
}

/** Measures how wide a box really is (starts with a phone-sized guess). */
export function useBoxWidth(initial = 280): [number, (e: LayoutChangeEvent) => void] {
  const [w, setW] = useState(initial);
  const onLayout = (e: LayoutChangeEvent) => {
    const nw = Math.floor(e.nativeEvent.layout.width);
    if (nw > 0 && Math.abs(nw - w) > 1) setW(nw);
  };
  return [w, onLayout];
}

/** A fraction written the school way: top number, a line, bottom number. */
export function FractionText({ top, bottom, color = C.text, size = 30, testID }: { top: number; bottom: number; color?: string; size?: number; testID?: string }) {
  return (
    <Ltr style={{ alignItems: 'center', alignSelf: 'center' }}>
      <View testID={testID} style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: size, lineHeight: size * 1.15, fontWeight: '800', color }}>{top}</Text>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: color, alignSelf: 'stretch', minWidth: size }} />
        <Text style={{ fontSize: size, lineHeight: size * 1.15, fontWeight: '800', color }}>{bottom}</Text>
      </View>
    </Ltr>
  );
}

/** SVG text uses the app's plain sans font on the web (browsers default SVG text to a serif font). */
export const SVG_FONT = Platform.OS === 'web' ? 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' : undefined;

/** Wraps maths ("3/4") so it stays in one piece inside an Arabic sentence. */
export const isolate = (s: string, rtl: boolean) => (rtl ? `\u2066${s}\u2069` : s);

/** Rounds away floating-point noise (0.30000000000000004 -> 0.3). */
export const nice = (n: number) => String(Math.round(n * 100) / 100);
