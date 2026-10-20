// POST /api/delete-family  body { childRefs: string[] (1-20 random ids) }
// -> { deleted: { aiTurnCounters, flagsAnonymised } }
// Deletes what the server stores for these children. Safety flags are kept ONLY in anonymised
// form (no childRef, no excerpt) so the independent reviewer's safety record is not lost.
// Phase 1 has no accounts: childRefs are long random ids, so they can't be guessed.
import { forgetChildren } from "../../../server/budget";
import { HttpError, asChildRef, handle, json, rateLimit, readJsonBody } from "../../../server/http";
import { anonymiseFlagsFor } from "../../../server/review";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "deleteFamily");
    const body = await readJsonBody(request, 4_000);
    const raw = body.childRefs;
    if (!Array.isArray(raw) || raw.length < 1 || raw.length > 20) throw new HttpError(400, "childRefs must be a list of 1-20 ids");
    const refs = raw.map((r) => {
      const ref = asChildRef(r);
      if (!ref) throw new HttpError(400, "childRefs must be ids");
      return ref;
    });
    return json({ deleted: { aiTurnCounters: forgetChildren(refs), flagsAnonymised: anonymiseFlagsFor(refs) } });
  });
}
