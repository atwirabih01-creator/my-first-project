// POST /api/family/consent  body { familyId, familyKey, action: "withdraw"|"give", consentId?, consentVersion? }
// -> { ok, consentId? }. Withdraw = the family stops using AI until consent is given again.
import { verifyFamily } from "../../../../server/family";
import { HttpError, asText, handle, json, rateLimit, readJsonBody } from "../../../../server/http";
import { getStore } from "../../../../server/storage";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "family");
    const body = await readJsonBody(request, 4_000);
    const familyId = await verifyFamily(body.familyId, body.familyKey);
    if (body.action === "withdraw") {
      if (typeof body.consentId !== "string") throw new HttpError(400, "consentId required");
      return json({ ok: await getStore().withdrawConsent(familyId, body.consentId) });
    }
    if (body.action === "give") {
      const c = await getStore().addConsent(familyId, { version: asText(body.consentVersion, "consentVersion", 40), method: "in_app_gate" });
      return json({ ok: true, consentId: c.id });
    }
    throw new HttpError(400, 'action must be "withdraw" or "give"');
  });
}
