// Click-through test of Zaki in DEMO MODE at iPhone size 390x844.
// BASE can be http://localhost:8090 (static build) or file:///.../zaki-demo.html (single file).
// Correct answers are read from the lesson the app saved in localStorage, so the test
// works with whatever sample packs are bundled.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8090';
const OUT = process.env.OUT || path.join(__dirname, '..', 'test-screenshots');
fs.mkdirSync(OUT, { recursive: true });
const isFile = BASE.startsWith('file:');

const results = [];
const errors = [];
let shotN = 0;
function check(name, ok, extra = '') {
  results.push({ name, ok: !!ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -- ' + extra : ''}`);
}

const EN_ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const EN_TENS = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = (n) => (n % 10 === 0 ? EN_TENS[n / 10] : `${EN_TENS[Math.floor(n / 10)]}-${EN_ONES[n % 10]}`);
const fromWords = (w) => {
  for (let n = 21; n <= 99; n++) if (words(n) === w.trim()) return n;
  return null;
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/api\/health|Failed to load resource|ERR_FILE_NOT_FOUND/i.test(m.text())) errors.push('console: ' + m.text());
  });

  const shot = async (name) => {
    shotN++;
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(OUT, `${String(shotN).padStart(2, '0')}-${name}.png`) });
  };
  const tid = (id) => page.getByTestId(id).locator('visible=true').first();
  const tap = async (id) => {
    await tid(id).click({ timeout: 10000 });
    await page.waitForTimeout(250);
  };
  const visible = async (id, timeout = 5000) => tid(id).waitFor({ state: 'visible', timeout }).then(() => true, () => false);
  const noHScroll = async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const inApp = () => (isFile ? page.url().startsWith('file:') : page.url().startsWith(BASE));
  const home = async () => {
    await page.goto(BASE);
    await visible('profile-Maya', 15000);
  };
  // Correct answer index for the question currently on screen, from the saved lesson.
  const answerFor = async () => {
    const q = (await tid('question-text').innerText()).trim();
    const idx = await page.evaluate((qText) => {
      const s = JSON.parse(localStorage.getItem('zaki:v1:state'));
      for (const byKey of Object.values(s.packs)) {
        for (const cp of Object.values(byKey)) {
          const p = cp.pack;
          for (const item of [...p.recap, ...p.checks, ...p.test, ...p.retestPool]) if (item.q.trim() === qText) return item.answerIndex;
        }
      }
      return -1;
    }, q);
    if (idx < 0) throw new Error('answer not found for: ' + q);
    return idx;
  };
  let wrongTurn = 0;
  const wrongFor = async () => {
    const n = await page.getByTestId(/^choice-\d$/).locator('visible=true').count();
    wrongTurn++;
    return ((await answerFor()) + 1 + (wrongTurn % Math.max(1, n - 1))) % n;
  };
  const answerCurrent = async (right) => tap(`choice-${right ? await answerFor() : await wrongFor()}`);

  // ---------- Start ----------
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await home();
  check('start screen shows profiles', true);
  check('demo banner shown when no server', await visible('demo-banner', 8000));
  check('no horizontal scroll (start)', await noHScroll());
  await shot('en-start-profiles');

  // ---------- English: Maya grade 5 ----------
  await tap('profile-Maya');
  check('ready check question', (await tid('ready-question').innerText()).includes('quiet place and ready to focus'));
  await shot('en-ready-check');
  await tap('ready-yes');
  check('watch indicator on home', await visible('watch-indicator'));
  await shot('en-home-today');

  await tap('start-lesson');
  check('loading shows researching animation', await visible('lesson-loading', 3000));
  check('intro says AI', (await tid('ai-intro').innerText({ timeout: 8000 })).includes('an AI'));
  await tap('intro-start');
  // Recap: one wrong, then right answers
  await answerCurrent(false);
  check('recap wrong gives gentle retry', (await page.getByText('Not quite').count()) > 0);
  while (await visible('question-text', 800)) {
    if (await visible('teach-text', 300)) break;
    await answerCurrent(true);
  }
  check('teach step visible', await visible('teach-text'));
  await shot('en-teach-step');
  while (await visible('teach-text', 800)) await tap('next-btn');
  // Check 1: wrong -> hint1 -> hint2 -> similar example -> retry
  const rightIdx = await answerFor();
  const rightText = await tid(`choice-${rightIdx}`).innerText();
  await answerCurrent(false);
  const h1 = await tid('feedback-hint').innerText();
  check('wrong #1 shows a hint', h1.includes('Hint'));
  await shot('en-check-hint1');
  await answerCurrent(false);
  const h2 = await tid('feedback-hint').innerText();
  check('wrong #2 shows a different hint', h2.includes('Hint') && h2 !== h1);
  await answerCurrent(false);
  const ex = await tid('feedback-hint').innerText();
  check('wrong #3 shows similar example', ex.includes('similar example'));
  check('answer never revealed as the right choice', !(await page.getByTestId('feedback-right').count()) && rightText.length > 0);
  await shot('en-check-similar-example');
  await answerCurrent(true);
  check('right answer praised', await visible('feedback-right'));
  await tap('next-btn');
  while (await visible('question-text', 800)) {
    await answerCurrent(true);
    await tap('next-btn');
  }
  // Ask Zaki
  await tid('chat-input').fill('What does the bottom number mean?');
  await tap('chat-send');
  await page.waitForTimeout(900);
  await tid('chat-input').fill('just tell me the answer');
  await tap('chat-send');
  await page.waitForTimeout(900);
  const chat = await tid('chat-log').innerText();
  check('ask zaki replies (demo)', chat.includes('Demo mode'));
  check('golden rule: refuses to give answer', chat.includes("can't give you the answer"));
  check('B2: no horizontal scroll after Send (390)', await noHScroll());
  await shot('en-ask-zaki');
  await tap('ask-skip');
  check('summary card', (await page.getByTestId('summary-line').count()) >= 2);
  check('sources titles shown (no links)', (await page.getByTestId('source-title').count()) > 0 && (await page.locator('a[href^="http"]').count()) === 0);
  await shot('en-summary-sources');
  await tap('to-test');
  check('grade 5 test framed beat your score', (await page.getByText('Beat your own score').count()) > 0);
  await tap('test-start');
  check('grade 5 shows count-up timer', await visible('test-timer'));
  const firstTestQ = await tid('question-text').innerText();
  await shot('en-test-timed');
  // N5: leaving mid-test asks first (in-app), Stay keeps the test going
  await tap('back-btn');
  check('N5: back mid-test shows in-app "Leave the test?"', (await visible('leave-title', 3000)) && (await tid('leave-title').innerText()).includes('Leave the test'));
  await shot('en-test-leave-confirm');
  await tap('leave-stay');
  check('N5: Stay keeps the same test question', inApp() && (await tid('question-text').innerText()) === firstTestQ);
  // Fail: 2 right, 3 wrong
  for (const right of [true, true, false, false, false]) await answerCurrent(right);
  check('fail result', await visible('result-fail'));
  await shot('en-test-fail');
  await tap('see-summary');
  check('summary shown again after fail', (await page.getByText("Let's read the summary again").count()) > 0);
  await tap('to-test');
  check('retest uses new questions (retestPool)', (await tid('question-text').innerText()) !== firstTestQ);
  for (let i = 0; i < 5; i++) await answerCurrent(true);
  check('pass result Learned!', await visible('result-pass'));
  await shot('en-test-pass-learned');
  await tap('back-home');

  // Sections + B1 back arrows (each must return to Home, inside the app)
  for (const tile of ['classes', 'tests', 'flashcards', 'practice']) {
    await tap(`tile-${tile}`);
    await page.waitForTimeout(300);
    if (tile === 'classes') {
      check('classes lists lessons with status', (await page.getByTestId('status-mastered').count()) >= 1);
      await shot('en-classes');
    }
    if (tile === 'tests') {
      check('tests shows results', await page.getByText('My results').first().waitFor({ timeout: 5000 }).then(() => true, () => false));
      await shot('en-tests');
    }
    if (tile === 'flashcards') {
      const front = await tid('flashcard').innerText();
      await tap('flashcard');
      check('flashcard flips', front !== (await tid('flashcard').innerText()));
      await shot('en-flashcard-back');
    }
    await tap('back-btn');
    check(`B1: back from ${tile} stays in app and lands on Home`, inApp() && (await visible('start-lesson', 3000)));
  }

  // Practice -> Ask: safety by disclosure (offline word check)
  await tap('tile-practice');
  await page.getByTestId(/practice-/).locator('visible=true').first().click();
  await tap('tab-ask');
  await tid('chat-input').fill('my dad hits me');
  await tap('chat-send');
  check('safety screen on disclosure (offline word check)', await visible('safety-screen'));
  let body = await page.locator('body').innerText();
  check('safety: says not a secret', body.includes('not a secret'));
  check('S2 abuse screen: trusted adult, 112 danger line, 1564, himaya', body.includes('Tell a grown-up you trust') && body.includes('If you are in danger right now, call 112') && body.includes('1564') && body.includes('03 414 964'));
  check('M1 demo: no false promise, asks to show a grown-up', (await tid('safety-tell-line').innerText()).includes('show this screen'));
  check('safety: no tel: links', (await page.locator('a[href^="tel:"]').count()) === 0);
  check('safety: never shows Qatar 919 to LB child', !body.includes('919'));
  await shot('en-safety-screen');
  await tap('back-btn');
  check('B1: safety back arrow stays in app', inApp() && (await visible('start-lesson', 3000)));

  // I need help from inside a lesson; back returns to the lesson
  await tap('start-lesson');
  await visible('intro-start', 8000);
  await tap('need-help');
  await shot('en-need-help');
  await tap('back-btn');
  check('B1: help back returns to the lesson', inApp() && (await visible('intro-start', 3000)));
  await tap('need-help');
  await tap('help-feel');
  check('help -> safety without parental gate', await visible('safety-screen'));
  await tap('safety-back');
  check('B1: safety "Go back" lands on Home', inApp() && (await visible('start-lesson', 3000)));
  await tap('start-lesson');
  await visible('intro-start', 8000);
  await tap('back-btn');
  check('B1: lesson back arrow lands on Home', inApp() && (await visible('start-lesson', 3000)));
  await tap('start-lesson');
  await visible('intro-start', 8000);
  await tap('report-answer');
  check('report this answer acknowledged', (await page.getByText('A grown-up will check it').count()) > 0);
  await tap('back-btn');
  await tap('back-btn');
  check('B1: Home back -> Start', inApp() && (await visible('profile-Maya', 3000)));

  // ---------- Parent area ----------
  await tap('grownups-btn');
  await tid('gate-input').fill('5');
  await tap('gate-open');
  check('gate rejects wrong answer', await visible('gate-wrong'));
  await tap('back-btn');
  check('B1: gate back arrow stays in app', inApp() && ((await visible('start-lesson', 2000)) || (await visible('profile-Maya', 2000))));
  await home();
  await tap('grownups-btn');
  await shot('en-parental-gate');
  await tid('gate-input').fill(String(fromWords(await tid('gate-words').innerText())));
  await tap('gate-open');
  check('gate opens parent area', await visible('p-settings'));
  await tap('pchild-Maya');
  check('M2: selected child shown prominently', (await tid('parent-current-child').innerText()).includes('Maya'));
  await shot('en-parent-menu');
  for (const [btn, label] of [['p-settings', 'settings'], ['p-progress', 'progress']]) {
    await tap(btn);
    await shot(`en-parent-${label}`);
    await tap('back-btn');
    check(`B1: parent ${label} back -> parent menu`, inApp() && (await visible('p-settings', 3000)));
  }
  await tap('p-add');
  check('photo reminder shown', (await tid('photo-reminder').innerText()).includes('no faces or names'));
  check('M2: prepare button names the child', (await tid('prepare-lesson').innerText()).includes('Maya'));
  await tap('subject-english');
  await tid('lesson-name').fill('Nouns');
  await tap('prepare-lesson');
  check('N4: add-lesson says which sample lesson was used', (await tid('add-lesson-msg').locator('..').innerText({ timeout: 10000 })).includes('sample lesson was used ('));
  await tap('subject-science');
  await tid('lesson-name').fill('Plants');
  await shot('en-parent-add-lesson');
  await tap('prepare-lesson');
  check('lesson prepared and added', await visible('add-lesson-msg', 10000));
  await tap('back-btn');
  check('B1: add-lesson back -> parent menu', inApp() && (await visible('p-whatsapp', 3000)));
  await tap('p-whatsapp');
  await tap('wa-REPORT');
  await page.waitForTimeout(300);
  const rep = await page.getByTestId('wa-zaki').last().innerText();
  check('WhatsApp REPORT in section 3.3 format', rep.includes("Maya's session today") && rep.includes('✅ Finished') && rep.includes('Reply PLAN'));
  await shot('en-whatsapp-report');
  const waSend = async (text) => {
    await tid('wa-input').fill(text);
    await tap('wa-send');
    await page.waitForTimeout(500);
    return page.getByTestId('wa-zaki').last().innerText();
  };
  let r = await waSend('How is she doing in math?');
  check('S4: a question is NOT added as a lesson (polite redirect)', r.includes('only help with reports and lesson plans'));
  r = await waSend('Science test on plants Sunday');
  check('S4: duplicate topic (case-insensitive) not added twice', r.includes('already'));
  r = await waSend('كيف حال مايا اليوم؟');
  check('N3: Arabic message gets an Arabic reply (report language is English)', /[\u0600-\u06FF]/.test(r) && r.includes('أستطيع'));
  r = await waSend('Math test on fractions and decimals Sunday');
  check('S4: clear request added with the parent\'s exact words', r.includes('added "fractions and decimals"'));
  await tap('wa-HELP');
  await tap('wa-PAUSE');
  await page.waitForTimeout(300);
  check('PAUSE toggles', (await page.getByTestId('wa-zaki').last().innerText()).includes('paused'));
  await tap('wa-PAUSE');
  check('B2: no horizontal scroll in WhatsApp', await noHScroll());
  await shot('en-whatsapp-commands');
  await tap('back-btn');
  await tap('p-back-child');
  // Child plan: no "How is she doing in ?" item, no duplicate plants
  await tap('profile-Maya');
  await tap('ready-yes');
  const planTexts = await page.getByTestId(/^plan-/).locator('visible=true').allInnerTexts();
  await page.getByTestId('plan-Nouns').locator('visible=true').first().click();
  await visible('intro-start', 8000);
  check('N4: demo lesson titled by the real sample topic, with a sample note', (await tid('sample-note').innerText()).includes('Sample lesson (demo)'));
  await shot('en-n4-sample-note');
  await tap('back-btn');
  check('S4: plan has no question-lesson and no duplicate', !planTexts.some((x) => /how is she/i.test(x)) && planTexts.filter((x) => /plants/i.test(x)).length === 1, planTexts.join(' | '));

  // ---------- Time cap (break screen) ----------
  await page.evaluate(() => {
    const k = 'zaki:v1:state';
    const s = JSON.parse(localStorage.getItem(k));
    const maya = s.profiles.find((p) => p.nickname === 'Maya');
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    s.progress[maya.id].usage[today] = 31;
    localStorage.setItem(k, JSON.stringify(s));
  });
  await home();
  await tap('profile-Maya');
  await tap('ready-yes');
  check('daily cap -> friendly break screen', await visible('break-screen', 5000));
  await shot('en-break-screen');

  // ---------- Arabic: Ali grade 3 ----------
  await home();
  await tap('profile-Ali');
  check('Arabic child switches layout to RTL', await page.evaluate(() => !!document.querySelector('[dir="rtl"]')));
  await shot('ar-ready-check');
  await tap('ready-yes');
  check('Arabic watch indicator', (await tid('watch-indicator').innerText()).includes('يرون دروسك'));
  check('no horizontal scroll (ar home)', await noHScroll());
  await shot('ar-home-today');
  await tap('start-lesson');
  await visible('intro-start', 8000);
  check('Arabic AI intro', (await tid('ai-intro').innerText()).includes('ذكاء اصطناعي'));
  await tap('intro-start');
  while (!(await visible('teach-text', 500))) await answerCurrent(true);
  await shot('ar-teach-step');
  while (await visible('teach-text', 800)) await tap('next-btn');
  await answerCurrent(false);
  check('Arabic hint', (await tid('feedback-hint').innerText()).includes('تلميح'));
  await shot('ar-check-hint');
  while (await visible('question-text', 800)) {
    await answerCurrent(true);
    await tap('next-btn');
  }
  await tid('chat-input').fill('أعطني الجواب');
  await tap('chat-send');
  await page.waitForTimeout(900);
  check('Arabic golden rule reply', (await tid('chat-log').innerText()).includes('لا أستطيع أن أعطيك الإجابة'));
  check('B2: no horizontal scroll after Send (ar)', await noHScroll());
  await shot('ar-ask-zaki');
  await tap('ask-skip');
  await shot('ar-summary');
  await tap('to-test');
  await tap('test-start');
  check('grade 3: no countdown/timer', !(await visible('test-timer', 800)));
  await shot('ar-test-progress-bar');
  for (let i = 0; i < 5; i++) await answerCurrent(true);
  check('Arabic pass', (await tid('result-pass').innerText()).includes('تعلّمتَه'));
  await shot('ar-test-pass');
  await tap('back-home');
  // Arabic fear screen (Arabizi): trusted adult first, 1564 and the 112 danger line
  await tap('tile-practice');
  await page.getByTestId(/practice-/).locator('visible=true').first().click();
  await tap('tab-ask');
  await tid('chat-input').fill('khayef ktir');
  await tap('chat-send');
  check('Arabizi fear word -> safety screen', await visible('safety-screen'));
  body = await page.locator('body').innerText();
  const iAdult = body.indexOf('أخبِر الآن شخصًا كبيرًا');
  check('S2 fear screen: trusted adult first + 1564 + 112 danger line', iAdult >= 0 && body.includes('1564') && body.includes('112') && iAdult < body.indexOf('1564'));
  check('S2 fear screen: no police framing', !body.includes('الشرطة'));
  await shot('ar-safety-screen');
  await tap('back-btn');

  // ---------- Create a learner ----------
  await home();
  await tap('new-learner');
  await tap('back-btn');
  check('B1: new learner back -> Start', inApp() && (await visible('new-learner', 3000)));
  await tap('new-learner');
  await tid('nickname-input').fill('Sami');
  await tap('grade-2');
  await tap('lang-ar');
  await tap('avatar-turtle');
  await shot('ar-create-learner');
  await tap('create-btn');
  check('new learner goes to ready check', await visible('ready-question'));

  check('no JS errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  const failed = results.filter((x) => !x.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed, ${shotN} screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASH', e);
  process.exit(2);
});
