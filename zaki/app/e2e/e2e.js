// Click-through test of Zaki (demo mode, no server) at iPhone size 390x844.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8090';
const OUT = process.env.OUT || '/home/user/my-first-project/zaki/app/test-screenshots';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
let shotN = 0;
function check(name, ok, extra = '') {
  results.push({ name, ok: !!ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -- ' + extra : ''}`);
}

const EN_ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const EN_TENS = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const AR_ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const AR_TENS = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
function words(n, lang) {
  const t = Math.floor(n / 10), o = n % 10;
  if (lang === 'ar') return o === 0 ? AR_TENS[t] : `${AR_ONES[o]} و${AR_TENS[t]}`;
  return o === 0 ? EN_TENS[t] : `${EN_TENS[t]}-${EN_ONES[o]}`;
}
function fromWords(w, lang) {
  for (let n = 21; n <= 99; n++) if (words(n, lang) === w.trim()) return n;
  return null;
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/api\/health|Failed to load resource/i.test(m.text())) errors.push('console: ' + m.text());
  });

  const shot = async (name) => {
    shotN++;
    const f = path.join(OUT, `${String(shotN).padStart(2, '0')}-${name}.png`);
    await page.waitForTimeout(350);
    await page.screenshot({ path: f });
    return f;
  };
  const tid = (id) => page.getByTestId(id).locator('visible=true').first();
  const tap = async (id) => {
    await tid(id).click();
    await page.waitForTimeout(250);
  };
  const visible = async (id, timeout = 4000) => {
    try {
      await tid(id).waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  };
  const noHScroll = async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  // ---------- Start ----------
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE);
  check('start screen shows profiles', await visible('profile-Maya', 15000));
  check('demo banner shown when no server', await visible('demo-banner', 8000));
  check('no horizontal scroll (start)', await noHScroll());
  await shot('en-start-profiles');

  // ---------- English: Maya grade 5 ----------
  await tap('profile-Maya');
  check('ready check question', (await tid('ready-question').innerText()).includes('quiet place and ready to focus'));
  check('watch indicator on ready', await visible('watch-indicator'));
  await shot('en-ready-check');
  await tap('ready-yes');
  check('home shows start button', await visible('start-lesson'));
  check('watch indicator on home', await visible('watch-indicator'));
  await shot('en-home-today');

  await tap('start-lesson');
  check('loading shows researching animation', await visible('lesson-loading', 3000));
  await shot('en-lesson-loading');
  check('intro says AI', (await tid('ai-intro').innerText({ timeout: 8000 })).includes('an AI'));
  await shot('en-lesson-ai-intro');
  await tap('intro-start');
  // Recap: answers all index 1
  await tap('choice-0');
  check('recap wrong gives gentle retry', (await page.getByText('Not quite').count()) > 0);
  for (let i = 0; i < 3; i++) await tap('choice-1');
  check('teach step visible', await visible('teach-text'));
  await shot('en-teach-step');
  for (let i = 0; i < 4; i++) await tap('next-btn');
  // Check question 1 (answer 1): wrong -> hint1 -> hint2 -> example -> retry
  await tap('choice-0');
  const h1 = await tid('feedback-hint').innerText();
  check('wrong #1 shows hint 1', h1.includes('Count how many equal pieces'));
  await shot('en-check-hint1');
  await tap('choice-2');
  check('wrong #2 shows hint 2', (await tid('feedback-hint').innerText()).includes('bottom number is the number of equal pieces'));
  await tap('choice-0');
  const ex = await tid('feedback-hint').innerText();
  check('wrong #3 shows similar example', ex.includes('sandwich'));
  check('answer never revealed in hints', !/1\/4/.test(ex));
  await shot('en-check-similar-example');
  await tap('choice-1');
  check('right answer praised', await visible('feedback-right'));
  await tap('next-btn');
  await tap('choice-1');
  await tap('next-btn');
  await tap('choice-1');
  await tap('next-btn');
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
  await shot('en-ask-zaki');
  await tap('ask-skip');
  check('summary card', (await page.getByTestId('summary-line').count()) >= 3);
  check('sources titles shown (no links)', (await page.getByTestId('source-title').count()) > 0 && (await page.locator('a[href^="http"]').count()) === 0);
  await shot('en-summary-sources');
  await tap('to-test');
  check('grade 5 test framed beat your score', (await page.getByText('Beat your own score').count()) > 0);
  await tap('test-start');
  check('grade 5 shows count-up timer', await visible('test-timer'));
  await shot('en-test-timed');
  // Fail first test: correct [0,1,1,0,0]; get 3/5
  for (const a of [0, 1, 0, 1, 1]) await tap(`choice-${a}`);
  check('fail result', await visible('result-fail'));
  await shot('en-test-fail');
  await tap('see-summary');
  check('summary shown again after fail', (await page.getByText("Let's read the summary again").count()) > 0);
  await tap('to-test');
  const firstRetestQ = await tid('question-text').innerText();
  check('retest uses new questions (retestPool)', firstRetestQ.includes('6 equal pieces'));
  for (const a of [1, 0, 1, 1, 1]) await tap(`choice-${a}`);
  check('pass result Learned!', await visible('result-pass'));
  await shot('en-test-pass-learned');
  await tap('back-home');

  // Sections
  await tap('tile-classes');
  await page.waitForTimeout(300);
  check('classes lists lessons with status', (await page.getByTestId('status-mastered').count()) >= 1 && (await page.getByTestId('status-learned').count()) >= 1);
  await tap('class-Fractions');
  await shot('en-classes');
  await tap('back-btn');
  await tap('tile-tests');
  check('tests shows upcoming + results', await page.getByText('My results').first().waitFor({ timeout: 5000 }).then(() => true, () => false));
  await shot('en-tests');
  await tap('back-btn');
  await tap('tile-flashcards');
  const front = await tid('flashcard').innerText();
  await tap('flashcard');
  const back = await tid('flashcard').innerText();
  check('flashcard flips', front !== back);
  await shot('en-flashcard-back');
  await tap('fc-mode-quick');
  await shot('en-flashcards-quick');
  await tap('back-btn');
  await tap('tile-practice');
  await tap('practice-Fractions');
  await tap('tab-ask');
  // Safety: disclosure in chat -> local safety screen, no network needed
  await tid('chat-input').fill('my dad hits me');
  await tap('chat-send');
  check('safety screen on disclosure (offline word check)', await visible('safety-screen'));
  const safetyText = await tid('safety-screen').innerText();
  const pageText = await page.locator('body').innerText();
  check('safety: says not a secret', pageText.includes('not a secret'));
  check('safety: Lebanon numbers 112 + himaya', pageText.includes('112') && pageText.includes('03 414 964'));
  check('safety: no tel: links', (await page.locator('a[href^="tel:"]').count()) === 0);
  check('safety: never shows Qatar 919 to LB child', !pageText.includes('919'));
  void safetyText;
  await shot('en-safety-screen');
  await tap('safety-back');
  await tap('back-btn');
  await tap('back-btn');
  // I need help from lesson screen
  await tap('start-lesson');
  await visible('intro-start', 8000);
  await tap('need-help');
  await shot('en-need-help');
  await tap('help-feel');
  check('help -> safety without parental gate', await visible('safety-screen'));
  await tap('safety-back');
  await page.waitForTimeout(300);
  // Report this answer
  await tap('report-answer');
  check('report this answer acknowledged', (await page.getByText('A grown-up will check it').count()) > 0);
  await tap('back-btn');

  // ---------- Parent area ----------
  await page.goto(BASE + '/');
  await tap('grownups-btn');
  check('parental gate shows number in words', await visible('gate-words'));
  await tid('gate-input').fill('5');
  await tap('gate-open');
  check('gate rejects wrong answer', await visible('gate-wrong'));
  await shot('en-parental-gate');
  const w = await tid('gate-words').innerText();
  await tid('gate-input').fill(String(fromWords(w, 'en')));
  await tap('gate-open');
  check('gate opens parent area', await visible('p-settings'));
  await tap('pchild-Maya');
  await shot('en-parent-menu');
  await tap('p-settings');
  await tap('dyslexia-on');
  await shot('en-parent-settings');
  await tap('dyslexia-off');
  await tap('back-btn');
  await tap('p-add');
  check('photo reminder shown', (await tid('photo-reminder').innerText()).includes('no faces or names'));
  await tap('subject-science');
  await tid('lesson-name').fill('Plants');
  await tap('has-test-yes');
  await shot('en-parent-add-lesson');
  await tap('prepare-lesson');
  check('lesson prepared and added', await visible('add-lesson-msg', 10000));
  await tap('back-btn');
  await tap('p-progress');
  check('progress shows sessions', await visible('stat-sessions'));
  await shot('en-parent-progress');
  await tap('back-btn');
  await tap('p-whatsapp');
  await tap('wa-REPORT');
  await page.waitForTimeout(300);
  const rep = (await page.getByTestId('wa-zaki').last().innerText());
  check('WhatsApp REPORT in section 3.3 format', rep.includes("Maya's session today") && rep.includes('✅ Finished') && rep.includes('Reply PLAN'));
  await shot('en-whatsapp-report');
  await tid('wa-input').fill('Science test on plants Sunday');
  await tap('wa-send');
  await page.waitForTimeout(500);
  check('WhatsApp plan message adds to plan', (await page.getByTestId('wa-zaki').last().innerText()).includes('added'));
  await tap('wa-HELP');
  await tap('wa-PAUSE');
  await page.waitForTimeout(300);
  check('PAUSE toggles', (await page.getByTestId('wa-zaki').last().innerText()).includes('paused'));
  await tap('wa-PAUSE');
  await shot('en-whatsapp-commands');

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
  await page.goto(BASE + '/');
  await tap('profile-Maya');
  await tap('ready-yes');
  check('daily cap -> friendly break screen', await visible('break-screen', 5000));
  await shot('en-break-screen');

  // ---------- Arabic: Ali grade 3 ----------
  await page.goto(BASE + '/');
  await tap('profile-Ali');
  const dir = await page.evaluate(() => {
    const el = document.querySelector('[dir="rtl"]');
    return el ? 'rtl' : 'ltr';
  });
  check('Arabic child switches layout to RTL', dir === 'rtl');
  check('Arabic ready question', (await tid('ready-question').innerText()).includes('مكان هادئ'));
  await shot('ar-ready-check');
  await tap('ready-yes');
  check('Arabic watch indicator', (await tid('watch-indicator').innerText()).includes('يرون دروسك'));
  check('no horizontal scroll (ar home)', await noHScroll());
  await shot('ar-home-today');
  await tap('start-lesson');
  await shot('ar-lesson-loading');
  await visible('intro-start', 8000);
  check('Arabic AI intro', (await tid('ai-intro').innerText()).includes('ذكاء اصطناعي'));
  await tap('intro-start');
  for (let i = 0; i < 3; i++) await tap('choice-1');
  await shot('ar-teach-step');
  for (let i = 0; i < 4; i++) await tap('next-btn');
  await tap('choice-0');
  check('Arabic hint 1', (await tid('feedback-hint').innerText()).includes('عُدَّ'));
  await shot('ar-check-hint');
  await tap('choice-1');
  await tap('next-btn');
  await tap('choice-1');
  await tap('next-btn');
  await tap('choice-1');
  await tap('next-btn');
  await tid('chat-input').fill('أعطني الجواب');
  await tap('chat-send');
  await page.waitForTimeout(900);
  check('Arabic golden rule reply', (await tid('chat-log').innerText()).includes('لا أستطيع أن أعطيك الإجابة'));
  await shot('ar-ask-zaki');
  await tap('ask-skip');
  await shot('ar-summary');
  await tap('to-test');
  await tap('test-start');
  check('grade 3: no countdown/timer', !(await visible('test-timer', 800)));
  await shot('ar-test-progress-bar');
  for (const a of [0, 1, 1, 0, 0]) await tap(`choice-${a}`);
  check('Arabic pass', (await tid('result-pass').innerText()).includes('تعلّمتَه'));
  await shot('ar-test-pass');
  await tap('back-home');
  // Arabic safety screen (offline words, Arabizi)
  await tap('tile-practice');
  await page.getByTestId(/practice-/).locator('visible=true').first().click();
  await tap('tab-ask');
  await tid('chat-input').fill('khayef ktir');
  await tap('chat-send');
  check('Arabizi fear word -> safety screen', await visible('safety-screen'));
  const arSafety = await page.locator('body').innerText();
  check('Arabic safety text + 1564', arSafety.includes('هذا ليس سرًّا') && arSafety.includes('1564'));
  await shot('ar-safety-screen');

  // ---------- Create a learner ----------
  await page.goto(BASE + '/');
  await tap('new-learner');
  await tid('nickname-input').fill('Sami');
  await tap('grade-2');
  await tap('lang-ar');
  await tap('avatar-turtle');
  await shot('ar-create-learner');
  await tap('create-btn');
  check('new learner goes to ready check', await visible('ready-question'));

  // ---------- Language toggle on start ----------
  await page.goto(BASE + '/');
  await page.waitForTimeout(500);
  await tap('lang-toggle');
  await shot('toggle-language-start');

  check('no JS errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed, ${shotN} screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASH', e);
  process.exit(2);
});
