// POST /api/parent-message (WhatsApp simulator)  body { text, lang, country }
// -> { reply, plan?, intent, action?, studyTime? }
import { SIZE_LIMITS, asCountry, asLang, asText, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { handleParentMessage } from "../../../server/parent";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "parent");
    const body = await readJsonBody(request, SIZE_LIMITS.parent);
    const text = asText(body.text, "text", 1000);
    return json(handleParentMessage(text, asLang(body.lang), asCountry(body.country)));
  });
}
