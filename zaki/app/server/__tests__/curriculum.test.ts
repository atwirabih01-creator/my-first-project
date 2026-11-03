import "./helpers";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_SUBJECTS, CURRICULUM, GRADES, effectiveAge, levelGuide, subjectsForGrade, topicsFor } from "../../src/lib/curriculum";
import { HttpError, asGrade, asOptionalAge, asSubject } from "../http";
import { keywordCategory, keywordScan } from "../keywordScan";
import { getSamplePack } from "../samples";
import { SUBJECTS } from "../types";

describe("grades 1-9, age and new subjects (validation)", () => {
  it("accepts grades 1-9 and rejects 0, 10 and non-integers", () => {
    for (const g of [1, 6, 7, 8, 9]) assert.equal(asGrade(g), g);
    for (const bad of [0, 10, 6.5, "7", null]) assert.throws(() => asGrade(bad), HttpError);
  });

  it("age is optional (old profiles) and must be a whole number from 5 to 16", () => {
    assert.equal(asOptionalAge(undefined), undefined);
    assert.equal(asOptionalAge(null), undefined);
    assert.equal(asOptionalAge(5), 5);
    assert.equal(asOptionalAge(16), 16);
    for (const bad of [4, 17, 9.5, "10", -1]) assert.throws(() => asOptionalAge(bad), HttpError);
  });

  it("physics, chemistry and biology are accepted subjects", () => {
    for (const s of ["physics", "chemistry", "biology", "math", "science", "english", "arabic", "social"]) assert.equal(asSubject(s), s);
    assert.throws(() => asSubject("history"), HttpError);
    assert.deepEqual([...SUBJECTS].sort(), [...ALL_SUBJECTS].sort());
  });

  it("a subject without its own demo pack falls back to a sample (never crashes)", () => {
    for (const s of ["physics", "chemistry", "biology"] as const) {
      for (const lang of ["en", "ar"] as const) {
        const p = getSamplePack(s, lang);
        assert.equal(p.subject, s);
        assert.equal(p.lang, lang);
        assert.ok(p.test.length >= 3);
      }
    }
  });
});

describe("curriculum map", () => {
  it("subjectsForGrade: physics/chemistry/biology only in grades 7-9; science in every grade", () => {
    for (const g of [1, 2, 3, 4, 5, 6]) {
      const subs = subjectsForGrade(g);
      assert.ok(subs.includes("science"));
      for (const s of ["physics", "chemistry", "biology"] as const) assert.ok(!subs.includes(s), `${s} in grade ${g}`);
    }
    for (const g of [7, 8, 9]) {
      const subs = subjectsForGrade(g);
      for (const s of ["science", "physics", "chemistry", "biology", "math", "english", "arabic", "social"] as const) assert.ok(subs.includes(s), `${s} in grade ${g}`);
    }
  });

  it("topicsFor: 6-12 topics for every grade and offered subject, English + Arabic names", () => {
    for (const g of GRADES) {
      for (const s of subjectsForGrade(g)) {
        const topics = topicsFor(g, s);
        assert.ok(topics.length >= 6 && topics.length <= 12, `grade ${g} ${s}: ${topics.length}`);
        for (const t of topics) {
          assert.ok(t.en.trim().length >= 3 && t.en.length <= 80, t.en);
          assert.ok(/[؀-ۿ]/.test(t.ar) && t.ar.length <= 80, t.ar);
        }
      }
    }
    assert.deepEqual(topicsFor(4, "physics"), []);
    // A returned list is a copy: changing it does not change the map.
    topicsFor(1, "math")[0].en = "changed";
    assert.notEqual(CURRICULUM[1].math![0].en, "changed");
  });

  it("every curriculum topic passes the safety word lists (a child may pick any of them)", () => {
    for (const g of GRADES) {
      for (const s of subjectsForGrade(g)) {
        for (const t of topicsFor(g, s)) {
          for (const text of [t.en, t.ar]) assert.equal(keywordCategory(keywordScan(text)), "none", `grade ${g} ${s}: ${text}`);
        }
      }
    }
  });

  it("levelGuide: simple for grades 1-2, more detail for 7-9, age-aware with a grade + 5 fallback", () => {
    assert.equal(effectiveAge(3), 8);
    assert.equal(effectiveAge(3, 9), 9);
    assert.equal(effectiveAge(3, 40), 8);
    const g1 = levelGuide(1);
    assert.match(g1, /^Grade 1, age 6\./);
    assert.match(g1, /very simple/i);
    const g8 = levelGuide(8, 13);
    assert.match(g8, /Middle-school/);
    assert.match(g8, /algebra/);
    assert.match(levelGuide(9), /quadratics/);
    assert.match(levelGuide(5, 8), /younger than most/);
    assert.match(levelGuide(2, 11), /older than most/);
  });
});
