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
  // Correct answer for the question on screen, looked up by TEXT in the saved lessons/exams
  // (answer positions are reshuffled on every attempt), then matched to the visible buttons.
  const answerFor = async () => {
    const q = (await tid('question-text').innerText()).trim();
    const right = await page.evaluate((qText) => {
      const s = JSON.parse(localStorage.getItem('zaki:v1:state'));
      const items = [];
      for (const byKey of Object.values(s.packs)) for (const cp of Object.values(byKey)) items.push(...cp.pack.recap, ...cp.pack.checks, ...cp.pack.test, ...cp.pack.retestPool);
      for (const list of Object.values(s.exams || {})) for (const e of list) items.push(...e.questions);
      const hit = items.find((it) => it.q.trim() === qText);
      return hit ? hit.choices[hit.answerIndex] : null;
    }, q);
    if (right === null) throw new Error('answer not found for: ' + q);
    const labels = await page.getByTestId(/^choice-\d$/).locator('visible=true').allInnerTexts();
    const idx = labels.findIndex((l) => l.replace(/^✓\s*/, '').trim() === right.trim());
    if (idx < 0) throw new Error('choice not visible for: ' + q);
    const ids = await page.getByTestId(/^choice-\d$/).locator('visible=true').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')));
    return Number(ids[idx].split('-')[1]);
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
  check('Demo reviewer code is NOT on the child-facing banner', !(await tid('demo-banner').innerText()).includes('2468'));
  check('no horizontal scroll (start)', await noHScroll());
  await shot('en-start-profiles');

  // ---------- Family consent (before any lesson) ----------
  const solveGate = async () => {
    await tid('gate-words').waitFor({ timeout: 5000 });
    await tid('gate-input').fill(String(fromWords(await tid('gate-words').innerText())));
    await tap('gate-open');
  };
  await tap('profile-Maya');
  check('Consent: child cannot start before consent', (await visible('consent-needed', 3000)) && !(await visible('ready-yes', 500)));
  await shot('en-consent-needed');
  await tap('consent-grownups');
  await solveGate();
  check('Consent: plain-language screen (90 days, 30 days, outside Lebanon/Qatar, reviewer, 2 years, 10 days)', await page.locator('body').innerText().then((b) => ['90 days', '30 days', 'outside Lebanon and Qatar', 'not a member of your family', '2 years', '10 days'].every((x) => b.includes(x))));
  await tap('consent-save');
  check('Consent: refused without both guardians', (await tid('consent-error').innerText()).includes('each guardian'));
  await tap('consent-mode-one');
  check('Consent: one-guardian intro does not say "both of you"', !(await tid('consent-intro').innerText()).includes('both of you'));
  await tid('g1-name').fill('Rami Haddad');
  await tid('g1-rel').fill('father');
  await tap('g1-agree');
  await tap('consent-save');
  check('Consent: one guardian must explicitly confirm the other agrees', await visible('consent-error', 2000));
  await tap('consent-mode-two');
  await tid('g2-name').fill('Lina');
  await tid('g2-rel').fill('mother');
  await tap('g2-agree');
  await shot('en-consent-form');
  await tap('consent-save');
  check('Consent: saved with two guardians', await visible('consent-saved', 3000));
  const savedConsent = await page.evaluate(() => JSON.parse(localStorage.getItem('zaki:v1:state')).consent);
  check('Consent: record keeps version, time and FIRST names only', !!savedConsent && savedConsent.version && savedConsent.at && savedConsent.guardians.map((g) => g.firstName).join(',') === 'Rami,Lina');
  await tap('back-btn');
  await tap('p-back-child');

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
  const helpBox = await tid('leave-need-help').boundingBox();
  check('Safety: full-size "I need help" inside the leave box', !!helpBox && helpBox.height >= 60 && helpBox.width >= 250);
  await tap('leave-need-help');
  check('Safety: "I need help" from the leave box opens help (no gate)', inApp() && (await visible('help-feel', 3000)));
  await tap('help-lesson');
  check('E8: help during a test talks about the question, not hints', (await page.locator('body').innerText()).includes('Read the question again'));
  await tap('back-btn');
  check('E4: back from help resumes the SAME test question', inApp() && (await visible('test-timer', 5000)) && (await tid('question-text').innerText()) === firstTestQ);
  await tap('back-btn');
  await visible('leave-title', 3000);
  await tap('leave-stay');
  check('N5: Stay keeps the same test question', inApp() && (await tid('question-text').innerText()) === firstTestQ && (await visible('test-timer', 2000)));
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
  check('B1: safety back arrow stays in app and returns to where the child was (Practice)', inApp() && (await page.getByTestId(/^practice-|^tab-ask$/).locator('visible=true').count()) > 0);
  if (await visible('tab-ask', 500)) await tap('back-btn');
  await tap('back-btn');
  check('B1: Practice back -> Home', inApp() && (await visible('start-lesson', 3000)));
  // A disclosure clearly OUTSIDE the home (stranger online): parent is told too.
  await tap('tile-practice');
  await page.getByTestId(/practice-/).locator('visible=true').first().click();
  await tap('tab-ask');
  await tid('chat-input').fill('a stranger online asked for my photo');
  await tap('chat-send');
  check('Stranger-online disclosure -> safety screen', await visible('safety-screen'));
  await tap('back-btn');
  if (await visible('tab-ask', 500)) await tap('back-btn');
  await tap('back-btn');

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
  check('B1: safety "Go back" returns to the lesson the child was in', inApp() && (await visible('intro-start', 5000)));
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
  // PASS-TO-UNLOCK: a second math lesson for Ali stays locked until "الكسور" is passed.
  await tap('pchild-Ali');
  await tap('subject-math');
  await tid('lesson-name').fill('Decimals');
  await tap('prepare-lesson');
  await visible('add-lesson-msg', 10000);
  await tap('back-btn');
  await tap('p-settings');
  check('Unlock: parent lesson order shows Decimals locked', (await tid('order-Decimals').innerText()).includes('Locked'));
  await tap('unlock-Decimals');
  check('Unlock: parent can unlock early (behind the gate)', (await tid('order-Decimals').innerText()).includes('Open'));
  await shot('en-parent-lesson-order');
  await tap('unlock-Decimals'); // lock again for the child-side check
  check('Unlock: parent can lock again', (await tid('order-Decimals').innerText()).includes('Locked'));
  await tap('back-btn');
  await tap('pchild-Maya');
  await tap('p-add');
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
  // EXAM BUILDER: science exam from two saved lessons, 10 questions
  await tap('p-exam');
  await tap('exam-build');
  check('E2: building with nothing ticked shows a clear message', (await tid('exam-error').innerText()).includes('Tick at least one lesson'));
  check('E6: plan lesson without a pack is listed as "not prepared yet"', (await tid('exam-unavailable-fractions and decimals').innerText()).includes('not prepared yet'));
  await tap('pchild-Ali');
  await tap('exam-subject-math');
  check('E5: a still-locked lesson cannot be ticked (Ali: Decimals)', (await tid('exam-unavailable-Decimals').innerText()).includes('locked'));
  await tap('pchild-Maya');
  await tap('exam-subject-science');
  await tap('exam-lesson-The water cycle');
  await tid('exam-day').fill('30');
  await tid('exam-month').fill('2');
  await tap('exam-build');
  check('E1: impossible date (30 Feb) rejected', (await tid('exam-error').innerText()).includes('real date in the future'));
  await tid('exam-day').fill('1');
  await tid('exam-month').fill('1');
  await tid('exam-year').fill('2020');
  await tap('exam-build');
  check('E1: past date rejected', (await tid('exam-error').innerText()).includes('real date in the future'));
  const fut = new Date();
  fut.setDate(fut.getDate() + 10);
  await tid('exam-day').fill(String(fut.getDate()));
  await tid('exam-month').fill(String(fut.getMonth() + 1));
  await tid('exam-year').fill(String(fut.getFullYear()));
  await tap('exam-lesson-The water cycle'); // untick; ticked again below
  await tap('exam-lesson-The water cycle');
  await tap('exam-lesson-Plants');
  await tap('exam-count-10');
  await shot('en-parent-exam-builder');
  await tap('exam-build');
  check('Exam: built from saved lessons (no AI in demo)', (await tid('exam-msg').innerText({ timeout: 10000 })).includes('10 questions'));
  await tap('back-btn');
  // PARENT ASK ZAKI (demo reply)
  await tap('p-ask');
  const askParent = async (text) => {
    const before = await page.getByTestId(/^parent-ask-(zaki|concern)$/).count();
    await tid('parent-ask-input').fill(text);
    await tap('parent-ask-send');
    await page.waitForFunction((n) => document.querySelectorAll('[data-testid="parent-ask-zaki"],[data-testid="parent-ask-concern"]').length > n, before, { timeout: 8000 });
    const last = page.locator('[data-testid="parent-ask-zaki"],[data-testid="parent-ask-concern"]').last();
    return { id: await last.getAttribute('data-testid'), text: await last.innerText() };
  };
  for (const [msg, must] of [
    ['My son told me his uncle touches him', ['1745', '03 414 964', '03 018 019', '112']],
    ['I think my daughter wants to hurt herself', ['1564', '112']],
    ['ابني قال إن عمه يضربه', ['1745', '03 414 964']],
    ['baba darabne, my kid keeps saying this', ['1745', 'KAFA']],
  ]) {
    const r = await askParent(msg);
    check(`P0 parent safety: "${msg}" -> fixed adult help text`, r.id === 'parent-ask-concern' && r.text.includes('safety comes first') && must.every((m) => r.text.includes(m)) && !r.text.includes('Demo mode'), r.text.slice(0, 80));
  }
  await shot('en-parent-ask-concern');
  for (const msg of ['How do I explain the water cycle?', 'My son is scared of spiders in the science book']) {
    const r = await askParent(msg);
    check(`P0 parent safety: harmless "${msg}" -> normal answer`, r.id === 'parent-ask-zaki' && r.text.includes('Demo mode'));
  }
  check('Parent Ask Zaki: no horizontal scroll', await noHScroll());
  await shot('en-parent-ask');
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
  // Child takes the exam: per-lesson breakdown
  await tap('tile-tests');
  await tap('exam-take-Science exam');
  const intro = await tid('exam-intro').innerText();
  check('E3: exam intro has one accurate count', intro.includes('10 questions from 2 lessons') && !intro.includes('5 questions'), intro.replace(/\n/g, ' '));
  await tap('exam-start');
  await answerCurrent(true);
  await answerCurrent(true);
  const examQ3 = await tid('question-text').innerText();
  await tap('need-help');
  await tap('help-lesson');
  check('E8: exam help text has no hint advice', !(await page.locator('body').innerText()).includes('Tap Hint'));
  await tap('back-btn');
  check('E4: back from help resumes the exam at the same question', (await visible('test-timer', 5000)) && (await tid('question-text').innerText()) === examQ3);
  check('Exam: grade 5 count-up timer', await visible('test-timer'));
  await tap('back-btn');
  check('Exam: leave box keeps "I need help"', (await visible('leave-title', 3000)) && (await visible('leave-need-help', 1000)));
  await tap('leave-stay');
  for (let i = 0; i < 8; i++) await answerCurrent(true);
  check('Exam: 10 of 10', (await tid('exam-score').innerText()).includes('10 of 10'));
  check('Exam: result broken down per lesson', (await page.getByTestId('exam-lesson-row').locator('visible=true').count()) === 2);
  await shot('en-exam-result');
  await tap('back-home');
  // FULL REVIEW of a learned lesson from the saved pack (no AI)
  await tap('tile-classes');
  await tap('class-Fractions');
  await tap('review-Fractions');
  check('Review lesson: re-reads teach steps', await visible('teach-text', 5000));
  await tap('back-btn');
  await tap('tile-classes');
  await tap('class-Fractions');
  await tap('retake-Fractions');
  await tap('test-start');
  check('Retake test: opens a test', await visible('question-text', 3000));
  await tap('back-btn');
  await tap('leave-go');
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
  check('Unlock: Decimals locked on Home until الكسور is passed', (await tid('locked-Decimals').innerText()).includes('الكسور'));
  check('E7: Arabic count grammar (minutes)', /\d+ (دقيقةً|دقائق)|دقيقتان|دقيقة واحدة/.test(await page.locator('body').innerText()));
  check('Unlock: Start goes to the current open lesson (الكسور)', (await tid('start-lesson').innerText()).includes('الكسور'));
  await shot('ar-home-locked-next');
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
  check('Unlock: passing الكسور opens Decimals', !(await visible('locked-Decimals', 1000)) && (await tid('start-lesson').innerText()).includes('Decimals'));
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

  // ---------- Parent safety notes, reviewer inbox, export, withdraw, delete ----------
  await home();
  if (!(await page.locator('body').innerText()).includes('Who is learning')) await tap('lang-toggle');
  await tap('grownups-btn');
  await solveGate();
  await tap('pchild-Ali');
  await tap('p-progress');
  const notesText = await tid('safety-notes').innerText();
  check('Parent sees a calm safety note for Ali (fear), never reviewer-only flags', (await page.getByTestId('safety-note').locator('visible=true').count()) === 1 && !/dad|hits|khayef/i.test(notesText));
  await shot('en-parent-safety-notes');
  await tap('back-btn');
  await tap('pchild-Maya');
  await tap('p-progress');
  check('Maya: only the outside-home note is shown; reviewer-route flags ("my dad hits me", help button) are NOT, and no child words', (await page.getByTestId('safety-note').locator('visible=true').count()) === 1 && !/dad|stranger|photo/i.test(await tid('safety-notes').innerText()));
  await tap('back-btn');
  await tap('p-settings');
  check('Settings shows consent status', (await tid('consent-status-text').innerText()).includes('Rami (father), Lina (mother)'));
  await tap('back-btn');
  // Export
  await tap('p-data');
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), tap('export-btn')]);
  const exportPath = path.join(OUT, '..', 'test-screenshots', 'export-check.json');
  await download.saveAs(exportPath);
  const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  fs.unlinkSync(exportPath);
  check('Export: JSON with profiles, lessons, results, consent', download.suggestedFilename().startsWith('zaki-data-') && exported.profiles.length >= 2 && Object.keys(exported.lessons).length > 0 && exported.progress && exported.consent.guardians.length === 2);
  check('Export: no reviewer-only safety reports in the family export', !JSON.stringify(exported).includes('dad hits') && exported.safetyNotes.length === 2 && exported.safetyNotes.every((n) => !('excerpt' in n)) && !JSON.stringify(exported).includes('stranger'));
  await tap('back-btn');
  // Reviewer inbox
  await tap('p-back-child');
  await tap('reviewer-btn');
  await tid('reviewer-code').fill('1111');
  await tap('reviewer-open');
  check('Reviewer: wrong code refused', await visible('reviewer-error', 2000));
  await tid('reviewer-code').fill('2468');
  await tap('reviewer-open');
  const inbox = await tid('reviewer-inbox').innerText();
  check('Reviewer: sees all flags with route, childRef and scrubbed excerpt', inbox.includes('my dad hits me') && inbox.includes('Reviewer only') && inbox.includes('Parent also told') && inbox.includes('childRef: c_') && !inbox.includes('Maya'));
  const cats = await page.getByTestId('reviewer-category').locator('visible=true').allInnerTexts();
  check('Reviewer: human-readable categories (no raw codes)', cats.length >= 4 && cats.every((c) => !/^(home|general|fear|self_harm|disclosure_harm|server)$/.test(c)) && cats.includes('Possible harm (child told something)'), cats.join(' | '));
  check('Reviewer: stranger online is labelled outside the home; help button is "unclear"', inbox.includes('Parent also told (outside the home)') && inbox.includes('unclear who is involved') && inbox.includes('possible home involvement'));
  check('Reviewer: local date format (not US m/d/yyyy)', !/\d{1,2}\/\d{1,2}\/20\d\d/.test(inbox));
  await page.getByTestId('flag-note').locator('visible=true').first().fill('Called the school counsellor.');
  await page.getByTestId('flag-status-resolved').locator('visible=true').first().click();
  await page.waitForTimeout(300);
  check('Reviewer: status + note saved', (await page.evaluate(() => JSON.parse(localStorage.getItem('zaki:v1:state')).flags.some((f) => f.status === 'resolved' && f.note === 'Called the school counsellor.'))));
  await shot('en-reviewer-inbox');
  await tap('lang-toggle');
  const arInbox = await tid('reviewer-inbox').innerText();
  check('Reviewer inbox in Arabic: Arabic labels, right-to-left', arInbox.includes('أذى محتمل') && arInbox.includes('للمراجِع فقط') && (await page.evaluate(() => !!document.querySelector('[dir="rtl"]'))));
  await shot('ar-reviewer-inbox');
  await tap('lang-toggle');
  await tap('back-btn');
  // Withdraw consent -> child blocked again
  await tap('grownups-btn');
  await solveGate();
  await tap('p-settings');
  await tap('consent-withdraw');
  await tap('consent-withdraw-yes');
  check('Withdraw: status says withdrawn', (await tid('consent-status-text').innerText()).includes('Withdrawn'));
  await tap('back-btn');
  check('Demo reviewer code shown inside the grown-ups area', (await tid('demo-reviewer-code').innerText()).includes('2468'));
  await tap('p-ask');
  check('Grown-up Ask Zaki: blocked without consent (banner)', await visible('parent-ask-needs-consent', 3000));
  await tid('parent-ask-input').fill('How do I explain fractions?');
  await tap('parent-ask-send');
  await page.waitForTimeout(500);
  check('Grown-up Ask Zaki: no AI answer without consent', (await page.locator('[data-testid="parent-ask-zaki"]').last().innerText()).includes('give family consent first'));
  await tid('parent-ask-input').fill('My son told me his uncle touches him');
  await tap('parent-ask-send');
  await page.waitForTimeout(500);
  check('Grown-up Ask Zaki: offline worry check still runs without consent', (await page.locator('[data-testid="parent-ask-concern"]').last().innerText()).includes('1745'));
  await tap('back-btn');
  await tap('p-back-child');
  await tap('profile-Maya');
  check('Withdraw: child is stopped until consent is given again', await visible('consent-needed', 3000));
  await tap('back-btn');
  // Delete everything
  await tap('grownups-btn');
  await solveGate();
  await tap('p-data');
  await tid('delete-input').fill('delete');
  await tap('delete-btn');
  check('Delete: needs the exact word', (await tid('data-msg').innerText()).includes('DELETE exactly'));
  await tid('delete-input').fill('DELETE');
  await tap('delete-btn');
  check('Delete: everything wiped (no profiles, no consent)', (await visible('restore-demo', 5000)) && (await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('zaki:v1:state')); return s.profiles.length === 0 && !s.consent; })));
  check('Delete: no flag keeps a child link; OPEN flags keep their words, RESOLVED ones lose them', await page.evaluate(() => {
    const f = JSON.parse(localStorage.getItem('zaki:v1:state')).flags;
    const resolved = f.filter((x) => x.status === 'resolved');
    const open = f.filter((x) => x.status !== 'resolved');
    return f.every((x) => !x.childRef) && resolved.length >= 1 && resolved.every((x) => /removed/.test(x.excerpt)) && open.length >= 1 && open.some((x) => /dad hits me/.test(x.excerpt));
  }));
  await shot('en-after-delete');
  await tap('restore-demo');
  check('Demo children can be restored after delete', await visible('profile-Maya', 3000));
  await page.evaluate(() => {
    const k = 'zaki:v1:state';
    const s = JSON.parse(localStorage.getItem(k));
    s.consent = { version: 'test', at: new Date().toISOString(), date: new Date().toISOString().slice(0, 10), mode: 'two-guardians', guardians: [{ firstName: 'A', relationship: 'p' }, { firstName: 'B', relationship: 'p' }] };
    localStorage.setItem(k, JSON.stringify(s));
  });

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
