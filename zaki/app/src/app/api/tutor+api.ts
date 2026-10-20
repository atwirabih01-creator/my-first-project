// POST /api/tutor
// body { packId, pack, step: "recap"|"teach"|"check"|"chat", history: {role:"child"|"zaki", text}[],
//        message, lang, grade, country?, childRef?, questionId? }
// -> { reply, hintLevel?, safety, demo? }
import { HttpError, SIZE_LIMITS, asChildRef, asGrade, asLang, asOptionalCountry, asSubject, asText, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { assertFamilyConsentIfPresent } from "../../../server/family";
import { validatePack } from "../../../server/packValidator";
import { TUTOR_STEPS, runTutorTurn, type TutorStep } from "../../../server/tutor";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "tutor");
    const body = await readJsonBody(request, SIZE_LIMITS.tutor);
    await assertFamilyConsentIfPresent(body); // no AI for a family without active consent
    const lang = asLang(body.lang);
    const grade = asGrade(body.grade);
    const country = asOptionalCountry(body.country);
    const childRef = asChildRef(body.childRef);
    const step = body.step as TutorStep;
    if (!TUTOR_STEPS.includes(step)) throw new HttpError(400, `step must be one of ${TUTOR_STEPS.join(", ")}`);
    const message = asText(body.message, "message", 1000);

    const rawPack = (body.pack ?? {}) as Record<string, unknown>;
    const checked = validatePack(rawPack, {
      subject: asSubject(rawPack.subject),
      grade: typeof rawPack.grade === "number" ? asGrade(rawPack.grade) : grade,
      lang: rawPack.lang === "en" || rawPack.lang === "ar" ? rawPack.lang : lang,
      lenient: true,
    });
    if (!checked.ok || !checked.pack) throw new HttpError(400, "pack is not valid");

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    if (rawHistory.length > 50) throw new HttpError(400, "history is too long");
    const history = rawHistory
      .filter((h): h is { role: "child" | "zaki"; text: string } =>
        !!h && typeof h === "object" && ((h as { role?: unknown }).role === "child" || (h as { role?: unknown }).role === "zaki") && typeof (h as { text?: unknown }).text === "string")
      .map((h) => ({ role: h.role, text: h.text.slice(0, 1000) }));

    const result = await runTutorTurn({
      packId: typeof body.packId === "string" ? body.packId.slice(0, 80) : checked.pack.id,
      pack: checked.pack,
      step,
      history,
      message,
      lang,
      grade,
      country,
      childRef,
      questionId: typeof body.questionId === "string" ? body.questionId.slice(0, 40) : undefined,
    });
    return json(result);
  });
}
