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
    if (url.endsWith('/api/lesson-pack')) return json({ pack, sources: [{ title: 'Mock Source', url: 'https://example.org' }], verify: { checked: 1, removed: 0 } });
    if (url.endsWith('/api/check-answer')) return json({ correct: body.answer === 1, feedbackKey: body.answer === 1 ? 'right' : 'hint1' });
    if (url.endsWith('/api/tutor')) return json({ reply: 'x', safety: { flagged: true, category: 'self_harm', showSafetyScreen: true } });
    return json({});
  });
  const tid = (id) => page.getByTestId(id).locator('visible=true').first();
  const visible = (id, t = 6000) => tid(id).waitFor({ state: 'visible', timeout: t }).then(() => true, () => false);
  await page.goto(BASE); await page.evaluate(() => localStorage.clear()); await page.goto(BASE);
  await giveTestConsent(page, BASE);
  await visible('profile-Maya', 15000);
  await page.waitForTimeout(800);
  check('no demo banner when /api/health ai:true', (await page.getByTestId('demo-banner').count()) === 0);
  await tid('profile-Maya').click(); await tid('ready-yes').click();
  await tid('start-lesson').click();
  await tid('intro-start').click({ timeout: 8000 });
  check('teach step comes from server pack', (await tid('teach-text').innerText()).includes('MOCK TEACH STEP'));
  const lp = calls.find((c) => c.url.endsWith('/api/lesson-pack'));
  check('lesson-pack request has childRef/grade/lang/country, no name', !!lp && lp.body.childRef && lp.body.grade === 5 && lp.body.lang === 'en' && lp.body.country === 'LB' && !JSON.stringify(lp.body).includes('Maya'));
  await tid('next-btn').click();
  await tid('choice-0').click(); await page.waitForTimeout(300);
  check('check-answer used (wrong -> hint)', calls.some((c) => c.url.endsWith('/api/check-answer')) && (await visible('feedback-hint')));
  await tid('choice-1').click(); await tid('next-btn').click();
  await tid('chat-input').fill('hello zaki'); await tid('chat-send').click();
  check('tutor safety.showSafetyScreen -> safety screen', await visible('safety-screen'));
  await page.screenshot({ path: path.join(OUT, '40-api-mock-safety-from-server.png') });
  const tutor = calls.find((c) => c.url.endsWith('/api/tutor'));
  check('tutor request carries pack + step + history', !!tutor && tutor.body.step === 'chat' && Array.isArray(tutor.body.history) && tutor.body.packId === 'mock-1');
  await browser.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\n${results.length - failed}/${results.length} API-mock checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('CRASH', e); process.exit(2); });
