// POST /api/family/register  body { guardians: [{firstName, relationship}] (1-2), consentVersion, country?, reportLang? }
// -> { familyId, familyKey, consentId }   (familyKey is shown ONCE; the server keeps only its hash)
import { registerFamily } from "../../../../server/family";
import { HttpError, SIZE_LIMITS, asLang, asOptionalCountry, asText, handle, json, rateLimit, readJsonBody } from "../../../../server/http";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "family");
    const body = await readJsonBody(request, SIZE_LIMITS.parent);
    const raw = body.guardians;
    if (!Array.isArray(raw) || raw.length < 1 || raw.length > 2) throw new HttpError(400, "guardians must be 1-2 entries");
    const guardians = raw.map((g, i) => {
      const o = (g ?? {}) as { firstName?: unknown; relationship?: unknown };
      return { firstName: asText(o.firstName, `guardians[${i}].firstName`, 40, 2), relationship: asText(o.relationship, `guardians[${i}].relationship`, 40, 2) };
    });
    return json(
      await registerFamily({
        guardians,
        consentVersion: asText(body.consentVersion, "consentVersion", 40),
        country: asOptionalCountry(body.country) ?? null,
        reportLang: body.reportLang === undefined ? undefined : asLang(body.reportLang),
      }),
    );
  });
}
