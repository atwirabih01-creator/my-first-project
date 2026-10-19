// QA regression checks: B2 (Send button fits at 320-430px) and S1 (offline safety words).
const { chromium } = require('playwright');
const path = require('path');
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

  // S1: offline safety words (incl. the R12 spellings from the safety review)
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  const tid = (id) => page.getByTestId(id).locator('visible=true').first();
  const phrases = ["I'm scared", "I'm scared of my dad", 'scared to go home', 'im scared of the bombs', 'baba darabne', 'bayye darabne', 'baba darabni', 'بابا ضربني', 'my dad hits me', 'someone touched me', 'I want to die', 'bade mout', 'khayef ktir'];
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
  await browser.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\n${results.length - failed}/${results.length} QA checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('CRASH', e);
  process.exit(2);
});
