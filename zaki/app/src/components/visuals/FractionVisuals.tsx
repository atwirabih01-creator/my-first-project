// Fraction pictures: a "pizza" circle or a chocolate-bar strip cut into equal pieces.
// The interactive one lets the child tap pieces to colour exactly the right number.
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Burst, PopIn } from '@/components/Celebrate';
import { Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useT } from '@/lib/store';
import { compareFractions } from '@/lib/visuals';
import { FractionText, isolate, Ltr, type VisualProps } from './common';

const LINE = '#1E3A4C';
const EMPTY = '#FFFFFF';

function wedge(cx: number, cy: number, r: number, i: number, n: number) {
  const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

/** The picture itself. `on[i]` = piece i is coloured. With `onPiece`, every piece is a button. */
export function FractionPicture({
  shape,
  on,
  size,
  accent,
  onPiece,
  pieceLabel,
}: {
  shape: 'circle' | 'bar';
  on: boolean[];
  size: number;
  accent: string;
  onPiece?: (i: number) => void;
  pieceLabel?: (i: number) => string;
}) {
  const n = on.length;
  if (shape === 'bar') {
    return (
      <Ltr style={{ width: size, height: 64, flexDirection: 'row', borderRadius: R.sm, borderWidth: 3, borderColor: LINE, overflow: 'hidden', alignSelf: 'center' }}>
        {on.map((filled, i) => {
          const style = { flex: 1, backgroundColor: filled ? accent : EMPTY, borderLeftWidth: i ? 2 : 0, borderColor: LINE };
          return onPiece ? (
            <Pressable
              key={i}
              testID={`fraction-piece-${i}`}
              role="button"
              aria-label={pieceLabel?.(i)}
              aria-pressed={filled}
              onPress={() => onPiece(i)}
              style={style}
            />
          ) : (
            <View key={i} style={style} />
          );
        })}
      </Ltr>
    );
  }
  const r = size / 2 - 4;
  const c = size / 2;
  const hit = Math.max(36, Math.min(48, (2 * Math.PI * r * 0.6) / n));
  return (
    <Ltr style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
        {n === 1 ? (
          <Circle cx={c} cy={c} r={r} fill={on[0] ? accent : EMPTY} stroke={LINE} strokeWidth={3} />
        ) : (
          on.map((filled, i) => (
            <Path key={i} d={wedge(c, c, r, i, n)} fill={filled ? accent : EMPTY} stroke={LINE} strokeWidth={2.5} strokeLinejoin="round" onPress={onPiece ? () => onPiece(i) : undefined} />
          ))
        )}
        <Circle cx={c} cy={c} r={r} fill="none" stroke={LINE} strokeWidth={3} />
      </Svg>
      {/* Bigger, labelled tap targets in the middle of each piece (screen readers + small fingers). */}
      {onPiece
        ? on.map((filled, i) => {
            const a = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / n;
            const d = n === 1 ? 0 : r * 0.6;
            return (
              <Pressable
                key={i}
                testID={`fraction-piece-${i}`}
                role="button"
                aria-label={pieceLabel?.(i)}
                aria-pressed={filled}
                onPress={() => onPiece(i)}
                style={{ position: 'absolute', left: c + d * Math.cos(a) - hit / 2, top: c + d * Math.sin(a) - hit / 2, width: hit, height: hit, borderRadius: hit / 2 }}
              />
            );
          })
        : null}
    </Ltr>
  );
}

const firstOn = (parts: number, shaded: number) => Array.from({ length: parts }, (_, i) => i < shaded);

/** Picture + the fraction written underneath (+ optional caption). */
export function FractionVisual({ shape, parts, shaded, label, width, accent }: VisualProps & { shape: 'circle' | 'bar'; parts: number; shaded: number; label?: string }) {
  const size = shape === 'bar' ? Math.min(300, width) : Math.min(200, width);
  return (
    <View style={{ gap: S.sm, alignItems: 'center' }}>
      <FractionPicture shape={shape} on={firstOn(parts, shaded)} size={size} accent={accent} />
      <FractionText top={shaded} bottom={parts} testID="fraction-text" />
      {label ? (
        <Txt center bold>
          {label}
        </Txt>
      ) : null}
    </View>
  );
}

/** Tap pieces to colour exactly `shaded` of them; a small celebration when it is right. */
export function FractionTapVisual({ shape, parts, shaded, label, width, accent }: VisualProps & { shape: 'circle' | 'bar'; parts: number; shaded: number; label?: string }) {
  const { t, rtl } = useT();
  const [on, setOn] = useState<boolean[]>(() => Array(parts).fill(false));
  const [party, setParty] = useState(0);
  const k = on.filter(Boolean).length;
  const done = k === shaded;
  const size = shape === 'bar' ? Math.min(300, width) : Math.min(210, width);
  const toggle = (i: number) => {
    const next = on.map((v, j) => (j === i ? !v : v));
    setOn(next);
    if (next.filter(Boolean).length === shaded) setParty((p) => p + 1);
  };
  return (
    <View style={{ gap: S.sm, alignItems: 'center' }}>
      <Txt variant="big" center testID="fraction-instruction">
        👆 {t('tapPieces', { n: shaded })}
      </Txt>
      <FractionPicture shape={shape} on={on} size={size} accent={accent} onPiece={toggle} pieceLabel={(i) => t('pieceA11y', { i: i + 1, n: parts })} />
      <Txt center bold testID="fraction-count" color={C.textSoft}>
        {t('piecesColoured', { k, n: parts })}
      </Txt>
      {label ? (
        <Txt center bold>
          {label}
        </Txt>
      ) : null}
      {done ? (
        <PopIn bounce key={party}>
          <View testID="fraction-done" role="alert" style={{ backgroundColor: C.mintSoft, borderColor: C.mint, borderWidth: 2, borderRadius: R.lg, padding: S.md, alignItems: 'center', gap: S.xs }}>
            <FractionText top={shaded} bottom={parts} color={C.mint} size={26} />
            <Txt variant="big" center color={C.mint}>
              {t('fractionDone', { f: isolate(`${shaded}/${parts}`, rtl) })}
            </Txt>
          </View>
        </PopIn>
      ) : k > shaded ? (
        <Txt center bold color={C.wrong} testID="fraction-too-many">
          {t('tooManyPieces')}
        </Txt>
      ) : null}
      {done ? <Burst key={`b${party}`} /> : null}
    </View>
  );
}

/** Two fractions side by side (bars: one above the other, same length); tap "?" to see <, > or =. */
export function FractionCompareVisual({ a, b, shape, width, accent }: VisualProps & { a: { parts: number; shaded: number }; b: { parts: number; shaded: number }; shape: 'circle' | 'bar' }) {
  const { t, rtl } = useT();
  const [shown, setShown] = useState(false);
  const cmp = compareFractions(a, b);
  const sign = cmp === 0 ? '=' : cmp > 0 ? '>' : '<';
  const fa = `${a.shaded}/${a.parts}`;
  const fb = `${b.shaded}/${b.parts}`;
  const sentence = t(cmp === 0 ? 'compareEqual' : cmp > 0 ? 'compareBigger' : 'compareSmaller', { a: isolate(fa, rtl), b: isolate(fb, rtl) });
  const bar = shape === 'bar';
  const pic = bar ? Math.min(260, width - 70) : Math.max(90, Math.min(130, (width - 72) / 2));
  const reveal = (
    <Pressable
      testID="compare-reveal"
      role="button"
      aria-label={shown ? sentence : t('compareAsk')}
      onPress={() => setShown(true)}
      style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: accent, backgroundColor: shown ? C.sunSoft : C.card, alignItems: 'center', justifyContent: 'center' }}>
      <Txt variant="title" center testID="compare-sign" color={C.text} style={{ writingDirection: 'ltr' }}>
        {shown ? sign : '?'}
      </Txt>
    </Pressable>
  );
  const side = (f: { parts: number; shaded: number }, id: string) =>
    bar ? (
      <Ltr style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }} key={id}>
        <FractionPicture shape="bar" on={firstOn(f.parts, f.shaded)} size={pic} accent={accent} />
        <FractionText top={f.shaded} bottom={f.parts} size={22} />
      </Ltr>
    ) : (
      <View style={{ alignItems: 'center', gap: S.xs }} key={id}>
        <FractionPicture shape="circle" on={firstOn(f.parts, f.shaded)} size={pic} accent={accent} />
        <FractionText top={f.shaded} bottom={f.parts} size={24} />
      </View>
    );
  return (
    <View style={{ gap: S.sm, alignItems: 'center' }}>
      {bar ? (
        <Ltr style={{ alignItems: 'center', gap: S.sm }}>
          {side(a, 'a')}
          {reveal}
          {side(b, 'b')}
        </Ltr>
      ) : (
        <Ltr style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm }}>
          {side(a, 'a')}
          {reveal}
          {side(b, 'b')}
        </Ltr>
      )}
      {shown ? (
        <PopIn bounce>
          <Txt variant="big" center testID="compare-result">
            {sentence}
          </Txt>
        </PopIn>
      ) : (
        <Txt center bold color={C.textSoft}>
          👆 {t('compareAsk')}
        </Txt>
      )}
    </View>
  );
}
