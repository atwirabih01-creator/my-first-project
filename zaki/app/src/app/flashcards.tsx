// Flashcards made from the child's own lessons: flip cards + a quick-recall round.
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Choice } from '@/components/lesson';
import { Btn, Card, Chip, ProgressBar, Row, Txt } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useChild, useT } from '@/lib/store';

type FC = { front: string; back: string };

function shuffle<T>(a: T[], seed: number): T[] {
  const arr = [...a];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Flashcards() {
  const { packs, progress } = useChild();
  const { t } = useT();
  const cards: FC[] = useMemo(
    () => Object.entries(packs).filter(([k]) => progress.lessons[k]).flatMap(([, cp]) => cp.pack.flashcards ?? []),
    [packs, progress.lessons],
  );
  const [mode, setMode] = useState<'flip' | 'quick'>('flip');
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [round, setRound] = useState(1);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongPick, setWrongPick] = useState<number | null>(null);

  const quick = useMemo(() => {
    const deck = shuffle(cards, round * 7).slice(0, 5);
    return deck.map((c, n) => {
      const others = shuffle(cards.filter((x) => x.back !== c.back), round * 13 + n).slice(0, 2).map((x) => x.back);
      const choices = shuffle([c.back, ...others], round * 17 + n);
      return { card: c, choices, answer: choices.indexOf(c.back) };
    });
  }, [cards, round]);

  return (
    <Screen child trackTime back="/home" title={`🃏 ${t('flashcards')}`}>
      {cards.length === 0 ? (
        <Txt>{t('fcNone')}</Txt>
      ) : (
        <>
          <Row wrap>
            <Chip label={t('fcCards')} selected={mode === 'flip'} onPress={() => setMode('flip')} testID="fc-mode-flip" />
            <Chip label={t('fcQuick')} selected={mode === 'quick'} onPress={() => setMode('quick')} testID="fc-mode-quick" />
          </Row>

          {mode === 'flip' ? (
            <View style={{ gap: S.md }}>
              <Txt variant="small" center>
                {t('cardOf', { n: i + 1, m: cards.length })} · {t('fcTapFlip')}
              </Txt>
              <Pressable
                testID="flashcard"
                onPress={() => setFlipped((f) => !f)}
                accessibilityRole="button"
                accessibilityLabel={flipped ? cards[i].back : cards[i].front}
                accessibilityHint={t('fcTapFlip')}
                style={({ pressed }) => [
                  {
                    minHeight: 220,
                    borderRadius: R.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: S.xl,
                    backgroundColor: flipped ? C.mintSoft : C.primarySoft,
                    borderWidth: 3,
                    borderColor: flipped ? C.mint : C.primary,
                  },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}>
                <Txt variant="title" center>
                  {flipped ? cards[i].back : cards[i].front}
                </Txt>
              </Pressable>
              <Btn
                title={t('fcNext')}
                big
                onPress={() => {
                  setFlipped(false);
                  setI((i + 1) % cards.length);
                }}
                testID="fc-next"
              />
            </View>
          ) : qi < quick.length ? (
            <View style={{ gap: S.md }}>
              <ProgressBar value={qi / quick.length} color={C.lilac} />
              <Txt variant="small">{t('fcQuickQ')}</Txt>
              <Card tone="primary">
                <Txt variant="title" center>
                  {quick[qi].card.front}
                </Txt>
              </Card>
              {quick[qi].choices.map((c, n) => (
                <Choice
                  key={`${round}-${qi}-${n}`}
                  label={c}
                  testID={`choice-${n}`}
                  state={wrongPick === n ? 'wrong' : 'idle'}
                  onPress={() => {
                    if (n === quick[qi].answer) {
                      if (wrongPick === null) setScore(score + 1);
                      setWrongPick(null);
                      setQi(qi + 1);
                    } else setWrongPick(n);
                  }}
                />
              ))}
            </View>
          ) : (
            <Card tone="mint" style={{ alignItems: 'center' }}>
              <Txt variant="title" center>
                🎉 {t('fcScore', { score, total: quick.length })}
              </Txt>
              <Btn
                title={t('fcAgain')}
                onPress={() => {
                  setRound(round + 1);
                  setQi(0);
                  setScore(0);
                }}
              />
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}
