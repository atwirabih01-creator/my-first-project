// LessonVisual: the picture for one teach step (pack version 4), in a soft card in the subject's
// colour. It checks the data first (src/lib/visuals.ts): an unknown or broken picture shows
// nothing, and a drawing error is caught so the lesson itself always keeps working.
import { Component, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';

import { R, S } from '@/constants/theme';
import { useT } from '@/lib/store';
import { subjectInfo } from '@/lib/subjects';
import type { Subject, Visual } from '@/lib/types';
import { cleanVisual, describeVisual } from '@/lib/visuals';
import { useBoxWidth, type VisualProps } from './common';
import { FractionCompareVisual, FractionTapVisual, FractionVisual } from './FractionVisuals';
import { BarsVisual, ClockVisual, EquationVisual, NumberLineVisual, PlaceValueVisual, ShapeVisual } from './MathVisuals';
import { LabeledVisual, ObjectsVisual, SequenceVisual, WordCardVisual } from './PictureVisuals';

class Quiet extends Component<{ children: ReactNode }, { broken: boolean }> {
  state = { broken: false };
  static getDerivedStateFromError() {
    return { broken: true };
  }
  render() {
    return this.state.broken ? null : this.props.children;
  }
}

/** Pictures the child can tap: the card is a group of buttons, not one picture. */
const isInteractive = (v: Visual) => ((v.type === 'fraction' || v.type === 'objects') && !!v.interactive) || v.type === 'fractionCompare' || v.type === 'wordCard';

function Body({ v, p }: { v: Visual; p: VisualProps }) {
  switch (v.type) {
    case 'fraction':
      return v.interactive ? <FractionTapVisual {...p} {...v} /> : <FractionVisual {...p} {...v} />;
    case 'fractionCompare':
      return <FractionCompareVisual {...p} a={v.a} b={v.b} shape={v.shape} />;
    case 'objects':
      return <ObjectsVisual {...p} {...v} />;
    case 'equation':
      return <EquationVisual {...p} parts={v.parts} highlight={v.highlight} />;
    case 'numberLine':
      return <NumberLineVisual {...p} {...v} />;
    case 'sequence':
      return <SequenceVisual {...p} items={v.items} />;
    case 'labeled':
      return <LabeledVisual {...p} items={v.items} />;
    case 'bars':
      return <BarsVisual {...p} bars={v.bars} />;
    case 'clock':
      return <ClockVisual {...p} hour={v.hour} minute={v.minute} />;
    case 'shape':
      return <ShapeVisual {...p} shape={v.shape} sideLabels={v.sideLabels} />;
    case 'placeValue':
      return <PlaceValueVisual {...p} number={v.number} />;
    case 'wordCard':
      return <WordCardVisual {...p} word={v.word} emoji={v.emoji} meaning={v.meaning} />;
    default:
      return null;
  }
}

/** The spoken description of a step's picture ('' when there is none), e.g. for "Read to me". */
export function useVisualLabel(visual: unknown): string {
  const { t } = useT();
  return useMemo(() => {
    const v = cleanVisual(visual);
    return v ? describeVisual(v, t) : '';
  }, [visual, t]);
}

export function LessonVisual({ visual, subject }: { visual: unknown; subject: Subject }) {
  const { t } = useT();
  const v = useMemo(() => cleanVisual(visual), [visual]);
  const [width, onLayout] = useBoxWidth();
  if (!v) return null;
  const subj = subjectInfo(subject);
  const label = describeVisual(v, t);
  const interactive = isInteractive(v);
  return (
    <View
      testID={`visual-${v.type}`}
      role={interactive ? 'group' : 'img'}
      aria-label={label}
      accessible={!interactive}
      style={{ backgroundColor: subj.soft, borderRadius: R.lg, borderWidth: 2, borderColor: subj.accent, padding: S.md, overflow: 'hidden' }}>
      <View onLayout={onLayout} style={{ alignSelf: 'stretch' }}>
        <Quiet>
          <Body v={v} p={{ accent: subj.accent, soft: subj.soft, width }} />
        </Quiet>
      </View>
    </View>
  );
}
