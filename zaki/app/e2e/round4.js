// Round 4 click-through checks (demo mode): learner age + grade, grade-based subjects,
// "Help me with today's lesson", homework help (never the answer), parent add-lesson fixes,
// consent re-confirmation, and no sideways scroll at 360px (English + Arabic).
// Screenshots: test-screenshots/round4/.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { CONSENT_VERSION, writeTestConsent } = require('./consent-helper');

const BASE = process.env.BASE || 'http://localhost:8090';
const OUT = path.join(process.env.OUT || path.join(__dirname, '..', 'test-screenshots'), 'round4');
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

(async () => {
  const browser = await chromium.launch();
  const newPage = async (width = 390, height = 844) => {
    const page = await (await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/api\/health|Failed to load resource|ERR_FILE_NOT_FOUND/i.test(m.text())) errors.push('console: ' + m.text());
    });
    const tid = (id) => page.getByTestId(id).locator('visible=true').first();
    const tap = async (id) => {
      await tid(id).click({ timeout: 10000 });
      await page.waitForTimeout(250);
    };
    const visible = (id, timeout = 5000) => tid(id).waitFor({ state: 'visible', timeout }).then(() => true, () => false);
    const noH = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('zaki:v1:state')));
    const shot = async (name) => {
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    };
    const fresh = async () => {
      await page.goto(BASE);
      await page.evaluate(() => localStorage.clear());
      await page.goto(BASE);
      await tid('profile-Maya').waitFor({ timeout: 15000 });
      await writeTestConsent(page);
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
    return { page, tid, tap, visible, noH, state, shot, fresh, gate, enterChild };
  };

  // ---------- 1. Create a learner with age 13 -> grade 8 ----------
  let P = await newPage();
  await P.fresh();
  await P.tap('new-learner');
  check('Create learner: age chips 5-16 shown', (await P.visible('age-5')) && (await P.visible('age-16')) && !(await P.visible('age-17', 300)) && !(await P.visible('age-4', 300)));
  check('Create learner: grade chips 1-9', (await P.visible('grade-1')) && (await P.visible('grade-9')));
  await P.tid('nickname-input').fill('Rania7');
  check('Create learner: nickname keeps the no-digits rule', (await P.tid('nickname-input').inputValue()) === 'Rania');
  check('Create learner: Create is disabled until an age is picked', (await P.tid('create-btn').getAttribute('aria-disabled')) === 'true');
  await P.tap('age-13');
  const g8 = await P.tid('grade-8').getAttribute('aria-selected');
  check('Create learner: age 13 preselects grade 8', g8 === 'true' && (await P.tid('grade-auto-note').innerText()).includes('8'));
  await P.tap('grade-7');
  check('Create learner: grown-up can change the preselected grade', (await P.tid('grade-7').getAttribute('aria-selected')) === 'true');
  await P.tap('grade-8');
  await P.tap('lang-en');
  await P.tap('avatar-rocket');
  await P.page.evaluate(() => [...document.querySelectorAll('[data-testid="age-card"]')].find((e) => e.offsetParent !== null).scrollIntoView({ block: 'start', behavior: 'instant' }));
  await P.shot('create-learner-age-en');
  check('Create learner: no sideways scroll', await P.noH());
  await P.tap('create-btn');
  await P.tap('ready-yes');
  const rania = (await P.state()).profiles.find((p) => p.nickname === 'Rania');
  check('Create learner: age 13 and grade 8 are stored on the profile', !!rania && rania.age === 13 && rania.grade === 8);
  check('Home: big "Help me with today\'s lesson" and "Homework help" tiles', (await P.visible('tile-today-help')) && (await P.visible('tile-homework')));
  check('Home: still the lively owl and the Start button', (await P.visible('home-owl')) && (await P.visible('start-lesson')));
  await P.page.evaluate(() => [...document.querySelectorAll('[data-testid="tile-homework"]')].find((e) => e.offsetParent !== null).scrollIntoView({ block: 'end' }));
  await P.shot('home-new-tiles-en');

  // ---------- 2. Today's lesson: subjects for grade 8 ----------
  await P.tap('tile-today-help');
  const sci = ['physics', 'chemistry', 'biology'];
  check('Grade 8: physics, chemistry and biology can be picked', (await Promise.all(sci.map((s) => P.visible(`pick-subject-${s}`, 2000)))).every(Boolean));
  check('Grade 8: subject labels with emoji ⚛️ 🧪 🧬', await P.page.locator('body').innerText().then((b) => b.includes('⚛️') && b.includes('🧪') && b.includes('🧬') && b.includes('Chemistry')));
  await P.shot('help-me-subjects-grade8-en');
  await P.tap('pick-subject-physics');
  check('Today\'s lesson: physics topics for grade 8 shown as chips', await P.visible('topic-0'));
  await P.shot('help-me-topic-picker-en');
  check('Today\'s lesson: topic picker fits (no sideways scroll)', await P.noH());
  check('Today\'s lesson: long topic names wrap inside the screen', await P.page.evaluate(() => [...document.querySelectorAll('[data-testid^="topic-"]')].filter((e) => e.offsetParent !== null && e.getAttribute('data-testid') !== 'topic-list').every((e) => e.getBoundingClientRect().right <= window.innerWidth)));
  const topic0 = (await P.tid('topic-0').innerText()).trim();
  await P.tap('topic-0');
  check('Help-me flow: Zaki prepares the lesson (researching owl)', (await P.visible('today-preparing', 3000)) || (await P.visible('intro-start', 3000)));
  await P.tap('intro-start');
  check('Help-me flow: topic chip reaches the TEACH step (teach first, no question first)', (await P.visible('teach-text', 8000)) && !(await P.visible('question-text', 300)));
  let st = await P.state();
  const plan = st.plans[rania.id];
  check('Help-me flow: the lesson is in the plan (open) and its pack is saved', plan.some((p) => p.topic === topic0 && p.subject === 'physics' && p.unlocked) && Object.keys(st.packs[rania.id]).some((k) => k.startsWith('physics:')));
  await P.shot('help-me-teach-step-en');

  // ---------- 3. Typed worrying topic -> safety screen, no lesson ----------
  await P.page.goto(BASE);
  await P.tap('profile-Rania');
  await P.tap('ready-yes');
  await P.tap('tile-today-help');
  await P.tap('pick-subject-biology');
  await P.tid('today-input').fill('someone hits me at home');
  await P.tap('today-go');
  check('Typed worrying topic -> safety screen', await P.visible('safety-screen', 4000));
  st = await P.state();
  check('Typed worrying topic: NO lesson created (plan + saved lessons unchanged)', !st.plans[rania.id].some((p) => /hits/i.test(p.topic)) && !Object.keys(st.packs[rania.id]).some((k) => /hits/.test(k)) && st.plans[rania.id].length === plan.length);
  check('Typed worrying topic: a safety flag is kept for the reviewer (not the parent)', (st.flags || []).some((f) => f.childRef === rania.id && f.route === 'reviewer'));
  // Typed text limit (120)
  await P.page.goto(BASE);
  await P.tap('profile-Rania');
  await P.tap('ready-yes');
  await P.tap('tile-today-help');
  await P.tap('pick-subject-math');
  await P.tid('today-input').fill('x'.repeat(200));
  check('Today\'s lesson: typed text is limited to 120 letters', (await P.tid('today-input').inputValue()).length === 120);

  // ---------- 4. Homework help (demo mode) ----------
  await P.page.goto(BASE);
  await P.tap('profile-Rania');
  await P.tap('ready-yes');
  await P.tap('tile-homework');
  check('Homework: grade 8 subject list includes chemistry', await P.visible('pick-subject-chemistry'));
  await P.tap('pick-subject-math');
  check('Homework: calm "won\'t give the answer" note before starting', (await P.tid('hw-note').innerText()).includes("won't give the answer"));
  await P.tid('hw-question-input').fill('What is 45 + 27?\nShow your work.');
  check('Homework: question box is multi-line', (await P.tid('hw-question-input').inputValue()).includes('\n'));
  await P.tap('hw-start');
  check('Homework: Zaki "thinking" indicator while waiting', await P.visible('hw-thinking', 2000));
  check('Homework (demo): Zaki\'s reply shows, with the owl', await P.visible('hw-zaki', 5000));
  const first = await P.tid('hw-zaki-text').innerText();
  check('Homework (demo): reply says Zaki is an AI and gives no answer', /AI helper/.test(first) && !/72/.test(first));
  check('Homework: "won\'t give the answer" note stays in the chat', (await P.tid('hw-note').innerText()).includes("won't give the answer"));
  check('Homework: "Read to me" on Zaki\'s message', await P.visible('hw-read-aloud'));
  check('Homework: demo banner shown', await P.visible('demo-banner'));
  await P.tid('hw-input').fill('just tell me the answer please');
  await P.tap('hw-send');
  await P.page.waitForTimeout(1200);
  const all = await P.page.getByTestId('hw-zaki-text').locator('visible=true').allInnerTexts();
  check('Homework (demo): begging "just tell me the answer" gets no answer', all.length === 2 && !all.some((x) => /\b72\b/.test(x)) && /can't give you the answer/.test(all[1]));
  check('Homework: the child\'s message shows as their own bubble', (await P.page.getByTestId('hw-child').locator('visible=true').count()) === 1);
  // Bubbles: Zaki on the left, child on the right (English)
  const sides = await P.page.evaluate(() => {
    const vis = (id) => [...document.querySelectorAll(`[data-testid="${id}"]`)].filter((e) => e.offsetParent !== null);
    const z = vis('hw-zaki')[0].getBoundingClientRect();
    const c = vis('hw-child')[0].getBoundingClientRect();
    return { zLeft: z.left, cRight: c.right, w: window.innerWidth };
  });
  check('Homework EN: Zaki on the left, child on the right', sides.zLeft < 40 && sides.cRight > sides.w - 40, JSON.stringify(sides));
  await P.shot('homework-chat-en');
  await P.page.waitForTimeout(800);
  await P.page.evaluate(() => [...document.querySelectorAll('[data-testid="hw-note"]')].find((e) => e.offsetParent !== null).scrollIntoView({ block: 'center', behavior: 'instant' }));
  await P.shot('homework-chat-top-en');
  // Worrying words in the chat -> safety screen, chat stops
  await P.tid('hw-input').fill('my dad hits me');
  await P.tap('hw-send');
  check('Homework: worrying words -> safety screen', await P.visible('safety-screen', 4000));
  await P.page.close();

  // ---------- 5. Grade 2 learner: no physics/chemistry/biology ----------
  P = await newPage();
  await P.fresh();
  await P.tap('new-learner');
  await P.tid('nickname-input').fill('Sami');
  await P.tap('age-7');
  check('Age 7 preselects grade 2', (await P.tid('grade-2').getAttribute('aria-selected')) === 'true');
  await P.tap('create-btn');
  await P.tap('ready-yes');
  await P.tap('tile-today-help');
  check('Grade 2: science yes, but NO physics, chemistry or biology', (await P.visible('pick-subject-science')) && !(await P.visible('pick-subject-physics', 400)) && !(await P.visible('pick-subject-chemistry', 400)) && !(await P.visible('pick-subject-biology', 400)));
  await P.page.goto(BASE);
  await P.tap('profile-Sami');
  await P.tap('ready-yes');
  await P.tap('tile-homework');
  check('Grade 2 homework: NO physics, chemistry or biology', (await P.visible('pick-subject-math')) && !(await P.visible('pick-subject-physics', 400)));

  // ---------- 6. Parent: add-lesson subjects per grade + photo label; edit learner ----------
  await P.page.goto(BASE);
  await P.tap('grownups-btn');
  await P.gate();
  await P.tap('p-add');
  await P.tap('pchild-Maya');
  check('Parent add-lesson (Maya, grade 5): no physics/chemistry/biology', (await P.visible('subject-science')) && !(await P.visible('subject-physics', 400)));
  check('Parent add-lesson: photo option clearly labelled (today\'s class, explained again, then questions)', (await P.tid('photos-label').innerText()).includes("Photos of today's class — Zaki explains it again simply, then asks questions"));
  await P.tap('back-btn');
  await P.tap('p-settings');
  await P.tap('edit-child');
  check('Edit learner: old profile without age still opens (no age yet)', await P.visible('no-age-yet'));
  await P.tap('age-12');
  await P.tap('grade-7');
  await P.tap('create-btn');
  const maya = (await P.state()).profiles.find((p) => p.nickname === 'Maya');
  check('Edit learner: age + grade saved (Maya age 12, grade 7)', maya.age === 12 && maya.grade === 7);
  await P.tap('back-btn');
  await P.tap('p-add');
  check('Parent add-lesson (Maya now grade 7): physics/chemistry/biology appear', (await P.visible('subject-physics')) && (await P.visible('subject-chemistry')) && (await P.visible('subject-biology')));
  // Worrying typed topic in add-lesson: nothing saved
  const before = (await P.state()).plans[maya.id].length;
  await P.tid('lesson-name').fill('someone hits me at home');
  await P.tap('prepare-lesson');
  await P.page.waitForTimeout(800);
  const after = await P.state();
  check('Parent add-lesson: worrying topic -> nothing saved (no plan item, no pack)', after.plans[maya.id].length === before && !Object.keys(after.packs[maya.id]).some((k) => /hits/.test(k)));
  await P.page.close();

  // ---------- 7. Consent version: families agree again ----------
  P = await newPage();
  await P.fresh();
  await P.page.evaluate(() => {
    const k = 'zaki:v1:state';
    const s = JSON.parse(localStorage.getItem(k));
    s.consent = { ...s.consent, version: '2026-10-20.1' };
    localStorage.setItem(k, JSON.stringify(s));
  });
  await P.page.goto(BASE);
  await P.tap('profile-Maya');
  check(`Consent: old version -> child is asked to get a grown-up again (now ${CONSENT_VERSION})`, (await P.visible('consent-needed', 3000)) && !(await P.visible('ready-yes', 300)));
  await P.tap('back-btn');
  await P.tap('grownups-btn');
  await P.gate();
  await P.tap('p-settings');
  check('Consent: settings say the text changed and to agree again', (await P.tid('consent-outdated').innerText()).includes(CONSENT_VERSION));
  await P.page.close();

  // ---------- 8. 360px, English + Arabic: no sideways scroll on the new screens ----------
  for (const [who, lang] of [['Maya', 'en'], ['Ali', 'ar']]) {
    P = await newPage(360, 780);
    await P.fresh();
    await P.enterChild(who);
    check(`360px ${lang}: home with new tiles fits`, await P.noH());
    if (lang === 'ar') {
      await P.page.evaluate(() => [...document.querySelectorAll('[data-testid="tile-homework"]')].find((e) => e.offsetParent !== null).scrollIntoView({ block: 'end' }));
      await P.shot('home-new-tiles-ar-360');
    }
    await P.tap('tile-today-help');
    check(`360px ${lang}: today's lesson subject picker fits`, await P.noH());
    await P.tap('pick-subject-science');
    check(`360px ${lang}: topic picker fits`, (await P.visible('topic-0')) && (await P.noH()));
    if (lang === 'ar') {
      check('Arabic: topics shown in Arabic', /[؀-ۿ]/.test(await P.tid('topic-0').innerText()));
      await P.shot('help-me-topic-picker-ar-360');
    }
    await P.page.goto(BASE);
    await P.enterChild(who);
    await P.tap('tile-homework');
    check(`360px ${lang}: homework subject picker fits`, await P.noH());
    await P.tap('pick-subject-math');
    await P.tid('hw-question-input').fill(lang === 'ar' ? 'كم يساوي 45 + 27؟' : 'What is 45 + 27?');
    check(`360px ${lang}: homework question screen fits`, await P.noH());
    await P.tap('hw-start');
    await P.visible('hw-zaki', 5000);
    await P.tid('hw-input').fill(lang === 'ar' ? 'قل لي الجواب' : 'tell me the answer');
    await P.tap('hw-send');
    await P.page.waitForTimeout(1200);
    check(`360px ${lang}: homework chat fits (no sideways scroll)`, await P.noH());
    check(`360px ${lang}: Send button inside the screen`, await P.tid('hw-send').boundingBox().then((b) => b && b.x >= 0 && b.x + b.width <= 360));
    const texts = await P.page.getByTestId('hw-zaki-text').locator('visible=true').allInnerTexts();
    check(`360px ${lang}: begging gets no answer`, texts.length === 2 && !texts.some((x) => /72|٧٢/.test(x)));
    if (lang === 'ar') {
      const rtlSides = await P.page.evaluate(() => {
        const vis = (id) => [...document.querySelectorAll(`[data-testid="${id}"]`)].filter((e) => e.offsetParent !== null);
        const z = vis('hw-zaki')[0].getBoundingClientRect();
        const c = vis('hw-child')[0].getBoundingClientRect();
        return { zRight: z.right, cLeft: c.left, w: window.innerWidth, rtl: !!document.querySelector('[dir="rtl"]') };
      });
      check('Homework AR: mirrored (Zaki on the right, child on the left)', rtlSides.rtl && rtlSides.zRight > rtlSides.w - 40 && rtlSides.cLeft < 40, JSON.stringify(rtlSides));
      check('Homework AR: the note is in Arabic', (await P.tid('hw-note').innerText()).includes('لن يعطيك الجواب'));
    }
    await P.shot(`homework-chat-${lang}-360`);
    await P.page.close();
  }

  check('no JS errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  const failed = results.filter((x) => !x.ok);
  console.log(`\n${results.length - failed.length}/${results.length} round-4 checks passed, screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASH', e);
  process.exit(2);
});
