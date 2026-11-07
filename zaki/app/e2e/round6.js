// Round 6: lesson pictures + "Try it!" (pack version 4), against a MOCKED server
// (needs http, e.g. `node e2e/serve.js <dist> 8092`, then BASE=http://localhost:8092 node e2e/round6.js).
// The mocked lesson pack has one teach step for EVERY picture type (+ one unknown picture that
// must show nothing). Checks: each picture renders (testID visual-<type>) with a spoken label,
// interactive fraction (tap 3 of 4 -> success), tap-to-count, fraction compare reveal, Try it
// right / wrong / shown after 2 wrong, "next" works without answering (secondary button until
// answered), "Read to me" includes the picture, 360px English + Arabic without sideways
// scrolling, and in Arabic the number line still counts left -> right.
// Screenshots: test-screenshots/round6/.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { writeTestConsent } = require('./consent-helper');

const BASE = process.env.BASE || 'http://localhost:8092';
const OUT = path.join(process.env.OUT || path.join(__dirname, '..', 'test-screenshots'), 'round6');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -- ' + extra : ''}`);
};

const q = (id) => ({ id, q: `Mock ${id}?`, choices: ['A', 'B', 'C'], answerIndex: 1, hint1: 'h1', hint2: 'h2', similarExample: 'ex' });
const T = {
  en: {
    tryFrac: { q: 'How many pieces are coloured in 3/4?', choices: ['2', '3', '4'], answerIndex: 1, explain: 'The top number, 3, tells how many pieces are coloured.' },
    tryBar: { q: 'The bar has 6 pieces. What is the bottom number?', choices: ['2', '4', '6'], answerIndex: 2, explain: 'The bottom number tells how many equal pieces there are: 6.' },
    tryCmp: { q: 'Which is bigger?', choices: ['3/4', '1/4'], answerIndex: 0, explain: '3 pieces are more than 1 piece.' },
    words: ['Seed', 'Sprout', 'Plant', 'Flower'],
    labels: ['Head', 'Wing', 'Tail', 'Leg'],
    bars: ['Apples', 'Bananas', 'Pears'],
    word: { word: 'Happy', meaning: 'Feeling good and smiling.' },
  },
  ar: {
    tryFrac: { q: 'كم قطعة ملوّنة في 3/4؟', choices: ['2', '3', '4'], answerIndex: 1, explain: 'العدد في الأعلى، 3، يخبرنا كم قطعة ملوّنة.' },
    tryBar: { q: 'في الشريط 6 قطع. ما العدد في الأسفل؟', choices: ['2', '4', '6'], answerIndex: 2, explain: 'العدد في الأسفل يخبرنا كم قطعة متساوية: 6.' },
    tryCmp: { q: 'أيّهما أكبر؟', choices: ['3/4', '1/4'], answerIndex: 0, explain: '3 قطع أكثر من قطعة واحدة.' },
    words: ['بذرة', 'برعم', 'نبتة', 'زهرة'],
    labels: ['رأس', 'جناح', 'ذيل', 'رِجل'],
    bars: ['تفاح', 'موز', 'إجاص'],
    word: { word: 'سعيد', meaning: 'يشعر بالفرح ويبتسم.' },
  },
};
const EMO = ['🌱', '🌿', '🪴', '🌸'];
const steps = (lang) => {
  const L = T[lang];
  const s = (n, visual, tryIt) => ({ title: lang === 'ar' ? `صورة ${n}` : `Picture ${n}`, text: lang === 'ar' ? `نص الخطوة ${n}.` : `Step ${n} text.`, example: n === 1 ? (lang === 'ar' ? 'مثال: نصف بيتزا.' : 'Example: half a pizza.') : undefined, visual, tryIt });
  return [
    s(1, { type: 'fraction', shape: 'circle', parts: 4, shaded: 3, interactive: true }, L.tryFrac),
    s(2, { type: 'fraction', shape: 'bar', parts: 6, shaded: 2, label: lang === 'ar' ? 'شوكولاتة' : 'A chocolate bar' }, L.tryBar),
    s(3, { type: 'fractionCompare', a: { parts: 4, shaded: 3 }, b: { parts: 4, shaded: 1 }, shape: 'circle' }, L.tryCmp),
    s(4, { type: 'objects', emoji: '🍎', count: 5, interactive: true }),
    s(5, { type: 'objects', emoji: '⭐', count: 9, groups: 3, crossedOut: 2, label: '9 - 2 = 7' }),
    s(6, { type: 'equation', parts: ['3', '+', '4', '=', '7'], highlight: 4 }),
    s(7, { type: 'numberLine', from: 0, to: 10, step: 1, marks: [2, 7], jumps: [{ from: 2, to: 5 }, { from: 5, to: 7 }] }),
    s(8, { type: 'sequence', items: L.words.map((label, i) => ({ emoji: EMO[i], label })) }),
    s(9, { type: 'labeled', items: L.labels.map((label, i) => ({ emoji: ['🐦', '🪶', '🐾', '🦵'][i], label })) }),
    s(10, { type: 'bars', bars: L.bars.map((label, i) => ({ label, value: [40, 70, 25][i], emoji: ['🍎', '🍌', '🍐'][i] })) }),
    s(11, { type: 'clock', hour: 3, minute: 30 }),
    s(12, { type: 'shape', shape: 'triangle', sideLabels: ['3 cm', '4 cm', '5 cm'] }),
    s(13, { type: 'placeValue', number: 245 }),
    s(14, { type: 'wordCard', word: L.word.word, emoji: '😊', meaning: L.word.meaning }),
    s(15, { type: 'hologram', size: 99 }), // unknown picture: nothing shown, lesson goes on
  ];
};
const TYPES = ['fraction', 'fraction', 'fractionCompare', 'objects', 'objects', 'equation', 'numberLine', 'sequence', 'labeled', 'bars', 'clock', 'shape', 'placeValue', 'wordCard', null];
const mkPack = (topic, lang) => ({
  id: `mock-vis-${lang}`, subject: 'math', topic, grade: 5, lang, recap: [], teachSteps: steps(lang),
  checks: [q('c1')], test: [q('t1'), q('t2'), q('t3'), q('t4'), q('t5')], retestPool: [], summary: ['Mock summary'], flashcards: [],
});

(async () => {
  const browser = await chromium.launch();
  const newPage = async (width = 360, height = 780, extra = {}) => {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...extra });
    const page = await ctx.newPage();
    // Catch what "Read to me" would say (the phone voice is not available in the test browser).
    await page.addInitScript(() => {
      window.__spoken = [];
      try {
        window.speechSynthesis.speak = (u) => window.__spoken.push(u.text);
        window.speechSynthesis.cancel = () => {};
      } catch {
        /* no voice */
      }
    });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load resource/i.test(m.text())) errors.push('console: ' + m.text());
    });
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const body = route.request().postDataJSON?.() ?? null;
      const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
      if (url.endsWith('/api/health')) return json({ ok: true, ai: true, moderation: 'fallback' });
      if (url.endsWith('/api/lesson-pack')) return json({ pack: mkPack(body.topic, body.lang), sources: [], verify: { checked: 0, removed: 0 }, packVersion: 4 });
      if (url.endsWith('/api/check-answer')) return json({ correct: body.answer === 1, feedbackKey: body.answer === 1 ? 'right' : 'hint1' });
      if (url.endsWith('/api/tutor')) return json({ reply: 'MOCK tutor', safety: { flagged: false } });
      return json({});
    });
    const tid = (id) => page.getByTestId(id).locator('visible=true').first();
    const tap = async (id) => {
      await tid(id).click({ timeout: 10000 });
      await page.waitForTimeout(250);
    };
    const visible = (id, timeout = 5000) => tid(id).waitFor({ state: 'visible', timeout }).then(() => true, () => false);
    const count = (id) => page.getByTestId(id).locator('visible=true').count();
    const noH = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    const scrollTo = (id, block = 'center') =>
      page.evaluate(([i, b]) => [...document.querySelectorAll(`[data-testid="${i}"]`)].find((e) => e.offsetParent !== null)?.scrollIntoView({ block: b, behavior: 'instant' }), [id, block]);
    const shot = async (name, id) => {
      if (id) await scrollTo(id);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    };
    const bg = (id) => page.evaluate((i) => getComputedStyle([...document.querySelectorAll(`[data-testid="${i}"]`)].find((e) => e.offsetParent !== null)).backgroundColor, id);
    const label = (id) => page.evaluate((i) => [...document.querySelectorAll(`[data-testid="${i}"]`)].find((e) => e.offsetParent !== null)?.getAttribute('aria-label') || '', id);
    const fresh = async (lang) => {
      await page.goto(BASE);
      await page.evaluate(() => localStorage.clear());
      await page.goto(BASE);
      await tid('profile-Maya').waitFor({ timeout: 15000 });
      await writeTestConsent(page);
      if (lang === 'ar') {
        await page.evaluate(() => {
          const s = JSON.parse(localStorage.getItem('zaki:v1:state'));
          s.profiles = s.profiles.map((p) => (p.nickname === 'Maya' ? { ...p, lang: 'ar' } : p));
          localStorage.setItem('zaki:v1:state', JSON.stringify(s));
        });
      }
      await page.goto(BASE);
      await tid('profile-Maya').waitFor({ timeout: 15000 });
      await tap('profile-Maya');
      await tap('ready-yes');
      await tap('start-lesson');
      await tap('intro-start');
      await visible('teach-step', 8000);
    };
    const next = async () => {
      const before = await tid('teach-title').innerText();
      await tap('next-btn');
      await page.waitForFunction((b) => {
        const e = [...document.querySelectorAll('[data-testid="teach-title"]')].find((x) => x.offsetParent !== null);
        return e && e.innerText !== b;
      }, before, { timeout: 5000 }).catch(() => {});
    };
    const anyVisual = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="visual-"]')].filter((e) => e.offsetParent !== null).map((e) => e.getAttribute('data-testid')));
    return { page, tid, tap, visible, count, noH, scrollTo, shot, bg, label, fresh, next, anyVisual };
  };
  const PRIMARY = 'rgb(31, 127, 138)';
  const WHITE = 'rgb(255, 255, 255)';

  // ================= English, 360px =================
  let P = await newPage();
  await P.fresh('en');
  const fits = [];
  // Step 1: interactive fraction + Try it (right answer)
  check('EN visual-fraction (interactive) shown with a spoken label', (await P.visible('visual-fraction')) && (await P.label('visual-fraction')).length > 5);
  check('EN interactive fraction: "Tap 3 pieces" instruction', (await P.tid('fraction-instruction').innerText()).includes('Tap 3 pieces'));
  check('EN "next" is the small secondary button before Try it is answered', (await P.bg('next-btn')) === WHITE, await P.bg('next-btn'));
  await P.shot('01-fraction-interactive-start-en', 'visual-fraction');
  for (const i of [0, 1, 2]) await P.tap(`fraction-piece-${i}`);
  check('EN interactive fraction: tapping 3 of 4 pieces -> success', (await P.visible('fraction-done')) && (await P.tid('fraction-done').innerText()).includes('3/4'));
  await P.shot('02-fraction-interactive-done-en', 'fraction-done');
  await P.tap('fraction-piece-3');
  check('EN interactive fraction: a 4th piece -> "too many", no success', (await P.visible('fraction-too-many')) && (await P.count('fraction-done')) === 0);
  await P.tap('fraction-piece-3');
  check('EN interactive fraction: un-colour it -> success again', await P.visible('fraction-done'));
  await P.tap('read-aloud');
  const spoken = await P.page.evaluate(() => window.__spoken.join(' | '));
  check('EN "Read to me" reads title, text, the picture and the example', /Picture 1/.test(spoken) && /Step 1 text/.test(spoken) && /circle cut into 4 equal pieces, 3 are coloured: 3\/4/.test(spoken) && /half a pizza/.test(spoken), spoken);
  check('EN Try it card shown with 3 choices', (await P.visible('try-it')) && (await P.count('try-choice-2')) === 1 && (await P.tid('try-question').innerText()).includes('3/4'));
  await P.tap('try-choice-1');
  check('EN Try it right -> green "Yes!" + explanation', (await P.visible('try-right')) && (await P.tid('try-explain').innerText()).includes('top number'));
  check('EN "next" becomes the main button after answering', (await P.bg('next-btn')) === PRIMARY, await P.bg('next-btn'));
  await P.shot('03-tryit-right-en', 'try-it');
  fits.push(await P.noH());
  await P.next();

  // Step 2: fraction bar + Try it wrong twice -> answer shown
  check('EN visual-fraction (bar) shows 2/6 written under it', (await P.visible('visual-fraction')) && (await P.tid('fraction-text').innerText()).replace(/\s/g, '') === '26');
  await P.shot('04-fraction-bar-en', 'visual-fraction');
  await P.tap('try-choice-0');
  check('EN Try it wrong -> "Almost! Look at the picture again 👀", can try again', (await P.visible('try-almost')) && (await P.tid('try-almost').innerText()).includes('Almost! Look at the picture again') && (await P.count('try-right')) === 0);
  await P.shot('05-tryit-wrong-en', 'try-it');
  await P.tap('try-choice-1');
  check('EN Try it 2 wrong -> right answer shown + explanation', (await P.visible('try-reveal')) && (await P.tid('try-reveal').innerText()).includes('The answer is: 6') && (await P.tid('try-explain').innerText()).includes('6'));
  await P.shot('06-tryit-shown-after-2-wrong-en', 'try-it');
  fits.push(await P.noH());
  await P.next();

  // Step 3: compare, then "next" WITHOUT answering Try it
  check('EN visual-fractionCompare shown with "?"', (await P.visible('visual-fractionCompare')) && (await P.tid('compare-sign').innerText()) === '?');
  await P.tap('compare-reveal');
  check('EN fraction compare: tap -> ">" and "3/4 is bigger than 1/4"', (await P.tid('compare-sign').innerText()) === '>' && (await P.tid('compare-result').innerText()).includes('3/4 is bigger than 1/4'));
  await P.shot('07-fraction-compare-en', 'visual-fractionCompare');
  fits.push(await P.noH());
  await P.next();
  check('EN "next" works without answering Try it', await P.visible('visual-objects'));

  // Step 4: tap to count
  check('EN objects: "Tap to count"', (await P.tid('objects-instruction').innerText()).includes('Tap to count'));
  for (const i of [0, 1, 2, 3, 4]) await P.tap(`object-${i}`);
  check('EN objects tap-to-count reaches 5 + cheer', (await P.tid('objects-count').innerText()) === '5' && (await P.visible('objects-done')) && (await P.tid('objects-done').innerText()).includes('You counted 5'));
  check('EN step without Try it: "next" is the main button', (await P.bg('next-btn')) === PRIMARY);
  await P.shot('08-objects-count-done-en', 'visual-objects');
  fits.push(await P.noH());
  await P.next();

  // Step 5: groups + crossed out
  check('EN objects: 3 group boxes, 2 crossed out', (await P.count('object-group')) === 3 && (await P.count('object-crossed')) === 2);
  check('EN objects label spoken: "9 times ⭐, in 3 groups, 2 crossed out, 7 left"', (await P.label('visual-objects')).includes('in 3 groups') && (await P.label('visual-objects')).includes('2 crossed out, 7 left'), await P.label('visual-objects'));
  await P.shot('09-objects-groups-crossed-en', 'visual-objects');
  fits.push(await P.noH());
  await P.next();

  check('EN visual-equation with a highlighted answer', (await P.visible('visual-equation')) && (await P.tid('equation-highlight').innerText()) === '7');
  await P.shot('10-equation-en', 'visual-equation');
  fits.push(await P.noH());
  await P.next();

  check('EN visual-numberLine shown', await P.visible('visual-numberLine'));
  const nlEn = await P.page.evaluate(() => [...document.querySelectorAll('[data-testid="visual-numberLine"] text')].map((e) => ({ t: e.textContent, x: e.getBoundingClientRect().left })));
  check('EN number line: 0..10 left to right + jump labels', nlEn.filter((n) => /^\d+$/.test(n.t)).length >= 6 && nlEn.some((n) => n.t === '+3'), JSON.stringify(nlEn.map((n) => n.t)));
  await P.shot('11-number-line-en', 'visual-numberLine');
  fits.push(await P.noH());
  await P.next();

  check('EN visual-sequence: 4 cards, 3 arrows →', (await P.count('sequence-card')) === 4 && (await P.count('sequence-arrow')) === 3 && (await P.tid('sequence-arrow').innerText()) === '→');
  await P.shot('12-sequence-en', 'visual-sequence');
  fits.push(await P.noH());
  await P.next();
  check('EN visual-labeled: 4 picture cards', (await P.visible('visual-labeled')) && (await P.count('labeled-card')) === 4);
  await P.shot('13-labeled-en', 'visual-labeled');
  fits.push(await P.noH());
  await P.next();
  check('EN visual-bars: 3 bars', (await P.visible('visual-bars')) && (await P.count('bar-2')) === 1);
  await P.shot('14-bars-en', 'visual-bars');
  fits.push(await P.noH());
  await P.next();
  check('EN visual-clock: 3:30', (await P.visible('visual-clock')) && (await P.tid('clock-digital').innerText()) === '3:30');
  await P.shot('15-clock-en', 'visual-clock');
  fits.push(await P.noH());
  await P.next();
  check('EN visual-shape: triangle with side labels', (await P.visible('visual-shape')) && (await P.tid('shape-name').innerText()) === 'A triangle' && (await P.label('visual-shape')).includes('3 cm'));
  await P.shot('16-shape-en', 'visual-shape');
  fits.push(await P.noH());
  await P.next();
  check('EN visual-placeValue: hundreds, tens, ones for 245', (await P.visible('visual-placeValue')) && (await P.tid('pv-h').innerText()).includes('2') && (await P.tid('pv-t').innerText()).includes('4') && (await P.tid('pv-o').innerText()).includes('5'));
  await P.shot('17-place-value-en', 'visual-placeValue');
  fits.push(await P.noH());
  await P.next();
  check('EN visual-wordCard: word + meaning + read button', (await P.visible('visual-wordCard')) && (await P.tid('word-card-word').innerText()) === 'Happy' && (await P.visible('word-read-aloud')));
  await P.shot('18-word-card-en', 'visual-wordCard');
  fits.push(await P.noH());
  await P.next();
  check('EN unknown picture type: nothing drawn, step still shown', (await P.visible('teach-text')) && (await P.anyVisual()).length === 0);
  check('EN 360px: no sideways scroll on any picture step', fits.every(Boolean), JSON.stringify(fits));
  await P.tap('next-btn');
  check('EN after the last step the questions start', await P.visible('choice-0', 6000));
  await P.page.close();

  // ================= Arabic (RTL), 360px =================
  P = await newPage();
  await P.fresh('ar');
  const fitsAr = [];
  check('AR interactive fraction: Arabic instruction', (await P.tid('fraction-instruction').innerText()).includes('اضغطْ على 3'));
  for (const i of [0, 1, 2]) await P.tap(`fraction-piece-${i}`);
  check('AR interactive fraction: 3 of 4 -> success', await P.visible('fraction-done'));
  await P.tap('try-choice-0');
  check('AR Try it wrong -> Arabic "Almost" line', (await P.tid('try-almost').innerText()).includes('اقتربتَ! انظرْ إلى الصورة مرة أخرى'));
  await P.tap('try-choice-1');
  check('AR Try it right -> Arabic praise', (await P.tid('try-right').innerText()).includes('نعم'));
  await P.shot('ar-01-fraction-tryit', 'visual-fraction');
  fitsAr.push(await P.noH());
  for (let i = 1; i < TYPES.length; i++) {
    await P.next();
    const type = TYPES[i];
    if (type) check(`AR visual-${type} (step ${i + 1}) shown with a label`, (await P.visible(`visual-${type}`)) && (await P.label(`visual-${type}`)).length > 2);
    fitsAr.push(await P.noH());
    if (type === 'numberLine') {
      const nl = await P.page.evaluate(() => [...document.querySelectorAll('[data-testid="visual-numberLine"] text')].map((e) => ({ t: e.textContent, x: e.getBoundingClientRect().left })).filter((n) => /^\d+$/.test(n.t)));
      const inc = nl.length >= 6 && nl.every((n, k) => k === 0 || (Number(n.t) > Number(nl[k - 1].t) && n.x > nl[k - 1].x));
      check('AR (RTL): number line numbers still increase left -> right', inc, JSON.stringify(nl.map((n) => `${n.t}@${Math.round(n.x)}`)));
      await P.shot('ar-02-number-line', 'visual-numberLine');
    }
    if (type === 'equation') {
      const xs = await P.page.evaluate(() => ['equation-token-0', 'equation-token-2', 'equation-highlight'].map((id) => [...document.querySelectorAll(`[data-testid="${id}"]`)].find((e) => e.offsetParent !== null).getBoundingClientRect().left));
      check('AR (RTL): equation "3 + 4 = 7" still reads left -> right', xs[0] < xs[1] && xs[1] < xs[2], JSON.stringify(xs));
      await P.shot('ar-03-equation', 'visual-equation');
    }
    if (type === 'sequence') {
      check('AR (RTL): sequence arrows point ←', (await P.tid('sequence-arrow').innerText()) === '←');
      await P.shot('ar-04-sequence', 'visual-sequence');
    }
    if (type === 'placeValue') await P.shot('ar-05-place-value', 'visual-placeValue');
    if (type === 'wordCard') await P.shot('ar-06-word-card', 'visual-wordCard');
    if (type === 'fractionCompare') {
      await P.tap('compare-reveal');
      check('AR fraction compare: Arabic sentence, ">" kept', (await P.tid('compare-sign').innerText()) === '>' && (await P.tid('compare-result').innerText()).includes('أكبر من'));
    }
  }
  check('AR 360px: no sideways scroll on any picture step', fitsAr.every(Boolean), JSON.stringify(fitsAr));
  await P.page.close();

  // ================= Reduced motion: pictures + celebrations still work, without movement =================
  P = await newPage(390, 844, { reducedMotion: 'reduce' });
  await P.fresh('en');
  for (const i of [0, 1, 2]) await P.tap(`fraction-piece-${i}`);
  check('Reduced motion: interactive fraction still shows success', await P.visible('fraction-done'));
  await P.tap('try-choice-1');
  check('Reduced motion: Try it still works', await P.visible('try-right'));
  await P.page.close();

  check('no JS errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  const failed = results.filter((x) => !x.ok);
  console.log(`\n${results.length - failed.length}/${results.length} round-6 checks passed, screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASH', e);
  process.exit(2);
});
