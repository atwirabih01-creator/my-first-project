// Maths pictures: big colourful sums, number lines with jumps, a clock, shapes, place value
// blocks and a simple bar chart. All of them stay left-to-right inside Arabic lessons.
import { useEffect, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { NATIVE_DRIVER, useReducedMotion } from '@/lib/motion';
import { useT } from '@/lib/store';
import { clockText, isNumberToken, isOperatorToken, placeDigits } from '@/lib/visuals';
import type { Visual } from '@/lib/types';
import { Ltr, nice, SVG_FONT, type VisualProps } from './common';

const INK = '#1E3A4C';

// ---------- Equation ----------
function Pulse({ children, on }: { children: React.ReactNode; on: boolean }) {
  const reduced = useReducedMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!on || reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(v, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE_DRIVER }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [on, reduced, v]);
  if (!on || reduced) return <>{children}</>;
  return <Animated.View style={{ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) }] }}>{children}</Animated.View>;
}

export function EquationVisual({ parts, highlight, accent, soft, width }: VisualProps & { parts: string[]; highlight?: number }) {
  // Long sums get slightly smaller tokens so they still fit on one or two lines.
  const big = parts.join('').length <= 12 && width >= 260 ? 40 : 32;
  return (
    <Ltr style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: S.sm }}>
      {parts.map((p, i) => {
        const hl = i === highlight;
        const op = isOperatorToken(p);
        const num = !op && isNumberToken(p);
        const token = op ? (
          <View style={{ width: big + 8, height: big + 8, borderRadius: (big + 8) / 2, backgroundColor: soft, borderWidth: 3, borderColor: accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: big * 0.75, fontWeight: '900', color: INK, lineHeight: big * 0.95 }}>{p === '*' ? '×' : p}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: num ? big : big * 0.8, fontWeight: '900', color: num ? accent : INK, lineHeight: big * 1.2 }}>{p}</Text>
        );
        return (
          <Pulse key={i} on={hl}>
            <View
              testID={hl ? 'equation-highlight' : `equation-token-${i}`}
              style={[{ paddingHorizontal: 4, borderRadius: R.sm }, hl && { backgroundColor: C.sunSoft, borderWidth: 3, borderColor: C.sun, paddingHorizontal: 8 }]}>
              {token}
            </View>
          </Pulse>
        );
      })}
    </Ltr>
  );
}

// ---------- Number line ----------
export function NumberLineVisual({ from, to, step, marks, jumps, accent, width }: VisualProps & Extract<Visual, { type: 'numberLine' }>) {
  const w = Math.max(220, Math.min(width, 520));
  const pad = 20;
  const hasJumps = !!jumps?.length;
  const lineY = hasJumps ? 92 : 40;
  const h = lineY + 44;
  const span = to - from;
  const x = (v: number) => pad + ((v - from) / span) * (w - 2 * pad);
  const ticks: number[] = [];
  for (let i = 0, n = Math.round(span / step); i <= n; i++) ticks.push(from + i * step);
  // Leave out some numbers when they would bump into each other (first + last always shown).
  const longest = Math.max(...ticks.map((v) => nice(v).length));
  const room = (w - 2 * pad) / Math.max(1, ticks.length - 1);
  const every = Math.max(1, Math.ceil((longest * 10 + 6) / room));
  const fs = room < 22 ? 13 : 16;
  return (
    <Ltr style={{ alignItems: 'center' }}>
      <Svg width={w} height={h} testID="number-line-svg">
        <Line x1={pad - 10} y1={lineY} x2={w - pad + 10} y2={lineY} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        {ticks.map((v, i) => {
          const showNum = i % every === 0 || i === ticks.length - 1;
          return (
            <G key={i}>
              <Line x1={x(v)} y1={lineY - 9} x2={x(v)} y2={lineY + 9} stroke={INK} strokeWidth={2.5} />
              {showNum ? (
                <SvgText fontFamily={SVG_FONT} x={x(v)} y={lineY + 30} fontSize={fs} fontWeight="700" fill={INK} textAnchor="middle">
                  {nice(v)}
                </SvgText>
              ) : null}
            </G>
          );
        })}
        {(marks ?? []).map((m, i) => (
          <Circle key={`m${i}`} cx={x(m)} cy={lineY} r={8} fill={accent} stroke="#FFFFFF" strokeWidth={2} />
        ))}
        {(jumps ?? []).map((j, i) => {
          const x1 = x(j.from);
          const x2 = x(j.to);
          const top = lineY - Math.min(70, 26 + Math.abs(x2 - x1) * 0.35);
          const cx = (x1 + x2) / 2;
          // The arrow head points along the curve where it lands.
          const dx = x2 - cx;
          const dy = lineY - 6 - top;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const ex = x2;
          const ey = lineY - 6;
          const head = `${ex},${ey} ${ex - ux * 11 - uy * 6},${ey - uy * 11 + ux * 6} ${ex - ux * 11 + uy * 6},${ey - uy * 11 - ux * 6}`;
          const diff = j.to - j.from;
          return (
            <G key={`j${i}`}>
              <Path d={`M ${x1} ${lineY - 6} Q ${cx} ${top} ${ex} ${ey}`} stroke={accent} strokeWidth={3.5} fill="none" strokeLinecap="round" />
              <Polygon points={head} fill={accent} />
              <SvgText fontFamily={SVG_FONT} x={cx} y={(lineY - 6 + top) / 2 - 2} fontSize={15} fontWeight="800" fill={INK} textAnchor="middle">
                {`${diff > 0 ? '+' : '−'}${nice(Math.abs(diff))}`}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </Ltr>
  );
}

// ---------- Clock ----------
export function ClockVisual({ hour, minute, accent, width }: VisualProps & { hour: number; minute: number }) {
  const size = Math.min(210, width);
  const c = size / 2;
  const r = c - 6;
  const hand = (turns: number, len: number) => {
    const a = turns * 2 * Math.PI - Math.PI / 2;
    return { x2: c + Math.cos(a) * len, y2: c + Math.sin(a) * len };
  };
  const hh = hand(((hour % 12) + minute / 60) / 12, r * 0.5);
  const mm = hand(minute / 60, r * 0.78);
  return (
    <Ltr style={{ alignItems: 'center', gap: S.sm }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} fill="#FFFFFF" stroke={accent} strokeWidth={6} />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * 2 * Math.PI;
          const big = i % 5 === 0;
          const r1 = r - (big ? 12 : 6);
          return <Line key={i} x1={c + Math.cos(a) * r1} y1={c + Math.sin(a) * r1} x2={c + Math.cos(a) * (r - 3)} y2={c + Math.sin(a) * (r - 3)} stroke={INK} strokeWidth={big ? 3 : 1} />;
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const n = i + 1;
          const a = (n / 12) * 2 * Math.PI - Math.PI / 2;
          return (
            <SvgText fontFamily={SVG_FONT} key={n} x={c + Math.cos(a) * r * 0.72} y={c + Math.sin(a) * r * 0.72 + 7} fontSize={size > 180 ? 20 : 16} fontWeight="800" fill={INK} textAnchor="middle">
              {String(n)}
            </SvgText>
          );
        })}
        <Line x1={c} y1={c} {...hh} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <Line x1={c} y1={c} {...mm} stroke={accent} strokeWidth={5} strokeLinecap="round" />
        <Circle cx={c} cy={c} r={7} fill={INK} />
      </Svg>
      <View style={{ backgroundColor: INK, borderRadius: R.md, paddingHorizontal: S.lg, paddingVertical: S.xs }}>
        <Text testID="clock-digital" style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: 2 }}>
          {clockText(hour, minute)}
        </Text>
      </View>
    </Ltr>
  );
}

// ---------- Shapes ----------
const SIDES: Record<string, number> = { triangle: 3, square: 4, pentagon: 5, hexagon: 6 };

export function ShapeVisual({ shape, sideLabels, accent, soft, width }: VisualProps & { shape: string; sideLabels?: string[] }) {
  const { t } = useT();
  const w = Math.min(260, width);
  const h = 200;
  const cx = w / 2;
  const cy = h / 2;
  let pts: [number, number][] = [];
  if (shape === 'rectangle') {
    const rw = Math.min(190, w - 70);
    const rh = 110;
    pts = [[cx - rw / 2, cy - rh / 2], [cx + rw / 2, cy - rh / 2], [cx + rw / 2, cy + rh / 2], [cx - rw / 2, cy + rh / 2]];
  } else if (shape === 'square') {
    const s = 120;
    pts = [[cx - s / 2, cy - s / 2], [cx + s / 2, cy - s / 2], [cx + s / 2, cy + s / 2], [cx - s / 2, cy + s / 2]];
  } else if (SIDES[shape]) {
    const n = SIDES[shape];
    const rad = 72;
    pts = Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + rad * Math.cos(a), cy + 8 + rad * Math.sin(a)] as [number, number];
    });
  }
  const labels = sideLabels ?? [];
  return (
    <View style={{ alignItems: 'center', gap: S.xs }}>
      <Ltr>
        <Svg width={w} height={h}>
          {shape === 'circle' ? (
            <G>
              <Circle cx={cx} cy={cy} r={72} fill={soft} stroke={accent} strokeWidth={5} />
              {labels[0] ? (
                <G>
                  <Line x1={cx} y1={cy} x2={cx + 72} y2={cy} stroke={INK} strokeWidth={3} strokeDasharray="6,4" />
                  <Circle cx={cx} cy={cy} r={4} fill={INK} />
                  <SvgText fontFamily={SVG_FONT} x={cx + 36} y={cy - 8} fontSize={16} fontWeight="800" fill={INK} textAnchor="middle">
                    {labels[0]}
                  </SvgText>
                </G>
              ) : null}
            </G>
          ) : (
            <G>
              <Polygon points={pts.map((p) => p.join(',')).join(' ')} fill={soft} stroke={accent} strokeWidth={5} strokeLinejoin="round" />
              {pts.map((p, i) => {
                const q = pts[(i + 1) % pts.length];
                const label = labels[i];
                if (!label) return null;
                const mx = (p[0] + q[0]) / 2;
                const my = (p[1] + q[1]) / 2;
                const dx = mx - cx;
                const dy = my - (shape === 'rectangle' || shape === 'square' ? cy : cy + 8);
                const d = Math.hypot(dx, dy) || 1;
                return (
                  <SvgText fontFamily={SVG_FONT} key={i} x={mx + (dx / d) * 18} y={my + (dy / d) * 18 + 6} fontSize={16} fontWeight="800" fill={INK} textAnchor="middle">
                    {label}
                  </SvgText>
                );
              })}
            </G>
          )}
        </Svg>
      </Ltr>
      <Txt variant="big" center testID="shape-name">
        {t(`shape_${shape}` as Parameters<typeof t>[0])}
      </Txt>
    </View>
  );
}

// ---------- Place value ----------
const PV = { h: '#1F7F8A', t: '#6A55A8', o: '#C2416E' };

function HundredSquare({ color }: { color: string }) {
  const s = 40;
  return (
    <Svg width={s} height={s}>
      <Rect x={1} y={1} width={s - 2} height={s - 2} fill={color} stroke={INK} strokeWidth={1.5} />
      {Array.from({ length: 9 }, (_, i) => {
        const p = 1 + ((i + 1) * (s - 2)) / 10;
        return (
          <G key={i}>
            <Line x1={p} y1={1} x2={p} y2={s - 1} stroke="#FFFFFF" strokeWidth={0.8} />
            <Line x1={1} y1={p} x2={s - 1} y2={p} stroke="#FFFFFF" strokeWidth={0.8} />
          </G>
        );
      })}
    </Svg>
  );
}

function TenRod({ color }: { color: string }) {
  return (
    <Svg width={10} height={52}>
      <Rect x={1} y={1} width={8} height={50} fill={color} stroke={INK} strokeWidth={1.2} />
      {Array.from({ length: 9 }, (_, i) => (
        <Line key={i} x1={1} y1={1 + (i + 1) * 5} x2={9} y2={1 + (i + 1) * 5} stroke="#FFFFFF" strokeWidth={0.8} />
      ))}
    </Svg>
  );
}

export function PlaceValueVisual({ number }: VisualProps & { number: number }) {
  const { t } = useT();
  const d = placeDigits(number);
  const digits = String(number).split('');
  const colourOf = (i: number) => [PV.h, PV.t, PV.o].slice(3 - digits.length)[i];
  const group = (key: 'h' | 't' | 'o', n: number, title: string, item: React.ReactNode) => (
    <View key={key} testID={`pv-${key}`} style={{ flexGrow: 1, flexBasis: 84, alignItems: 'center', gap: S.xs, backgroundColor: '#FFFFFF', borderRadius: R.md, padding: S.sm, borderWidth: 2, borderColor: PV[key] }}>
      <View style={{ flexGrow: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'flex-end', gap: 4, minHeight: 52, alignItems: 'flex-end', maxWidth: key === 'h' ? 140 : key === 't' ? 110 : 70 }}>
        {Array.from({ length: n }, (_, i) => (
          <View key={i}>{item}</View>
        ))}
      </View>
      <Text style={{ fontSize: 30, fontWeight: '900', color: PV[key] }}>{n}</Text>
      <Text style={{ fontSize: 15, fontWeight: '700', color: INK }}>{title}</Text>
    </View>
  );
  return (
    <Ltr style={{ gap: S.sm, alignItems: 'stretch' }}>
      <Ltr style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {digits.map((ch, i) => (
          <Text key={i} style={{ fontSize: 46, fontWeight: '900', color: colourOf(i), lineHeight: 54 }}>
            {ch}
          </Text>
        ))}
      </Ltr>
      <Ltr style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, justifyContent: 'center' }}>
        {number >= 100 ? group('h', d.h, t('hundreds'), <HundredSquare color={PV.h} />) : null}
        {number >= 10 ? group('t', d.t, t('tens'), <TenRod color={PV.t} />) : null}
        {group('o', d.o, t('ones'), <View style={{ width: 13, height: 13, backgroundColor: PV.o, borderWidth: 1.2, borderColor: INK, borderRadius: 2 }} />)}
      </Ltr>
    </Ltr>
  );
}

// ---------- Bar chart ----------
export function BarsVisual({ bars, accent }: VisualProps & { bars: { label: string; value: number; emoji?: string }[] }) {
  const H = 130;
  return (
    <Ltr style={{ gap: S.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: S.sm, height: H + 30, borderBottomWidth: 3, borderColor: INK, paddingHorizontal: S.xs }}>
        {bars.map((b, i) => (
          <View key={i} testID={`bar-${i}`} style={{ flex: 1, maxWidth: 64, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: INK }}>{nice(b.value)}</Text>
            <View style={{ alignSelf: 'stretch', height: Math.max(4, (b.value / 100) * H), backgroundColor: accent, borderTopLeftRadius: R.sm, borderTopRightRadius: R.sm }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: S.sm, paddingHorizontal: S.xs }}>
        {bars.map((b, i) => (
          <View key={i} style={{ flex: 1, maxWidth: 64, alignItems: 'center' }}>
            {b.emoji ? <Text style={{ fontSize: 24 }}>{b.emoji}</Text> : null}
            <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '700', color: INK, textAlign: 'center' }}>
              {b.label}
            </Text>
          </View>
        ))}
      </View>
    </Ltr>
  );
}
