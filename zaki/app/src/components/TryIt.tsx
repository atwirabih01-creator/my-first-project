// "Try it!": one small practice question inside a teach step. Nothing is scored or saved.
// Right -> green, a little confetti, a happy owl and the short explanation.
// Wrong -> a gentle orange "Almost! Look at the picture again" and another go;
// after 2 wrong answers the right one is shown with the explanation.
import { useState } from 'react';
import { View } from 'react-native';

import { C, R, S } from '@/constants/theme';
import { useT } from '@/lib/store';
import type { TryIt } from '@/lib/types';
import { Burst, PopIn } from './Celebrate';
import { Choice } from './lesson';
import { Mascot } from './Mascot';
import { Row, Txt } from './ui';

export function TryItCard({ tryIt, onFinished }: { tryIt: TryIt; onFinished?: () => void }) {
  const { t } = useT();
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const revealed = !solved && wrong.length >= 2;
  const finished = solved || revealed;

  const pick = (i: number) => {
    if (finished || wrong.includes(i)) return;
    if (i === tryIt.answerIndex) {
      setSolved(true);
      onFinished?.();
      return;
    }
    const next = [...wrong, i];
    setWrong(next);
    if (next.length >= 2) onFinished?.();
  };

  return (
    <View testID="try-it" style={{ backgroundColor: C.lilacSoft, borderColor: C.lilac, borderWidth: 3, borderRadius: R.lg, padding: S.lg, gap: S.md, overflow: 'hidden' }}>
      <Row>
        <Mascot size={52} mood={solved ? 'cheer' : wrong.length ? 'thinking' : 'happy'} action={solved ? 'hop' : undefined} actionKey={solved ? 1 : 0} />
        <Txt variant="h2" color={C.lilac} style={{ flex: 1 }}>
          🎯 {t('tryItTitle')}
        </Txt>
      </Row>
      <Txt variant="big" testID="try-question">
        {tryIt.q}
      </Txt>
      {tryIt.choices.map((c, i) => (
        <Choice
          key={i}
          big
          testID={`try-choice-${i}`}
          label={c}
          state={(solved || revealed) && i === tryIt.answerIndex ? 'right' : wrong.includes(i) ? 'wrong' : 'idle'}
          onPress={() => pick(i)}
        />
      ))}
      {!finished && wrong.length ? (
        <PopIn key={wrong.length}>
          <View testID="try-almost" role="alert" style={{ backgroundColor: C.wrongSoft, borderColor: '#F2B57A', borderWidth: 2, borderRadius: R.md, padding: S.md }}>
            <Txt bold color={C.wrong}>
              {t('tryAlmost')}
            </Txt>
          </View>
        </PopIn>
      ) : null}
      {finished ? (
        <PopIn bounce>
          <View
            testID={solved ? 'try-right' : 'try-reveal'}
            role="alert"
            style={{ backgroundColor: C.mintSoft, borderColor: C.mint, borderWidth: 2, borderRadius: R.md, padding: S.md, gap: S.xs }}>
            <Txt bold color={C.mint}>
              {solved ? t('tryRight') : t('tryShowAnswer', { a: tryIt.choices[tryIt.answerIndex] })}
            </Txt>
            {tryIt.explain ? <Txt testID="try-explain">{tryIt.explain}</Txt> : null}
          </View>
        </PopIn>
      ) : null}
      {solved ? <Burst /> : null}
    </View>
  );
}
