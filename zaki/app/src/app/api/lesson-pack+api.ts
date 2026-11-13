// POST /api/lesson-pack
// body { subject, topic, grade (1-9), age? (5-16), lang, country, childRef?, pageImages?: string[] (base64 jpeg, max 3),
//        source?: "parent" | "child" (who typed the topic; default "child"),
//        schoolCountry?: "LB"|"IQ"|...|"OTHER" (the school's country, NOT `country`), program?: "national"|"british"|"american"|"french"|"ib"|"other" }
// -> { pack, packVersion: 3, sources: {title,url}[], verify: { checked, removed }, demo?, fromLibrary? }
//  | { budgetReached: true }
//  | { blocked: true, reply, safety }   (the topic text failed the chat safety check;
//                                        safety.showSafetyScreen => show the safety screen;
//                                        sensitive topic => safety.category "sensitive_topic", no screen)
import { HttpError, SIZE_LIMITS, asChildRef, asCountry, asGrade, asLang, asOptionalAge, asOptionalProgram, asOptionalSchoolCountry, asSubject, asText, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { assertFamilyConsentIfPresent } from "../../../server/family";
import { LessonPackError, MAX_PAGE_IMAGES, buildLessonPack } from "../../../server/lessonPack";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "lessonPack");
    const body = await readJsonBody(request, SIZE_LIMITS.lessonPack);
    await assertFamilyConsentIfPresent(body); // no AI for a family without active consent
    const childRef = asChildRef(body.childRef);
    const images = body.pageImages;
    if (images !== undefined && (!Array.isArray(images) || images.length > MAX_PAGE_IMAGES || images.some((i) => typeof i !== "string"))) {
      throw new HttpError(400, `pageImages must be a list of at most ${MAX_PAGE_IMAGES} base64 JPEG strings`);
    }
    const source = body.source;
    if (source !== undefined && source !== null && source !== "parent" && source !== "child") {
      throw new HttpError(400, `source must be "parent" or "child"`);
    }
    try {
      const result = await buildLessonPack({
        subject: asSubject(body.subject),
        topic: asText(body.topic, "topic", 120, 2), // a child may describe "what we did in class today"
        grade: asGrade(body.grade),
        age: asOptionalAge(body.age),
        lang: asLang(body.lang),
        country: asCountry(body.country),
        pageImages: images as string[] | undefined,
        childRef,
        source: source === "parent" ? "parent" : "child",
        schoolCountry: asOptionalSchoolCountry(body.schoolCountry),
        program: asOptionalProgram(body.program),
      });
      return json(result);
    } catch (e) {
      if (e instanceof LessonPackError) {
        const status = e.code === "bad_image" ? 400 : 422;
        throw new HttpError(status, e.message, e.code);
      }
      throw e;
    }
  });
}
