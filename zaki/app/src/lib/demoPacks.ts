// Bundled sample LessonPacks for DEMO MODE (no server / no AI key).
// Plain data, no secrets. Used when /api is unreachable or /api/health says ai:false.
import type { Lang, LessonPack, Question, Source, Subject } from './types';

type QTuple = [id: string, q: string, choices: string[], answerIndex: number, hint1?: string, hint2?: string, example?: string];

function mk(list: QTuple[], fallback: { hint1: string; hint2: string; example: string }, kind?: 'math' | 'text'): Question[] {
  return list.map(([id, q, choices, answerIndex, hint1, hint2, example]) => ({
    id,
    q,
    choices,
    answerIndex,
    hint1: hint1 ?? fallback.hint1,
    hint2: hint2 ?? fallback.hint2,
    similarExample: example ?? fallback.example,
    kind,
  }));
}

// ---------------- Math: fractions (grade 3) ----------------
const fracHintsEn = {
  hint1: 'Remember: the bottom number is how many equal parts.',
  hint2: 'The top number is how many parts we take.',
  example: 'In 2/4: we cut into 4 equal parts and took 2.',
};
const fracHintsAr = {
  hint1: 'تذكَّرْ: الرقم السفلي هو عدد الأجزاء المتساوية.',
  hint2: 'والرقم العلوي هو عدد الأجزاء التي أخذناها.',
  example: 'في 2/4: قسمنا إلى 4 أجزاء متساوية وأخذنا 2.',
};

const fractionsEn: LessonPack = {
  id: 'demo-math-fractions-en',
  subject: 'math',
  topic: 'Fractions',
  grade: 3,
  lang: 'en',
  recap: [
    { q: 'What is 2 + 2?', choices: ['3', '4', '5'], answerIndex: 1 },
    { q: 'Which shape has 4 equal sides?', choices: ['Triangle', 'Square', 'Circle'], answerIndex: 1 },
    { q: 'Half of 6 apples is how many apples?', choices: ['2', '3', '4'], answerIndex: 1 },
  ],
  teachSteps: [
    { text: 'A fraction is a part of a whole. Imagine one pizza cut into equal pieces.', example: 'Cut a pizza into 4 equal slices. Each slice is 1/4 (one quarter).' },
    { text: 'The bottom number tells how many equal parts the whole has.', example: 'In 3/4, the 4 means the pizza has 4 equal slices.' },
    { text: 'The top number tells how many parts we take.', example: 'In 3/4, the 3 means we took 3 slices.' },
    { text: 'Same bottom number? The bigger top number is the bigger fraction.', example: '3/4 is bigger than 1/4, because 3 slices are more than 1 slice.' },
  ],
  checks: mk(
    [
      ['c1', 'A cake is cut into 4 equal pieces. What is one piece?', ['1/2', '1/4', '4/1'], 1, 'Count how many equal pieces the whole cake has.', 'The bottom number is the number of equal pieces.', 'A sandwich is cut into 2 equal halves. One piece is 1/2.'],
      ['c2', 'In 2/5, how many equal parts is the whole cut into?', ['2', '5', '7'], 1, 'Look at the bottom number.', 'The bottom number tells how many equal parts.', 'In 3/8, the whole is cut into 8 equal parts.'],
      ['c3', 'Which is bigger?', ['1/3', '2/3'], 1, 'Both have 3 equal parts. Look at the top numbers.', 'More parts taken means more.', 'Which is more: 1/5 or 4/5 of a chocolate bar? 4/5, because 4 pieces are more than 1.'],
    ],
    fracHintsEn,
    'math',
  ),
  test: mk(
    [
      ['t1', 'A pizza has 8 equal slices. You eat 3. What fraction did you eat?', ['3/8', '8/3', '5/8'], 0],
      ['t2', 'Which fraction means one half?', ['1/4', '1/2', '2/1'], 1],
      ['t3', 'Which is bigger?', ['2/6', '5/6', 'They are the same'], 1],
      ['t4', 'In 4/7, what is the top number?', ['4', '7', '11'], 0],
      ['t5', 'A bar is cut into 4 equal parts. You take all 4. What fraction is that?', ['4/4', '1/4', '0/4'], 0],
    ],
    fracHintsEn,
    'math',
  ),
  retestPool: mk(
    [
      ['r1', 'A cake has 6 equal pieces. You eat 1. What fraction did you eat?', ['6/1', '1/6', '5/6'], 1],
      ['r2', 'Which fraction is one quarter?', ['1/4', '1/3', '4/1'], 0],
      ['r3', 'Which is smaller?', ['3/5', '1/5', 'They are the same'], 1],
      ['r4', 'In 5/9, what is the bottom number?', ['5', '9', '14'], 1],
      ['r5', '2 out of 3 equal parts are coloured. What fraction is coloured?', ['3/2', '2/3', '1/3'], 1],
      ['r6', 'A pie has 10 equal slices. 7 are eaten. What fraction is eaten?', ['7/10', '10/7', '3/10'], 0],
      ['r7', 'Which is bigger?', ['4/8', '6/8', 'They are the same'], 1],
      ['r8', 'How many halves make one whole?', ['1', '2', '4'], 1],
      ['r9', 'A pizza has 4 equal slices. 2 are left. What fraction is left?', ['2/4', '4/2', '1/4'], 0],
      ['r10', 'Which fraction has 3 equal parts?', ['3/5', '1/3', '3/1'], 1],
    ],
    fracHintsEn,
    'math',
  ),
  summary: [
    'A fraction is a part of a whole cut into equal parts.',
    'Bottom number: how many equal parts.',
    'Top number: how many parts we take.',
    'Same bottom number? Bigger top number means a bigger fraction.',
  ],
  flashcards: [
    { front: 'What is a fraction?', back: 'A part of a whole' },
    { front: 'What does the bottom number tell us?', back: 'How many equal parts' },
    { front: 'What does the top number tell us?', back: 'How many parts we take' },
    { front: '1/2', back: 'One half' },
    { front: '1/4', back: 'One quarter' },
  ],
};

const fractionsAr: LessonPack = {
  id: 'demo-math-fractions-ar',
  subject: 'math',
  topic: 'الكسور',
  grade: 3,
  lang: 'ar',
  recap: [
    { q: 'كم يساوي 2 + 2؟', choices: ['3', '4', '5'], answerIndex: 1 },
    { q: 'أيُّ شكلٍ له 4 أضلاع متساوية؟', choices: ['مثلث', 'مربع', 'دائرة'], answerIndex: 1 },
    { q: 'نصف 6 تفاحات، كم تفاحة؟', choices: ['2', '3', '4'], answerIndex: 1 },
  ],
  teachSteps: [
    { text: 'الكسر جزءٌ من شيءٍ كامل. تخيَّلْ بيتزا مقسومة إلى قطعٍ متساوية.', example: 'نقسم البيتزا إلى 4 قطع متساوية. كل قطعة هي 1/4 (ربع).' },
    { text: 'الرقم السفلي يخبرنا: إلى كم جزءًا متساويًا قُسِم الشيء الكامل.', example: 'في 3/4، الرقم 4 يعني أن البيتزا فيها 4 قطع متساوية.' },
    { text: 'الرقم العلوي يخبرنا: كم جزءًا أخذنا.', example: 'في 3/4، الرقم 3 يعني أننا أخذنا 3 قطع.' },
    { text: 'إذا كان الرقم السفلي نفسه، فالكسر ذو الرقم العلوي الأكبر هو الأكبر.', example: '3/4 أكبر من 1/4، لأن 3 قطع أكثر من قطعة واحدة.' },
  ],
  checks: mk(
    [
      ['c1', 'قُسِمت كعكة إلى 4 قطع متساوية. ما الكسر الذي يمثّل قطعة واحدة؟', ['1/2', '1/4', '4/1'], 1, 'عُدَّ القطع المتساوية في الكعكة كلها.', 'الرقم السفلي هو عدد القطع المتساوية.', 'قُسِمت شطيرة إلى قطعتين متساويتين. كل قطعة هي 1/2.'],
      ['c2', 'في الكسر 2/5، إلى كم جزءًا متساويًا قُسِم الشيء الكامل؟', ['2', '5', '7'], 1, 'انظرْ إلى الرقم السفلي.', 'الرقم السفلي يخبرنا بعدد الأجزاء المتساوية.', 'في الكسر 3/8، قُسِم الشيء الكامل إلى 8 أجزاء متساوية.'],
      ['c3', 'أيُّ الكسرين أكبر؟', ['1/3', '2/3'], 1, 'في الكسرين 3 أجزاء متساوية. انظرْ إلى الرقمين العلويين.', 'كلما أخذنا أجزاء أكثر، كان الكسر أكبر.', 'أيهما أكثر: 1/5 أم 4/5 من لوح شوكولاتة؟ 4/5، لأن 4 قطع أكثر من قطعة واحدة.'],
    ],
    fracHintsAr,
    'math',
  ),
  test: mk(
    [
      ['t1', 'في البيتزا 8 قطع متساوية. أكلتَ 3 منها. ما الكسر الذي أكلته؟', ['3/8', '8/3', '5/8'], 0],
      ['t2', 'أيُّ كسرٍ يعني النصف؟', ['1/4', '1/2', '2/1'], 1],
      ['t3', 'أيُّ الكسرين أكبر؟', ['2/6', '5/6', 'متساويان'], 1],
      ['t4', 'في الكسر 4/7، ما الرقم العلوي؟', ['4', '7', '11'], 0],
      ['t5', 'قُسِم لوحٌ إلى 4 أجزاء متساوية، وأخذتَ الأجزاء الأربعة كلها. ما الكسر؟', ['4/4', '1/4', '0/4'], 0],
    ],
    fracHintsAr,
    'math',
  ),
  retestPool: mk(
    [
      ['r1', 'في الكعكة 6 قطع متساوية. أكلتَ قطعة واحدة. ما الكسر الذي أكلته؟', ['6/1', '1/6', '5/6'], 1],
      ['r2', 'أيُّ كسرٍ يعني الربع؟', ['1/4', '1/3', '4/1'], 0],
      ['r3', 'أيُّ الكسرين أصغر؟', ['3/5', '1/5', 'متساويان'], 1],
      ['r4', 'في الكسر 5/9، ما الرقم السفلي؟', ['5', '9', '14'], 1],
      ['r5', 'لُوِّن جزآن من 3 أجزاء متساوية. ما الكسر الملوَّن؟', ['3/2', '2/3', '1/3'], 1],
      ['r6', 'في الفطيرة 10 قطع متساوية، أُكِل منها 7. ما الكسر الذي أُكِل؟', ['7/10', '10/7', '3/10'], 0],
      ['r7', 'أيُّ الكسرين أكبر؟', ['4/8', '6/8', 'متساويان'], 1],
      ['r8', 'كم نصفًا يصنع شيئًا كاملًا؟', ['1', '2', '4'], 1],
      ['r9', 'في البيتزا 4 قطع متساوية، بقيت منها قطعتان. ما الكسر الباقي؟', ['2/4', '4/2', '1/4'], 0],
      ['r10', 'أيُّ كسرٍ قُسِم فيه الشيء إلى 3 أجزاء متساوية؟', ['3/5', '1/3', '3/1'], 1],
    ],
    fracHintsAr,
    'math',
  ),
  summary: [
    'الكسر جزءٌ من شيءٍ كامل مقسوم إلى أجزاء متساوية.',
    'الرقم السفلي: عدد الأجزاء المتساوية.',
    'الرقم العلوي: عدد الأجزاء التي أخذناها.',
    'إذا تساوى الرقم السفلي، فالرقم العلوي الأكبر يعني كسرًا أكبر.',
  ],
  flashcards: [
    { front: 'ما هو الكسر؟', back: 'جزءٌ من شيءٍ كامل' },
    { front: 'ماذا يخبرنا الرقم السفلي؟', back: 'عدد الأجزاء المتساوية' },
    { front: 'ماذا يخبرنا الرقم العلوي؟', back: 'عدد الأجزاء التي أخذناها' },
    { front: '1/2', back: 'نصف' },
    { front: '1/4', back: 'ربع' },
  ],
};

// ---------------- Science: the water cycle ----------------
const waterHintsEn = {
  hint1: 'Think about the sun, the clouds and the rain.',
  hint2: 'Water goes up as vapour, makes clouds, then falls.',
  example: 'A puddle dries in the sun, the vapour makes clouds, and later it rains.',
};
const waterHintsAr = {
  hint1: 'فكّرْ في الشمس والغيوم والمطر.',
  hint2: 'يصعد الماء بخارًا، ويصنع الغيوم، ثم يسقط.',
  example: 'تجفّ بركة الماء في الشمس، ويصنع البخار الغيوم، ثم يسقط المطر.',
};

const waterEn: LessonPack = {
  id: 'demo-science-water-en',
  subject: 'science',
  topic: 'The water cycle',
  grade: 3,
  lang: 'en',
  recap: [
    { q: 'What do plants need to grow?', choices: ['Water and sun', 'Only toys', 'Nothing'], answerIndex: 0 },
    { q: 'Water can be a liquid. Ice is water as a…', choices: ['Gas', 'Solid', 'Rainbow'], answerIndex: 1 },
  ],
  teachSteps: [
    { text: 'Water on Earth goes round and round. This is called the water cycle.', example: 'The rain today may once have been in the sea!' },
    { text: 'Evaporation: the sun warms water and it turns into water vapour, a gas that rises into the sky.', example: 'A wet towel dries in the sun because its water evaporates.' },
    { text: 'Condensation: high in the sky the vapour cools and turns into tiny drops. Many drops make clouds.', example: 'A cold glass gets drops on the outside. That is condensation.' },
    { text: 'Precipitation: when the drops get heavy, they fall as rain, snow or hail. Then the cycle starts again.', example: 'Rain fills rivers and seas, and the sun warms them again.' },
  ],
  checks: mk(
    [
      ['c1', 'What makes water evaporate?', ["The sun's heat", 'The moon', 'Wind only'], 0, 'Think of a wet towel drying outside.', 'It is hot and bright in the sky.', 'A puddle disappears on a sunny day because the sun heats it.'],
      ['c2', 'What are clouds made of?', ['Cotton', 'Tiny water drops', 'Smoke'], 1, 'Clouds form when vapour cools.', 'Cooling vapour turns into little drops.', 'Drops on a cold glass come from vapour in the air.'],
      ['c3', 'Rain, snow and hail are called…', ['Evaporation', 'Precipitation', 'Condensation'], 1, 'It is the step when water falls.', 'It is the last step before the cycle starts again.', 'When snow falls from clouds, that is part of the falling step.'],
    ],
    waterHintsEn,
    'text',
  ),
  test: mk(
    [
      ['t1', 'Water turning into vapour is called…', ['Evaporation', 'Precipitation', 'Freezing'], 0],
      ['t2', 'Where does vapour go when it rises?', ['Under the ground', 'Up into the sky', 'Into rocks'], 1],
      ['t3', 'Vapour cooling into drops is called…', ['Condensation', 'Evaporation', 'Melting'], 0],
      ['t4', 'Which one is precipitation?', ['Rain', 'Sunshine', 'A rainbow'], 0],
      ['t5', 'Why is it called a cycle?', ['It goes round and round', 'It happens only once', 'It has wheels'], 0],
    ],
    waterHintsEn,
    'text',
  ),
  retestPool: mk(
    [
      ['r1', 'What heats the water in seas and rivers?', ['The sun', 'The clouds', 'The fish'], 0],
      ['r2', 'Clouds are made when vapour…', ['gets hot', 'cools down', 'disappears forever'], 1],
      ['r3', 'Snow falling from clouds is…', ['Precipitation', 'Evaporation', 'Condensation'], 0],
      ['r4', 'Drops on a cold glass are an example of…', ['Condensation', 'Precipitation', 'Evaporation'], 0],
      ['r5', 'After rain falls into the sea, what happens next?', ['The sun warms it again', 'It stops forever', 'It turns into sand'], 0],
    ],
    waterHintsEn,
    'text',
  ),
  summary: [
    'The water cycle: water goes round and round.',
    'Evaporation: the sun turns water into vapour that rises.',
    'Condensation: vapour cools into drops that make clouds.',
    'Precipitation: rain, snow or hail fall, and it starts again.',
  ],
  flashcards: [
    { front: 'Evaporation', back: 'Water turns into vapour and rises' },
    { front: 'Condensation', back: 'Vapour cools into tiny drops (clouds)' },
    { front: 'Precipitation', back: 'Rain, snow or hail falling' },
    { front: 'Water cycle', back: 'Water going round and round' },
  ],
};

const waterAr: LessonPack = {
  id: 'demo-science-water-ar',
  subject: 'science',
  topic: 'دورة الماء',
  grade: 3,
  lang: 'ar',
  recap: [
    { q: 'ماذا تحتاج النباتات لتنمو؟', choices: ['الماء والشمس', 'الألعاب فقط', 'لا شيء'], answerIndex: 0 },
    { q: 'الماء يكون سائلًا. والجليد هو ماء في حالة…', choices: ['غازية', 'صلبة', 'قوس قزح'], answerIndex: 1 },
  ],
  teachSteps: [
    { text: 'الماء على الأرض يدور ويدور. نسمّي ذلك: دورة الماء.', example: 'ربما كان مطر اليوم يومًا ما في البحر!' },
    { text: 'التبخّر: الشمس تُدفئ الماء فيتحوّل إلى بخار، وهو غاز يصعد إلى السماء.', example: 'تجفّ المنشفة المبلّلة في الشمس لأن ماءها يتبخّر.' },
    { text: 'التكاثف: في أعلى السماء يبرد البخار ويتحوّل إلى قطرات صغيرة. القطرات الكثيرة تصنع الغيوم.', example: 'تظهر قطرات على كأس بارد من الخارج: هذا هو التكاثف.' },
    { text: 'الهطول: عندما تثقل القطرات، تسقط مطرًا أو ثلجًا أو بَرَدًا. ثم تبدأ الدورة من جديد.', example: 'يملأ المطر الأنهار والبحار، ثم تُدفئها الشمس من جديد.' },
  ],
  checks: mk(
    [
      ['c1', 'ما الذي يجعل الماء يتبخّر؟', ['حرارة الشمس', 'القمر', 'الريح فقط'], 0, 'فكّرْ في منشفة مبلّلة تجفّ في الخارج.', 'شيء حارّ ومضيء في السماء.', 'تختفي بركة الماء في يوم مشمس لأن الشمس تُسخّنها.'],
      ['c2', 'مِمَّ تتكوّن الغيوم؟', ['من القطن', 'من قطرات ماء صغيرة', 'من الدخان'], 1, 'تتكوّن الغيوم عندما يبرد البخار.', 'البخار عندما يبرد يصير قطرات صغيرة.', 'القطرات على الكأس البارد تأتي من البخار في الهواء.'],
      ['c3', 'المطر والثلج والبَرَد تُسمّى…', ['تبخّرًا', 'هطولًا', 'تكاثفًا'], 1, 'إنها الخطوة التي يسقط فيها الماء.', 'إنها آخر خطوة قبل أن تبدأ الدورة من جديد.', 'عندما يسقط الثلج من الغيوم، فهذا جزء من خطوة السقوط.'],
    ],
    waterHintsAr,
    'text',
  ),
  test: mk(
    [
      ['t1', 'تحوُّل الماء إلى بخار يُسمّى…', ['التبخّر', 'الهطول', 'التجمّد'], 0],
      ['t2', 'إلى أين يذهب البخار عندما يصعد؟', ['تحت الأرض', 'إلى السماء', 'داخل الصخور'], 1],
      ['t3', 'تحوُّل البخار البارد إلى قطرات يُسمّى…', ['التكاثف', 'التبخّر', 'الذوبان'], 0],
      ['t4', 'أيُّ هذه هطول؟', ['المطر', 'أشعة الشمس', 'قوس قزح'], 0],
      ['t5', 'لماذا نسمّيها دورة؟', ['لأن الماء يدور ويدور', 'لأنها تحدث مرة واحدة فقط', 'لأن لها عجلات'], 0],
    ],
    waterHintsAr,
    'text',
  ),
  retestPool: mk(
    [
      ['r1', 'ما الذي يُسخّن ماء البحار والأنهار؟', ['الشمس', 'الغيوم', 'الأسماك'], 0],
      ['r2', 'تتكوّن الغيوم عندما…', ['يسخن البخار', 'يبرد البخار', 'يختفي البخار إلى الأبد'], 1],
      ['r3', 'سقوط الثلج من الغيوم هو…', ['هطول', 'تبخّر', 'تكاثف'], 0],
      ['r4', 'القطرات على الكأس البارد مثال على…', ['التكاثف', 'الهطول', 'التبخّر'], 0],
      ['r5', 'بعد أن يسقط المطر في البحر، ماذا يحدث؟', ['تُدفئه الشمس من جديد', 'يتوقّف إلى الأبد', 'يتحوّل إلى رمل'], 0],
    ],
    waterHintsAr,
    'text',
  ),
  summary: [
    'دورة الماء: الماء يدور ويدور.',
    'التبخّر: الشمس تحوّل الماء إلى بخار يصعد.',
    'التكاثف: البخار يبرد ويصير قطرات تصنع الغيوم.',
    'الهطول: يسقط المطر أو الثلج أو البَرَد، ثم تبدأ الدورة من جديد.',
  ],
  flashcards: [
    { front: 'التبخّر', back: 'يتحوّل الماء إلى بخار ويصعد' },
    { front: 'التكاثف', back: 'يبرد البخار ويصير قطرات صغيرة (غيوم)' },
    { front: 'الهطول', back: 'سقوط المطر أو الثلج أو البَرَد' },
    { front: 'دورة الماء', back: 'الماء يدور ويدور' },
  ],
};

export const DEMO_PACKS: LessonPack[] = [fractionsEn, fractionsAr, waterEn, waterAr];

const DEMO_SOURCES: Record<string, Record<Lang, Source[]>> = {
  math: {
    en: [{ title: 'Sample source (demo): Fractions for beginners' }, { title: 'Sample source (demo): Equal parts of a whole' }],
    ar: [{ title: 'مصدر تجريبي: الكسور للمبتدئين' }, { title: 'مصدر تجريبي: الأجزاء المتساوية من الشيء الكامل' }],
  },
  science: {
    en: [{ title: 'Sample source (demo): The water cycle for kids' }],
    ar: [{ title: 'مصدر تجريبي: دورة الماء للأطفال' }],
  },
};

/** Pick a bundled sample pack. Subjects without a sample fall back to fractions. */
export function getDemoPack(subject: Subject, lang: Lang, grade: number): { pack: LessonPack; sources: Source[] } {
  const subj = subject === 'science' ? 'science' : 'math';
  const base = DEMO_PACKS.find((p) => p.subject === subj && p.lang === lang) ?? fractionsEn;
  return { pack: { ...base, grade }, sources: DEMO_SOURCES[subj][lang] };
}
