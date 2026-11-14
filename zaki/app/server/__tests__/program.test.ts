// Round 7: the child's school country + school program. Validation (400 on unknown values,
// missing is fine), the program guide in the lesson writer / tutor / homework prompts, the
// shared library key (per program), French decimal commas in our math checks, and the
// regional-words filter (country names never reach lesson content). No program = old behaviour.
import { demoMode, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { runHomeworkTurn, type HomeworkRequest } from "../homework";
import { HttpError, __resetRateLimitsForTests, asOptionalProgram, asOptionalSchoolCountry } from "../http";
import { buildLessonPack, type LessonPackRequest, type LessonPackResponse } from "../lessonPack";
import { libraryKey } from "../library";
import { PHOTOS_OVERRIDE_RULE, programGuide } from "../programGuide";
import { findRegionalWords } from "../regionalWords";
import { leakedItem } from "../replyChecks";
import { __clearFlagsForTests } from "../safety";
import { getSamplePack } from "../samples";
import { runTutorTurn, type TutorRequest } from "../tutor";
import type { ClaudeParams } from "../ai";
import type { Question } from "../types";
import { decimalCommaToDot, verifyPack, verifyQuestion } from "../verify";
import { POST as homeworkRoute } from "../../src/app/api/homework+api";
import { POST as lessonPackRoute } from "../../src/app/api/lesson-pack+api";
import { POST as tutorRoute } from "../../src/app/api/tutor+api";

const NONE = '{"category":"none","involvesHome":false}';
const post = (route: (r: Request) => Promise<Response>, url: string, body: unknown) =>
  route(new Request(`http://local${url}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
const lessonReq = (o: Partial<LessonPackRequest> = {}): LessonPackRequest => ({ subject: "math", topic: "Fractions", grade: 3, lang: "en", country: "LB", ...o });
const tutorReq = (o: Partial<TutorRequest> = {}): TutorRequest => {
  const pack = getSamplePack("math", "en");
  return { packId: pack.id, pack, step: "chat", history: [{ role: "zaki", text: "Hi! I'm Zaki, an AI helper." }], message: "can you explain again", lang: "en", grade: 3, country: "LB", childRef: "kid_r7_123456", ...o };
};
const hwReq = (o: Partial<HomeworkRequest> = {}): HomeworkRequest => ({
  question: "How do I divide 84 by 4?", history: [], subject: "math", grade: 3, age: 8, lang: "en", country: "LB", childRef: "kid_r7_hw1234", ...o,
});
/** Everything the AI was given in one call (system + messages), as text. */
const promptText = (p: ClaudeParams) => JSON.stringify({ s: p.system, m: p.messages });
const writerCalls = (calls: ClaudeParams[]) => calls.filter((c) => !isClassifierCall(c) && !c.tools?.length);
/** A mocked Claude: classifier says none, research gives notes, the writer returns the sample pack. */
const mockWriter = () =>
  mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : p.tools?.length ? textMsg("notes") : textMsg(JSON.stringify({ ...getSamplePack("math", "en"), pageText: "" }))));

afterEach(() => {
  demoMode();
  __clearFlagsForTests();
});

describe("round 7: school country + program validation", () => {
  it("helpers: known values pass, missing is fine, unknown values are a 400", () => {
    assert.equal(asOptionalSchoolCountry("IQ"), "IQ");
    assert.equal(asOptionalSchoolCountry("OTHER"), "OTHER");
    assert.equal(asOptionalProgram("french"), "french");
    for (const v of [undefined, null, ""]) {
      assert.equal(asOptionalSchoolCountry(v), undefined);
      assert.equal(asOptionalProgram(v), undefined);
    }
    for (const bad of ["FR", "iq", "US", 3, {}]) assert.throws(() => asOptionalSchoolCountry(bad), (e) => e instanceof HttpError && e.status === 400);
    for (const bad of ["French", "cambridge", "us", 1, []]) assert.throws(() => asOptionalProgram(bad), (e) => e instanceof HttpError && e.status === 400);
  });

  it("routes: /api/lesson-pack, /api/tutor and /api/homework accept the fields and reject unknown values", async () => {
    __resetRateLimitsForTests();
    const lp = { subject: "math", topic: "Fractions", grade: 3, lang: "en", country: "LB" };
    assert.equal((await post(lessonPackRoute, "/api/lesson-pack", lp)).status, 200, "missing is fine");
    assert.equal((await post(lessonPackRoute, "/api/lesson-pack", { ...lp, schoolCountry: "IQ", program: "national" })).status, 200);
    assert.equal((await post(lessonPackRoute, "/api/lesson-pack", { ...lp, schoolCountry: "XX" })).status, 400);
    assert.equal((await post(lessonPackRoute, "/api/lesson-pack", { ...lp, program: "montessori" })).status, 400);

    const pack = getSamplePack("math", "en");
    const tu = { packId: pack.id, pack, step: "chat", history: [], message: "hello", lang: "en", grade: 3 };
    assert.equal((await post(tutorRoute, "/api/tutor", tu)).status, 200);
    assert.equal((await post(tutorRoute, "/api/tutor", { ...tu, schoolCountry: "JO", program: "british" })).status, 200);
    assert.equal((await post(tutorRoute, "/api/tutor", { ...tu, program: "German" })).status, 400);
    assert.equal((await post(tutorRoute, "/api/tutor", { ...tu, schoolCountry: "France" })).status, 400);

    const hw = { question: "What is 45 + 27?", subject: "math", grade: 3, lang: "en", country: "LB" };
    assert.equal((await post(homeworkRoute, "/api/homework", hw)).status, 200);
    assert.equal((await post(homeworkRoute, "/api/homework", { ...hw, schoolCountry: "EG", program: "american" })).status, 200);
    assert.equal((await post(homeworkRoute, "/api/homework", { ...hw, program: "IB" })).status, 400);
    assert.equal((await post(homeworkRoute, "/api/homework", { ...hw, schoolCountry: "lb" })).status, 400);
  });
});

describe("round 7: program guide text", () => {
  it("no program or 'other' = no guide (today's behaviour)", () => {
    assert.equal(programGuide(undefined, undefined), "");
    assert.equal(programGuide(undefined, "IQ"), "");
    assert.equal(programGuide("other", "LB"), "");
  });

  it("every guide keeps the founder rules: photos first, general examples, no country names in the lesson", () => {
    for (const p of ["national", "british", "american", "french", "ib"] as const) {
      const g = programGuide(p, "IQ");
      assert.ok(g.includes(PHOTOS_OVERRIDE_RULE), p);
      assert.ok(g.includes("examples stay general and international"), p);
      assert.ok(g.includes("never write a country, city or program name"), p);
      assert.ok(g.length < 700, `${p} guide is short (${g.length})`);
    }
  });

  it("french / british / national content", () => {
    const fr = programGuide("french", undefined);
    for (const w of ["3,5", "12 500", "CP=1", "3e=9", "division posée"]) assert.ok(fr.includes(w), w);
    const br = programGuide("british", undefined);
    for (const w of ["Year N = grade N-1", "bus-stop", "times tables", "pence"]) assert.ok(br.includes(w), w);
    const nat = programGuide("national", "IQ");
    assert.ok(nat.includes("National program of Iraq"));
    assert.ok(nat.includes("٣٤٥") && nat.includes("ONLY if the uploaded page uses them"));
    assert.ok(programGuide("national", "OTHER").includes("National program of the child's country"));
    assert.ok(programGuide("american", undefined).includes("long division"));
    assert.ok(programGuide("ib", undefined).includes("inquiry"));
  });
});

describe("round 7: prompts carry the program guide", () => {
  it("lesson writer: french / british / national guide in the request; no program = no guide", async () => {
    for (const [program, schoolCountry, needle] of [
      ["french", undefined, "division posée"],
      ["british", undefined, "bus-stop"],
      ["national", "IQ", "National program of Iraq"],
    ] as const) {
      const calls = mockWriter();
      const r = (await buildLessonPack(lessonReq({ program, schoolCountry, topic: `Division ${program}` }))) as LessonPackResponse;
      assert.ok(r.pack, program);
      const w = writerCalls(calls);
      assert.equal(w.length, 1, program);
      const text = promptText(w[0]);
      assert.ok(text.includes("school program: ") && text.includes(needle), program);
      assert.ok(text.includes(PHOTOS_OVERRIDE_RULE), program);
      // The big system prompt is unchanged (still cached): the guide sits in the request.
      assert.ok(!JSON.stringify(w[0].system).includes("school program"), program);
    }
    const calls = mockWriter();
    await buildLessonPack(lessonReq({ topic: "Division plain" }));
    assert.ok(!promptText(writerCalls(calls)[0]).includes("school program"), "no program: no guide");
    const other = mockWriter();
    await buildLessonPack(lessonReq({ topic: "Division other", program: "other", schoolCountry: "LB" }));
    assert.ok(!promptText(writerCalls(other)[0]).includes("school program"), "program other: no guide");
  });

  it("research call never gets the program or country (only subject/topic/grade)", async () => {
    const calls = mockWriter();
    await buildLessonPack(lessonReq({ topic: "Fun number puzzles", program: "national", schoolCountry: "IQ" }));
    const research = calls.filter((c) => c.tools?.length);
    assert.ok(research.length >= 1);
    assert.ok(!promptText(research[0]).includes("Iraq") && !promptText(research[0]).includes("school program"));
  });

  it("tutor + homework: the guide is in turn_context (french / national); no program = no guide", async () => {
    let calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Let's look at the first step together.")));
    await runTutorTurn(tutorReq({ program: "french" }));
    let main = calls.filter((c) => !isClassifierCall(c));
    assert.ok(promptText(main[0]).includes("school program: French program") && promptText(main[0]).includes("3,5"));
    assert.ok(!promptText(main[0]).includes("mathExpr"), "the chat guide has no lesson-writer notes");

    calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Let's look at the first step together.")));
    await runTutorTurn(tutorReq());
    main = calls.filter((c) => !isClassifierCall(c));
    assert.ok(!promptText(main[0]).includes("school program"), "tutor without a program: as before");

    calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("What do you know about sharing 84 things into 4 groups?")));
    await runHomeworkTurn(hwReq({ program: "national", schoolCountry: "SY" }));
    main = calls.filter((c) => !isClassifierCall(c));
    const hwText = promptText(main[0]);
    assert.ok(hwText.includes("school program: National program of Syria") && hwText.includes(PHOTOS_OVERRIDE_RULE));

    calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("What do you know about sharing 84 things into 4 groups?")));
    await runHomeworkTurn(hwReq({ program: "british" }));
    main = calls.filter((c) => !isClassifierCall(c));
    assert.ok(promptText(main[0]).includes("bus-stop"));

    calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("What do you know about sharing 84 things into 4 groups?")));
    await runHomeworkTurn(hwReq());
    main = calls.filter((c) => !isClassifierCall(c));
    assert.ok(!promptText(main[0]).includes("school program"), "homework without a program: as before");
  });
});

describe("round 7: shared lesson library key", () => {
  it("key: old key without a program (or 'other'); differs by program; national adds the school country", () => {
    const old = "math|fractions|3|en";
    assert.equal(libraryKey("math", "Fractions", 3, "en"), old);
    assert.equal(libraryKey("math", "Fractions", 3, "en", {}), old);
    assert.equal(libraryKey("math", "Fractions", 3, "en", { program: "other", schoolCountry: "LB" }), old);
    assert.equal(libraryKey("math", "Fractions", 3, "en", { schoolCountry: "IQ" }), old, "a country alone does not change the lesson");
    const fr = libraryKey("math", "Fractions", 3, "en", { program: "french" });
    const us = libraryKey("math", "Fractions", 3, "en", { program: "american" });
    assert.notEqual(fr, us);
    assert.notEqual(fr, old);
    assert.equal(libraryKey("math", "Fractions", 3, "en", { program: "french", schoolCountry: "LB" }), fr, "country only matters for national");
    assert.notEqual(libraryKey("math", "Fractions", 3, "en", { program: "national", schoolCountry: "IQ" }), libraryKey("math", "Fractions", 3, "en", { program: "national", schoolCountry: "JO" }));
  });

  it("a French-program lesson is never served to an American-program child (or to a child with no program)", async () => {
    const calls = mockWriter();
    await buildLessonPack(lessonReq({ topic: "Long division", program: "french" }));
    assert.equal(writerCalls(calls).length, 1);
    const again = (await buildLessonPack(lessonReq({ topic: "Long division", program: "french" }))) as LessonPackResponse;
    assert.equal(again.fromLibrary, true, "same program: from the library");
    assert.equal(writerCalls(calls).length, 1);
    const us = (await buildLessonPack(lessonReq({ topic: "Long division", program: "american" }))) as LessonPackResponse;
    assert.ok(!us.fromLibrary);
    assert.equal(writerCalls(calls).length, 2, "american: built fresh");
    const none = (await buildLessonPack(lessonReq({ topic: "Long division" }))) as LessonPackResponse;
    assert.ok(!none.fromLibrary);
    assert.equal(writerCalls(calls).length, 3, "no program: its own (old) key");
    const none2 = (await buildLessonPack(lessonReq({ topic: "Long division" }))) as LessonPackResponse;
    assert.equal(none2.fromLibrary, true, "no program: the old library entry is still served");
  });
});

describe("round 7: French notation in our math checks", () => {
  const q = (choices: string[], answerIndex: number, mathExpr = "7 / 2", text = "Share 7 cakes between 2 friends. How much does each get?"): Question => ({
    id: "t1", q: text, choices, answerIndex, hint1: "h", hint2: "h", similarExample: "e", kind: "math", mathExpr,
  });

  it("decimalCommaToDot: 3,5 -> 3.5, 12 500 -> 12500, mixed numbers untouched", () => {
    assert.equal(decimalCommaToDot("3,5"), "3.5");
    assert.equal(decimalCommaToDot("12 500 + 0,25"), "12500 + 0.25");
    assert.equal(decimalCommaToDot("1 1/2"), "1 1/2");
    assert.equal(decimalCommaToDot("cmp(3/4, 2/3)"), "cmp(3/4, 2/3)");
  });

  it("French program: a 3,5 choice is read as 3.5 (kept); other programs keep today's reading", () => {
    const item = q(["3,5", "4,5", "2,5"], 0);
    assert.equal(verifyQuestion(item, { decimalComma: true }).ok, true);
    assert.equal(verifyQuestion(item).ok, false, "without the French program: unchanged behaviour");
    const pack = { ...getSamplePack("math", "en"), checks: [item], test: [item], retestPool: [] };
    assert.equal(verifyPack(pack, { decimalComma: true }).removed, 0);
    assert.equal(verifyPack(pack, { decimalComma: true }).pack.test[0].choices[0], "3,5", "the child still sees 3,5");
    // Thousands with a space: 12 500
    assert.equal(verifyQuestion(q(["12 500", "1 250", "125"], 0, "12500 * 1", "A town has 12 500 trees. How many trees?"), { decimalComma: true }).ok, true);
  });

  it("answer guard: a reply that writes the answer with a decimal comma (3,5) is caught", () => {
    const item = q(["3.5", "4.5", "2.5"], 0);
    assert.ok(leakedItem("Each friend gets 3,5 cakes.", [item]));
    assert.ok(leakedItem("Each friend gets 3.5 cakes.", [item]));
    assert.equal(leakedItem("Try sharing them one by one.", [item]), null);
  });
});

describe("round 7: regional words still apply with a program", () => {
  it("the new school countries' names are caught (EN + AR), history and look-alikes are not", () => {
    assert.deepEqual(findRegionalWords("Sara lives in Baghdad, Iraq").sort(), ["Baghdad", "Iraq"]);
    assert.ok(findRegionalWords("سافر إلى العراق والأردن ومصر والكويت").length === 4);
    assert.ok(findRegionalWords("Omar paid 5 dinars in Dubai").length === 2);
    assert.ok(findRegionalWords("في البحرين وفي عمان").length === 2);
    for (const ok of ["Ancient Egypt had pyramids", "حضارات بلاد الرافدين ومصر القديمة", "رياض الأطفال", "التقى البحرين", "a woman and a man", "قوة قاهرة", "دبّي الصغير", "French and English lessons", "North America"]) {
      assert.deepEqual(findRegionalWords(ok), [], ok);
    }
  });

  it("national program lesson: a country name in the content is rejected (retry) and then replaced; the lesson is not failed", async () => {
    const bad = getSamplePack("math", "en");
    bad.teachSteps[0] = { ...bad.teachSteps[0], example: "Sara shares a cake in Baghdad, Iraq." };
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : p.tools?.length ? textMsg("notes") : textMsg(JSON.stringify({ ...bad, pageText: "" }))));
    const r = (await buildLessonPack(lessonReq({ topic: "Fractions national", program: "national", schoolCountry: "IQ" }))) as LessonPackResponse;
    const w = writerCalls(calls);
    assert.equal(w.length, 2, "one retry");
    assert.ok(JSON.stringify(w[1].messages).includes("region-specific words are not allowed"));
    const text = JSON.stringify(r.pack);
    assert.deepEqual(findRegionalWords(text), []);
    assert.ok(!/Iraq|Baghdad/i.test(text));
    assert.ok(text.includes("Sara shares a cake in the city, the country."));
  });

  it("tutor reply with a country name: swapped by our code (any program)", async () => {
    mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Think of a cake cut into 4 pieces in Jordan.")));
    const r = await runTutorTurn(tutorReq({ program: "national", schoolCountry: "JO" }));
    assert.ok(!/Jordan/i.test(r.reply), r.reply);
  });
});
