// Round 7: the school's COUNTRY and SCHOOL PROGRAM on the learner card, against a MOCKED server
// (needs http, e.g. `node e2e/serve.js <dist> 8097`, then BASE=http://localhost:8097 node e2e/round7.js).
// Checks: the two optional chip groups (nothing picked by default), the hint, the British
// "Year N = grade N-1" note and the French class-name note; create a learner with Iraq +
// National -> the lesson-pack, tutor and homework requests carry schoolCountry "IQ" and
// program "national" (the family country for help lines stays "LB"); edit to French -> the
// next lesson request says "french"; an old profile without them sends neither; the family
// export includes them; deleting the learner removes them; 360px English + Arabic without
// sideways scrolling. Screenshots: test-screenshots/round7/.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { writeTestConsent } = require('./consent-helper');

const BASE = process.env.BASE || 'http://localhost:8097';
const OUT = path.join(process.env.OUT || path.join(__dirname, '..', 'test-screenshots'), 'round7');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -- ' + extra : ''}`);
};
const EN_ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const EN_TENS = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = (n) => (n % 10 === 0 ? EN_TENS[n / 10] : `${EN_TENS[Math.floor(n / 10)]}-${EN_ONES[n % 10]}`);
const fromWords = (w) => {
  for (let n = 21; n <= 99; n++) if (words(n) === w.trim()) return n;
  return null;
};

const pack = {
  id: 'mock-r7', subject: 'math', topic: 'Division', grade: 4, lang: 'en',
  recap: [], teachSteps: [{ title: 'Sharing', text: 'MOCK R7 TEACH STEP.', example: 'Share 8 apples.' }],
  checks: [{ id: 'c1', q: 'Mock check?', choices: ['A', 'B'], answerIndex: 1, hint1: 'h1', hint2: 'h2', similarExample: 'ex' }],
  test: [], retestPool: [], summary: ['Mock summary'], flashcards: [],
};
const COUNTRIES = ['LB', 'IQ', 'SY', 'JO', 'PS', 'EG', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'OTHER'];
const PROGRAMS = ['national', 'british', 'american', 'french', 'ib', 'other'];

(async () => {
  const browser = await chromium.launch();
  const calls = [];
  const newPage = async (width = 390, height = 844) => {
    const page = await (await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true })).newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load resource/i.test(m.text())) errors.push('console: ' + m.text());
    });
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const body = route.request().postDataJSON?.() ?? null;
      calls.push({ url, body });
      const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
      if (url.endsWith('/api/health')) return json({ ok: true, ai: true, moderation: 'fallback' });
      if (url.endsWith('/api/lesson-pack')) return json({ pack: { ...pack, topic: body.topic }, packVersion: 4, sources: [], verify: { checked: 0, removed: 0 } });
      if (url.endsWith('/api/check-answer')) return json({ correct: body.answer === 1, feedbackKey: body.answer === 1 ? 'right' : 'hint1' });
      if (url.endsWith('/api/tutor')) return json({ reply: 'MOCK tutor reply', safety: { flagged: false } });
      if (url.endsWith('/api/homework')) return json({ reply: 'MOCK homework hint', hintLevel: 1, safety: { flagged: false } });
      return json({});
    });
    const tid = (id) => page.getByTestId(id).locator('visible=true').first();
    const tap = async (id) => {
      await tid(id).click({ timeout: 10000 });
      await page.waitForTimeout(250);
    };
    const visible = (id, timeout = 5000) => tid(id).waitFor({ state: 'visible', timeout }).then(() => true, () => false);
    const selected = async (id) => (await tid(id).getAttribute('aria-selected')) === 'true';
    const noH = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('zaki:v1:state')));
    const scrollTo = (id) => page.evaluate((x) => [...document.querySelectorAll(`[data-testid="${x}"]`)].find((e) => e.offsetParent !== null)?.scrollIntoView({ block: 'start', behavior: 'instant' }), id);
    const shot = async (name) => {
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    };
    const fresh = async (uiLang = 'en') => {
      await page.goto(BASE);
      await page.evaluate(() => localStorage.clear());
      await page.goto(BASE);
      await tid('profile-Maya').waitFor({ timeout: 15000 });
      await writeTestConsent(page);
      await page.evaluate((l) => localStorage.setItem('zaki:v1:uiLang', JSON.stringify(l)), uiLang);
      await page.goto(BASE);
      await tid('profile-Maya').waitFor({ timeout: 15000 });
    };
    const gate = async () => {
      await tid('gate-words').waitFor({ timeout: 5000 });
      await tid('gate-input').fill(String(fromWords(await tid('gate-words').innerText())));
      await tap('gate-open');
    };
    const enterChild = async (name) => {
      await page.goto(BASE);
      await tap(`profile-${name}`);
      await tap('ready-yes');
      await visible('start-lesson');
    };
    const todayLesson = async (topic) => {
      await tap('tile-today-help');
      await tap('pick-subject-math');
      await tid('today-input').fill(topic);
      await tap('today-go');
      await visible('intro-start', 10000);
    };
    return { page, tid, tap, visible, selected, noH, state, scrollTo, shot, fresh, gate, enterChild, todayLesson };
  };
  const lastCall = (route) => [...calls].reverse().find((c) => c.url.endsWith(route));

  // ---------- 1. Create a learner: Iraq + National ----------
  let P = await newPage();
  await P.fresh();
  await P.tap('new-learner');
  check('Create: "Country of the school" and "School program" cards shown', (await P.visible('school-country-card')) && (await P.visible('school-program-card')));
  check('Create: all 13 countries and 6 programs offered', (await Promise.all([...COUNTRIES.map((c) => P.visible(`school-country-${c}`, 1500)), ...PROGRAMS.map((p) => P.visible(`school-program-${p}`, 1500))])).every(Boolean));
  const anySelected = (await Promise.all([...COUNTRIES.map((c) => P.selected(`school-country-${c}`)), ...PROGRAMS.map((p) => P.selected(`school-program-${p}`))])).some(Boolean);
  check('Create: both optional and nothing picked by default', !anySelected);
  check('Create: labels in English', (await P.tid('school-country-LB').innerText()) === 'Lebanon' && (await P.tid('school-program-british').innerText()) === 'British (Cambridge / IGCSE)' && (await P.tid('school-program-national').innerText()) === 'National program of the country');
  check('Create: the hint says photos come first', (await P.tid('school-hint').innerText()).includes("Zaki follows this program's way of teaching. Photos of the lessons always come first."));
  await P.tid('nickname-input').fill('Rania');
  await P.tap('age-9');
  await P.tap('school-country-IQ');
  await P.tap('school-program-british');
  check('Create: British note maps Year N = grade N-1 (age 9 -> grade 4 -> Year 5)', (await P.visible('school-british-note')) && (await P.tid('school-british-note').innerText()).includes('British Year 5 ≈ grade 4'));
  await P.tap('school-program-french');
  check('Create: French note lists CP=1 ... 3e=9', !(await P.visible('school-british-note', 300)) && (await P.tid('school-french-note').innerText()).includes('CP=1, CE1=2, CE2=3, CM1=4, CM2=5, 6e=6, 5e=7, 4e=8, 3e=9'));
  await P.tap('school-program-other');
  await P.tap('school-program-other');
  check('Create: tapping the chosen program again clears it', !(await P.selected('school-program-other')));
  await P.tap('school-program-national');
  check('Create: Iraq + National selected, no grade-mapping note', (await P.selected('school-country-IQ')) && (await P.selected('school-program-national')) && !(await P.visible('school-french-note', 300)));
  check('Create (390px EN): no sideways scroll', await P.noH());
  await P.scrollTo('school-country-card');
  await P.shot('learner-card-school-en');
  await P.tap('create-btn');
  await P.tap('ready-yes');
  let rania = (await P.state()).profiles.find((p) => p.nickname === 'Rania');
  check('Create: schoolCountry "IQ" + program "national" stored on the learner card', !!rania && rania.schoolCountry === 'IQ' && rania.program === 'national' && rania.age === 9 && rania.grade === 4);
  check('Create: the family country (help lines) is unchanged ("LB")', (await P.state()).settings[rania.id].country === 'LB');

  // ---------- 2. Every AI request carries them ----------
  await P.todayLesson('Division');
  let lp = lastCall('/api/lesson-pack');
  check('Lesson request: schoolCountry "IQ" + program "national" (+ family country "LB", no name)', !!lp && lp.body.schoolCountry === 'IQ' && lp.body.program === 'national' && lp.body.country === 'LB' && lp.body.grade === 4 && !JSON.stringify(lp.body).includes('Rania'));
  await P.tap('intro-start');
  check('Lesson opens with the server pack', (await P.tid('teach-text').innerText()).includes('MOCK R7 TEACH STEP'));
  await P.tap('next-btn');
  await P.tap('choice-1');
  await P.tap('next-btn');
  await P.tid('chat-input').fill('can you explain again');
  await P.tap('chat-send');
  await P.page.waitForTimeout(800);
  const tu = lastCall('/api/tutor');
  check('Tutor request: schoolCountry "IQ" + program "national"', !!tu && tu.body.schoolCountry === 'IQ' && tu.body.program === 'national');
  await P.enterChild('Rania');
  await P.tap('tile-homework');
  await P.tap('pick-subject-math');
  await P.tid('hw-question-input').fill('How do I divide 84 by 4?');
  await P.tap('hw-start');
  await P.visible('hw-zaki', 5000);
  const hw = lastCall('/api/homework');
  check('Homework request: schoolCountry "IQ" + program "national"', !!hw && hw.body.schoolCountry === 'IQ' && hw.body.program === 'national');

  // ---------- 3. Edit to French ----------
  await P.page.goto(BASE);
  await P.tap('grownups-btn');
  await P.gate();
  await P.tap('p-settings');
  await P.tap('pchild-Rania');
  await P.tap('edit-child');
  check('Edit: the saved Iraq + National are shown', (await P.selected('school-country-IQ')) && (await P.selected('school-program-national')));
  await P.tap('school-program-french');
  check('Edit: French note shown', await P.visible('school-french-note'));
  await P.scrollTo('school-program-card');
  await P.shot('learner-card-edit-french-en');
  await P.tap('create-btn');
  rania = (await P.state()).profiles.find((p) => p.nickname === 'Rania');
  check('Edit: program "french" saved, school country kept', rania.program === 'french' && rania.schoolCountry === 'IQ');
  await P.enterChild('Rania');
  await P.todayLesson('Fractions');
  lp = lastCall('/api/lesson-pack');
  check('After the edit: the next lesson request says program "french"', !!lp && lp.body.program === 'french' && lp.body.schoolCountry === 'IQ' && lp.body.topic === 'Fractions');

  // Old profile (Maya: made before this round): neither field is sent.
  await P.enterChild('Maya');
  await P.todayLesson('Fractions');
  lp = lastCall('/api/lesson-pack');
  check('Old profile without school fields: request has no schoolCountry / program (old behaviour)', !!lp && !('schoolCountry' in lp.body) && !('program' in lp.body) && lp.body.grade === 5);

  // ---------- 4. Export includes them; deleting the learner removes them ----------
  await P.page.goto(BASE);
  await P.tap('grownups-btn');
  await P.gate();
  await P.tap('p-data');
  const [download] = await Promise.all([P.page.waitForEvent('download', { timeout: 10000 }), P.tap('export-btn')]);
  const exportPath = path.join(OUT, 'export-check.json');
  await download.saveAs(exportPath);
  const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  fs.unlinkSync(exportPath);
  const exRania = exported.profiles.find((p) => p.nickname === 'Rania');
  check('Export: the learner card includes schoolCountry + program', !!exRania && exRania.schoolCountry === 'IQ' && exRania.program === 'french');
  await P.tap('back-btn');
  await P.tap('p-settings');
  await P.tap('pchild-Rania');
  await P.tap('delete-child');
  await P.tap('delete-child-yes');
  await P.page.waitForTimeout(400);
  const after = await P.state();
  check('Delete learner: the card (with its school fields) is gone', !after.profiles.some((p) => p.nickname === 'Rania') && !JSON.stringify(after.profiles).includes('french') && !after.settings[rania.id]);
  await P.page.close();

  // ---------- 5. 360px, English + Arabic: no sideways scroll ----------
  for (const lang of ['en', 'ar']) {
    P = await newPage(360, 780);
    await P.fresh(lang);
    await P.tap('new-learner');
    await P.tap('school-country-JO');
    await P.tap('school-program-british');
    check(`360px ${lang}: create form with school chips + British note fits`, (await P.visible('school-british-note')) && (await P.noH()));
    if (lang === 'ar') {
      check('Arabic: labels in Arabic', (await P.tid('school-country-JO').innerText()) === 'الأردن' && (await P.tid('school-program-national').innerText()) === 'المنهج الوطني للبلد' && (await P.tid('school-hint').innerText()).includes('صور الدروس تأتي دائمًا أولًا'));
      check('Arabic: the page is right-to-left', await P.page.evaluate(() => !!document.querySelector('[dir="rtl"]')));
    }
    await P.scrollTo('school-country-card');
    await P.shot(`learner-card-school-${lang}-360`);
    await P.scrollTo('school-program-card');
    await P.shot(`learner-card-british-${lang}-360`);
    await P.tap('school-program-french');
    if (lang === 'ar') {
      check('Arabic: French note keeps CP=1 ... 3e=9 in reading order', (await P.tid('school-french-note').innerText()).includes('CP=1, CE1=2, CE2=3, CM1=4, CM2=5, 6e=6, 5e=7, 4e=8, 3e=9'));
    }
    check(`360px ${lang}: French note fits`, (await P.visible('school-french-note')) && (await P.noH()));
    // Every chip stays inside the screen
    const outside = await P.page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="school-"]')].filter((e) => e.offsetParent !== null).map((e) => e.getBoundingClientRect()).filter((r) => r.left < -1 || r.right > window.innerWidth + 1).length,
    );
    check(`360px ${lang}: every school chip is inside the screen`, outside === 0, `outside: ${outside}`);
    await P.scrollTo('school-program-card');
    await P.shot(`learner-card-program-french-${lang}-360`);
    // The edit screen too (Maya, an old card). The test reads the gate's number in English,
    // then switches the screen language with the header button.
    await P.page.evaluate(() => localStorage.setItem('zaki:v1:uiLang', JSON.stringify('en')));
    await P.page.goto(BASE);
    await P.tap('grownups-btn');
    await P.gate();
    await P.tap('p-settings');
    await P.tap('pchild-Maya');
    await P.tap('edit-child');
    if (lang === 'ar') {
      await P.tap('lang-toggle');
      check('Arabic edit screen: labels in Arabic', (await P.tid('school-program-french').innerText()) === 'الفرنسي');
      await P.scrollTo('school-country-card');
      await P.shot('learner-card-edit-ar-360');
    }
    check(`360px ${lang}: edit screen (old card: nothing picked) fits`, !(await P.selected('school-program-national')) && !(await P.selected('school-country-LB')) && (await P.noH()));
    await P.page.close();
  }

  check('no JS errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  const failed = results.filter((x) => !x.ok);
  console.log(`\n${results.length - failed.length}/${results.length} round-7 checks passed, screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASH', e);
  process.exit(2);
});
