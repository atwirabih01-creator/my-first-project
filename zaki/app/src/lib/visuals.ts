// Lesson pictures (pack version 4): checks the data before anything is drawn, and writes the
// spoken description for screen readers and "Read to me".
// Plain code, no React: a picture that does not make sense is dropped (null), never drawn wrong.
import type { StringKey } from './i18n';
import type { TryIt, Visual, VisualItem } from './types';

type T = (key: StringKey, params?: Record<string, string | number>) => string;

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
const isInt = (n: unknown): n is number => isNum(n) && Math.floor(n) === n;
const str = (s: unknown, max = 60): string | undefined => (typeof s === 'string' && s.trim() ? s.trim().slice(0, max) : undefined);
const inRange = (n: unknown, lo: number, hi: number): n is number => isInt(n) && n >= lo && n <= hi;

function items(list: unknown, max: number): VisualItem[] | null {
  if (!Array.isArray(list)) return null;
  const out: VisualItem[] = [];
  for (const it of list.slice(0, max)) {
    const label = str((it as VisualItem)?.label, 40);
    const emoji = str((it as VisualItem)?.emoji, 12) ?? '';
    if (label) out.push({ emoji, label });
  }
  return out.length ? out : null;
}

const frac = (x: unknown): { parts: number; shaded: number } | null => {
  const f = x as { parts?: unknown; shaded?: unknown } | null;
  return f && inRange(f.parts, 1, 12) && inRange(f.shaded, 0, f.parts as number) ? { parts: f.parts as number, shaded: f.shaded as number } : null;
};

/** A checked, safe copy of the picture, or null when it can't be drawn (unknown type, bad numbers). */
export function cleanVisual(v: unknown): Visual | null {
  if (!v || typeof v !== 'object') return null;
  const x = v as Record<string, unknown>;
  try {
    switch (x.type) {
      case 'fraction': {
        if (!inRange(x.parts, 2, 12) || !inRange(x.shaded, 0, x.parts)) return null;
        const shape = x.shape === 'bar' ? 'bar' : 'circle';
        // Tapping to colour 0 pieces is no game: then it is just a picture.
        return { type: 'fraction', shape, parts: x.parts, shaded: x.shaded, label: str(x.label), interactive: x.interactive === true && x.shaded > 0 };
      }
      case 'fractionCompare': {
        const a = frac(x.a);
        const b = frac(x.b);
        if (!a || !b) return null;
        return { type: 'fractionCompare', a, b, shape: x.shape === 'bar' ? 'bar' : 'circle' };
      }
      case 'objects': {
        const emoji = str(x.emoji, 12);
        if (!emoji || !inRange(x.count, 1, 20)) return null;
        const groups = inRange(x.groups, 1, x.count) && x.groups > 1 ? x.groups : undefined;
        const crossedOut = inRange(x.crossedOut, 1, x.count) ? x.crossedOut : undefined;
        return { type: 'objects', emoji, count: x.count, groups, crossedOut, label: str(x.label), interactive: x.interactive === true };
      }
      case 'equation': {
        if (!Array.isArray(x.parts)) return null;
        const parts = x.parts.map((p) => (typeof p === 'number' ? String(p) : str(p, 16))).filter((p): p is string => !!p).slice(0, 9);
        if (!parts.length) return null;
        const highlight = inRange(x.highlight, 0, parts.length - 1) ? x.highlight : undefined;
        return { type: 'equation', parts, highlight };
      }
      case 'numberLine': {
        const { from, to, step } = x;
        if (!isNum(from) || !isNum(to) || !isNum(step) || step <= 0 || to <= from) return null;
        const ticks = (to - from) / step;
        if (ticks < 1 || ticks > 40) return null;
        const within = (n: unknown): n is number => isNum(n) && n >= from && n <= to;
        const marks = Array.isArray(x.marks) ? x.marks.filter(within).slice(0, 10) : undefined;
        const jumps = Array.isArray(x.jumps)
          ? (x.jumps as { from?: unknown; to?: unknown }[]).filter((j) => j && within(j.from) && within(j.to) && j.from !== j.to).slice(0, 8) as { from: number; to: number }[]
          : undefined;
        return { type: 'numberLine', from, to, step, marks: marks?.length ? marks : undefined, jumps: jumps?.length ? jumps.map((j) => ({ from: j.from, to: j.to })) : undefined };
      }
      case 'sequence':
      case 'labeled': {
        const list = items(x.items, x.type === 'sequence' ? 6 : 8);
        return list ? { type: x.type, items: list } : null;
      }
      case 'bars': {
        if (!Array.isArray(x.bars)) return null;
        const bars = (x.bars as { label?: unknown; value?: unknown; emoji?: unknown }[])
          .filter((b) => b && str(b.label, 30) && isNum(b.value))
          .slice(0, 6)
          .map((b) => ({ label: str(b.label, 30) as string, value: Math.max(0, Math.min(100, b.value as number)), emoji: str(b.emoji, 12) }));
        return bars.length ? { type: 'bars', bars } : null;
      }
      case 'clock':
        return inRange(x.hour, 1, 12) && inRange(x.minute, 0, 59) ? { type: 'clock', hour: x.hour, minute: x.minute } : null;
      case 'shape': {
        const shapes = ['triangle', 'square', 'rectangle', 'circle', 'pentagon', 'hexagon'] as const;
        const shape = shapes.find((s) => s === x.shape);
        if (!shape) return null;
        const sideLabels = Array.isArray(x.sideLabels) ? x.sideLabels.map((l) => (typeof l === 'number' ? String(l) : str(l, 16))).filter((l): l is string => !!l).slice(0, 6) : undefined;
        return { type: 'shape', shape, sideLabels: sideLabels?.length ? sideLabels : undefined };
      }
      case 'placeValue':
        return inRange(x.number, 1, 999) ? { type: 'placeValue', number: x.number } : null;
      case 'wordCard': {
        const word = str(x.word, 30);
        const meaning = str(x.meaning, 160);
        return word && meaning ? { type: 'wordCard', word, emoji: str(x.emoji, 12) ?? '', meaning } : null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** A checked "Try it!" question, or null (then no Try it card is shown). */
export function cleanTryIt(v: unknown): TryIt | null {
  const x = v as Partial<TryIt> | null;
  if (!x || typeof x !== 'object') return null;
  const q = str(x.q, 300);
  if (!q || !Array.isArray(x.choices)) return null;
  const choices = x.choices.map((c) => (typeof c === 'number' ? String(c) : str(c, 80)));
  if (choices.length < 2 || choices.length > 4 || choices.some((c) => !c)) return null;
  if (!inRange(x.answerIndex, 0, choices.length - 1)) return null;
  return { q, choices: choices as string[], answerIndex: x.answerIndex, explain: str(x.explain, 300) ?? '' };
}

/** Compares two fractions: -1 (a smaller), 0 (equal), 1 (a bigger). */
export function compareFractions(a: { parts: number; shaded: number }, b: { parts: number; shaded: number }): -1 | 0 | 1 {
  const l = a.shaded * b.parts;
  const r = b.shaded * a.parts;
  return l === r ? 0 : l > r ? 1 : -1;
}

/** Numbers and simple maths symbols ("12", "3/4", "0.5", "?") get the number style. */
export const isNumberToken = (s: string) => /^[\d٠-٩.,/]+$/.test(s) || s === '?';
export const isOperatorToken = (s: string) => /^[+\-−–×x*÷/=<>≤≥]$/.test(s.trim());

export const clockText = (hour: number, minute: number) => `${hour}:${String(minute).padStart(2, '0')}`;

/** Splits n (1-999) into hundreds, tens and ones. */
export const placeDigits = (n: number) => ({ h: Math.floor(n / 100), t: Math.floor((n % 100) / 10), o: n % 10 });

/** How many emoji go in each group box (the last box takes what is left). */
export function groupSizes(count: number, groups?: number): number[] {
  if (!groups || groups <= 1) return [count];
  const per = Math.ceil(count / groups);
  const out: number[] = [];
  let left = count;
  for (let i = 0; i < groups && left > 0; i++) {
    out.push(Math.min(per, left));
    left -= per;
  }
  return out;
}

/** The words a screen reader (and "Read to me") says for the picture. */
export function describeVisual(v: Visual, t: T): string {
  switch (v.type) {
    case 'fraction': {
      const base = t('vis_fraction', { shape: t(v.shape === 'bar' ? 'vis_bar' : 'vis_circle'), parts: v.parts, shaded: v.shaded });
      return v.label ? `${base}. ${v.label}` : base;
    }
    case 'fractionCompare':
      return t('vis_compare', { a: `${v.a.shaded}/${v.a.parts}`, b: `${v.b.shaded}/${v.b.parts}` });
    case 'objects': {
      let s = t('vis_objects', { n: v.count, emoji: v.emoji });
      if (v.groups) s += `, ${t('vis_groups', { n: groupSizes(v.count, v.groups).length })}`;
      if (v.crossedOut) s += `, ${t('vis_crossed', { n: v.crossedOut, left: v.count - v.crossedOut })}`;
      return v.label ? `${s}. ${v.label}` : s;
    }
    case 'equation':
      return v.parts.join(' ');
    case 'numberLine': {
      let s = t('vis_numberLine', { from: v.from, to: v.to });
      if (v.marks?.length) s += `. ${t('vis_marks', { list: v.marks.join(', ') })}`;
      if (v.jumps?.length) s += `. ${v.jumps.map((j) => t('vis_jump', { a: j.from, b: j.to })).join(', ')}`;
      return s;
    }
    case 'sequence':
      return v.items.map((i) => i.label).join(t('vis_then'));
    case 'labeled':
      return t('vis_labeled', { list: v.items.map((i) => i.label).join(', ') });
    case 'bars':
      return t('vis_bars', { list: v.bars.map((b) => `${b.label} ${b.value}`).join(', ') });
    case 'clock':
      return t('vis_clock', { time: clockText(v.hour, v.minute) });
    case 'shape': {
      const name = t(`shape_${v.shape}` as StringKey);
      return v.sideLabels?.length ? `${name}: ${v.sideLabels.join(', ')}` : name;
    }
    case 'placeValue': {
      const d = placeDigits(v.number);
      return t('vis_placeValue', { n: v.number, h: d.h, t: d.t, o: d.o });
    }
    case 'wordCard':
      return `${v.word}: ${v.meaning}`;
  }
}
