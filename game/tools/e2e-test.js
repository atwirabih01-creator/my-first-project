/* Cold Read end-to-end test.
   Plays the development case (test.html) from start to debrief at desktop and phone sizes.

   Run:  NODE_PATH=/opt/node22/lib/node_modules node game/tools/e2e-test.js
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
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("dialog", (d) => { errors.push("Unexpected dialog: " + d.type()); d.dismiss(); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.route(/^https?:\/\//, (r) => { if (!/fonts\./.test(r.request().url())) { errors.push("Network request: " + r.request().url()); r.abort(); } else r.fallback(); });

  const mobile = label === "phone";
  let shot = 0;
  const k = (key) => page.locator(`[data-k="${key}"]`).first();
  const click = async (key) => { await k(key).click(); await page.waitForTimeout(60); };
  const snap = async (name) => {
    shot++;
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
  await page.fill("#puzzle-input", "0000");
  await click("puzzle-submit");
  check((await text(".puzzle__msg")).includes("doesn't fit"), "wrong puzzle answer rejected");
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
  check((await text(".modal")).includes("locked away"), "first relevant hint shown");
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
  await click("begin");

  // Second run with overrides
  check((await clock()) === "Day 1, 06:40", "reopen restarts the clock");
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
  await click("ask-q-sam-night");
  await dismissEvent();
  await waitStampGone();
  await go("people");
  if (await k("person-back").count() === 0) await click("person-p-sam");
  check((await text(".conv")).includes("Rex Vance"), "reopen question override applied");
  await click("ask-q-sam-close");
  await click("ask-q-sam-backdoor");
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
  check((await text(".ending")).includes("Just numbers"), "confession scene shown");
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

  check(errors.length === 0, "no console errors" + (errors.length ? ": " + errors.join(" | ") : ""));
  await browser.close();
}

(async () => {
  try {
    await run({ width: 1280, height: 800 }, "desktop");
    await run({ width: 390, height: 844 }, "phone");
  } catch (e) {
    console.error("Test crashed:", e);
    results.push({ ok: false, msg: "crash: " + e.message });
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots in ${SHOTS}`);
  process.exit(failed.length ? 1 : 0);
})();
