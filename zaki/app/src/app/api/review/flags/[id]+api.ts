// POST /api/review/flags/:id  (header x-reviewer-code)  body { status: "new"|"seen"|"resolved", note? }
// -> { flag }
import { HttpError, handle, json, rateLimit, readJsonBody } from "../../../../../server/http";
import { checkReviewerCode, updateFlagReview, type ReviewStatus } from "../../../../../server/review";

export async function POST(request: Request, params: Record<string, string>): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "review");
    checkReviewerCode(request);
    const id = params?.id;
    if (!id || !/^[A-Za-z0-9-]{8,64}$/.test(id)) throw new HttpError(400, "bad flag id");
    const body = await readJsonBody(request, 4_000);
    const note = typeof body.note === "string" ? body.note : undefined;
    return json({ flag: updateFlagReview(id, body.status as ReviewStatus, note) });
  });
}
