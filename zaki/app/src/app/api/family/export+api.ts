// POST /api/family/export  body { familyId, familyKey } -> { export } (everything stored for this family)
import { verifyFamily } from "../../../../server/family";
import { HttpError, handle, json, rateLimit, readJsonBody } from "../../../../server/http";
import { getStore } from "../../../../server/storage";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "family");
    const body = await readJsonBody(request, 4_000);
    const familyId = await verifyFamily(body.familyId, body.familyKey);
    const data = await getStore().exportFamily(familyId);
    if (!data) throw new HttpError(404, "family not found", "not_found");
    return json({ export: data });
  });
}
