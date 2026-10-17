// POST /api/lesson-pack
// body { subject, topic, grade, lang, country, childRef?, pageImages?: string[] (base64 jpeg, max 3) }
// -> { pack, sources: {title,url}[], verify: { checked, removed }, demo? }
import { HttpError, SIZE_LIMITS, asChildRef, asCountry, asGrade, asLang, asSubject, asText, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { LessonPackError, MAX_PAGE_IMAGES, buildLessonPack } from "../../../server/lessonPack";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "lessonPack");
    const body = await readJsonBody(request, SIZE_LIMITS.lessonPack);
    asChildRef(body.childRef);
    const images = body.pageImages;
    if (images !== undefined && (!Array.isArray(images) || images.length > MAX_PAGE_IMAGES || images.some((i) => typeof i !== "string"))) {
      throw new HttpError(400, `pageImages must be a list of at most ${MAX_PAGE_IMAGES} base64 JPEG strings`);
    }
    try {
      const result = await buildLessonPack({
        subject: asSubject(body.subject),
        topic: asText(body.topic, "topic", 80, 2),
        grade: asGrade(body.grade),
        lang: asLang(body.lang),
        country: asCountry(body.country),
        pageImages: images as string[] | undefined,
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
