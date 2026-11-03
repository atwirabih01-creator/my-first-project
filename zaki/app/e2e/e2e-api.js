// Server-mode test with MOCKED API routes (server not finished yet).
// Proves: no demo banner when ai:true; the app reads packs from /api/lesson-pack;
// any response with safety.showSafetyScreen opens the fixed safety screen.
const { chromium } = require('playwright');
const path = require('path');
const { giveTestConsent } = require('./consent-helper');
const BASE = process.env.BASE || 'http://localhost:8090';
const OUT = process.env.OUT || '/home/user/my-first-project/zaki/app/test-screenshots';
const results = [];
const check = (n, ok) => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}`); };
const pack = {
  id: 'mock-1', subject: 'math', topic: 'Mock fractions', grade: 5, lang: 'en',
  recap: [], teachSteps: [{ text: 'MOCK TEACH STEP from server.' }],
  checks: [{ id: 'm1', q: 'Mock check?', choices: ['A', 'B'], answerIndex: 1, hint1: 'h1', hint2: 'h2', similarExample: 'ex' }],
  test: [], retestPool: [], summary: ['Mock summary'], flashcards: [],
};
(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
  const calls = [];
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const body = route.request().postDataJSON?.() ?? null;
    calls.push({ url, body });
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
    if (url.endsWith('/api/health')) return json({ ok: true, ai: true, moderation: 'fallback' });
    if (url.endsWith('/api/lesson-pack') && /my address/i.test(body.topic)) {
      return json({ blocked: true, reply: "MOCK: let's keep personal details private.", safety: { flagged: true, category: 'personal_data' } });
    }
    if (url.endsWith('/api/homework')) {
      const n = calls.filter((c) => c.url.endsWith('/api/homework')).length;
      if (n >= 3) return json({ reply: 'MOCK limit: Zaki has done a lot of thinking today!', safety: { flagged: false }, budgetReached: true });
      return json({ reply: `MOCK hint ${n}`, hintLevel: n, safety: { flagged: false } });
    }
    if (url.endsWith('/api/lesson-pack')) return json({ pack, sources: [{ title: 'Mock Source', url: 'https://example.org' }], verify: { checked: 1, removed: 0 } });
    if (url.endsWith('/api/check-answer')) return json({ correct: body.answer === 1, feedbackKey: body.answer === 1 ? 'right' : 'hint1' });
    if (url.endsWith('/api/tutor')) return json({ reply: 'x', safety: { flagged: true, category: 'self_harm', showSafetyScreen: true } });
    return json({});
  });
  const tid = (id) => page.getByTestId(id).locator('visible=true').first();
  const visible = (id, t = 6000) => tid(id).waitFor({ state: 'visible', timeout: t }).then(() => true, () => false);
  await page.goto(BASE); await page.evaluate(() => localStorage.clear()); await page.goto(BASE);
  await giveTestConsent(page, BASE);
  // Round 4: Maya's card gets an age (as if a grown-up set it in "Edit name, age and grade").
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('zaki:v1:state'));
    s.profiles = s.profiles.map((p) => (p.nickname === 'Maya' ? { ...p, age: 10 } : p));
    localStorage.setItem('zaki:v1:state', JSON.stringify(s));
  });
  await page.goto(BASE);
  await visible('profile-Maya', 15000);
  await page.waitForTimeout(800);
  check('no demo banner when /api/health ai:true', (await page.getByTestId('demo-banner').count()) === 0);
  await tid('profile-Maya').click(); await tid('ready-yes').click();
  await tid('start-lesson').click();
  await tid('intro-start').click({ timeout: 8000 });
  check('teach step comes from server pack', (await tid('teach-text').innerText()).includes('MOCK TEACH STEP'));
  const lp = calls.find((c) => c.url.endsWith('/api/lesson-pack'));
  check('lesson-pack request has childRef/grade/lang/country, no name', !!lp && lp.body.childRef && lp.body.grade === 5 && lp.body.lang === 'en' && lp.body.country === 'LB' && !JSON.stringify(lp.body).includes('Maya'));
  check('Round 4: lesson-pack request carries the child\'s age', !!lp && lp.body.age === 10);
  await tid('next-btn').click();
  await tid('choice-0').click(); await page.waitForTimeout(300);
  check('check-answer used (wrong -> hint)', calls.some((c) => c.url.endsWith('/api/check-answer')) && (await visible('feedback-hint')));
  await tid('choice-1').click(); await tid('next-btn').click();
  await tid('chat-input').fill('hello zaki'); await tid('chat-send').click();
  check('tutor safety.showSafetyScreen -> safety screen', await visible('safety-screen'));
  await page.screenshot({ path: path.join(OUT, '40-api-mock-safety-from-server.png') });
  const tutor = calls.find((c) => c.url.endsWith('/api/tutor'));
  check('tutor request carries pack + step + history', !!tutor && tutor.body.step === 'chat' && Array.isArray(tutor.body.history) && tutor.body.packId === 'mock-1');
  check('Round 4: tutor request carries the child\'s age', !!tutor && tutor.body.age === 10);

  // ---------- Round 4: server says the typed topic is personal (blockedReply, no safety screen) ----------
  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('zaki:v1:state')));
  const mayaId = (await state()).profiles.find((p) => p.nickname === 'Maya').id;
  const planLen = (await state()).plans[mayaId].length;
  await page.goto(BASE);
  await tid('profile-Maya').click(); await tid('ready-yes').click();
  await tid('tile-today-help').click();
  await tid('pick-subject-math').click();
  await tid('today-input').fill('my address is near the park');
  await tid('today-go').click();
  check('Round 4: blocked topic -> calm card with the server\'s reply', (await visible('today-blocked')) && (await tid('today-blocked-reply').innerText()).includes('personal details private'));
  check('Round 4: blocked topic -> no safety screen, nothing saved', (await page.getByTestId('safety-screen').count()) === 0 && (await state()).plans[mayaId].length === planLen && !Object.keys((await state()).packs[mayaId]).some((k) => /address/.test(k)));
  await page.screenshot({ path: path.join(OUT, 'round4', 'api-mock-today-blocked.png') });
  // A plan item whose topic the server now refuses: lesson.tsx shows the calm card + Back
  await page.evaluate((id) => {
    const s = JSON.parse(localStorage.getItem('zaki:v1:state'));
    s.plans[id].unshift({ id: 'p_mock', subject: 'math', topic: 'my address lesson', kind: 'lesson', addedAt: new Date().toISOString(), unlocked: true });
    localStorage.setItem('zaki:v1:state', JSON.stringify(s));
  }, mayaId);
  await page.goto(BASE);
  await tid('profile-Maya').click(); await tid('ready-yes').click();
  await tid('plan-my address lesson').click();
  check('Round 4: lesson with blockedReply -> calm card with Back (not a silent stop)', (await visible('lesson-blocked')) && (await tid('blocked-reply').innerText()).includes('personal details private') && (await visible('blocked-back')));
  check('Round 4: blocked lesson pack is not saved', !Object.keys((await state()).packs[mayaId]).some((k) => /address/.test(k)));
  await tid('blocked-back').click();
  check('Round 4: Back from the blocked lesson goes home', await visible('start-lesson'));

  // ---------- Round 4: homework help against the (mocked) server ----------
  await tid('tile-homework').click();
  await tid('pick-subject-math').click();
  await tid('hw-question-input').fill('What is 45 + 27?');
  await tid('hw-start').click();
  check('Round 4 homework: server reply shown', await tid('hw-zaki-text').innerText().then((x) => x.includes('MOCK hint 1')));
  await tid('hw-input').fill('is it 70?'); await tid('hw-send').click();
  await page.waitForTimeout(600);
  const hw = calls.filter((c) => c.url.endsWith('/api/homework'));
  check('Round 4 homework: 1st turn = question, no message, empty history; has age, grade, subject, no name', hw[0].body.question === 'What is 45 + 27?' && !hw[0].body.message && hw[0].body.history.length === 0 && hw[0].body.age === 10 && hw[0].body.grade === 5 && hw[0].body.subject === 'math' && !JSON.stringify(hw[0].body).includes('Maya'));
  check('Round 4 homework: 2nd turn sends the message + the history so far', hw[1].body.message === 'is it 70?' && hw[1].body.history.length === 1 && hw[1].body.history[0].role === 'zaki' && hw[1].body.question === 'What is 45 + 27?');
  await tid('hw-input').fill('and now?'); await tid('hw-send').click();
  check('Round 4 homework: per-child limit / budget -> friendly limit message, chat stops', (await visible('hw-limit')) && (await tid('hw-limit').innerText()).includes('a lot of thinking') && (await page.getByTestId('hw-input').count()) === 0);
  await page.screenshot({ path: path.join(OUT, 'round4', 'api-mock-homework-limit.png') });

  await browser.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\n${results.length - failed}/${results.length} API-mock checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('CRASH', e); process.exit(2); });
