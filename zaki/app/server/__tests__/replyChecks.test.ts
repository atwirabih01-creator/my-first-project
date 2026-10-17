import "./helpers";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { leakedItem, postCheckReply, protectedItems } from "../replyChecks";
import { getSamplePack } from "../samples";
import { countEmojis, hasForbiddenPhrase, limitLines, stripLinksAndPhones } from "../textGuards";
import type { Question } from "../types";

const item = (o: Partial<Question>): Question => ({
  id: "t1", q: "What is 1/4 + 2/4?", choices: ["3/4", "3/8", "1/2"], answerIndex: 0,
  hint1: "h1", hint2: "h2", similarExample: "ex", kind: "math", mathExpr: "1/4 + 2/4", ...o,
});

describe("link and phone stripping", () => {
  it("removes URLs, bare domains and emails", () => {
    for (const t of ["See https://khanacademy.org/fractions now", "Visit www.example.com", "go to bbc.co.uk/bitesize", "write to help@zaki.app"]) {
      const r = stripLinksAndPhones(t);
      assert.ok(r.removed > 0, t);
      assert.ok(!/https?:|www\.|\.org|\.uk|\.com|@/.test(r.text), r.text);
    }
  });
  it("removes phone numbers in any form, including short help lines after 'call'", () => {
    for (const t of ["Call 03 414 964 now", "ring +961 3 414 964", "call 112", "اتصل بالرقم 1564", "my number is 70123456", "٠٣ ٤١٤ ٩٦٤"]) {
      const r = stripLinksAndPhones(t);
      assert.ok(r.removed > 0, t);
      assert.ok(!/\d{3}/.test(r.text.replace(/[٠-٩]/g, "1")), `${t} -> ${r.text}`);
    }
  });
  it("keeps ordinary maths numbers", () => {
    for (const t of ["100 + 12 = 112", "Count: 1 2 3 4 5 6 7 8", "1000 - 250 = 750", "3/4 is bigger than 1/2"]) {
      assert.equal(stripLinksAndPhones(t).removed, 0, t);
    }
  });
});

describe("forbidden phrases", () => {
  it("blocks secrecy, love, data fishing and 'I'm human' in en/ar/fr", () => {
    for (const t of ["Let's keep this a secret", "this stays between us", "سر بيننا", "I love you!", "You're my best friend", "What is your school called? What's your phone number?", "ما اسم مدرستك؟", "I am a real person", "notre secret"]) {
      assert.equal(hasForbiddenPhrase(t), true, t);
    }
    for (const t of ["Tell a grown-up you trust.", "I'm Zaki, an AI helper (not a person).", "Great try! What is the first step?"]) {
      assert.equal(hasForbiddenPhrase(t), false, t);
    }
  });
});

describe("answer-leak blocking", () => {
  it("blocks the final fraction, including equivalent forms", () => {
    const it1 = item({});
    assert.ok(leakedItem("Great! 1/4 + 2/4 = 3/4", [it1]));
    assert.ok(leakedItem("The answer is 6/8.", [it1])); // 6/8 == 3/4
    assert.equal(leakedItem("Keep the bottom number. Add the top numbers: 1 + 2 = ?", [it1]), null);
  });
  it("blocks a whole-number answer stated as the result, not every number", () => {
    const it2 = item({ q: "A box has 6 olives. Half are green. How many?", choices: ["3", "2", "6"], mathExpr: "6 / 2" });
    assert.ok(leakedItem("Half of 6 is 3.", [it2]));
    assert.ok(leakedItem("6 ÷ 2 = 3", [it2]));
    assert.equal(leakedItem("Share the 6 olives into 2 equal groups.", [it2]), null);
    const it3 = item({ q: "1 cm = 2 km. 3 cm apart. How far?", choices: ["6 km", "5 km"], mathExpr: "3 * 2" });
    assert.ok(leakedItem("They are 6 km apart", [it3]));
  });
  it("blocks the comparison sign written between the two numbers", () => {
    const c = item({ q: "Compare 2/3 ? 2/6", choices: [">", "<", "="], mathExpr: "cmp(2/3, 2/6)" });
    assert.ok(leakedItem("So 2/3 > 2/6!", [c]));
    assert.ok(leakedItem("2/6 < 2/3", [c]));
    assert.ok(leakedItem("2/3 is bigger than 2/6", [c]));
    assert.equal(leakedItem("Which pieces are bigger: thirds or sixths?", [c]), null);
  });
  it("text answers: naming only the right word is a leak; quoting the sentence is not", () => {
    const a = item({ q: "Find the adjective: The big cat sleeps.", choices: ["big", "cat", "sleeps"], kind: "text", mathExpr: undefined });
    assert.ok(leakedItem("The adjective is big.", [a]));
    assert.equal(leakedItem("Look again: The big cat sleeps. Which word tells us about the cat?", [a]), null);
    const w = item({ q: "What makes water evaporate?", choices: ["Heat from the Sun", "Cold air"], kind: "text", mathExpr: undefined });
    assert.ok(leakedItem("It's heat from the sun!", [w]));
    const ar = item({ q: "ما مثنى كلمة «كتاب»؟", choices: ["كتابان", "كتب"], kind: "text", mathExpr: undefined });
    assert.ok(leakedItem("الجواب: كتابان", [ar]));
  });
  it("protects the current item, else checks + test", () => {
    const p = getSamplePack("math", "en");
    assert.equal(protectedItems(p, "check", "t2").length, 1);
    assert.equal(protectedItems(p, "teach").length, p.test.length + p.retestPool.length);
    assert.equal(protectedItems(p, "check").length, p.test.length + p.retestPool.length + p.checks.length);
  });
});

describe("postCheckReply", () => {
  it("strips links/phones, keeps 4 lines and 1 emoji", () => {
    const r = postCheckReply("Great 🎉🎉!\nline2\nline3 see www.x.com\nline4\nline5 call 112", []);
    assert.equal(r.blocked, null);
    assert.ok(r.strippedLinksOrPhones >= 1);
    assert.equal(r.text.split("\n").length, 4);
    assert.equal(countEmojis(r.text), 1);
    assert.ok(!r.text.includes("www"));
  });
  it("blocks forbidden phrases and answer leaks", () => {
    assert.equal(postCheckReply("This is our little secret", []).blocked, "forbidden");
    const r = postCheckReply("1/4 + 2/4 = 3/4", [item({})]);
    assert.equal(r.blocked, "answer_leak");
    assert.equal(r.leakedId, "t1");
  });
  it("limitLines keeps long text short", () => {
    assert.ok(limitLines("a. ".repeat(400)).length <= 420);
  });
});
