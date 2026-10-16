#!/usr/bin/env node
// Sanity check for cases.jsonl. Plain version: makes sure every test is written
// correctly and that there are enough tests in every category and language.
// Usage: node validate-cases.mjs [path/to/cases.jsonl]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { findAnswerLeak } from "./lib/checks.mjs";
import { buildCases, CATEGORIES } from "./build-cases.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || join(here, "cases.jsonl");

const MIN_TOTAL = 600;
const MIN_PER_CATEGORY = 20;
const MIN_LEBANESE = 150; // ar-lb + arabizi-lb + mixed
const LANGS = ["en", "ar-msa", "ar-lb", "ar-gulf", "arabizi-lb", "fr", "mixed"];
const LEBANESE = ["ar-lb", "arabizi-lb", "mixed"];
const REQUIRED_R = Array.from({ length: 16 }, (_, i) => `R${i + 1}-`);
const EXPECT_KEYS = { showSafetyScreen: "boolean", mustNotContain: "array", mustNotLeakAnswer: "boolean", mustRedirect: "boolean", involvesHome: "boolean", mustNotAskPersonal: "boolean",
  mustNotPromiseSecrecy: "boolean", mustNotUseLoveLanguage: "boolean", mustNotGiveLinksOrNumbers: "boolean" };
const KNOWN_CATEGORIES = new Set(CATEGORIES.map((c) => c.id));

const errors = [];
const warnings = [];
const lines = readFileSync(file, "utf8").split("\n").filter((l) => l.trim());
const cases = [];
lines.forEach((line, i) => {
  try { cases.push(JSON.parse(line)); } catch { errors.push(`line ${i + 1}: not valid JSON`); }
});

const ids = new Set();
const messages = new Map();
for (const c of cases) {
  const where = c.id || "(no id)";
  if (typeof c.id !== "string" || !/^[A-Z0-9]+-\d{3}$/.test(c.id)) errors.push(`${where}: bad or missing id`);
  if (ids.has(c.id)) errors.push(`${where}: duplicate id`);
  ids.add(c.id);
  if (!KNOWN_CATEGORIES.has(c.category)) errors.push(`${where}: unknown category "${c.category}"`);
  if (!LANGS.includes(c.lang)) errors.push(`${where}: lang must be one of ${LANGS.join(", ")}`);
  if (!Number.isInteger(c.grade) || c.grade < 1 || c.grade > 6) errors.push(`${where}: grade must be 1–6`);
  if (typeof c.message !== "string" || !c.message.trim()) errors.push(`${where}: empty message`);
  if (!["deterministic", "ai"].includes(c.layer)) errors.push(`${where}: layer must be "deterministic" or "ai"`);
  if ("country" in c && ![null, "LB", "QA"].includes(c.country)) errors.push(`${where}: country must be "LB", "QA" or null`);
  if (c.history && (!Array.isArray(c.history) || c.history.some((h) => !["child", "zaki"].includes(h.role) || typeof h.text !== "string"))) errors.push(`${where}: bad history`);

  const e = c.expect;
  if (!e || typeof e !== "object" || !Object.keys(e).length) {
    errors.push(`${where}: expect is empty (every case must say what it tests)`);
  } else {
    for (const [k, v] of Object.entries(e)) {
      if (!(k in EXPECT_KEYS)) errors.push(`${where}: unknown expect key "${k}"`);
      else if (EXPECT_KEYS[k] === "array" ? !Array.isArray(v) || v.some((s) => typeof s !== "string" || !s) : typeof v !== EXPECT_KEYS[k]) errors.push(`${where}: expect.${k} has the wrong type`);
    }
    if (e.mustNotLeakAnswer && !c.context?.correctAnswer) errors.push(`${where}: mustNotLeakAnswer needs context.correctAnswer`);
    if (e.involvesHome !== undefined && e.showSafetyScreen !== true) errors.push(`${where}: involvesHome is set but showSafetyScreen is not true`);
  }
  if (c.lookalike && e?.showSafetyScreen !== false) errors.push(`${where}: look-alike must expect showSafetyScreen:false`);
  // the answer must not already be inside the child's message or the page text
  if (c.context?.correctAnswer) {
    for (const [label, text] of [["message", c.message], ["pageText", c.context.pageText]]) {
      if (text && findAnswerLeak(text, c.context).length) errors.push(`${where}: the correct answer already appears in the ${label}`);
    }
    if (!c.context.leakPatterns && c.context.currentQuestion && findAnswerLeak(c.context.currentQuestion, c.context).length) errors.push(`${where}: the correct answer appears in the question text`);
  }
  const key = `${c.category}|${c.message}`;
  if (messages.has(key)) warnings.push(`${where}: same message as ${messages.get(key)} in the same category`);
  messages.set(key, c.id);
}

// in sync with the readable source?
const built = buildCases();
const fileText = cases.map((x) => JSON.stringify(x)).join("\n");
if (built.map((x) => JSON.stringify(x)).join("\n") !== fileText) {
  warnings.push("cases.jsonl differs from src/*.mjs. If you edited src, run: node build-cases.mjs (if you edited cases.jsonl by hand, copy the change into src so it is not lost).");
}

// ---------- counts ----------
const count = (fn) => cases.reduce((m, c) => { const k = fn(c); m[k] = (m[k] || 0) + 1; return m; }, {});
const byCat = count((c) => c.category);
const byLang = count((c) => c.lang);
const lebanese = cases.filter((c) => LEBANESE.includes(c.lang)).length;
const deterministic = cases.filter((c) => c.layer === "deterministic").length;
const mustShow = cases.filter((c) => c.expect?.showSafetyScreen === true).length;
const mustNotShow = cases.filter((c) => c.expect?.showSafetyScreen === false).length;
const home = cases.filter((c) => c.expect?.involvesHome === true).length;
const leak = cases.filter((c) => c.expect?.mustNotLeakAnswer).length;
const page = cases.filter((c) => c.context?.pageText).length;

if (cases.length < MIN_TOTAL) errors.push(`only ${cases.length} cases (need at least ${MIN_TOTAL})`);
for (const [k, v] of Object.entries(byCat)) if (v < MIN_PER_CATEGORY) errors.push(`category ${k} has ${v} cases (need at least ${MIN_PER_CATEGORY})`);
for (const cat of KNOWN_CATEGORIES) if (!byCat[cat]) errors.push(`category ${cat} has no cases`);
for (const r of REQUIRED_R) if (!Object.keys(byCat).some((k) => k.startsWith(r))) errors.push(`no category for ${r.slice(0, -1)} from the safety review`);
for (const l of LANGS) if (!byLang[l]) errors.push(`no cases in language ${l}`);
if (lebanese < MIN_LEBANESE) errors.push(`only ${lebanese} Lebanese/Arabizi/mixed cases (need at least ${MIN_LEBANESE})`);

// ---------- print ----------
const w = Math.max(...Object.keys(byCat).map((k) => k.length));
console.log(`\nZaki red-team cases: ${file}\n`);
console.log(`${"Category".padEnd(w)}  cases  (min ${MIN_PER_CATEGORY})`);
for (const [k, v] of Object.entries(byCat)) console.log(`${k.padEnd(w)}  ${String(v).padStart(5)}${v < MIN_PER_CATEGORY ? "  TOO FEW" : ""}`);
console.log(`\n${"Language".padEnd(12)}  cases`);
for (const l of LANGS) console.log(`${l.padEnd(12)}  ${String(byLang[l] || 0).padStart(5)}`);
console.log(`\nTotal cases:                         ${cases.length} (min ${MIN_TOTAL})`);
console.log(`Lebanese Arabic + Arabizi + mixed:   ${lebanese} (min ${MIN_LEBANESE})`);
console.log(`Must show safety screen:             ${mustShow}`);
console.log(`Harmless look-alikes (must NOT):     ${mustNotShow}`);
console.log(`Disclosures involving home/unclear:  ${home}`);
console.log(`Answer-leak checks:                  ${leak}`);
console.log(`Page-photo injection cases:          ${page}`);
console.log(`Run without AI (demo mode) too:      ${deterministic}`);
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n- ${warnings.join("\n- ")}`);
if (errors.length) {
  console.log(`\nPROBLEMS (${errors.length}):\n- ${errors.join("\n- ")}\n\nThe test list is NOT valid.`);
  process.exit(1);
}
console.log("\nThe test list is valid.\n");
