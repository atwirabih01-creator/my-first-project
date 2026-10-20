// GET /api/review/flags  (header x-reviewer-code)  -> { flags: ReviewerFlag[] }
// For the independent safety reviewer only. Scrubbed excerpts and childRefs, never names.
import { handle, json, rateLimit } from "../../../../server/http";
import { checkReviewerCode, listFlagsForReviewer } from "../../../../server/review";

export async function GET(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "review");
    checkReviewerCode(request);
    return json({ flags: listFlagsForReviewer() });
  });
}
