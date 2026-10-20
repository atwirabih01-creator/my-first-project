// POST /api/delete-family  body { familyId, familyKey }
// -> { deleted: { children, flagsUnlinked } }
// The family key is verified FIRST. Then everything stored for the family is deleted. Safety
// flags are kept only without any link to the children (an open referral must not vanish).
import { deleteVerifiedFamily, verifyFamily } from "../../../server/family";
import { handle, json, rateLimit, readJsonBody } from "../../../server/http";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "deleteFamily");
    const body = await readJsonBody(request, 4_000);
    const familyId = await verifyFamily(body.familyId, body.familyKey);
    return json({ deleted: await deleteVerifiedFamily(familyId) });
  });
}
