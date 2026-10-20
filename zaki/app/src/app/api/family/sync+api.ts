// POST /api/family/sync  body { familyId, familyKey, children: [{ childRef, nickname, grade, lang, avatar, dailyLimitMin, progress? }] }
// -> { synced }. The family key is verified BEFORE any family data is touched.
import { syncFamily, verifyFamily, type SyncChildInput } from "../../../../server/family";
import { HttpError, SIZE_LIMITS, asGrade, asLang, handle, json, rateLimit, readJsonBody } from "../../../../server/http";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "family");
    const body = await readJsonBody(request, SIZE_LIMITS.family);
    const familyId = await verifyFamily(body.familyId, body.familyKey);
    const raw = body.children;
    if (!Array.isArray(raw) || raw.length > 10) throw new HttpError(400, "children must be a list of up to 10");
    const children: SyncChildInput[] = raw.map((c, i) => {
      const o = (c ?? {}) as Record<string, unknown>;
      if (typeof o.childRef !== "string" || typeof o.nickname !== "string" || typeof o.avatar !== "string") throw new HttpError(400, `children[${i}] is incomplete`);
      const limit = Number(o.dailyLimitMin);
      return {
        childRef: o.childRef,
        nickname: o.nickname,
        grade: asGrade(o.grade),
        lang: asLang(o.lang),
        avatar: o.avatar.slice(0, 20),
        dailyLimitMin: Number.isInteger(limit) && limit > 0 && limit <= 240 ? limit : 30,
        progress: o.progress && typeof o.progress === "object" ? (o.progress as SyncChildInput["progress"]) : undefined,
      };
    });
    return json({ synced: await syncFamily(familyId, children) });
  });
}
