// Picture visuals: rows of things to count (in groups, some crossed out), steps with arrows,
// labelled picture cards, and a word card for language lessons.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Burst, PopIn } from '@/components/Celebrate';
import { ReadAloud } from '@/components/ReadAloud';
import { Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useT } from '@/lib/store';
import { groupSizes } from '@/lib/visuals';
import type { VisualItem } from '@/lib/types';
import { type VisualProps } from './common';

const RED = '#D32F2F';

// ---------- Objects (count, groups, take away) ----------
export function ObjectsVisual({
  emoji,
  count,
  groups,
  crossedOut,
  label,
  interactive,
  accent,
  soft,
  width,
}: VisualProps & { emoji: string; count: number; groups?: number; crossedOut?: number; label?: string; interactive?: boolean }) {
  const { t } = useT();
  // order[i] = the number the child said when tapping thing i (0 = not counted yet).
  const [order, setOrder] = useState<number[]>(() => Array(count).fill(0));
  const [party, setParty] = useState(0);
  const firstCrossed = count - (crossedOut ?? 0); // the last ones are the crossed-out ones
  const target = firstCrossed;
  const counted = order.filter(Boolean).length;
  const done = !!interactive && counted === target;
  const cell = count > 12 && width < 320 ? 40 : 46;
  const tap = (i: number) => {
    if (order[i] || i >= firstCrossed) return;
    const next = order.slice();
    next[i] = counted + 1;
    setOrder(next);
    if (counted + 1 === target) setParty((p) => p + 1);
  };
  const thing = (i: number) => {
    const crossed = i >= firstCrossed;
    const n = order[i];
    const body = (
      <>
        <Text style={{ fontSize: cell * 0.66, lineHeight: cell * 0.86, opacity: crossed ? 0.3 : 1, textAlign: 'center' }}>{emoji}</Text>
        {crossed ? (
          <Text style={{ position: 'absolute', top: 0, left: 0, width: cell, height: cell, fontSize: cell * 0.8, lineHeight: cell, fontWeight: '900', color: RED, textAlign: 'center' }} testID="object-crossed">
            ✕
          </Text>
        ) : null}
        {n ? (
          <View style={{ position: 'absolute', top: -6, right: -6, minWidth: 24, height: 24, borderRadius: 12, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14 }}>{n}</Text>
          </View>
        ) : null}
      </>
    );
    const style = { width: cell, height: cell, alignItems: 'center' as const, justifyContent: 'center' as const, borderRadius: R.sm, backgroundColor: n ? C.mintSoft : 'transparent' };
    return interactive && !crossed ? (
      <Pressable key={i} testID={`object-${i}`} role="button" aria-label={t('objectA11y', { i: i + 1 })} aria-pressed={!!n} onPress={() => tap(i)} style={style}>
        {body}
      </Pressable>
    ) : (
      <View key={i} testID={`object-${i}`} style={style}>
        {body}
      </View>
    );
  };
  const sizes = groupSizes(count, groups);
  const boxes = sizes.map((n, g) => {
    const start = sizes.slice(0, g).reduce((a, b) => a + b, 0);
    const idx = Array.from({ length: n }, (_, k) => start + k);
    return (
      <View
        key={g}
        testID={sizes.length > 1 ? 'object-group' : undefined}
        style={[
          { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 },
          sizes.length > 1 && { borderWidth: 3, borderColor: accent, borderStyle: 'dashed', borderRadius: R.md, padding: S.xs, backgroundColor: '#FFFFFF', maxWidth: '100%' },
        ]}>
        {idx.map(thing)}
      </View>
    );
  });
  return (
    <View style={{ gap: S.sm, alignItems: 'center' }}>
      {interactive ? (
        <Txt variant="big" center testID="objects-instruction">
          👆 {t('tapToCount')}
        </Txt>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: S.sm, alignSelf: 'stretch' }}>{boxes}</View>
      {interactive ? (
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: soft, borderWidth: 3, borderColor: accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text testID="objects-count" style={{ fontSize: 26, fontWeight: '900', color: C.text }}>
            {counted}
          </Text>
        </View>
      ) : null}
      {label ? (
        <Txt center bold>
          {label}
        </Txt>
      ) : null}
      {done ? (
        <PopIn bounce key={party}>
          <View testID="objects-done" role="alert" style={{ backgroundColor: C.mintSoft, borderColor: C.mint, borderWidth: 2, borderRadius: R.lg, paddingVertical: S.sm, paddingHorizontal: S.lg }}>
            <Txt variant="big" center color={C.mint}>
              {t('countDone', { n: target })}
            </Txt>
          </View>
        </PopIn>
      ) : null}
      {done ? <Burst key={`b${party}`} /> : null}
    </View>
  );
}

// ---------- Sequence (steps with arrows; arrows point the reading way, flipped in Arabic) ----------
export function SequenceVisual({ items, accent, soft }: VisualProps & { items: VisualItem[] }) {
  const { rtl } = useT();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', rowGap: S.sm, columnGap: 2 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View testID="sequence-card" style={{ width: 92, minHeight: 92, borderRadius: R.md, backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: accent, alignItems: 'center', justifyContent: 'center', padding: S.xs }}>
            <View style={{ position: 'absolute', top: 4, start: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '900', color: C.text }}>{i + 1}</Text>
            </View>
            <Text style={{ fontSize: 34, lineHeight: 42 }}>{it.emoji}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text, textAlign: 'center' }}>{it.label}</Text>
          </View>
          {i < items.length - 1 ? (
            <Text testID="sequence-arrow" style={{ fontSize: 26, fontWeight: '900', color: accent, marginHorizontal: 2 }}>
              {rtl ? '←' : '→'}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

// ---------- Labelled pictures ----------
export function LabeledVisual({ items, accent }: VisualProps & { items: VisualItem[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: S.sm }}>
      {items.map((it, i) => (
        <View
          key={i}
          testID="labeled-card"
          style={{ width: '47%', minHeight: 96, borderRadius: R.md, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: accent, alignItems: 'center', justifyContent: 'center', padding: S.sm, gap: 2 }}>
          <Text style={{ fontSize: 40, lineHeight: 48 }}>{it.emoji}</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'center' }}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------- Word card ----------
export function WordCardVisual({ word, emoji, meaning, accent }: VisualProps & { word: string; emoji: string; meaning: string }) {
  return (
    <View style={{ alignItems: 'center', gap: S.sm }}>
      {emoji ? <Text style={{ fontSize: 72, lineHeight: 86 }}>{emoji}</Text> : null}
      <Text testID="word-card-word" style={{ fontSize: 36, fontWeight: '900', color: C.text, textAlign: 'center' }}>
        {word}
      </Text>
      <View style={{ height: 5, width: 80, borderRadius: 3, backgroundColor: accent }} />
      <Txt variant="big" center>
        {meaning}
      </Txt>
      <View style={{ alignSelf: 'center' }}>
        <ReadAloud text={word} label={word} testID="word-read-aloud" />
      </View>
    </View>
  );
}
