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
import { selfContradictoryExample, validatePack } from "../packValidator";
import { addNotesVisuals } from "../notesVisuals";
import { LESSON_STORY_STYLE, LESSON_VISUAL_RULES } from "../promptRules";
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

  it("nearer grades first: the same grade, then a neighbour grade when the topic is taught there", () => {
    // Taught in grade 3; a grade-4 child still gets the grade-3 notes (lower score).
    const g4 = matchKnowledge({ grade: 4, subject: "math", topic: "Fractions" });
    assert.equal(g4[0].id, "3|math|Fractions");
    assert.ok(g4[0].score < 1);
    // A same-grade fuzzy match beats a neighbour-grade exact name.
    const pct = matchKnowledge({ grade: 5, subject: "math", topic: "percentages" });
    assert.equal(pct[0].entry.grade, 5);
    // An exact name two grades away still matches, with a lower score.
    const ld = matchKnowledge({ grade: 6, subject: "math", topic: "Long division" });
    assert.equal(ld[0].id, "4|math|Long division");
    assert.ok(ld[0].score < g4[0].score && ld[0].strong);
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

// ---------------------------------------------------------------------------------------
// Round 2 after live tests: any-grade names, more pictures, self-contradicting examples
// ---------------------------------------------------------------------------------------

const KANA_STEPS = [
  { title: "هل لاحظتَ؟", text: "نبدأ بجملة اسمية: الجوُّ جميلٌ.", example: "الشمسُ مشرقةٌ.", visual: null, tryIt: null },
  { title: "ماذا تفعل كان؟", text: "ندخل كان على الجملة: كانَ الجوُّ جميلًا. المبتدأ يبقى مرفوعًا ويُنصب الخبر.", example: "كانَ البابُ مفتوحًا.", visual: null, tryIt: null },
  { title: "الأخوات", text: "أخوات كان: أصبحَ في الصباح، أمسى في المساء، صارَ للتحوّل، ليسَ للنفي.", example: "أصبحَ الطفلُ نشيطًا.", visual: null, tryIt: null },
  { title: "مثال آخر", text: "ظلَّ الطالبُ مجتهدًا طوال النهار.", example: "باتَ القمرُ منيرًا.", visual: null, tryIt: null },
  { title: "الآن تعرف", text: "الآن تعرف أن كان وأخواتها ترفع الاسم وتنصب الخبر.", example: "كانَ العصفورُ صغيرًا.", visual: null, tryIt: null },
];
const kanaPack = () => ({ ...structuredClone(getSamplePack("arabic", "ar")), topic: "كان وأخواتها", teachSteps: structuredClone(KANA_STEPS) });

describe("teacher notes at any grade (programs teach topics in different grades)", () => {
  it("an exact Arabic or English name matches at a far grade, lower score but strong", () => {
    for (const topic of ["كان وأخواتها", "Kana and its sisters"]) {
      const m = matchKnowledge({ grade: 7, subject: "arabic", topic });
      assert.equal(m[0]?.id, "4|arabic|Kana and its sisters", topic);
      assert.equal(m[0].strong, true);
      assert.ok(m[0].score <= 0.56, `gap 3: ${m[0].score}`);
      assert.ok(!m.some((x) => x.id.includes("Inna")), "not Inna and its sisters");
    }
    assert.equal(matchKnowledge({ grade: 9, subject: "math", topic: "Fractions" })[0]?.id, "3|math|Fractions");
  });

  it("near-exact name: 'Kana and her sisters' = 'Kana and its sisters'; one shared word is not enough", () => {
    const m = matchKnowledge({ grade: 7, subject: "arabic", topic: "Kana and her sisters" });
    assert.equal(m[0]?.id, "4|arabic|Kana and its sisters");
    assert.equal(m[0].exact, true);
    assert.deepEqual(findKnowledge({ grade: 9, subject: "math", topic: "tens" }), [], "'tens' is not 'Tens and ones'");
  });

  it("a fuzzy match reaches +-2 grades; a weak fuzzy match at a far grade still does not match", () => {
    // Pythagoras' theorem is grade 8: fuzzy from grade 9 and 6, not from grade 5.
    assert.equal(matchKnowledge({ grade: 6, subject: "math", topic: "Pythagoras" })[0]?.entry.grade, 8);
    assert.deepEqual(findKnowledge({ grade: 5, subject: "math", topic: "Pythagoras" }), []);
    assert.deepEqual(findKnowledge({ grade: 9, subject: "math", topic: "multiplication" }), []);
  });

  it("notes for another grade say so, in the writer brief and the chat brief", () => {
    const [e] = findKnowledge({ grade: 7, subject: "arabic", topic: "كان وأخواتها" });
    const note = "these notes were written for grade 4; adapt depth and wording to grade 7";
    assert.ok(knowledgeBrief(e, "ar", undefined, 7).includes(note));
    assert.ok(knowledgeBriefShort(e, 7).includes(note));
    assert.ok(!knowledgeBrief(e, "ar", undefined, 4).includes("Grade note"));
  });
});

describe("pictures: every lesson has pictures", () => {
  it("Arabic grammar pictures with full vowel marks, arrows in a label or a non-emoji icon are kept", () => {
    const long = { type: "sequence", items: [{ emoji: "📝", label: "الجوُّ جميلٌ ← كانَ الجوُّ جميلًا" }, { emoji: "1️⃣", label: "اسمُ كانَ مرفوعٌ وخبرُها منصوبٌ" }] };
    const r = validateVisual(long);
    assert.ok(r.value, r.reason);
    const escaped = JSON.stringify({ type: "labeled", items: [1, 2, 3, 4, 5, 6].map(() => ({ emoji: "🔤", label: "خبرُ كانَ المنصوبُ هنا" })) }).replace(/[؀-ۿ]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
    assert.ok(escaped.length > 800);
    assert.ok(validateVisual(escaped).value, "escaped Arabic JSON is measured after parsing");
    // Still dropped: a label that is really too long, with a reason code.
    const tooLong = validateVisual({ type: "labeled", items: [{ emoji: "🔤", label: "ا".repeat(31) }, { emoji: "🔤", label: "ب" }] });
    assert.match(tooLong.reason!, /item_1_label too long \(31 > 30\)/);
  });

  it("the writer rules ask for at least 4 pictures with grammar ideas, and forbid fake 'No:' examples", () => {
    assert.ok(LESSON_VISUAL_RULES.includes("AT LEAST 4 teach steps") && LESSON_VISUAL_RULES.includes("اسم كان") && LESSON_VISUAL_RULES.includes("wordCard"));
    assert.ok(LESSON_STORY_STYLE.includes('never write a sentence, then "No:"'));
  });

  it("free fallback: too few pictures -> fitting pictures from the notes join steps that have none", () => {
    const [e] = findKnowledge({ grade: 7, subject: "arabic", topic: "كان وأخواتها" });
    const pack = kanaPack();
    const v = validatePack(pack, { subject: "arabic", grade: 7, lang: "ar" });
    assert.ok(v.ok, v.errors.join("; "));
    const r = addNotesVisuals(v.pack!, e);
    assert.equal(r.added, 2);
    const withPics = r.pack.teachSteps.map((s) => s.visual?.type ?? null);
    assert.ok(withPics[0] === "sequence" || withPics[1] === "sequence", "the sentence change joins a step about الجوُّ جميلٌ");
    assert.equal(withPics[2], "labeled", "the sisters join the step that names them");
    assert.equal(addNotesVisuals(r.pack, e).added, 0, "only steps without a picture; stops when nothing else fits");
  });

  it("fallback never attaches on a guess: English labels in an Arabic lesson, numbers not in the step", () => {
    const [fractions] = findKnowledge({ grade: 3, subject: "math", topic: "Fractions" });
    const pack = kanaPack();
    const v = validatePack(pack, { subject: "arabic", grade: 7, lang: "ar" });
    assert.equal(addNotesVisuals(v.pack!, fractions).added, 0);
    // Number pictures need EVERY number in that step: a step about "1/2" never gets a 3/4 pizza.
    const math = structuredClone(getSamplePack("math", "en"));
    math.teachSteps = math.teachSteps.map((s) => ({ title: s.title, text: "Half of a pizza is 1/2.", example: "Cut it in 2 parts." }));
    const picked = addNotesVisuals(math, { ...fractions, visuals: [{ type: "fraction", shape: "circle", parts: 4, shaded: 3, label: "3/4" }] });
    assert.equal(picked.added, 0);
    const fits = addNotesVisuals(math, { ...fractions, visuals: [{ type: "fraction", shape: "circle", parts: 2, shaded: 1, label: "1/2" }] });
    assert.equal(fits.added, 1);
  });

  it("lesson pack: the writer's few pictures are topped up from the notes; drop reasons are reported", async () => {
    const steps = structuredClone(KANA_STEPS) as Record<string, unknown>[];
    steps[0].visual = JSON.stringify({ type: "wordCard", word: "كانَ", emoji: "📘", meaning: "فعل ناسخ" });
    steps[3].visual = JSON.stringify({ type: "sequence", items: [{ emoji: "🔤", label: "ظلَّ" }] }); // 1 item: dropped
    const calls = mockClaude((p) =>
      isClassifierCall(p) ? textMsg(NONE) : p.tools?.length ? textMsg("notes") : textMsg(JSON.stringify({ ...kanaPack(), teachSteps: steps, pageText: "" })),
    );
    const r = (await buildLessonPack({ subject: "arabic", topic: "كان وأخواتها", grade: 7, lang: "ar", country: "LB" })) as LessonPackResponse;
    assert.equal(r.verify.knowledge, "4|arabic|Kana and its sisters");
    assert.equal(researchCalls(calls).length, 0, "an exact name is strong at any grade");
    assert.ok(promptText(writerCalls(calls)[0]).includes("adapt depth and wording to grade 7"));
    assert.equal(r.verify.visualsFromNotes, 2);
    assert.equal(r.verify.visuals, 3);
    assert.ok(r.verify.dropReasons?.some((x) => x.includes("items_count")));
  });
});

describe("self-contradicting examples", () => {
  it("'X? No: X' is detected (Arabic and English); real corrections are not", () => {
    assert.equal(selfContradictoryExample("كان المعلمان حاضرَين؟ لا: كان المعلمان حاضرَين."), true);
    assert.equal(selfContradictoryExample("Is the cat big? No: is the cat big."), true);
    assert.equal(selfContradictoryExample("Is the cat big? No, the cat is small."), false);
    assert.equal(selfContradictoryExample("لا تنسَ أن خبر كان منصوب."), false);
  });

  it("the validator drops such an example and keeps the step", () => {
    const pack = kanaPack();
    pack.teachSteps[1].example = "كان المعلمان حاضرَين؟ لا: كان المعلمان حاضرَين.";
    const r = validatePack(pack, { subject: "arabic", grade: 7, lang: "ar" });
    assert.ok(r.ok, r.errors.join("; "));
    assert.equal(r.pack!.teachSteps[1].example, undefined);
    assert.ok(r.pack!.teachSteps[1].text.length > 0);
    assert.ok(r.repairs.some((x) => x.includes("contradicts itself")));
  });
});

describe("self-correcting examples", () => {
  it("drops examples that trail off and correct themselves, keeps labelled ones", async () => {
    const { selfContradictoryExample } = await import("../packValidator");
    assert.equal(selfContradictoryExample("ما زالَ الحديقةُ... لا؛ نقول: ما زالتِ الحديقةُ خضراءَ."), true);
    assert.equal(selfContradictoryExample("أصبحَ الحقلُ أخضرَ... بل نقول: صارَ الحقلُ أخضرَ."), true);
    assert.equal(selfContradictoryExample("The cat run... no, we say: the cat runs."), true);
    assert.equal(selfContradictoryExample("خطأ: أصبحَ الطقسَ باردًا. صواب: أصبحَ الطقسُ باردًا."), false);
    assert.equal(selfContradictoryExample("لا تنسَ أن تنصب الخبر."), false);
    assert.equal(selfContradictoryExample("No, the cat is small."), false);
  });
});
