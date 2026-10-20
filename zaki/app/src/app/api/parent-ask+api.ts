// POST /api/parent-ask (parent area, behind the parental gate)
// body { message, lang, country?, history?: {role:"parent"|"zaki", text}[], pageImages?: string[] (base64 JPEG, max 3) }
// -> { reply, demo?, budgetReached?, blocked? }
// Explains school topics (grades 1-6) to the PARENT. Never receives child names.
import { HttpError, SIZE_LIMITS, asLang, asOptionalCountry, asText, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { assertFamilyConsentIfPresent } from "../../../server/family";
import { LessonPackError, MAX_PAGE_IMAGES } from "../../../server/lessonPack";
import { runParentAsk, type ParentAskTurn } from "../../../server/parentAsk";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "parentAsk");
    const body = await readJsonBody(request, SIZE_LIMITS.parentAsk);
    await assertFamilyConsentIfPresent(body); // no AI for a family without active consent
    const images = body.pageImages;
    if (images !== undefined && (!Array.isArray(images) || images.length > MAX_PAGE_IMAGES || images.some((i) => typeof i !== "string"))) {
      throw new HttpError(400, `pageImages must be a list of at most ${MAX_PAGE_IMAGES} base64 JPEG strings`);
    }
    const rawHistory = Array.isArray(body.history) ? body.history.slice(-20) : [];
    const history: ParentAskTurn[] = rawHistory
      .filter((h): h is ParentAskTurn => !!h && typeof h === "object" && ((h as ParentAskTurn).role === "parent" || (h as ParentAskTurn).role === "zaki") && typeof (h as ParentAskTurn).text === "string")
      .map((h) => ({ role: h.role, text: h.text.slice(0, 2000) }));
    try {
      return json(
        await runParentAsk({
          message: asText(body.message, "message", 1500),
          lang: asLang(body.lang),
          country: asOptionalCountry(body.country),
          history,
          pageImages: images as string[] | undefined,
        }),
      );
    } catch (e) {
      if (e instanceof LessonPackError) throw new HttpError(400, e.message, e.code);
      throw e;
    }
  });
}
