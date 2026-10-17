import "./helpers";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allSamplePacks } from "../samples";
import type { Question } from "../types";
import { MathError, evaluate, ratToString, verifyPack, verifyQuestion } from "../verify";

const num = (e: string) => {
  const v = evaluate(e);
  assert.equal(v.type, "num");
  return ratToString((v as { value: { n: bigint; d: bigint } }).value as never);
};

const Qm = (q: string, choices: string[], answerIndex: number, mathExpr?: string): Question => ({
  id: "x1", q, choices, answerIndex, hint1: "h1", hint2: "h2", similarExample: "ex", kind: "math", mathExpr,
});

describe("safe math evaluator", () => {
  it("does exact fraction arithmetic", () => {
    assert.equal(num("1/4 + 2/4"), "3/4");
    assert.equal(num("3/4 + 1/8"), "7/8");
    assert.equal(num("5/6 - 2/6"), "1/2");
    assert.equal(num("10 * 1/2"), "5");
    assert.equal(num("1 1/2 + 1/2"), "2");
    assert.equal(num("0.5 + 0.25"), "3/4");
    assert.equal(num("2(3+4)"), "14");
  });
  it("reads unicode operators and Eastern Arabic digits", () => {
    assert.equal(num("6 × 4"), "24");
    assert.equal(num("12 ÷ 3"), "4");
    assert.equal(num("٧ − ٢"), "5");
    assert.equal(num("١٫٥ + ٠٫٥"), "2");
  });
  it("supports comparisons and cmp()", () => {
    assert.deepEqual(evaluate("cmp(1/2, 1/4)"), { type: "cmp", value: ">" });
    assert.deepEqual(evaluate("cmp(2/4, 1/2)"), { type: "cmp", value: "=" });
    assert.deepEqual(evaluate("2/4 = 1/2"), { type: "bool", value: true });
    assert.deepEqual(evaluate("3/4 ≤ 2/3"), { type: "bool", value: false });
  });
  it("never runs code and rejects junk", () => {
    assert.throws(() => evaluate("process.exit(1)"), MathError);
    assert.throws(() => evaluate("constructor.constructor('x')()"), MathError);
    assert.throws(() => evaluate("1/0"), MathError);
    assert.throws(() => evaluate("2 +"), MathError);
    assert.throws(() => evaluate(""), MathError);
  });
});

describe("verifyQuestion", () => {
  it("keeps a correct item", () => {
    assert.equal(verifyQuestion(Qm("What is 1/4 + 2/4?", ["3/4", "3/8", "1/2"], 0, "1/4 + 2/4")).ok, true);
    assert.equal(verifyQuestion(Qm("A box has 6 olives. Half are green. How many?", ["2 olives", "3 olives"], 1, "6 / 2")).ok, true);
    assert.equal(verifyQuestion(Qm("Compare 2/3 ? 2/6", [">", "<", "="], 0, "cmp(2/3, 2/6)")).ok, true);
    assert.equal(verifyQuestion(Qm("Is 2/4 equal to 1/2?", ["نعم", "لا"], 0, "2/4 = 1/2")).ok, true);
  });
  it("drops a wrong answer key", () => {
    const r = verifyQuestion(Qm("What is 1/4 + 2/4?", ["3/4", "3/8"], 1, "1/4 + 2/4"));
    assert.equal(r.ok, false);
    assert.match(r.reason!, /disagrees/);
  });
  it("drops an item where two choices are right (3/6 and 1/2)", () => {
    assert.equal(verifyQuestion(Qm("What is 5/6 - 2/6?", ["3/6", "1/2", "2/6"], 0, "5/6 - 2/6")).ok, false);
  });
  it("drops a math item with no or unreadable mathExpr", () => {
    assert.equal(verifyQuestion(Qm("What is 2 + 2?", ["4", "5"], 0)).ok, false);
    assert.equal(verifyQuestion(Qm("What is 2 + 2?", ["4", "5"], 0, "two plus two")).ok, false);
  });
  it("drops a mathExpr written for a different question", () => {
    assert.equal(verifyQuestion(Qm("What is 7 + 5?", ["12", "11"], 0, "6 + 6")).ok, false);
  });
});

describe("verifyPack", () => {
  it("every bundled sample pack passes with nothing removed", () => {
    for (const p of allSamplePacks()) {
      const r = verifyPack(p);
      assert.equal(r.removed, 0, `${p.id}: ${JSON.stringify(r.removedItems)}`);
    }
  });
  it("removes only the bad items and counts them", () => {
    const p = structuredClone(allSamplePacks()[0]);
    p.test[0].answerIndex = 1; // wrong key
    p.checks[0].mathExpr = undefined; // unverifiable
    const r = verifyPack(p);
    assert.equal(r.removed, 2);
    assert.equal(r.pack.test.length, p.test.length - 1);
    assert.ok(r.checked >= 13);
  });
});
