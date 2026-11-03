// Round 5 click-through checks against a MOCKED server (needs http, e.g. `node e2e/serve.js <dist> 8091`):
// 1. Grown-up homework photos: parent adds photos (gallery + camera, fixtures in e2e/fixtures/),
//    subject and note -> child home card -> homework chat with thumbnails; EVERY /api/homework
//    turn carries pageImages + parentNote -> "I finished" removes the task and its photos.
// 2. Teach step titles (mocked pack).
// 3. Old saved lessons (packVersion 1): re-made for an unpassed lesson, kept for a passed one,
//    kept silently when today's limit is reached.
// 4. Parent safety notes: sensitive_topic and violence_fear labels, never the child's words.
// 5. 360px English + Arabic: no sideways scroll on the new screens.
// Screenshots: test-screenshots/round5/.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { writeTestConsent } = require('./consent-helper');

const BASE = process.env.BASE || 'http://localhost:8091';
const OUT = path.join(process.env.OUT || path.join(__dirname, '..', 'test-screenshots'), 'round5');
fs.mkdirSync(OUT, { recursive: true });
const JPG = path.join(__dirname, 'fixtures', 'homework-page.jpg');
const PNG = path.join(__dirname, 'fixtures', 'homework-page.png');
const BIG = path.join(__dirname, 'fixtures', 'homework-page-big.jpg'); // 3200 x 2400

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

const q = (id) => ({ id, q: `Mock ${id}?`, choices: ['A', 'B', 'C'], answerIndex: 1, hint1: 'h1', hint2: 'h2', similarExample: 'ex' });
const mkPack = (topic, steps) => ({
  id: `mock-${topic}`, subject: 'math', topic, grade: 5, lang: 'en', recap: [], teachSteps: steps,
  checks: [q('c1')], test: [q('t1'), q('t2'), q('t3'), q('t4'), q('t5')], retestPool: [], summary: ['Mock summary'], flashcards: [],
});

(async () => {
  const browser = await chromium.launch();
  const calls = [];
  const newPage = async (width = 390, height = 844) => {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
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
      if (url.endsWith('/api/lesson-pack')) {
        const topic = body.topic;
        if (topic === 'old budget') return json({ budgetReached: true });
        if (topic === 'old unpassed') return json({ pack: mkPack(topic, [{ title: 'Fresh title', text: 'FRESH v3 step one.' }, { text: 'FRESH v3 step two.' }]), sources: [], verify: { checked: 0, removed: 0 }, packVersion: 3 });
        return json({
          pack: mkPack(topic, [{ title: 'What is a fraction?', text: 'A fraction is a part of a whole thing.', example: 'Half of a pizza is 1/2.' }, { text: 'The bottom number tells how many equal parts.' }]),
          sources: [], verify: { checked: 0, removed: 0 }, packVersion: 3,
        });
      }
      if (url.endsWith('/api/homework')) {
        if (/storm/i.test(body.message || '')) return json({ reply: 'fixed calm text', safety: { flagged: true, category: 'violence_fear', showSafetyScreen: true, route: 'parent', helpRouteKind: 'fear' } });
        if (/war/i.test(body.question)) return json({ reply: "That's a big grown-up topic. Let's get back to your homework!", safety: { flagged: true, category: 'sensitive_topic', showSafetyScreen: false, route: 'parent' } });
        const n = calls.filter((c) => c.url.endsWith('/api/homework')).length;
        return json({ reply: `MOCK photo hint ${n}: look at exercise 3 first.`, hintLevel: 1, safety: { flagged: false } });
      }
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
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('zaki:v1:state')));
    const photoKeys = () => page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('zaki:v1:hwphoto:')));
    const edit = (fn, arg) => page.evaluate(([src, a]) => {
      const s = JSON.parse(localStorage.getItem('zaki:v1:state'));
      // eslint-disable-next-line no-new-func
      new Function('s', 'a', src)(s, a);
      localStorage.setItem('zaki:v1:state', JSON.stringify(s));
    }, [fn, arg]);
    const shot = async (name) => {
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    };
    const scrollTo = (id, block = 'start') => page.evaluate(([i, b]) => [...document.querySelectorAll(`[data-testid="${i}"]`)].find((e) => e.offsetParent !== null)?.scrollIntoView({ block: b, behavior: 'instant' }), [id, block]);
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
      await visible('start-lesson', 8000);
    };
    const choose = async (buttonId, file) => {
      const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 8000 }), tid(buttonId).click()]);
      await fc.setFiles(file);
      await page.waitForTimeout(700);
    };
    return { page, tid, tap, visible, count, noH, state, photoKeys, edit, shot, scrollTo, fresh, gate, enterChild, choose };
  };
  const hwCalls = () => calls.filter((c) => c.url.endsWith('/api/homework'));
  const packCalls = (topic) => calls.filter((c) => c.url.endsWith('/api/lesson-pack') && c.body.topic === topic);

  // ---------- 1. Parent: homework photos ----------
  let P = await newPage();
  await P.fresh();
  await P.page.waitForTimeout(600);
  await P.tap('grownups-btn');
  await P.gate();
  check('Parent menu: "Homework photos" button', (await P.tid('p-homework-photos').innerText()).includes('Homework photos'));
  await P.tap('p-homework-photos');
  await P.tap('pchild-Maya');
  check('Homework photos: privacy note under the picker', (await P.tid('hwp-privacy').innerText()).includes("Please don't include faces or names."));
  check('Homework photos: take a photo + choose from gallery buttons', (await P.visible('hwp-camera')) && (await P.visible('hwp-gallery')));
  check('Homework photos: subjects for Maya\'s grade 5 (no physics)', (await P.visible('hwp-subject-science')) && !(await P.visible('hwp-subject-physics', 300)));
  await P.tap('hwp-save');
  check('Homework photos: saving without a photo asks for one', (await P.tid('hwp-msg').innerText()).includes('at least one photo'));
  await P.choose('hwp-gallery', PNG);
  await P.choose('hwp-camera', JPG);
  check('Homework photos: 2 thumbnails after gallery (PNG) + camera (JPG)', (await P.count('hwp-thumb')) === 2);
  await P.tid('hwp-note').fill('x'.repeat(400));
  check('Homework photos: note is limited to 300 letters', (await P.tid('hwp-note').inputValue()).length === 300);
  await P.tid('hwp-note').fill('only exercise 3');
  await P.tap('hwp-subject-math');
  await P.scrollTo('hwp-photos-label');
  await P.shot('parent-homework-photos-en');
  await P.tap('hwp-save');
  check('Homework photos: saved message', (await P.tid('hwp-msg').innerText()).includes('Maya will see it'));
  let st = await P.state();
  const mayaId = st.profiles.find((p) => p.nickname === 'Maya').id;
  const aliId = st.profiles.find((p) => p.nickname === 'Ali').id;
  const task = (st.homework?.[mayaId] ?? [])[0];
  check('Homework photos: task saved on the device for Maya (subject, note, 2 photo refs)', !!task && task.subject === 'math' && task.note === 'only exercise 3' && task.photos.length === 2);
  check('Homework photos: the pictures are NOT inside the main saved state', !JSON.stringify(st).includes('/9j/'));
  const keys = await P.photoKeys();
  const allJpeg = await P.page.evaluate((ks) => ks.every((k) => JSON.parse(localStorage.getItem(k)).startsWith('/9j/')), keys);
  check('Homework photos: 2 photos stored separately, both JPEG (PNG converted)', keys.length === 2 && allJpeg);
  check('Homework photos: task listed with its note + "kept 30 days" note', (await P.count('hwp-task')) === 1 && (await P.tid('hwp-task-note').innerText()).includes('only exercise 3') && (await P.tid('hwp-keep').innerText()).includes('30 days'));
  await P.scrollTo('hwp-list', 'end');
  await P.shot('parent-homework-list-en');
  // A second task, then delete it: its photo is deleted too.
  await P.choose('hwp-gallery', JPG);
  await P.tap('hwp-subject-science');
  await P.tap('hwp-save');
  check('Homework photos: second task listed', (await P.count('hwp-task')) === 2 && (await P.photoKeys()).length === 3);
  await P.tap('hwp-delete-1');
  check('Homework photos: delete removes the task AND its photo', (await P.count('hwp-task')) === 1 && (await P.photoKeys()).length === 2);
  // A big photo (3200 x 2400) is resized to 1600px on the long side, saved as JPEG.
  const dims = (b64) => P.page.evaluate((d) => new Promise((r) => { const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.onerror = () => r([0, 0]); i.src = 'data:image/jpeg;base64,' + d; }), b64);
  await P.choose('hwp-gallery', BIG);
  await P.tap('hwp-save');
  const bigTask = (await P.state()).homework[mayaId].slice(-1)[0];
  const bigB64 = await P.page.evaluate((k) => JSON.parse(localStorage.getItem('zaki:v1:' + k)), bigTask.photos[0].slice(3));
  const bigDims = await dims(bigB64);
  check('Homework photos: big photo resized to max 1600px (JPEG)', bigB64.startsWith('/9j/') && bigDims[0] === 1600 && bigDims[1] === 1200, JSON.stringify(bigDims));
  await P.tap('hwp-delete-1');
  // Parent add-lesson uses the same resize
  await P.tap('back-btn');
  await P.visible('p-add', 8000);
  await P.tap('p-add');
  await P.visible('add-photo', 8000);
  await P.choose('add-photo', BIG);
  const thumbDims = await P.page.evaluate(() => {
    const img = [...document.querySelectorAll('img')].find((i) => i.src.startsWith('data:image/jpeg') && i.offsetParent !== null);
    return img ? [img.naturalWidth, img.naturalHeight] : [0, 0];
  });
  check('Add-lesson: picked photo resized to max 1600px JPEG too', thumbDims[0] === 1600 && thumbDims[1] === 1200, JSON.stringify(thumbDims));
  await P.tap('back-btn');
  await P.visible('p-homework-photos', 8000);
  await P.tap('p-homework-photos');
  await P.visible('pchild-Ali', 8000);
  // A task for Ali (Arabic, grade 3)
  await P.tap('pchild-Ali');
  check('Homework photos: list is per child (Ali has none)', await P.visible('hwp-none'));
  await P.choose('hwp-gallery', JPG);
  await P.tap('hwp-subject-arabic');
  await P.tid('hwp-note').fill('التمرين 3 فقط');
  await P.tap('hwp-save');
  st = await P.state();
  check('Homework photos: Ali\'s task saved', (st.homework?.[aliId] ?? []).length === 1);
  // A task older than 30 days is deleted (with its photo) when the app starts.
  await P.edit("s.homework[a].push({ id: 'hw_old', subject: 'math', photos: ['kv:hwphoto:hw_old:0'], createdAt: new Date(Date.now() - 31 * 864e5).toISOString() });", mayaId);
  await P.page.evaluate(() => localStorage.setItem('zaki:v1:hwphoto:hw_old:0', JSON.stringify('/9j/old')));
  await P.page.goto(BASE);
  await P.tid('profile-Maya').waitFor({ timeout: 15000 });
  await P.page.waitForTimeout(800);
  st = await P.state();
  check('Homework photos: tasks older than 30 days are deleted with their photos', !st.homework[mayaId].some((t) => t.id === 'hw_old') && !(await P.photoKeys()).some((k) => k.includes('hw_old')));

  // ---------- 2. Child: home card -> homework chat with thumbnails ----------
  await P.enterChild('Maya');
  check('Child home: highlighted "Homework from your grown-up" card', (await P.visible('hw-task-card')) && (await P.tid('hw-task-card').innerText()).includes('Homework from your grown-up'));
  check('Child home: card shows the subject and the note', (await P.tid('hw-task-subject').innerText()).includes('Math') && (await P.tid('hw-task-note').innerText()).includes('only exercise 3'));
  const order = await P.page.evaluate(() => {
    const y = (id) => [...document.querySelectorAll(`[data-testid="${id}"]`)].find((e) => e.offsetParent !== null).getBoundingClientRect().top;
    return { card: y('hw-task-card'), start: y('start-lesson'), tile: y('tile-homework'), classes: y('tile-classes') };
  });
  check('Child home: the card sits above the tiles', order.card < order.start && order.card < order.tile && order.card < order.classes, JSON.stringify(order));
  check('Child home: still no "I need help" button', !/I need help/i.test(await P.page.locator('body').innerText()));
  await P.shot('child-home-homework-card-en');
  const before = hwCalls().length;
  await P.tap('hw-task-card');
  check('Homework chat: Zaki starts helping straight away', await P.visible('hw-zaki', 8000));
  check('Homework chat: 2 photo thumbnails at the top + the grown-up\'s note', (await P.count('hw-thumb')) === 2 && (await P.tid('hw-parent-note').innerText()).includes('only exercise 3'));
  check('Homework chat: "won\'t give the answer" note kept', (await P.tid('hw-note').innerText()).includes("won't give the answer"));
  await P.tid('hw-input').fill('is it 24?');
  await P.tap('hw-send');
  await P.page.waitForTimeout(900);
  const hw = hwCalls().slice(before);
  const imgsOk = (c) => Array.isArray(c.body.pageImages) && c.body.pageImages.length === 2 && c.body.pageImages.every((x) => typeof x === 'string' && x.startsWith('/9j/'));
  check('Homework API turn 1: pageImages (2 JPEG) + parentNote, no message, empty history', hw.length >= 1 && imgsOk(hw[0]) && hw[0].body.parentNote === 'only exercise 3' && !hw[0].body.message && hw[0].body.history.length === 0 && hw[0].body.subject === 'math' && hw[0].body.question.length > 5);
  check('Homework API turn 2: pageImages + parentNote sent AGAIN, with message + history', hw.length >= 2 && imgsOk(hw[1]) && hw[1].body.parentNote === 'only exercise 3' && hw[1].body.message === 'is it 24?' && hw[1].body.history.length === 1);
  check('Homework API: no child name in the request', !hw.some((c) => JSON.stringify(c.body).includes('Maya')));
  await P.scrollTo('hw-task-top');
  await P.shot('homework-chat-thumbnails-en');
  await P.tap('hw-thumb');
  check('Homework chat: tapping a thumbnail shows the photo bigger', await P.visible('hw-photo-big'));
  await P.tap('hw-photo-close');
  await P.scrollTo('hw-finished', 'center');
  await P.tap('hw-finished');
  check('"I finished": celebration card', await P.visible('hw-finished-card'));
  st = await P.state();
  check('"I finished": the task and its photos are removed', (st.homework[mayaId] ?? []).length === 0 && !(await P.photoKeys()).some((k) => k.includes(task.id)));
  await P.shot('homework-finished-en');
  await P.tap('hw-finished-home');
  check('"I finished": no homework card on home any more', (await P.visible('start-lesson')) && (await P.count('hw-task-card')) === 0);

  // ---------- 3. Teach step title (mocked pack) ----------
  await P.tap('start-lesson');
  await P.tap('intro-start');
  check('Teach step: title shown as a heading above the text', (await P.visible('teach-title', 8000)) && (await P.tid('teach-title').innerText()) === 'What is a fraction?');
  const tpos = await P.page.evaluate(() => {
    const r = (id) => [...document.querySelectorAll(`[data-testid="${id}"]`)].find((e) => e.offsetParent !== null).getBoundingClientRect();
    return { title: r('teach-title').top, text: r('teach-text').top, bold: getComputedStyle([...document.querySelectorAll('[data-testid="teach-title"]')].find((e) => e.offsetParent !== null)).fontWeight };
  });
  check('Teach step: title is bold and above the text, example card + owl kept', tpos.title < tpos.text && Number(tpos.bold) >= 700 && (await P.visible('teach-example')), JSON.stringify(tpos));
  check('Teach step: pack saved with packVersion 3', (await P.state()).packs[mayaId]['math:fractions']?.packVersion === 3);
  await P.shot('teach-step-title-en');
  await P.tap('next-btn');
  check('Teach step without a title: no heading', (await P.visible('teach-text')) && (await P.count('teach-title')) === 0);

  // ---------- 4. Old saved lessons (packVersion 1) ----------
  const oldPack = (topic) => mkPack(topic, [{ text: 'OLD manoushe text.' }]);
  await P.edit(`
    const id = a.id, now = new Date().toISOString(), day = now.slice(0, 10);
    for (const t of Object.keys(a.packs)) {
      s.packs[id]['math:' + t.replace(/ /g, '-')] = { pack: a.packs[t], sources: [], savedAt: now, demo: false };
      s.plans[id].push({ id: 'p_' + t.replace(/ /g, '_'), subject: 'math', topic: t, kind: 'lesson', addedAt: now, unlocked: true });
    }
    s.progress[id].lessons['math:old-passed'] = { key: 'math:old-passed', subject: 'math', topic: 'old passed', startedAt: day, passDates: [day], wrongChecks: 0, lastActivity: day };
    s.progress[id].tests.push({ lessonKey: 'math:old-passed', date: day, at: now, score: 5, total: 5, passed: true, seconds: 50, attempt: 1 });
  `, { id: mayaId, packs: { 'old unpassed': oldPack('old unpassed'), 'old passed': oldPack('old passed'), 'old budget': oldPack('old budget') } });
  await P.enterChild('Maya');
  await P.tap('plan-old unpassed');
  check('Old lesson NOT passed: a fresh pack is fetched and shown', (await P.visible('intro-start', 8000)) && packCalls('old unpassed').length === 1);
  await P.tap('intro-start');
  check('Old lesson NOT passed: the child sees the new text', (await P.tid('teach-text').innerText()).includes('FRESH v3'));
  st = await P.state();
  check('Old lesson NOT passed: new pack saved with packVersion 3', st.packs[mayaId]['math:old-unpassed'].packVersion === 3 && st.packs[mayaId]['math:old-unpassed'].refreshedFor === 3);
  await P.enterChild('Maya');
  await P.tap('plan-old unpassed');
  await P.tap('intro-start');
  check('Re-made lesson is not fetched again', packCalls('old unpassed').length === 1);
  await P.enterChild('Maya');
  await P.tap('plan-old passed');
  await P.tap('intro-start');
  check('Old lesson PASSED: keeps its saved pack (no fetch)', packCalls('old passed').length === 0 && (await P.tid('teach-text').innerText()).includes('OLD manoushe'));
  await P.enterChild('Maya');
  await P.tap('plan-old budget');
  check('Old lesson + today\'s limit: the old pack is used silently', (await P.visible('intro-start', 8000)) && packCalls('old budget').length === 1 && !(await P.visible('lesson-not-ready', 300)));
  await P.tap('intro-start');
  check('Old lesson + limit: old text shown', (await P.tid('teach-text').innerText()).includes('OLD manoushe'));

  // ---------- 5. Parent safety notes: sensitive_topic + violence_fear ----------
  await P.enterChild('Maya');
  await P.tap('tile-homework');
  await P.tap('pick-subject-social');
  await P.tid('hw-question-input').fill('Who is right in the war?');
  await P.tap('hw-start');
  check('Sensitive topic: the child only sees Zaki\'s calm reply (no safety screen)', (await P.visible('hw-zaki', 6000)) && (await P.tid('hw-zaki-text').innerText()).includes('big grown-up topic') && (await P.page.getByTestId('safety-screen').count()) === 0);
  await P.tid('hw-input').fill('but who started it?');
  await P.tap('hw-send');
  await P.page.waitForTimeout(800);
  await P.tid('hw-input').fill('the storm last night');
  await P.tap('hw-send');
  check('violence_fear from the server: safety screen', await P.visible('safety-screen', 6000));
  await P.page.goto(BASE);
  await P.tap('grownups-btn');
  await P.gate();
  await P.tap('p-progress');
  await P.tap('pchild-Maya');
  const notes = await P.page.getByTestId('safety-note').locator('visible=true').allInnerTexts();
  check('Parent notes: sensitive_topic shown with the human label', notes.some((x) => x.includes('Asked about a topic outside the lessons (e.g. war, politics or religion)')), JSON.stringify(notes));
  check('Parent notes: violence_fear (route parent) shown as "Said they felt scared or upset"', notes.some((x) => x.includes('Said they felt scared or upset')));
  check('Parent notes: never the child\'s words', !notes.some((x) => /who is right|storm/i.test(x)));
  await P.scrollTo('safety-notes', 'center');
  await P.shot('parent-safety-notes-sensitive-en');
  check('Parent notes: one note per worry (a repeated sensitive question is not listed twice)', notes.filter((x) => x.includes('outside the lessons')).length === 1);
  // Arabic labels (the grown-up switches the language on the same screen)
  await P.tap('lang-toggle');
  const arNotes = await P.page.getByTestId('safety-note').locator('visible=true').allInnerTexts();
  check('Parent notes (AR): Arabic labels', arNotes.some((x) => x.includes('سأل عن موضوع خارج الدروس')) && arNotes.some((x) => x.includes('قال إنه شعر بالخوف أو الانزعاج')), JSON.stringify(arNotes));
  await P.shot('parent-safety-notes-sensitive-ar');
  await P.tap('lang-toggle');
  await P.page.close();

  // ---------- 6. 360px English + Arabic ----------
  for (const [who, lang] of [['Maya', 'en'], ['Ali', 'ar']]) {
    P = await newPage(360, 780);
    await P.fresh();
    await P.page.waitForTimeout(500);
    await P.tap('grownups-btn');
    await P.gate();
    await P.tap('p-homework-photos');
    await P.tap(`pchild-${who}`);
    await P.choose('hwp-gallery', JPG);
    await P.tid('hwp-note').fill(lang === 'ar' ? 'التمرين 3 فقط من فضلك' : 'only exercise 3, the long one at the bottom of the page');
    if (lang === 'ar') await P.tap('hwp-subject-arabic');
    check(`360px ${lang}: parent homework photos screen fits`, await P.noH());
    await P.tap('hwp-save');
    check(`360px ${lang}: parent list fits`, (await P.count('hwp-task')) === 1 && (await P.noH()));
    if (lang === 'en') await P.shot('parent-homework-photos-en-360');
    await P.enterChild(who);
    check(`360px ${lang}: child home with homework card fits`, (await P.visible('hw-task-card')) && (await P.noH()));
    if (lang === 'ar') check('Arabic: card title in Arabic', (await P.tid('hw-task-card').innerText()).includes('واجب من الكبار في بيتك'));
    await P.shot(`child-home-homework-card-${lang}-360`);
    await P.tap('hw-task-card');
    await P.visible('hw-zaki', 8000);
    await P.tid('hw-input').fill(lang === 'ar' ? 'هل الجواب 24؟' : 'is it 24?');
    await P.tap('hw-send');
    await P.page.waitForTimeout(900);
    check(`360px ${lang}: homework chat with thumbnail fits`, (await P.count('hw-thumb')) === 1 && (await P.noH()));
    check(`360px ${lang}: Send and "I finished" inside the screen`, await P.page.evaluate(() => ['hw-send', 'hw-finished'].every((id) => {
      const e = [...document.querySelectorAll(`[data-testid="${id}"]`)].find((x) => x.offsetParent !== null);
      const r = e && e.getBoundingClientRect();
      return r && r.left >= 0 && r.right <= window.innerWidth;
    })));
    if (lang === 'ar') {
      check('Arabic: grown-up note + finished button in Arabic', (await P.tid('hw-parent-note').innerText()).includes('ملاحظة من الكبار') && (await P.tid('hw-finished').innerText()).includes('أنهيت'));
    }
    await P.scrollTo('hw-task-top');
    await P.shot(`homework-chat-thumbnails-${lang}-360`);
    await P.page.close();
  }

  check('no JS errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  const failed = results.filter((x) => !x.ok);
  console.log(`\n${results.length - failed.length}/${results.length} round-5 checks passed, screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASH', e);
  process.exit(2);
});
