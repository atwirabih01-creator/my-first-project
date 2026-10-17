import "./helpers";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handleParentMessage, parseDate, parseStudyTime } from "../parent";

const NOW = new Date("2026-10-16T09:00:00Z"); // Friday, 16 Oct 2026
const h = (t: string, lang: "en" | "ar" = "en") => handleParentMessage(t, lang, "LB", NOW);

describe("parent WhatsApp simulator routing", () => {
  it("commands in English and Arabic", () => {
    assert.equal(h("REPORT").action, "send_report");
    assert.equal(h("تقرير", "ar").action, "send_report");
    assert.equal(h("plan").action, "show_plan");
    assert.equal(h("PAUSE").action, "pause_reminders");
    assert.equal(h("HELP").intent, "help");
    assert.equal(h("STOP").action, "opt_out");
    assert.equal(h("إيقاف", "ar").action, "opt_out");
    assert.equal(h("DELETE MY DATA").action, "request_deletion");
    assert.equal(h("احذف بياناتي", "ar").action, "request_deletion");
    assert.match(h("DELETE MY DATA").reply, /10 days/);
  });
  it("test dates become a plan", () => {
    const r = h("Math test on Thursday about fractions");
    assert.equal(r.intent, "test");
    assert.deepEqual(r.plan, { subject: "math", topic: "fractions", dueDate: "2026-10-22", sessions: 4 });
    const a = h("امتحان علوم بكرا عن النباتات", "ar");
    assert.equal(a.plan?.subject, "science");
    assert.equal(a.plan?.topic, "النباتات");
    assert.equal(a.plan?.dueDate, "2026-10-17");
    assert.equal(a.plan?.sessions, 1);
    assert.match(a.reply, /جلسة دراسة واحدة/);
    assert.equal(h("English exam on 22/10").plan?.dueDate, "2026-10-22");
    assert.equal(h("Arabic test 2026-11-02").plan?.dueDate, "2026-11-02");
  });
  it("lesson names and study times", () => {
    const l = h("Science lesson: the water cycle");
    assert.equal(l.intent, "lesson");
    assert.equal(l.plan?.topic, "the water cycle");
    assert.equal(h("Study at 5pm").studyTime, "17:00");
    assert.equal(h("الدراسة الساعة 5 مساء", "ar").studyTime, "17:00");
  });
  it("asks for the subject when it is missing", () => {
    const r = h("test tomorrow");
    assert.equal(r.intent, "test");
    assert.equal(r.plan, undefined);
  });
  it("anything else gets the fixed polite redirect to the app", () => {
    for (const t of ["What's the weather?", "Can you write my CV?", "my son is being bullied, what should I do", "Buy now!"]) {
      const r = h(t);
      assert.equal(r.intent, "other", t);
      assert.match(r.reply, /open the Zaki app/);
    }
    assert.match(h("كيف حالك؟", "ar").reply, /تطبيق ذكي/);
  });
  it("date and time parsers", () => {
    assert.equal(parseDate("today", NOW, "QA"), "2026-10-16");
    assert.equal(parseDate("on Friday", NOW, "LB"), "2026-10-23");
    assert.equal(parseDate("22 October", NOW, "LB"), "2026-10-22");
    assert.equal(parseDate("in 3 days", NOW, "LB"), "2026-10-19");
    assert.equal(parseStudyTime("at 4:30 pm"), "16:30");
    assert.equal(parseStudyTime("hello"), undefined);
  });
});
