// POST /api/check-answer   body { pack, questionId, answer, attempt? } -> { correct, feedbackKey }
// Deterministic, no AI.
import { CheckAnswerError, checkAnswer } from "../../../server/checkAnswer";
import { HttpError, SIZE_LIMITS, asGrade, asLang, asSubject, asText, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { validatePack } from "../../../server/packValidator";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "checkAnswer");
    const body = await readJsonBody(request, SIZE_LIMITS.checkAnswer);
    const rawPack = (body.pack ?? {}) as Record<string, unknown>;
    const v = validatePack(rawPack, {
      subject: asSubject(rawPack.subject),
      grade: asGrade(rawPack.grade),
      lang: asLang(rawPack.lang),
      lenient: true,
    });
    if (!v.ok || !v.pack) throw new HttpError(400, "pack is not valid");
    const questionId = asText(body.questionId, "questionId", 40);
    const attempt = typeof body.attempt === "number" ? body.attempt : 1;
    try {
      return json(checkAnswer(v.pack, questionId, body.answer, attempt));
    } catch (e) {
      if (e instanceof CheckAnswerError) throw new HttpError(400, e.message);
      throw e;
    }
  });
}
