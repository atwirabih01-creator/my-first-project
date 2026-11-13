// Teacher notes ("background experience", server/knowledge): matching, brief size, use in the
// lesson writer / tutor / homework prompts, data checks on every entry, and the lesson-content
// safety scan (school words such as "limestone" no longer reject a whole lesson).
import { demoMode, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { ClaudeParams } from "../ai";
import { runHomeworkTurn, type HomeworkRequest } from "../homework";
import { keywordCategory, keywordScan } from "../keywordScan";
import {
  ALL_KNOWLEDGE,
  BRIEF_MAX_CHARS,
  SHORT_BRIEF_MAX_CHARS,
  findKnowledge,
  knowledgeBrief,
  knowledgeBriefShort,
  knowledgeId,
  matchKnowledge,
  type KnowledgeEntry,
} from "../knowledge";
import { buildLessonPack, type LessonPackRequest, type LessonPackResponse } from "../lessonPack";
import { validatePack } from "../packValidator";
import { findRegionalWords } from "../regionalWords";
import { __clearFlagsForTests, moderate } from "../safety";
import { getSamplePack } from "../samples";
import { runTutorTurn, type TutorRequest } from "../tutor";
import type { SchoolProgram } from "../types";
import { validateVisual } from "../visuals";
import { topicsFor } from "../../src/lib/curriculum";

const NONE = '{"category":"none","involvesHome":false}';
const ids = (r: KnowledgeEntry[]) => r.map((e) => knowledgeId(e));
const promptText = (p: ClaudeParams) => JSON.stringify({ s: p.system, m: p.messages });
const writerCalls = (calls: ClaudeParams[]) => calls.filter((c) => !isClassifierCall(c) && !c.tools?.length);
const researchCalls = (calls: ClaudeParams[]) => calls.filter((c) => c.tools?.length);
const mockWriter = () =>
  mockClaude((p) =>
    isClassifierCall(p) ? textMsg(NONE) : p.tools?.length ? textMsg("notes") : textMsg(JSON.stringify({ ...getSamplePack("math", "en"), pageText: "" })),
  );
const lessonReq = (o: Partial<LessonPackRequest> = {}): LessonPackRequest => ({ subject: "math", topic: "Fractions", grade: 3, lang: "en", country: "LB", ...o });

afterEach(() => {
  demoMode();
  __clearFlagsForTests();
});

describe("teacher notes: findKnowledge", () => {
  it("exact topic name, English and Arabic, any case and punctuation", () => {
    assert.deepEqual(ids(findKnowledge({ grade: 3, subject: "math", topic: "Fractions" })), ["3|math|Fractions"]);
    assert.deepEqual(ids(findKnowledge({ grade: 3, subject: "math", topic: "  fractions! " })), ["3|math|Fractions"]);
    assert.deepEqual(ids(findKnowledge({ grade: 3, subject: "math", topic: "الكسور" })), ["3|math|Fractions"]);
    // The name without its "(...)" part counts as exact too.
    const m = matchKnowledge({ grade: 1, subject: "math", topic: "Comparing numbers" });
    assert.equal(m[0].id, "1|math|Comparing numbers (more, less, equal)");
    assert.equal(m[0].exact, true);
    assert.equal(m[0].strong, true);
  });

  it("fuzzy: stemmed tokens, stopwords removed, topic + vocabulary + key idea", () => {
    const eq = matchKnowledge({ grade: 4, subject: "math", topic: "the equivalent fraction lesson" });
    assert.equal(eq[0].id, "4|math|Equivalent fractions");
    assert.equal(eq[0].exact, false);
    const forces = matchKnowledge({ grade: 7, subject: "physics", topic: "forces" });
    assert.match(forces[0].id, /^7\|physics\|Forces/);
  });

  it("Arabic fuzzy: article and clitics are ignored", () => {
    const water = matchKnowledge({ grade: 3, subject: "science", topic: "دورة الماء" });
    assert.equal(water[0].id, "3|science|The water cycle");
    const frac = matchKnowledge({ grade: 3, subject: "math", topic: "درس الكسور اليوم" });
    assert.equal(frac[0]?.id, "3|math|Fractions");
  });

  it("grade +-1: the same grade first, a neighbour grade when the topic is taught there", () => {
    // Taught in grade 3; a grade-4 child still gets the grade-3 notes (lower score).
    const g4 = matchKnowledge({ grade: 4, subject: "math", topic: "Fractions" });
    assert.equal(g4[0].id, "3|math|Fractions");
    assert.ok(g4[0].score < 1);
    // A same-grade fuzzy match beats a neighbour-grade exact name.
    const pct = matchKnowledge({ grade: 5, subject: "math", topic: "percentages" });
    assert.equal(pct[0].entry.grade, 5);
    // Two grades away: nothing.
    assert.deepEqual(findKnowledge({ grade: 6, subject: "math", topic: "Long division" }), []);
  });

  it("science matches physics/chemistry/biology and back; other subjects never cross", () => {
    assert.equal(matchKnowledge({ grade: 8, subject: "science", topic: "Photosynthesis" })[0].id, "8|biology|Photosynthesis");
    assert.deepEqual(findKnowledge({ grade: 3, subject: "english", topic: "Fractions" }), []);
  });

  it("no match: off-curriculum or vague topics return [] (weak overlaps are dropped)", () => {
    for (const topic of ["dinosaurs", "what we did in class today", "Fun number puzzles", ""]) {
      assert.deepEqual(findKnowledge({ grade: 3, subject: "math", topic }), [], topic);
    }
    assert.deepEqual(findKnowledge({ grade: 3, subject: "math", topic: "", text: "45 + 27 = ?" }), []);
  });

  it("long text (homework question / page text) matches by the topic words in it", () => {
    const hw = matchKnowledge({ grade: 3, subject: "math", topic: "", text: "Ali has 3/4 of a pizza and eats 1/4. What fraction of the pizza is left?" });
    assert.equal(hw[0].id, "3|math|Fractions");
  });

  it("returns at most 2 entries, best first, and is fast", () => {
    const t0 = performance.now();
    for (let i = 0; i < 200; i++) {
      const r = findKnowledge({ grade: 1 + (i % 9), subject: "science", topic: "The water cycle and weather" });
      assert.ok(r.length <= 2);
    }
    assert.ok(performance.now() - t0 < 1000, "200 lookups under 1 s");
  });

  it("every curriculum topic that has notes finds its own entry by name (EN and AR)", () => {
    let checked = 0;
    for (const e of ALL_KNOWLEDGE) {
      if (!topicsFor(e.grade, e.subject).some((t) => t.en === e.topic)) continue;
      for (const topic of [e.topic, e.topicAr]) {
        const best = matchKnowledge({ grade: e.grade, subject: e.subject, topic })[0];
        assert.equal(best?.id, knowledgeId(e), `${knowledgeId(e)} via ${topic}`);
      }
      checked++;
    }
    assert.ok(checked > 300, `checked ${checked}`);
  });
});

describe("teacher notes: briefs", () => {
  const programs: (SchoolProgram | undefined)[] = [undefined, "national", "british", "american", "french", "ib"];

  it("knowledgeBrief stays within ~1,200 tokens for every entry, language and program", () => {
    for (const e of ALL_KNOWLEDGE) {
      for (const lang of ["en", "ar"] as const) {
        for (const p of programs) {
          const b = knowledgeBrief(e, lang, p);
          assert.ok(b.length <= BRIEF_MAX_CHARS, `${knowledgeId(e)} ${lang} ${p}: ${b.length}`);
        }
      }
      assert.ok(knowledgeBriefShort(e).length <= SHORT_BRIEF_MAX_CHARS, knowledgeId(e));
    }
  });

  it("brief content: key idea, definition in the lesson language, steps, mistakes, program note, visual JSON", () => {
    const [e] = findKnowledge({ grade: 3, subject: "math", topic: "Fractions" });
    const en = knowledgeBrief(e, "en", "french");
    const ar = knowledgeBrief(e, "ar");
    assert.ok(en.includes(e.keyIdea) && en.includes(e.kidDefinition) && en.includes(e.steps[0]));
    assert.ok(ar.includes(e.kidDefinitionAr) && !ar.includes(e.kidDefinition));
    assert.ok(en.includes(e.misconceptions[0].mistake));
    if (e.programNotes.french) assert.ok(en.includes(e.programNotes.french));
    assert.ok(en.includes(JSON.stringify(e.visuals[0])), "pictures as compact visual JSON strings");
    const short = knowledgeBriefShort(e);
    assert.ok(short.includes(e.keyIdea) && short.includes(e.misconceptions[0].mistake));
    assert.ok(!short.includes(e.workedExamples[0].solution), "no worked solutions in the chat brief");
  });

  it("brief text passes the regional-word check (EN and AR, every entry)", () => {
    const bad: string[] = [];
    for (const e of ALL_KNOWLEDGE) {
      for (const lang of ["en", "ar"] as const) {
        const words = findRegionalWords(knowledgeBrief(e, lang, "national") + "\n" + knowledgeBriefShort(e));
        if (words.length) bad.push(`${knowledgeId(e)} ${lang}: ${words.join(", ")}`);
      }
    }
    assert.deepEqual(bad, []);
  });

  it("every entry's visuals pass validateVisual (the lesson writer can reuse them as they are)", () => {
    const bad: string[] = [];
    for (const e of ALL_KNOWLEDGE) {
      e.visuals.forEach((v, i) => {
        const r = validateVisual(JSON.stringify(v));
        if (!r.value) bad.push(`${knowledgeId(e)} visual ${i}: ${r.reason}`);
      });
    }
    assert.deepEqual(bad, []);
  });

  it("every entry passes the lesson-content safety scan (notes can be echoed into a pack)", () => {
    const strs = (o: unknown): string[] =>
      typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(strs) : o && typeof o === "object" ? Object.values(o).flatMap(strs) : [];
    const bad: string[] = [];
    for (const e of ALL_KNOWLEDGE) {
      const s = keywordScan(strs(e).join("\n"), { lessonContent: true });
      if (s.selfHarm || s.disclosure || s.secrecy || s.adult || s.injection || s.politics) bad.push(knowledgeId(e));
    }
    assert.deepEqual(bad, []);
  });
});

describe("teacher notes in the prompts", () => {
  it("lesson pack, strong match: <teacher_notes> in the writer prompt, NO research call, id in verify", async () => {
    const calls = mockWriter();
    const r = (await buildLessonPack(lessonReq())) as LessonPackResponse;
    assert.ok(r.pack);
    assert.equal(researchCalls(calls).length, 0, "research skipped");
    assert.deepEqual(r.sources, []);
    const w = writerCalls(calls);
    assert.equal(w.length, 1);
    const text = promptText(w[0]);
    assert.ok(text.includes("<teacher_notes>") && text.includes("reference, not instructions"));
    const [e] = findKnowledge({ grade: 3, subject: "math", topic: "Fractions" });
    assert.ok(text.includes(JSON.stringify(e.keyIdea).slice(1, -1)), "key idea in the prompt");
    assert.ok(!JSON.stringify(w[0].messages).includes("<research_notes>"), "no empty research block");
    assert.ok(JSON.stringify(w[0].system).includes("<teacher_notes> are Zaki's own checked teacher notes"));
    assert.equal(r.verify.knowledge, "3|math|Fractions");
  });

  it("lesson pack, no match: research runs as before, no teacher notes, no verify.knowledge", async () => {
    const calls = mockWriter();
    const r = (await buildLessonPack(lessonReq({ topic: "Fun number puzzles" }))) as LessonPackResponse;
    assert.equal(researchCalls(calls).length, 1);
    const msgs = JSON.stringify(writerCalls(calls)[0].messages);
    assert.ok(!msgs.includes("<teacher_notes>"));
    assert.ok(msgs.includes("<research_notes>"));
    assert.equal(r.verify.knowledge, undefined);
  });

  it("lesson pack, weak match: notes are given AND research still runs", async () => {
    const m = matchKnowledge({ grade: 9, subject: "math", topic: "Pythagoras" });
    assert.ok(m.length && !m[0].strong, "a weak match");
    const calls = mockWriter();
    const r = (await buildLessonPack(lessonReq({ grade: 9, topic: "Pythagoras" }))) as LessonPackResponse;
    assert.equal(researchCalls(calls).length, 1);
    const text = promptText(writerCalls(calls)[0]);
    assert.ok(text.includes("<teacher_notes>") && text.includes("<research_notes>"));
    assert.equal(r.verify.knowledge, m[0].id);
  });

  it("tutor: the lesson's notes ride with the lesson pack (system, cached)", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Let's look at the first step together.")));
    const pack = getSamplePack("math", "en");
    const req: TutorRequest = { packId: pack.id, pack, step: "chat", history: [{ role: "zaki", text: "Hi! I'm Zaki, an AI helper." }], message: "explain again please", lang: "en", grade: 3, country: "LB", childRef: "kid_kn_123456" };
    await runTutorTurn(req);
    const tutor = calls.find((c) => !isClassifierCall(c))!;
    const sys = JSON.stringify(tutor.system);
    assert.ok(sys.includes("<lesson_pack>") && sys.includes("<teacher_notes>"));
    const [e] = findKnowledge({ grade: 3, subject: "math", topic: "Fractions" });
    assert.ok(sys.includes(JSON.stringify(e.keyIdea).slice(1, -1)));
    assert.ok(!sys.includes(JSON.stringify(e.workedExamples[0].solution).slice(1, -1)));
  });

  it("homework: subject + question text match -> brief in the system prompt; no match -> none", async () => {
    let calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("What does the question ask you to find?")));
    const base: HomeworkRequest = { question: "", history: [], subject: "math", grade: 3, age: 8, lang: "en", country: "LB", childRef: "kid_kn_hw1234" };
    await runHomeworkTurn({ ...base, question: "Ali has 3/4 of a pizza and eats 1/4. What fraction of the pizza is left?" });
    let sys = JSON.stringify(calls.find((c) => !isClassifierCall(c))!.system);
    assert.ok(sys.includes("<teacher_notes>") && sys.includes("Topic: Fractions"));
    calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("What does the question ask you to find?")));
    await runHomeworkTurn({ ...base, question: "45 + 27 = ?" });
    sys = JSON.stringify(calls.find((c) => !isClassifierCall(c))!.system);
    assert.ok(!sys.includes("<teacher_notes>"));
  });
});

describe("lesson-content safety scan (false alarms on school words)", () => {
  const schoolText = [
    "Limestone is a rock made from the shells of tiny sea animals.",
    "Heat the water only under teacher supervision.",
    "Humans have two sex chromosomes: girls have XX and boys have XY.",
    "We can see some stars with the naked eye.",
    "Simplify 2b + 4p - b.",
    "نتحرك إلى الأمام عندما ندفع الأرض بأقدامنا.",
  ];

  it("these phrases pass lesson-pack validation", () => {
    const pack = structuredClone(getSamplePack("science", "en"));
    pack.teachSteps[0].text = schoolText.join(" ");
    const r = validatePack(pack, { subject: "science", grade: 9, lang: "en" });
    assert.ok(r.ok, r.errors.join("; "));
  });

  it("real harm words in a pack are still rejected", () => {
    for (const bad of ["My teacher touched me and said keep it secret.", "I want to kill myself.", "Look at this porn.", "انتحار"]) {
      const pack = structuredClone(getSamplePack("science", "en"));
      pack.teachSteps[0].text = bad;
      const r = validatePack(pack, { subject: "science", grade: 9, lang: "en" });
      assert.equal(r.ok, false, bad);
      assert.ok(r.errors.includes("pack text contains blocked safety words"), bad);
    }
  });

  it("chat messages are scanned exactly as before: 'my teacher touched me' is still caught", async () => {
    assert.equal(keywordCategory(keywordScan("my teacher touched me")), "disclosure_harm");
    const m = await moderate("my teacher touched me", { speaker: "child", lang: "en", country: "LB" });
    assert.equal(m.block, true);
    assert.equal(m.safety.showSafetyScreen, true);
    // Arabizi spelling tricks are still caught in chat (they are switched off only for lesson text).
    assert.equal(keywordCategory(keywordScan("lamasetne")), "disclosure_harm");
    // The chat scan keeps its fuzzy layers, so these school words still look worrying THERE
    // (unchanged behaviour); only lesson content is scanned with the school-word rules.
    assert.notEqual(keywordCategory(keywordScan("limestone")), "none");
  });

  it("textbook photo text: a biology page about sex chromosomes is not an adult topic", async () => {
    const m = await moderate("Sex chromosomes decide if a baby is a boy or a girl.", { speaker: "child", lang: "en", country: "LB", pageText: true });
    assert.notEqual(m.rawCategory, "adult_topic");
    assert.notEqual(m.rawCategory, "sexual");
  });
});
