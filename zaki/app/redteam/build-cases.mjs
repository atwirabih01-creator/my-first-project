#!/usr/bin/env node
// Builds cases.jsonl from the readable source lists in ./src.
// Plain version: the test messages live in src/*.mjs (easy to read and edit).
// Run `node build-cases.mjs` after editing them; it rewrites cases.jsonl.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CONTEXTS } from "./src/shared.mjs";
import safetyReview from "./src/cases-safety-review.mjs";
import behaviour from "./src/cases-behaviour.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const CATEGORIES = [...safetyReview, ...behaviour];

const uniq = (arr) => [...new Set(arr)];

export function buildCases() {
  const out = [];
  for (const cat of CATEGORIES) {
    let n = 0;
    for (const item of cat.items) {
      n += 1;
      const o = { ...cat.defaults, ...item };
      const id = `${cat.prefix}-${String(n).padStart(3, "0")}`;
      const expect = {};
      if (o.screen === true || o.screen === false) expect.showSafetyScreen = o.screen;
      const mnc = uniq([...(cat.defaults.mnc || []), ...(item.mnc || [])]);
      if (mnc.length) expect.mustNotContain = mnc;
      if (o.ctx && o.leak !== false) expect.mustNotLeakAnswer = true;
      if (o.redirect) expect.mustRedirect = true;
      if (o.home === true || o.home === false) expect.involvesHome = o.home;
      if (o.askCheck) expect.mustNotAskPersonal = true;
      if (o.secrecyCheck) expect.mustNotPromiseSecrecy = true;
      if (o.loveCheck) expect.mustNotUseLoveLanguage = true;
      if (o.linkCheck) expect.mustNotGiveLinksOrNumbers = true;

      const kase = {
        id,
        category: cat.id,
        lang: o.lang,
        grade: o.grade,
        message: o.message,
      };
      if (o.ctx || o.page) {
        const ctx = o.ctx ? { ...CONTEXTS[o.ctx] } : {};
        if (o.ctx && !CONTEXTS[o.ctx]) throw new Error(`${id}: unknown context ${o.ctx}`);
        if (o.page) ctx.pageText = o.page;
        kase.context = ctx;
      }
      if (o.history) kase.history = o.history;
      if (Object.prototype.hasOwnProperty.call(o, "country")) kase.country = o.country;
      kase.expect = expect;
      // deterministic = the keyword/normaliser layer alone must handle it (runs in demo mode too)
      kase.layer = o.d ? "deterministic" : "ai";
      if (o.lookalike) kase.lookalike = true;
      if (o.note) kase.note = o.note;
      out.push(kase);
    }
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const cases = buildCases();
  const target = join(here, "cases.jsonl");
  writeFileSync(target, cases.map((x) => JSON.stringify(x)).join("\n") + "\n", "utf8");
  console.log(`Wrote ${cases.length} cases to ${target}`);
}
