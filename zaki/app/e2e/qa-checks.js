// QA regression checks: B2 (Send button fits at 320-430px), S1 (offline safety words) and
// Round 2 at a 360px phone (no "I need help" button, teach first, big wrong-answer help panel).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { giveTestConsent } = require('./consent-helper');
const BASE = process.env.BASE || 'http://localhost:8090';
const OUT = process.env.OUT || path.join(__dirname, '..', 'test-screenshots');
const results = [];
const check = (n, ok, extra = '') => {
  results.push(!!ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${extra ? '  -- ' + extra : ''}`);
};

(async () => {
  const browser = await chromium.launch();
  for (const width of [320, 375, 390, 430]) {
    const page = await (await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true })).newPage();
    const tid = (id) => page.getByTestId(id).locator('visible=true').first();
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE);
    await giveTestConsent(page, BASE);
    await tid('profile-Maya').click({ timeout: 15000 });
    await tid('ready-yes').click();
    await tid('tile-practice').click();
    await page.getByTestId(/practice-/).locator('visible=true').first().click();
    await tid('tab-ask').click();
    await tid('chat-input').fill('What is evaporation?');
    const box1 = await tid('chat-send').boundingBox();
    await tid('chat-send').click();
    await page.waitForTimeout(900);
    const box2 = await tid('chat-send').boundingBox();
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const scrolled = await page.evaluate(() => {
      // any horizontally scrolled element?
      return [...document.querySelectorAll('*')].some((e) => e.scrollLeft > 0);
    });
    check(`B2 ${width}px: Send inside screen before & after tap, no sideways shift`, box1.x + box1.width <= width && box2.x + box2.width <= width && sw <= width + 1 && !scrolled, `send right=${Math.round(box2.x + box2.width)} scrollWidth=${sw}`);
    if (width === 320) await page.screenshot({ path: path.join(OUT, 'qa-b2-ask-320.png') });
    await page.close();
  }


  // ---------- Round 2 at 360px (small Android phone), English then Arabic ----------
  const R2 = path.join(OUT, 'round2');
  fs.mkdirSync(R2, { recursive: true });
  for (const [who, lang] of [['Maya', 'en'], ['Ali', 'ar']]) {
    const p = await (await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
    const t2 = (id) => p.getByTestId(id).locator('visible=true').first();
    const vis = (id, ms = 5000) => t2(id).waitFor({ state: 'visible', timeout: ms }).then(() => true, () => false);
    const noH = () => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    const noHelp = async () => !(await vis('need-help', 300)) && !/I need help|أحتاج إلى مساعدة/.test(await p.locator('body').innerText());
    await p.goto(BASE);
    await p.evaluate(() => localStorage.clear());
    await p.goto(BASE);
    await giveTestConsent(p, BASE);
    await t2(`profile-${who}`).click({ timeout: 15000 });
    await t2('ready-yes').click();
    await vis('start-lesson');
    check(`Round 2 ${lang} 360px: no "I need help" button on Home`, await noHelp());
    if (lang === 'en') await p.screenshot({ path: path.join(R2, 'home-no-help-button-en-360.png') });
    await t2('start-lesson').click();
    await t2('intro-start').click({ timeout: 10000 });
    check(`Round 2 ${lang} 360px: lesson opens on a teach step (no questions first)`, (await vis('teach-text')) && !(await vis('question-text', 300)));
    check(`Round 2 ${lang} 360px: teach step fits (no sideways scroll)`, await noH());
    check(`Round 2 ${lang} 360px: no "I need help" button in the lesson`, await noHelp());
    if (lang === 'en') await p.screenshot({ path: path.join(R2, 'teach-step-en-360.png') });
    while (await vis('teach-text', 800)) await t2('next-btn').click();
    // Tap a WRONG answer (looked up from the saved lesson).
    const wrongIdx = await p.evaluate(() => {
      const qText = [...document.querySelectorAll('[data-testid="question-text"]')].find((e) => e.offsetParent !== null).innerText.trim();
      const s = JSON.parse(localStorage.getItem('zaki:v1:state'));
      const items = Object.values(s.packs).flatMap((byKey) => Object.values(byKey)).flatMap((cp) => cp.pack.checks);
      const hit = items.find((it) => it.q.trim() === qText);
      const labels = [...document.querySelectorAll('[data-testid^="choice-"]')].filter((e) => e.offsetParent !== null).map((e) => e.innerText.trim());
      const right = labels.indexOf(hit.choices[hit.answerIndex].trim());
      return right === 0 ? 1 : 0;
    });
    await t2(`choice-${wrongIdx}`).click();
    const panelOk = await vis('feedback-panel', 4000);
    await p.waitForTimeout(700);
    const geo = await p.evaluate(() => {
      const el = [...document.querySelectorAll('[data-testid="feedback-panel"]')].find((e) => e.offsetParent !== null);
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, vh: window.innerHeight, vw: window.innerWidth };
    });
    check(`Round 2 ${lang} 360px: big help panel shows after a wrong answer, on screen`, panelOk && geo.top >= 0 && geo.top < geo.vh && geo.left >= 0 && geo.right <= geo.vw, JSON.stringify(geo));
    check(`Round 2 ${lang} 360px: help panel title`, (await t2('feedback-title').innerText()).includes(lang === 'ar' ? 'هيّا ننظر إليه معًا' : "Let's look at it together"));
    check(`Round 2 ${lang} 360px: no sideways scroll with the help panel`, await noH());
    if (lang === 'ar') check('Round 2 ar: right-to-left layout', await p.evaluate(() => !!document.querySelector('[dir="rtl"]')));
    // Put the whole panel (and the tapped answer above it) in the picture.
    await p.evaluate(() => [...document.querySelectorAll('[data-testid="feedback-panel"]')].find((e) => e.offsetParent !== null).scrollIntoView({ block: 'end' }));
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(R2, `wrong-answer-panel-${lang}-360.png`) });
    await p.close();
  }

  // S1: offline safety words (incl. the R12 spellings from the safety review)
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  const tid = (id) => page.getByTestId(id).locator('visible=true').first();
  // Round 5 (server rules): the child's own fear with nobody named ("I'm scared", "scared of the
  // bombs", "khayef ktir") no longer opens the screen; fear with someone at home / outside,
  // "scared to go home" or a help request still does.
  const phrases = ["I'm scared of my dad", 'scared to go home', 'I am scared of a stranger online', "I'm scared, who can I call?", 'khayef ktir mn shab bel madrase', 'baba darabne', 'bayye darabne', 'baba darabni', 'بابا ضربني', 'my dad hits me', 'someone touched me', 'I want to die', 'bade mout'];
  const safe = ['I am scared of spiders in the science book', "I'm scared of the dark", 'أنا خايف من العنكبوت', 'What is evaporation?', 'I am scared of the science exam', 'is 3/4 bigger than 1/2'];
  const open = async () => {
    await page.goto(BASE);
    await tid('profile-Maya').click({ timeout: 15000 });
    await tid('ready-yes').click();
    await tid('tile-practice').click();
    await page.getByTestId(/practice-/).locator('visible=true').first().click();
    await tid('tab-ask').click();
  };
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE);
  await giveTestConsent(page, BASE);
  for (const p of phrases) {
    await open();
    await tid('chat-input').fill(p);
    await tid('chat-send').click();
    const ok = await tid('safety-screen').waitFor({ timeout: 4000 }).then(() => true, () => false);
    check(`S1 "${p}" -> safety screen (offline)`, ok);
  }
  for (const p of safe) {
    await open();
    await tid('chat-input').fill(p);
    await tid('chat-send').click();
    await page.waitForTimeout(1200);
    check(`S1 normal school text "${p}" -> no safety screen`, (await page.getByTestId('safety-screen').count()) === 0);
  }
  // Round 5: own fear, nobody named -> no screen, the fixed calm line; sensitive subject -> the
  // fixed "not part of our lessons" line, no screen (same texts as server/data/safetyMessages.ts).
  const calm = [
    ["I'm scared", 'Please tell a grown-up at home how you feel'],
    ['im scared of the bombs', 'Please tell a grown-up at home how you feel'],
    ['khayef ktir', 'Please tell a grown-up at home how you feel'],
    ['Who is right in the war?', "That's not part of our lessons. Let's get back to our lesson!"],
  ];
  for (const [p, line] of calm) {
    await open();
    await tid('chat-input').fill(p);
    await tid('chat-send').click();
    await page.waitForTimeout(1300);
    const log = await tid('chat-log').innerText();
    check(`S1 "${p}" -> no safety screen, calm line instead (offline)`, (await page.getByTestId('safety-screen').count()) === 0 && log.includes(line));
  }
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('zaki:v1:state')));
  const maya = st.profiles.find((x) => x.nickname === 'Maya').id;
  const calmFlags = (st.flags || []).filter((f) => f.childRef === maya && f.noScreen && f.route === 'parent');
  check('S1 calm cases: a parent note is kept (own fear + sensitive topic), no child words shown to parents', calmFlags.some((f) => f.category === 'violence_fear') && calmFlags.some((f) => f.category === 'sensitive_topic'));
  await page.goto(BASE);
  await tid('grownups-btn').click();
  await tid('gate-words').waitFor({ timeout: 5000 });
  {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const w = (n) => (n % 10 === 0 ? tens[n / 10] : `${tens[Math.floor(n / 10)]}-${ones[n % 10]}`);
    const g = (await tid('gate-words').innerText()).trim();
    let n = 21;
    while (n < 100 && w(n) !== g) n++;
    await tid('gate-input').fill(String(n));
    await tid('gate-open').click();
  }
  await tid('pchild-Maya').click();
  await tid('p-progress').click();
  await page.waitForTimeout(500);
  const notes = await page.getByTestId('safety-note').locator('visible=true').allInnerTexts();
  check('S1 parent notes: own fear = "Said they felt scared or upset" (no help screen), sensitive topic label, no child words', notes.some((x) => x.includes('Said they felt scared or upset') && x.includes('no help screen')) && notes.some((x) => x.includes('Asked about a topic outside the lessons')) && !notes.some((x) => /bombs|khayef|who is right/i.test(x)), JSON.stringify(notes));
  await browser.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\n${results.length - failed}/${results.length} QA checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('CRASH', e);
  process.exit(2);
});
