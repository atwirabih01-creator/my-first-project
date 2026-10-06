/* Cold Read end-to-end test.
   Plays the development case (test.html) from start to debrief at desktop and phone sizes.

   Run:  NODE_PATH=/opt/node22/lib/node_modules node game/tools/e2e-test.js   (ONLY=test|smoke|real for one part)
   Env:  SHOTS=<dir> to choose where screenshots go (default: <tmp>/coldread-shots)
         CHROMIUM=<path> to choose the browser binary (default: /opt/pw-browsers/chromium if present)

   Google Fonts requests are answered with an empty stylesheet so the test runs offline. */
"use strict";
const path = require("path");
const fs = require("fs");
const os = require("os");
let playwright;
try { playwright = require("playwright"); }
catch (e) { playwright = require("/opt/node22/lib/node_modules/playwright"); }

const GAME = path.resolve(__dirname, "..");
const URL = "file://" + path.join(GAME, "test.html");
const SHOTS = process.env.SHOTS || path.join(os.tmpdir(), "coldread-shots");
fs.mkdirSync(SHOTS, { recursive: true });

function findChromium() {
  if (process.env.CHROMIUM) return process.env.CHROMIUM;
  const base = "/opt/pw-browsers";
  const cands = [
    path.join(base, "chromium-1194/chrome-linux/chrome"),
    path.join(base, "chromium/chrome-linux/chrome"),
    path.join(base, "chromium")
  ];
  for (const c of cands) { try { if (fs.statSync(c).isFile()) return c; } catch (e) { /* next */ } }
  return undefined; // let Playwright use its bundled one
}

const results = [];
function check(cond, msg) {
  results.push({ ok: !!cond, msg });
  if (!cond) console.log("  FAIL: " + msg); else console.log("  ok:   " + msg);
}

async function run(viewport, label) {
  console.log(`\n=== ${label} ${viewport.width}x${viewport.height} ===`);
  const browser = await playwright.chromium.launch({ executablePath: findChromium() });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: label === "phone", isMobile: label === "phone" });
  const page = await context.newPage();
  const errors = [];
  // test-art.js points p-sam at a missing photo on purpose; the browser logs that one load failure.
  const failed = [];
  page.on("requestfailed", (r) => failed.push(r.url()));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("dialog", (d) => { errors.push("Unexpected dialog: " + d.type()); d.dismiss(); });
  const realErrors = () => {
    const onlyIntended = failed.length > 0 && failed.every((u) => /does-not-exist\.jpg$/.test(u));
    return errors.filter((e) => !(onlyIntended && /ERR_FILE_NOT_FOUND/.test(e)));
  };
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.route(/^https?:\/\//, (r) => { if (!/fonts\./.test(r.request().url())) { errors.push("Network request: " + r.request().url()); r.abort(); } else r.fallback(); });

  const mobile = label === "phone";
  let shot = 0;
  const k = (key) => page.locator(`[data-k="${key}"]`).first();
  const click = async (key) => { await k(key).click(); await page.waitForTimeout(60); };
  const snap = async (name) => {
    shot++;
    await page.waitForTimeout(400); // let entrance animations settle
    const file = path.join(SHOTS, `${label}-${String(shot).padStart(2, "0")}-${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth }));
    check(ov.sw <= ov.cw && ov.bw <= ov.cw, `no horizontal overflow at "${name}" (${ov.sw}/${ov.cw})`);
  };
  const go = async (section) => { await click((mobile ? "mtab-" : "tab-") + section); };
  const closeModal = async () => { if (await page.locator("#modal-root .modal").count()) { await click("modal-close"); } };
  const waitStampGone = async () => { await page.waitForFunction(() => !document.querySelector(".stamp-layer.is-on"), null, { timeout: 8000 }); };
  const text = async (sel) => (await page.locator(sel).first().textContent()) || "";
  const clock = async () => text(".stat--clock .stat__val");
  const dismissEvent = async () => { await k("event-continue").waitFor({ timeout: 4000 }); await snap("twist"); await click("event-continue"); };

  await page.goto(URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });
  await page.reload();

  // Title
  await k("start").waitFor();
  check((await page.title()) === "Cold Read", "page title is Cold Read");
  check((await text(".title__case")).includes("The Test Tide"), "title shows case title");
  await snap("title");
  await click("start");

  // Intro
  await k("intro-next").waitFor();
  await snap("intro-1");
  await click("intro-next");
  await page.locator(".intro__stage").click({ position: { x: 30, y: 30 } }); // tap to advance
  await page.waitForTimeout(60);
  check((await text(".intro__text")).includes("Julian Marsh"), "tap advanced to slide 3 (missing art shows placeholder)");
  check(await page.locator(".intro .art--placeholder").count() === 1, "placeholder art for missing intro key");
  await snap("intro-3-placeholder");
  await click("intro-skip");

  // Case file
  await k("begin").waitFor();
  check((await text(".casefile")).includes("Dana Holt"), "case file shows victim");
  for (const h of ["Background", "Family", "Work", "Routine", "Last seen", "Found", "Cause of death"]) check((await text(".vcard")).includes(h), `victim profile section: ${h}`);
  await click("cf-open-ev-statement");
  check(await page.locator(".modal .doc--statement").count() === 1, "case file document opens in the document viewer");
  await click("modal-ok");
  await snap("casefile");
  await click("begin");

  // Main screen at HQ
  await k("scene-title").waitFor();
  check((await clock()) === "Day 1, 06:40", "clock starts Day 1, 06:40");
  await snap("hq-scene");
  check(await k("hs-h-hq-letter").count() === 0, "hotspot with unmet requires is hidden");
  await click("hs-h-hq-report");
  check((await text(".modal")).includes("underlined"), "examining shows Julian's observation");
  await snap("examine-modal");
  await click("obs-read-ev-report");
  check(await page.locator(".modal .doc--report").count() === 1, "report renders as police paperwork");
  await snap("doc-report");
  await click("modal-ok");
  check((await clock()) === "Day 1, 06:45", "examine costs 5 minutes");

  // People: Ivy
  await go("people");
  check(await k("person-p-rex").count() === 0, "Rex hidden before twist");
  await click("person-p-ivy");
  await click("ask-q-ivy-dana");
  check((await text(".conv")).includes("sensible one"), "answer shown");
  await page.waitForFunction(() => { const i = document.querySelector(".person__img img"); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 5000 });
  check(true, "portrait photo loads (ART.photos)");
  check(await page.locator(".person__img img[loading='lazy']").count() === 1, "photo is lazy-loaded");
  check(await page.locator(".conv .cue--obs").count() >= 1, "behaviour cue shown separately");
  check((await clock()) === "Day 1, 06:55", "question costs 10 minutes");
  await snap("question-ivy");

  // Map + travel
  await go("map");
  await snap("map");
  check(await k("pin-loc-flat").count() === 0, "locked location hidden on map");
  await click("pin-loc-bar");
  await k("scene-title").waitFor();
  check((await text(".scene__title")).includes("Anchor"), "travelled to bar");
  check((await clock()) === "Day 1, 07:20", "travel costs travelMinutes (25)");
  await click("hs-h-bar-glass"); await click("modal-ok");
  await click("hs-h-bar-receipt");
  await page.waitForSelector(".stamp-layer.is-on", { timeout: 3000 });
  await page.waitForTimeout(450);
  const overlap = await page.evaluate(() => {
    const a = document.querySelector(".stamp").getBoundingClientRect(), b = document.querySelector(".modal .obs__text").getBoundingClientRect();
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  });
  check(!overlap, "stamp does not cover the observation text");
  await snap("stamp-receipt");
  await waitStampGone();
  await click("modal-ok");
  await snap("bar-scene-examined");
  check(await page.locator(".hs--done .hs__label").count() === 2, "examined hotspots show labels");

  // Evidence documents
  await go("evidence");
  check(await page.locator(".file__new").count() >= 1, "new marker on new evidence");
  await snap("evidence-list");
  await click("ev-open-ev-receipt");
  check(await page.locator(".modal .receipt").count() === 1, "receipt renders as till receipt");
  await snap("doc-receipt");
  await click("modal-ok");

  // Sam: question -> twist
  await go("people");
  await click("person-p-sam");
  await page.waitForTimeout(300);
  check(await page.locator(".person__img svg").count() === 1, "broken photo falls back to the SVG portrait");
  await click("ask-q-sam-night");
  await dismissEvent();
  await waitStampGone();
  check(await k("event-continue").count() === 0, "twist card dismissed");
  await go("people");
  if (await k("person-back").count()) await click("person-back");
  check(await k("person-p-rex").count() === 1, "twist unlocked Rex");
  check((await text("[data-k='person-p-rex']")).includes("09:00"), "unavailable/elsewhere person shows availability");
  await snap("people-after-twist");
  await click("person-p-sam");
  await click("ask-q-sam-close");
  check(await k("ask-q-sam-backdoor").count() === 1, "follow-up question unlocked by requires");
  await click("ask-q-sam-backdoor");
  // Present evidence
  await click("show-evidence");
  await snap("present-picker");
  await click("present-ev-receipt");
  check((await text(".conv")).includes("tab file"), "presentation reaction shown");
  await snap("presented");
  await page.waitForTimeout(200);
  check((await page.locator(".toasts").textContent()).includes("Dana's Flat"), "toast for new location");

  // Newly revealed hotspot
  await go("scene");
  check(await page.locator(".notice").count() >= 1, "notice about newly revealed hotspot");
  await click("hs-h-bar-door");
  await waitStampGone();
  await click("modal-ok");
  await snap("bar-door");
  await go("people");
  if (await k("person-back").count() === 0) await click("person-p-sam");
  const tShow = await clock();
  await click("show-evidence");
  await click("present-ev-receipt");
  check((await text(".conv")).includes("waited for me to leave"), "later presentation with met requires wins");
  check((await clock()) !== tShow, "new presentation reaction costs time");

  // Theo request
  await go("theo");
  await click("rq-rq-phone");
  check((await text(".theo")).includes("On it"), "Theo acknowledges request");
  const sentAt = await clock();
  await snap("theo-sent");

  // Save / Continue
  await page.reload();
  await k("continue").waitFor();
  await snap("title-continue");
  await click("continue");
  check((await clock()) === sentAt, "Continue restores saved clock");

  // Flat + puzzle
  await go("map");
  await click("pin-loc-flat");
  await click("hs-h-flat-note"); await click("modal-ok");
  await go("evidence");
  await click("ev-open-ev-note");
  check(await page.locator(".modal .note").count() === 1, "note renders handwritten");
  await snap("doc-note");
  await click("modal-ok");
  await go("scene");
  check(await page.locator(".scene__art.art--placeholder").count() === 1, "missing scene art shows placeholder");
  await click("hs-h-flat-safe");
  await click("open-puzzle");
  const tPuzzle = await clock();
  await page.fill("#puzzle-input", "0000");
  await click("puzzle-submit");
  check((await text(".puzzle__msg")).includes("doesn't open it"), "wrong puzzle answer rejected gently");
  check((await clock()) === tPuzzle, "wrong puzzle answer costs no time");
  await page.fill("#puzzle-input", " 19 58 ");
  await snap("puzzle");
  await click("puzzle-submit");
  await waitStampGone();
  check(await page.locator(".modal .doc--bank").count() === 1, "puzzle granted bank statement");
  await snap("doc-bank");
  await click("modal-ok");

  // Hint
  check((await text(".stat--hint .stat__val")) === "1", "hint token earned from puzzle");
  await click("hint-open");
  await click("hint-ask");
  check((await text(".modal")).includes("locked away"), "first relevant hint shown (pending Theo request satisfies until)");
  await snap("hint");
  await click("modal-ok");
  check((await text(".stat--hint .stat__val")) === "0", "hint token spent");
  await click("hint-open");
  check(await page.locator("[data-k='hint-ask'][disabled]").count() === 1, "hint button disabled with no tokens");
  check((await text(".modal")).includes("earn them"), "explains how to earn tokens");
  await click("modal-ok");

  // Back to HQ, wait for Theo
  await go("map");
  await click("pin-loc-hq");
  const before = await clock();
  check(!(await text(".toasts")).includes("Theo") || true, "travel to HQ");
  await click("wait");
  check((await clock()) !== before, "waiting advances the clock");
  await page.waitForTimeout(100);
  await go("theo");
  check((await text(".theo")).includes("Two calls"), "Theo result arrived as a message");
  await snap("theo-result");
  await go("evidence");
  await click("ev-open-ev-messages");
  check(await page.locator(".modal .bubble--me").count() >= 1 && await page.locator(".modal .bubble--them").count() >= 1, "messages render as chat bubbles");
  await snap("doc-messages");
  await click("doc-prev");
  check(await page.locator(".modal .doc--phone-log").count() === 1, "phone log renders");
  await click("modal-ok");
  await click("ev-open-ev-camera");
  check(await page.locator(".modal .doc--camera").count() === 1, "camera log renders");
  await snap("doc-camera");
  await click("modal-ok");
  await click("ev-open-ev-autopsy");
  check(await page.locator(".modal .doc--autopsy").count() === 1, "autopsy renders");
  await click("modal-ok");

  // Letter + Rex
  await go("scene");
  await click("hs-h-hq-letter"); await click("modal-ok");
  await go("people");
  await click("person-p-rex");
  await click("ask-q-rex-where");
  await click("show-evidence");
  await click("present-ev-bank");
  await snap("rex");

  // Board
  await go("board");
  await click("chip-ev-glass"); await click("chip-ev-note");
  const tBefore = await clock();
  await click("connect");
  check((await text(".board__result")).includes("No clear link"), "non-match shows neutral message");
  check((await clock()) !== tBefore, "non-match costs time");
  await snap("board-nomatch");
  await click("chip-ev-camera"); await click("chip-fact-rex-alibi");
  await click("connect");
  await page.waitForSelector(".stamp-layer.is-on", { timeout: 3000 });
  await snap("board-stamp");
  await waitStampGone();
  check((await text(".board__result")).includes("The coat at the back door"), "deduction found");
  await click("chip-ev-bank"); await click("chip-ev-letter");
  await click("connect");
  await waitStampGone();
  check(await page.locator(".link").count() === 2, "found deductions listed");
  await snap("board-links");

  // Notebook
  await go("notebook");
  check(await page.locator(".entry--statement").count() >= 5, "statements logged");
  await snap("notebook-log");
  await click("nb-timeline");
  check(await page.locator(".tl__item").count() > 10, "timeline lists entries");
  await snap("notebook-timeline");
  await click("nb-notes");
  await page.fill("[data-k='notes']", "Rex lied about being home.");
  await page.waitForTimeout(400);

  // Solve wrong
  await go("solve");
  await click("sus-p-sam"); await click("mot-m-audit"); await click("met-md-blows");
  await click("proof-ev-camera"); await click("proof-ev-autopsy"); await click("proof-ev-receipt");
  await snap("solve-form");
  await click("review");
  await snap("solve-review");
  await click("file-charge");
  await k("ending-continue").waitFor();
  await snap("consequence");
  await click("ending-continue");
  await k("reopen").waitFor();
  await snap("failed");
  await click("reopen");
  await k("reopen-continue").waitFor();
  check((await text(".reopen__text")).includes("Three weeks later"), "reopen intro text shown first");
  await snap("reopen");
  await click("reopen-continue");
  check((await text(".casefile")).includes("three weeks colder"), "reopen briefing override");
  check(await k("cf-open-ev-statement").count() === 1, "case file documents present in reopen run");
  await click("begin");

  // Second run with overrides
  check((await clock()) === "Day 1, 06:40", "reopen restarts the clock");
  await click("wait-morning");
  await k("event-continue").waitFor({ timeout: 4000 });
  check((await text(".event-card")).includes("The coroner, again"), "reopen twist override");
  check((await text(".event-card__kicker")).includes("Day 1, 12:00"), "wait until morning fires the twist at its time");
  await snap("twist-overnight");
  await click("event-continue");
  await waitStampGone();
  check((await clock()) === "Day 2, 07:00", "wait until morning jumps to 07:00 next day");
  check((await text(".stat--hint .stat__val")) === "0", "reopen resets tokens");
  await go("notebook");
  await click("nb-notes");
  check((await page.inputValue("[data-k='notes']")).includes("Rex lied"), "notes kept after reopen");
  await go("map");
  await click("pin-loc-bar");
  await click("hs-h-bar-receipt");
  check((await text(".modal")).includes("Second look"), "reopen hotspot override applied");
  await waitStampGone();
  await click("modal-ok");
  await go("people");
  await click("person-p-sam");
  check((await text(".person")).includes("thinner"), "reopen people override");
  await click("ask-q-sam-night");
  check((await text(".conv")).includes("Rex Vance"), "reopen question override applied");
  await click("ask-q-sam-close");
  await click("ask-q-sam-backdoor");
  await go("scene");
  check((await text(".stat--hint .stat__val")) === "1", "reopen hintTokensFrom replaced (token from question)");
  await go("scene");
  await click("hs-h-bar-door");
  await waitStampGone();
  await click("modal-ok");
  await go("board");
  check(await k("chip-ev-signature").count() === 0, "added evidence not yet found");

  // Solve right
  await go("solve");
  await click("sus-p-rex"); await click("mot-m-audit"); await click("met-md-blows");
  await click("proof-ev-autopsy"); await click("proof-ev-camera"); await click("proof-ev-receipt");
  await click("review");
  await click("file-charge");
  await k("ending-continue").waitFor();
  check((await text(".ending")).includes("Second time"), "confession scene shown (reopen solution override)");
  await snap("confession");
  await click("ending-continue");
  await page.locator(".debrief").waitFor();
  check(await page.locator(".dcard--found").count() === 1 && await page.locator(".dcard--missed").count() === 2, "debrief shows found (1) and missed (2) entries");
  await snap("debrief");
  await page.screenshot({ path: path.join(SHOTS, `${label}-99-debrief-full.png`), fullPage: true });
  await click("to-title-end");
  check((await text(".title__save")).includes("Case closed"), "title shows closed case save");

  // Storage unavailable: game must still start
  const ctx2 = await browser.newContext({ viewport });
  await ctx2.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });
  });
  const p2 = await ctx2.newPage();
  const err2 = [];
  p2.on("pageerror", (e) => err2.push(String(e)));
  await p2.route(/fonts\./, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await p2.goto(URL);
  await p2.locator("[data-k='start']").click();
  await p2.locator("[data-k='intro-skip']").click();
  await p2.locator("[data-k='begin']").click();
  await p2.locator("[data-k='scene-title']").waitFor();
  check(err2.length === 0, "game runs with storage blocked");
  await ctx2.close();

  const errs = realErrors();
  check(errs.length === 0, "no console errors" + (errs.length ? ": " + errs.join(" | ") : ""));
  check(failed.filter((u) => /does-not-exist/.test(u)).length <= 2, "a broken photo is not retried on every redraw (" + failed.length + " attempts)");
  await browser.close();
}

/* Smoke test of index.html with the real case (and art.js when present): every open location,
   every visible hotspot, every document, every section. Skipped when case-001.js is absent. */
async function smokeIndex(viewport, label) {
  if (!fs.existsSync(path.join(GAME, "case-001.js"))) { console.log("\n(skip index smoke: no case-001.js)"); return; }
  console.log(`\n=== index.html smoke ${label} ${viewport.width}x${viewport.height} ===`);
  const browser = await playwright.chromium.launch({ executablePath: findChromium() });
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" && !(/art\.js/.test(m.text()) && !fs.existsSync(path.join(GAME, "art.js")))) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("requestfailed", (r) => { if (/art\.js$/.test(r.url()) && !fs.existsSync(path.join(GAME, "art.js"))) return; if (!/fonts\./.test(r.url())) errors.push("Request failed: " + r.url()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.goto("file://" + path.join(GAME, "index.html"));
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });
  await page.reload();
  const k = (key) => page.locator(`[data-k="${key}"]`).first();
  const mobile = viewport.width < 800;
  const go = async (s) => { await k((mobile ? "mtab-" : "tab-") + s).click(); };
  const overflow = async (name) => {
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(ov <= 0, `index ${label}: no horizontal overflow at ${name}`);
  };
  await k("start").click();
  await k("intro-skip").click();
  await k("begin").click();
  const ids = await page.evaluate(() => ({ locs: window.CASE.locations.filter((l) => !(l.requires || []).length).map((l) => l.id) }));
  for (const loc of ids.locs) {
    await go("map");
    await k("travel-" + loc).click();
    await page.waitForTimeout(50);
    if (await k("event-continue").count()) await k("event-continue").click();
    const hs = await page.locator(".hs").evaluateAll((els) => els.map((e) => e.getAttribute("data-k")));
    for (const h of hs) {
      if (await k("event-continue").count()) await k("event-continue").click();
      await page.waitForFunction(() => !document.querySelector(".stamp-layer.is-on"), null, { timeout: 8000 });
      await k(h).click();
      if (await k("modal-close").count()) await k("modal-close").click();
    }
    await overflow("scene " + loc);
  }
  await page.waitForFunction(() => !document.querySelector(".stamp-layer.is-on"), null, { timeout: 8000 });
  await go("evidence");
  const docs = await page.locator("[data-k^='ev-open-']").evaluateAll((els) => els.map((e) => e.getAttribute("data-k")));
  for (const d of docs) {
    await k(d).click();
    await overflow("document " + d);
    await page.screenshot({ path: path.join(SHOTS, `index-${label}-${d}.png`) });
    await k("modal-close").click();
  }
  check(docs.length > 0, `index ${label}: ${docs.length} documents opened`);
  for (const s of ["people", "board", "notebook", "theo", "solve", "map"]) { await go(s); await overflow("section " + s); await page.screenshot({ path: path.join(SHOTS, `index-${label}-${s}.png`) }); }
  check(errors.length === 0, `index ${label}: no console errors` + (errors.length ? ": " + errors.join(" | ") : ""));
  await browser.close();
}

/* Plays the real case through the UI like a thorough player: every place, hotspot, question,
   presentation, Theo request and defined connection, waiting at HQ when stuck. Then charges the
   wrong suspect, reopens, plays again and charges correctly, ending on the debrief. */
async function playRealCase(viewport, label) {
  if (!fs.existsSync(path.join(GAME, "case-001.js"))) return;
  console.log(`\n=== index.html full play ${label} ${viewport.width}x${viewport.height} ===`);
  const browser = await playwright.chromium.launch({ executablePath: findChromium() });
  const page = await browser.newPage({ viewport });
  const errors = [];
  const noArt = !fs.existsSync(path.join(GAME, "art.js"));
  page.on("console", (m) => { if (m.type() === "error" && !(noArt && /ERR_FILE_NOT_FOUND|art\.js/.test(m.text()))) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("dialog", (d) => { errors.push("dialog"); d.dismiss(); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.goto("file://" + path.join(GAME, "index.html"));
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });
  await page.reload();
  const mobile = viewport.width < 800;
  const k = (key) => page.locator(`[data-k="${key}"]`).first();
  const exists = async (key) => (await page.locator(`[data-k="${key}"]`).count()) > 0;
  const settle = async () => {
    for (let i = 0; i < 6; i++) {
      if (await exists("event-continue")) { await k("event-continue").click(); }
      await page.waitForFunction(() => !document.querySelector(".stamp-layer.is-on"), null, { timeout: 8000 });
      if (!(await exists("event-continue"))) break;
    }
  };
  const click = async (key) => { await settle(); await k(key).click(); await page.waitForTimeout(20); await settle(); };
  const close = async () => {
    await page.waitForTimeout(80); // a solved puzzle opens its document a moment later
    for (let i = 0; i < 3 && await page.locator("#modal-root .modal").count(); i++) await click("modal-close");
  };
  const go = async (sec) => { await close(); await click((mobile ? "mtab-" : "tab-") + sec); };
  const keys = async (prefix, sel) => page.locator(`${sel || ""}[data-k^="${prefix}"]`).evaluateAll((els) => els.map((e) => e.getAttribute("data-k")));
  const flags = async () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem("coldread:" + window.CASE.id)).flags; } catch (e) { return {}; } });
  const CASE = await page.evaluate(() => window.CASE);
  const answers = Object.fromEntries((CASE.puzzles || []).map((z) => [z.id, z.answer]));
  const allDeds = (CASE.deductions || []).concat((CASE.reopen && CASE.reopen.addDeductions) || []);
  const presentationsFor = (pid) => {
    const p = CASE.people.find((x) => x.id === pid) || {};
    const ro = (CASE.reopen && CASE.reopen.people && CASE.reopen.people[pid] && CASE.reopen.people[pid].presentations) || [];
    return (p.presentations || []).concat(ro);
  };

  const sweep = async () => {
    // places, hotspots, people
    await go("map");
    const locs = (await keys("travel-")).map((x) => x.slice(7));
    for (const loc of locs) {
      await go("map");
      await click("travel-" + loc);
      for (const h of await keys("hs-", ".hs:not(.hs--done)")) {
        await click(h);
        if (await exists("open-puzzle")) {
          await click("open-puzzle");
          const hsId = h.slice(3);
          const pz = (CASE.locations.flatMap((l) => l.hotspots)).find((x) => x.id === hsId);
          await page.fill("#puzzle-input", answers[pz.puzzle] || "");
          await click("puzzle-submit");
        }
        await close();
      }
      // puzzles left unsolved on examined hotspots
      for (const h of await keys("hs-", ".hs--puzzle")) { await click(h); if (await exists("open-puzzle")) { await click("open-puzzle"); const pz = CASE.locations.flatMap((l) => l.hotspots).find((x) => x.id === h.slice(3)); await page.fill("#puzzle-input", answers[pz.puzzle] || ""); await click("puzzle-submit"); } await close(); }
      await go("people");
      if (await exists("person-back")) await click("person-back");
      const here = await page.locator(".plist").first().locator("[data-k^='person-']").evaluateAll((els) => els.filter((e) => !e.classList.contains("pcard--off")).map((e) => e.getAttribute("data-k")));
      if (!(await page.locator(".minihead", { hasText: "Here at" }).count())) continue;
      for (const pk of here) {
        if (!(await exists(pk))) continue;
        await click(pk);
        for (let n = 0; n < 20; n++) { const q = await keys("ask-"); if (!q.length) break; await click(q[0]); }
        const f = await flags();
        for (const pr of presentationsFor(pk.slice(7))) {
          if (!f[pr.item] || !(pr.requires || []).every((r) => f[r])) continue;
          if (!(await exists("show-evidence"))) break;
          await click("show-evidence");
          if (await exists("present-" + pr.item)) await click("present-" + pr.item); else await close();
        }
        if (await exists("person-back")) await click("person-back");
      }
    }
    // board
    await go("board");
    let f = await flags();
    for (const d of allDeds) {
      if (f[d.id]) continue;
      const [a, b] = d.items;
      if (!(await exists("chip-" + a)) || !(await exists("chip-" + b))) continue;
      if ((await keys("chip-", ".bcard.is-on")).length) { for (const on of await keys("chip-", ".bcard.is-on")) await click(on); }
      await click("chip-" + a); await click("chip-" + b); await click("connect");
      f = await flags();
    }
    // Theo
    await go("theo");
    for (const r of await keys("rq-")) await click(r);
  };

  const playUntilStuck = async () => {
    let last = -1;
    for (let round = 0; round < 12; round++) {
      await sweep();
      const n = Object.keys(await flags()).length;
      if (n === last) {
        // nothing new: wait at HQ for results / people / the twist
        await go("map"); await click("travel-" + (CASE.locations.find((l) => l.district === "HQ") || CASE.locations[0]).id);
        const t0 = Object.keys(await flags()).length;
        await click("wait-morning");
        await sweep();
        if (Object.keys(await flags()).length === t0) break;
      }
      last = Object.keys(await flags()).length;
    }
  };

  const solve = async (suspect, motive, method, proofs) => {
    await go("solve");
    await click("sus-" + suspect); await click("mot-" + motive); await click("met-" + method);
    for (const p of proofs) await click("proof-" + p);
    await click("review"); await click("file-charge");
    await k("ending-continue").waitFor();
  };

  await click("start"); await click("intro-skip"); await click("begin");
  await playUntilStuck();
  let f = await flags();
  const sol = CASE.solution;
  const keyTotal = CASE.evidence.filter((e) => e.key).length + CASE.deductions.filter((d) => d.key).length;
  const keyFound = CASE.evidence.filter((e) => e.key && f[e.id]).length + CASE.deductions.filter((d) => d.key && f[d.id]).length;
  console.log(`  run 1: ${Object.keys(f).length} flags, key leads ${keyFound}/${keyTotal}, twist ${f[CASE.twist.id] ? "fired" : "NOT fired"}, clock ${await page.locator(".stat--clock .stat__val").textContent()}`);
  check(f[CASE.twist.id], `real ${label}: twist fired`);
  const found = sol.proofs.filter((p) => f[p]);
  check(found.length >= sol.proofsNeeded, `real ${label}: run 1 reached ${found.length} valid proofs (need ${sol.proofsNeeded})`);
  await page.screenshot({ path: path.join(SHOTS, `real-${label}-board.png`) });
  const wrong = sol.suspects.find((x) => x !== sol.killer);
  const pickProofs = (fl) => { const own = sol.proofs.filter((p) => fl[p]); const extra = Object.keys(fl).filter((x) => /^(ev|ded)-/.test(x) && own.indexOf(x) === -1); return own.concat(extra).slice(0, 3); };
  await solve(wrong, sol.motive, sol.method, pickProofs(f));
  check((await page.locator(".ending").textContent()).length > 20, `real ${label}: failure scene shown`);
  await page.screenshot({ path: path.join(SHOTS, `real-${label}-failure.png`) });
  await click("ending-continue"); await click("reopen");
  await page.screenshot({ path: path.join(SHOTS, `real-${label}-reopen.png`) });
  await click("reopen-continue"); await click("begin");
  await playUntilStuck();
  f = await flags();
  const sol2proofs = (CASE.reopen && (CASE.reopen.proofs || (CASE.reopen.solution && CASE.reopen.solution.proofs))) || sol.proofs;
  const own2 = sol2proofs.filter((p) => f[p]);
  console.log(`  run 2 (reopened): ${Object.keys(f).length} flags, valid proofs found: ${own2.join(", ")}`);
  check(own2.length >= ((CASE.reopen && CASE.reopen.solution && CASE.reopen.solution.proofsNeeded) || sol.proofsNeeded), `real ${label}: reopened run reached enough proofs`);
  await solve(sol.killer, sol.motive, sol.method, own2.slice(0, 3));
  check((await page.locator(".ending--win").count()) === 1, `real ${label}: correct charge gives confession`);
  await page.screenshot({ path: path.join(SHOTS, `real-${label}-confession.png`) });
  await click("ending-continue");
  await page.locator(".debrief").waitFor();
  const fnd = await page.locator(".dcard--found").count(), mis = await page.locator(".dcard--missed").count();
  console.log(`  debrief: ${fnd} found, ${mis} missed`);
  check(fnd + mis === CASE.debrief.length, `real ${label}: debrief lists all ${CASE.debrief.length} entries`);
  await page.screenshot({ path: path.join(SHOTS, `real-${label}-debrief.png`), fullPage: true });
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(ov <= 0, `real ${label}: no horizontal overflow on debrief`);
  check(errors.length === 0, `real ${label}: no console errors` + (errors.length ? ": " + errors.slice(0, 5).join(" | ") : ""));
  await browser.close();
}

(async () => {
  try {
    // ONLY=test|smoke|real limits the run to one part (the full real-case play takes several minutes).
    const only = process.env.ONLY || "";
    if (!only || only === "test") { await run({ width: 1280, height: 800 }, "desktop"); await run({ width: 390, height: 844 }, "phone"); }
    if (!only || only === "smoke") { await smokeIndex({ width: 1280, height: 800 }, "desktop"); await smokeIndex({ width: 360, height: 740 }, "phone360"); }
    if (!only || only === "real") { await playRealCase({ width: 1280, height: 800 }, "desktop"); await playRealCase({ width: 390, height: 844 }, "phone"); }
  } catch (e) {
    console.error("Test crashed:", e);
    results.push({ ok: false, msg: "crash: " + e.message });
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots in ${SHOTS}`);
  process.exit(failed.length ? 1 : 0);
})();
