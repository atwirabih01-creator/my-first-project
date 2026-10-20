// POST /api/exam
// body { subject, lang, grade, count, lessons: [{ lessonKey, pack }] (1-8 saved lessons) }
// -> { questions: ExamQuestion[], added, demo?, budgetReached? }
// Mixes questions from the saved lessons (no AI). With AI on and budget left, adds a few NEW
// exam-style questions (math checked by our own code). No child names are ever sent.
import { buildExam } from "../../../server/exam";
import { EXAM_DEFAULT_QUESTIONS, EXAM_MAX_QUESTIONS, EXAM_MIN_QUESTIONS } from "../../../server/examMix";
import { HttpError, SIZE_LIMITS, asGrade, asLang, asSubject, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { assertFamilyConsentIfPresent } from "../../../server/family";
import { validatePack } from "../../../server/packValidator";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "exam");
    const body = await readJsonBody(request, SIZE_LIMITS.exam);
    await assertFamilyConsentIfPresent(body); // no AI for a family without active consent
    const subject = asSubject(body.subject);
    const lang = asLang(body.lang);
    const grade = asGrade(body.grade);
    const rawCount = body.count === undefined ? EXAM_DEFAULT_QUESTIONS : Number(body.count);
    if (!Number.isInteger(rawCount) || rawCount < EXAM_MIN_QUESTIONS || rawCount > EXAM_MAX_QUESTIONS) {
      throw new HttpError(400, `count must be ${EXAM_MIN_QUESTIONS}-${EXAM_MAX_QUESTIONS}`);
    }
    const raw = body.lessons;
    if (!Array.isArray(raw) || raw.length < 1 || raw.length > 8) throw new HttpError(400, "lessons must be a list of 1-8 saved lessons");
    const lessons = raw.map((l, i) => {
      const o = (l ?? {}) as { lessonKey?: unknown; pack?: Record<string, unknown> };
      if (typeof o.lessonKey !== "string" || !o.lessonKey || o.lessonKey.length > 120) throw new HttpError(400, `lessons[${i}].lessonKey is missing`);
      const checked = validatePack(o.pack ?? {}, { subject, grade: typeof o.pack?.grade === "number" ? asGrade(o.pack.grade) : grade, lang, lenient: true });
      if (!checked.ok || !checked.pack) throw new HttpError(400, `lessons[${i}].pack is not valid`);
      return { lessonKey: o.lessonKey, pack: checked.pack };
    });
    return json(await buildExam({ subject, lang, grade, count: rawCount, lessons }));
  });
}
