// POST /api/homework  (homework help: Zaki never gives the final answer)
// body { childRef?, grade (1-9), age? (5-16), lang, country?, subject,
//        question (1-1000 chars), message? (0-1000 chars; empty on the first turn),
//        history?: {role:"child"|"zaki", text}[] (max 50), pageImages?: string[] (base64 JPEG, max 3),
//        parentNote?: string (max 300 chars; the grown-up's note, e.g. "exercise 4 only"; DATA,
//        safety-checked like a message), familyId?, familyKey? }
// -> { reply, hintLevel?, safety, demo?, budgetReached? }   (same shape as /api/tutor)
// Same safety pipeline as /api/tutor: rate limit, family consent, moderation of the question
// + message, safety screen, flags, per-child daily turns, daily budget, reply checks.
import { HttpError, SIZE_LIMITS, asChildRef, asGrade, asLang, asOptionalAge, asOptionalCountry, asSubject, asText, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { assertFamilyConsentIfPresent } from "../../../server/family";
import { MAX_HOMEWORK_IMAGES, MAX_PARENT_NOTE_CHARS, MAX_QUESTION_CHARS, runHomeworkTurn, type HomeworkTurn } from "../../../server/homework";
import { LessonPackError } from "../../../server/lessonPack";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "homework");
    const body = await readJsonBody(request, SIZE_LIMITS.homework);
    await assertFamilyConsentIfPresent(body); // no AI for a family without active consent
    const lang = asLang(body.lang);
    const grade = asGrade(body.grade);
    const age = asOptionalAge(body.age);
    const country = asOptionalCountry(body.country);
    const childRef = asChildRef(body.childRef);
    const subject = asSubject(body.subject);
    const question = asText(body.question, "question", MAX_QUESTION_CHARS);
    const message = body.message === undefined || body.message === null || body.message === "" ? undefined : asText(body.message, "message", 1000);
    const parentNote =
      body.parentNote === undefined || body.parentNote === null || body.parentNote === "" ? undefined : asText(body.parentNote, "parentNote", MAX_PARENT_NOTE_CHARS);

    const images = body.pageImages;
    if (images !== undefined && (!Array.isArray(images) || images.length > MAX_HOMEWORK_IMAGES || images.some((i) => typeof i !== "string"))) {
      throw new HttpError(400, `pageImages must be a list of at most ${MAX_HOMEWORK_IMAGES} base64 JPEG strings`);
    }

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    if (rawHistory.length > 50) throw new HttpError(400, "history is too long");
    const history: HomeworkTurn[] = rawHistory
      .filter((h): h is HomeworkTurn =>
        !!h && typeof h === "object" && ((h as { role?: unknown }).role === "child" || (h as { role?: unknown }).role === "zaki") && typeof (h as { text?: unknown }).text === "string")
      .map((h) => ({ role: h.role, text: h.text.slice(0, 1000) }));

    try {
      const result = await runHomeworkTurn({ question, message, history, subject, grade, age, lang, country, childRef, pageImages: images as string[] | undefined, parentNote });
      return json(result);
    } catch (e) {
      if (e instanceof LessonPackError && e.code === "bad_image") throw new HttpError(400, e.message, e.code);
      throw e;
    }
  });
}
