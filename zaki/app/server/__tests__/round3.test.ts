// Round 3 founder decisions: story-lesson teach steps with titles (pack version 3), no
// regional words, sensitive topics (fixed line + parent note), calm fear replies without the
// safety screen, homework from photos (3 photos, parent note, book's own method).
import { demoMode, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { FIXED_MESSAGES } from "../data/safetyMessages";
import { HOMEWORK_SYSTEM_PROMPT, runHomeworkTurn, splitPageText, type HomeworkRequest } from "../homework";
import { __resetRateLimitsForTests } from "../http";
import { PACK_VERSION, buildLessonPack, sensitiveTopicAllowed, type LessonPackResponse, type TopicBlockedResponse } from "../lessonPack";
import { libraryKey } from "../library";
import { LESSON_PACK_JSON_SCHEMA, validatePack } from "../packValidator";
import { findRegionalWords, replaceRegionalWords } from "../regionalWords";
import { __clearFlagsForTests, getFlagQueue, keywordCategory, keywordScan, moderate } from "../safety";
import { allSamplePacks, getSamplePack } from "../samples";
import { getStore } from "../storage";
import { runTutorTurn, type TutorRequest } from "../tutor";
import type { LessonPack } from "../types";
import { POST as homeworkRoute } from "../../src/app/api/homework+api";
import { POST as lessonPackRoute } from "../../src/app/api/lesson-pack+api";

const NONE = '{"category":"none","involvesHome":false}';
const cls = (category: string, involvesHome = false) => JSON.stringify({ category, involvesHome });
const LINE = FIXED_MESSAGES.sensitive_topic;
const HW_LINE = FIXED_MESSAGES.sensitive_topic_homework;
const FEAR = FIXED_MESSAGES.fear_calm;
const lessonReq = { subject: "math" as const, topic: "Fractions", grade: 3, lang: "en" as const, country: "LB" as const };
const tutorReq = (o: Partial<TutorRequest> = {}): TutorRequest => {
  const pack = getSamplePack("math", "en");
  return { packId: pack.id, pack, step: "chat", history: [{ role: "zaki", text: "Hi! I'm Zaki, an AI helper." }], message: "hi", lang: "en", grade: 3, country: "LB", childRef: "kid_r3_123456", ...o };
};
const hwReq = (o: Partial<HomeworkRequest> = {}): HomeworkRequest => ({
  question: "What is 45 + 27?", history: [], subject: "math", grade: 3, age: 8, lang: "en", country: "LB", childRef: "kid_r3_hw1234", ...o,
});
const post = (route: (r: Request) => Promise<Response>, url: string, body: unknown) =>
  route(new Request(`http://local${url}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
const lastFlag = () => getFlagQueue().at(-1)!;
const JPEG = "/9j/" + "A".repeat(100);

afterEach(() => {
  demoMode();
  __clearFlagsForTests();
});

describe("C1 teach-step titles + story-lesson samples", () => {
  it("validator keeps a title, drops a too-long one (not the step), schema asks the AI for title + example", () => {
    const p = getSamplePack("math", "en");
    const raw = { ...p, teachSteps: [{ title: "What is a fraction?", text: "A part of a whole.", example: "1/2 of a pizza." }, { title: "x".repeat(81), text: "Second step." }] };
    const r = validatePack(raw, { subject: "math", grade: 3, lang: "en" });
    assert.equal(r.ok, true, r.errors.join("; "));
    assert.equal(r.pack!.teachSteps[0].title, "What is a fraction?");
    assert.equal(r.pack!.teachSteps[1].title, undefined);
    assert.equal(r.pack!.teachSteps[1].text, "Second step.");
    const step = (LESSON_PACK_JSON_SCHEMA.properties.teachSteps as { items: { required: string[]; properties: Record<string, unknown> } }).items;
    assert.ok(step.properties.title && step.required.includes("title") && step.required.includes("example"));
  });

  it("every demo sample: 5-8 steps, each with title + text + example; hook first, 'Now you know' last", () => {
    for (const p of allSamplePacks()) {
      assert.ok(p.teachSteps.length >= 5 && p.teachSteps.length <= 8, p.id);
      for (const s of p.teachSteps) assert.ok(s.title && s.text && s.example, `${p.id}: ${s.text.slice(0, 30)}`);
      const first = p.teachSteps[0].title!;
      const last = p.teachSteps.at(-1)!;
      assert.match(first, p.lang === "ar" ? /^هل / : /^Have you ever/, p.id);
      assert.match(`${last.title} ${last.text}`, p.lang === "ar" ? /الآن تعرف/ : /Now you know/, p.id);
    }
  });

  it("demo examples do not give away a check/test answer (spot checks)", () => {
    const steps = (id: string) => JSON.stringify(allSamplePacks().find((p) => p.id === id)!.teachSteps);
    const ws = steps("sample_science_water_cycle_g3_en");
    assert.ok(!/towel|cold glass|cold can|snow falls on the mountains/i.test(ws));
    const maps = steps("sample_social_maps_directions_g4_en");
    assert.ok(!/4 cm on the map is 4 km/.test(maps));
    const nums = steps("sample_arabic_mufrad_muthanna_jam_g3_ar");
    for (const w of ["كتابان", "بنتان", "أولاد", "معلّمات", "قلمان", "بابان", "زهرات"]) assert.ok(!nums.includes(w), w);
    const adj = steps("sample_english_adjectives_g2_en");
    for (const w of ["red", "tall", "soft", "happy", "sweet", "round", "big"]) assert.ok(!new RegExp(`\\b${w}\\b`).test(adj), w);
  });
});

describe("C2 packVersion", () => {
  it("PACK_VERSION is 3; demo responses carry it", async () => {
    assert.equal(PACK_VERSION, 3);
    const r = (await buildLessonPack(lessonReq)) as LessonPackResponse;
    assert.equal(r.demo, true);
    assert.equal(r.packVersion, 3);
  });

  it("AI pack + library hit carry packVersion; a library entry from before v3 is NOT served (rebuilt, then replaced)", async () => {
    const good = getSamplePack("math", "en");
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : p.tools?.length ? textMsg("notes") : textMsg(JSON.stringify({ ...good, pageText: "" }))));
    const writers = () => calls.filter((c) => !isClassifierCall(c) && !c.tools?.length).length;
    const key = libraryKey("math", "Fractions", 3, "en");
    const old: LessonPack = { ...good, id: "old_v2_pack", teachSteps: [{ text: "old style" }] };
    await getStore().libraryPut({ key, pack: old, sources: [], verify: { checked: 0, removed: 0 }, savedAt: new Date().toISOString() });

    const first = (await buildLessonPack(lessonReq)) as LessonPackResponse;
    assert.equal(first.fromLibrary, undefined, "old entry must not be served");
    assert.equal(first.packVersion, 3);
    assert.equal(writers(), 1);
    assert.equal((await getStore().libraryGet(key))!.packVersion, 3);

    const second = (await buildLessonPack(lessonReq)) as LessonPackResponse;
    assert.equal(second.fromLibrary, true);
    assert.equal(second.packVersion, 3);
    assert.equal(writers(), 1, "no new AI call for a v3 library entry");
  });

  it("route: demo pack has packVersion 3; bad `source` is a 400", async () => {
    __resetRateLimitsForTests();
    const res = await post(lessonPackRoute, "/api/lesson-pack", { ...lessonReq });
    assert.equal(res.status, 200);
    assert.equal(((await res.json()) as { packVersion: number }).packVersion, 3);
    assert.equal((await post(lessonPackRoute, "/api/lesson-pack", { ...lessonReq, source: "teacher" })).status, 400);
  });
});

describe("no regional words", () => {
  it("finds EN/AR/Arabizi regional words, but not look-alikes (diameter, building block, table, cake)", () => {
    assert.deepEqual(findRegionalWords("Sara buys a manousheh in Beirut for 5000 lira").sort(), ["Beirut", "lira", "manousheh"].sort());
    assert.deepEqual(findRegionalWords("اشترى عمر منقوشة بالزعتر من الدوحة بخمسة ريالات").sort(), ["الدوحة", "ريال", "زعتر", "منقوشة"].sort());
    assert.ok(findRegionalWords("we ate kibbeh and labneh, then tabbouleh").length === 3);
    assert.ok(findRegionalWords("ana bi Lebnen w akalet man2oushe").length === 2);
    for (const ok of ["قطر الدائرة 6 سم", "الخلية لبنة بناء الكائن الحي", "a table and a cake", "كعكة كبيرة", "Lira is my friend", "falafel and hummus"]) {
      assert.deepEqual(findRegionalWords(ok), [], ok);
    }
    assert.equal(replaceRegionalWords("Omar buys a manousheh in Beirut.", "en"), "Omar buys a pizza in the city.");
    assert.equal(replaceRegionalWords("سافر من قطر إلى لبنان", "ar"), "سافر من البلد إلى البلد");
  });

  it("validator: a regional word is an error (regionalOnly, pack still returned for the last-resort swap)", () => {
    const p = getSamplePack("math", "en");
    p.teachSteps[0] = { ...p.teachSteps[0], example: "Mama cuts a manousheh into 4 pieces." };
    const r = validatePack(p, { subject: "math", grade: 3, lang: "en" });
    assert.equal(r.ok, false);
    assert.equal(r.regionalOnly, true);
    assert.ok(r.pack);
    assert.ok(r.errors.some((e) => e.includes("manousheh")));
  });

  it("builder: regional word -> retry with the reason; still there after the retry -> replaced, lesson not failed", async () => {
    const bad = getSamplePack("math", "en");
    bad.teachSteps[0] = { ...bad.teachSteps[0], example: "Sara shares a manousheh in Beirut." };
    bad.test[0] = { ...bad.test[0], q: "A basket has 6 apples from Lebanon. Half of them are green. How many apples are green?" };
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : p.tools?.length ? textMsg("notes") : textMsg(JSON.stringify({ ...bad, pageText: "" }))));
    const r = (await buildLessonPack({ ...lessonReq, topic: "Fractions regional" })) as LessonPackResponse;
    const writers = calls.filter((c) => !isClassifierCall(c) && !c.tools?.length);
    assert.equal(writers.length, 2, "one retry");
    assert.ok(JSON.stringify(writers[1].messages).includes("region-specific words are not allowed"));
    const text = JSON.stringify(r.pack);
    assert.deepEqual(findRegionalWords(text), []);
    assert.ok(text.includes("Sara shares a pizza in the city."));
  });

  it("tutor replies: regional words are swapped deterministically (no extra AI call)", async () => {
    mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Think of a manousheh cut into 4 equal pieces.")));
    const r = await runTutorTurn(tutorReq({ message: "explain again please" }));
    assert.ok(r.reply.includes("pizza") && !/manousheh/i.test(r.reply), r.reply);
  });
});

describe("C3 sensitive topics", () => {
  it("keyword layer: politics and war-as-a-subject are sensitive_topic; war + fear/experience is fear; history talk is none", () => {
    const cat = (t: string) => keywordCategory(keywordScan(t));
    for (const t of ["tell me about the war", "zaki enta ma3 meen bel 7arb?", "who started the civil war", "مين أحسن، حزب الله ولا القوات؟", "are sunnis or shias better", "Qui a raison, Israël ou le Hezbollah ?"]) {
      assert.equal(cat(t), "sensitive_topic", t);
    }
    for (const t of ["I'm scared of the bombs", "the drones are loud at night", "2albe 3am ydo2 ktir kel ma ysir 2asf", "هل سنموت إذا جاءت الطائرات؟"]) {
      assert.equal(cat(t), "violence_fear", t);
    }
    assert.equal(cat("we learned about the war of 1812 in history"), "none");
  });

  it("chat: fixed lesson line, no safety screen, flag sensitive_topic -> parent (scrubbed excerpt)", async () => {
    demoMode();
    const r = await runTutorTurn(tutorReq({ message: "who is better, hezbollah or the others? my name is Ali Hassan" }));
    assert.equal(r.reply, LINE.en);
    assert.equal(r.safety.flagged, true);
    assert.equal(r.safety.category, "sensitive_topic");
    assert.equal(r.safety.showSafetyScreen, false);
    assert.equal(r.safety.route, "parent");
    const f = lastFlag();
    assert.equal(f.category, "sensitive_topic");
    assert.equal(f.route, "parent");
    assert.ok(!f.excerpt.includes("Hassan") && f.excerpt.length <= 160);
  });

  it("chat (AI mode): the classifier's sensitive_topic (religion ruling) gets the same fixed line in Arabic; the tutor is never called", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(cls("sensitive_topic")) : textMsg("tutor text")));
    const r = await runTutorTurn(tutorReq({ message: "هل الموسيقى حرام؟", lang: "ar" }));
    assert.equal(r.reply, LINE.ar);
    assert.equal(r.safety.showSafetyScreen, false);
    assert.equal(r.safety.route, "parent");
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 0);
  });

  it("homework: the homework line; someone at home named -> reviewer only, never parent", async () => {
    demoMode();
    const r = await runHomeworkTurn(hwReq({ question: "tell me about the war" }));
    assert.equal(r.reply, HW_LINE.en);
    assert.equal(r.safety.category, "sensitive_topic");
    assert.equal(r.safety.showSafetyScreen, false);
    assert.equal(r.safety.route, "parent");
    const home = await runHomeworkTurn(hwReq({ question: "my dad says the elections are rigged, who should he vote for?", lang: "ar" }));
    assert.equal(home.reply, HW_LINE.ar);
    assert.equal(home.safety.route, "reviewer");
    assert.equal(home.safety.alertParent, false);
  });

  it("typed lesson topic: a war topic from a child -> fixed line + parent note, no lesson", async () => {
    demoMode();
    const r = (await buildLessonPack({ ...lessonReq, subject: "social", topic: "the war and the bombs", grade: 6 })) as TopicBlockedResponse;
    assert.equal(r.blocked, true);
    assert.equal(r.reply, LINE.en);
    assert.equal(r.safety.category, "sensitive_topic");
    assert.equal(r.safety.showSafetyScreen, false);
    assert.equal(r.safety.route, "parent");
  });

  it("typed lesson topic: a Social Studies history topic the PARENT added is a normal lesson (not flagged)", async () => {
    demoMode();
    const r = (await buildLessonPack({ ...lessonReq, subject: "social", topic: "The Second World War", grade: 9, source: "parent" })) as LessonPackResponse;
    assert.ok(r.pack, "lesson built");
    assert.equal(getFlagQueue().length, 0);
    // the same topic typed by the child, or in another subject, is not allowed
    assert.equal(((await buildLessonPack({ ...lessonReq, subject: "social", topic: "The Second World War", grade: 9 })) as TopicBlockedResponse).blocked, true);
    assert.equal(((await buildLessonPack({ ...lessonReq, subject: "math", topic: "The Second World War", grade: 9, source: "parent" })) as TopicBlockedResponse).blocked, true);
  });

  it("typed lesson topic: a curriculum Social Studies topic is allowed even when the classifier calls it sensitive", async () => {
    const good = getSamplePack("social", "en");
    mockClaude((p) => (isClassifierCall(p) ? textMsg(cls("sensitive_topic")) : p.tools?.length ? textMsg("notes") : textMsg(JSON.stringify({ ...good, pageText: "" }))));
    const topic = "Ancient civilizations (Mesopotamia, Egypt, Greece, Rome)";
    assert.equal(sensitiveTopicAllowed({ subject: "social", grade: 7, topic }), true);
    const r = (await buildLessonPack({ ...lessonReq, subject: "social", topic, grade: 7 })) as LessonPackResponse;
    assert.ok(r.pack);
    assert.equal(getFlagQueue().length, 0);
    const blocked = (await buildLessonPack({ ...lessonReq, subject: "social", topic: "who is right in the elections", grade: 7 })) as TopicBlockedResponse;
    assert.equal(blocked.blocked, true);
  });

  it("AI replies that drift into a sensitive subject get the fixed line (not flagged as the child's)", async () => {
    mockClaude((p) => {
      if (!isClassifierCall(p)) return textMsg("Let's talk about which political party is best.");
      return textMsg(JSON.stringify(p.messages).includes("speaker: tutor") ? cls("sensitive_topic") : NONE);
    });
    const r = await runTutorTurn(tutorReq({ message: "what is 1/2?" }));
    assert.equal(r.reply, LINE.en);
    assert.equal(r.safety.flagged, false);
  });
});

describe("fear without someone at home: calm line, no screen, parent note", () => {
  it("chat: 'the drones are loud at night' -> calm line, no screen, violence_fear -> parent", async () => {
    demoMode();
    const r = await runTutorTurn(tutorReq({ message: "the drones are loud at night" }));
    assert.equal(r.reply, FEAR.en);
    assert.equal(r.safety.showSafetyScreen, false);
    assert.equal(r.safety.category, "violence_fear");
    assert.equal(r.safety.route, "parent");
    assert.ok(!/are you ok/i.test(r.reply));
  });

  it("homework + Arabic: same calm line; grief with nobody else named -> calm too; someone outside named -> screen", async () => {
    demoMode();
    const r = await runHomeworkTurn(hwReq({ question: "انا خايفة من القصف", lang: "ar" }));
    assert.equal(r.reply, FEAR.ar);
    assert.equal(r.safety.showSafetyScreen, false);
    assert.equal(r.safety.route, "parent");
    const g = await moderate("jiddo mat", { speaker: "child", lang: "ar", country: "LB" });
    assert.equal(g.fixedReplyKey, "fear_calm");
    // someone OUTSIDE the family named (a classmate, a bully): unchanged, safety screen
    const out = await moderate("رفيقي بالصف مات", { speaker: "child", lang: "ar", country: "LB" });
    assert.equal(out.fixedReplyKey, "safety_fear");
    assert.equal(out.safety.showSafetyScreen, true);
  });

  it("keywords say fear, the classifier says none: calm line (no 'are you OK?' check-in)", async () => {
    mockClaude(() => textMsg(NONE));
    const r = await moderate("I'm scared of the bombs", { speaker: "child", lang: "en", country: "LB" });
    assert.equal(r.fixedReplyKey, "fear_calm");
    assert.equal(r.safety.showSafetyScreen, false);
    assert.equal(r.safety.route, "parent");
  });

  it("fear + asking for a help number keeps the help screen (help routes unchanged)", async () => {
    demoMode();
    const r = await moderate("shu ra2m el police? 3am bkhaf", { speaker: "child", lang: "ar", country: "LB" });
    assert.equal(r.fixedReplyKey, "safety_fear");
    assert.equal(r.safety.showSafetyScreen, true);
    assert.equal(r.safety.helpRouteKind, "fear");
  });

  it("fear with someone at home (classifier says so): safety screen, reviewer only", async () => {
    mockClaude(() => textMsg(cls("violence_fear", true)));
    const r = await moderate("I'm scared, I don't want to be there tonight", { speaker: "child", lang: "en", country: "LB" });
    assert.equal(r.safety.showSafetyScreen, true);
    assert.equal(r.safety.route, "reviewer");
    assert.equal(r.safety.alertParent, false);
  });
});

describe("unchanged: self-harm, disclosure, secrecy, help requests", () => {
  it("keep the safety screen and their routes exactly as before", async () => {
    demoMode();
    const sh = await moderate("bade mout", { speaker: "child", lang: "ar", country: "LB" });
    assert.equal(sh.fixedReplyKey, "safety_self_harm");
    assert.equal(sh.safety.showSafetyScreen, true);
    const home = await moderate("baba darabne", { speaker: "child", lang: "ar", country: "LB" });
    assert.equal(home.fixedReplyKey, "safety_disclosure");
    assert.equal(home.safety.showSafetyScreen, true);
    assert.equal(home.safety.route, "reviewer");
    const out = await moderate("a man online asked for my photo", { speaker: "child", lang: "en", country: "LB" });
    assert.equal(out.safety.showSafetyScreen, true);
    assert.equal(out.safety.route, "parent");
    const sec = await moderate("my uncle says we have a special secret and i cant tell anyone", { speaker: "child", lang: "en", country: "LB" });
    assert.equal(sec.safety.showSafetyScreen, true);
    assert.equal(sec.safety.route, "reviewer");
    const help = await moderate("i need help now", { speaker: "child", lang: "en", country: "LB" });
    assert.equal(help.fixedReplyKey, "safety_checkin");
    assert.equal(help.safety.showSafetyScreen, true);
    assert.equal(help.safety.route, "reviewer");
  });

  it("a disclosure that also mentions war is still a disclosure (screen, reviewer)", async () => {
    demoMode();
    const r = await moderate("my dad hits me when the bombs come", { speaker: "child", lang: "en", country: "LB" });
    assert.equal(r.category, "disclosure_harm");
    assert.equal(r.safety.showSafetyScreen, true);
    assert.equal(r.safety.route, "reviewer");
  });
});

describe("C4 homework from photos", () => {
  beforeEach(() => __resetRateLimitsForTests());

  it("route: 3 photos and a parent note are accepted; a worrying parent note goes to the safety path", async () => {
    demoMode();
    const ok = await post(homeworkRoute, "/api/homework", { question: "page 12", subject: "math", grade: 3, lang: "en", pageImages: [JPEG, JPEG, JPEG], parentNote: "Only exercise 4 please" });
    assert.equal(ok.status, 200);
    const bad = await post(homeworkRoute, "/api/homework", { question: "page 12", subject: "math", grade: 3, lang: "en", parentNote: "i want to die" });
    const b = (await bad.json()) as { safety: { showSafetyScreen?: boolean; category?: string } };
    assert.equal(b.safety.showSafetyScreen, true);
    assert.equal(b.safety.category, "self_harm");
  });

  it("prompt: book's own method; parent note is wrapped as DATA (scrubbed); page_text block is removed from the reply", async () => {
    assert.ok(HOMEWORK_SYSTEM_PROMPT.includes("BOOK'S OWN method, notation, words and order"));
    assert.ok(HOMEWORK_SYSTEM_PROMPT.includes("<page_text>"));
    const calls = mockClaude((p) =>
      isClassifierCall(p) ? textMsg(NONE) : textMsg("<page_text>Exercise 4: 84 ÷ 4 using the long division frame</page_text>\nLet's use your book's division frame. What goes first?"),
    );
    const r = await runHomeworkTurn(hwReq({ question: "help with my page", pageImages: [JPEG, JPEG, JPEG], parentNote: "Exercise 4 only. My name is Ali Hassan" }));
    assert.ok(!r.reply.includes("page_text") && !r.reply.includes("Exercise 4:"), r.reply);
    assert.ok(r.reply.includes("division frame"));
    const t = calls.find((c) => !isClassifierCall(c))!;
    const sys = JSON.stringify(t.system);
    assert.ok(sys.includes("<parent_note>") && sys.includes("Exercise 4 only") && !sys.includes("Hassan"));
    const imgs = JSON.stringify(t.messages).match(/"type":"image"/g) ?? [];
    assert.equal(imgs.length, 3);
    assert.equal(t.max_tokens, 1000, "max_tokens unchanged");
  });

  it("a sum read from the photo is protected by the answer guard", async () => {
    let n = 0;
    mockClaude((p) => {
      if (isClassifierCall(p)) return textMsg(NONE);
      n++;
      return textMsg("<page_text>Exercise 2: 36 + 47 = ___</page_text>\nThe answer is 83.");
    });
    const r = await runHomeworkTurn(hwReq({ question: "do exercise 2 from the photo", pageImages: [JPEG] }));
    assert.equal(n, 2, "retried once");
    assert.ok(!r.reply.includes("83"), r.reply);
  });

  it("an unsuitable page (adult content read from the photo) gets the fixed photo reply", async () => {
    mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("<page_text>xxx porn pictures</page_text>\nok")));
    const r = await runHomeworkTurn(hwReq({ question: "help", pageImages: [JPEG] }));
    assert.equal(r.reply, FIXED_MESSAGES.photo_rejected.en);
  });

  it("splitPageText: unclosed block is never shown", () => {
    assert.deepEqual(splitPageText("<page_text>abc</page_text> hi"), { pageText: "abc", reply: "hi" });
    assert.equal(splitPageText("<page_text>abc and no end").reply, null);
    assert.equal(splitPageText("plain reply").reply, "plain reply");
  });
});
