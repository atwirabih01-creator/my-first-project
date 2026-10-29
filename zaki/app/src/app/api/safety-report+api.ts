// POST /api/safety-report
// body { kind: "home"|"self_harm"|"fear"|"general", message?, lang, country?, childRef? } -> { ok: true }
// The phone caught a worry on its own (offline word list or the "I don't feel safe" button).
// This makes sure the independent reviewer sees it. No consent check: safety reports always go through.
import { asChildRef, asLang, asOptionalCountry, asText, handle, HttpError, json, rateLimit, readJsonBody } from "../../../server/http";
import { reportFromDevice, type DeviceReportKind } from "../../../server/safety";

const KINDS: DeviceReportKind[] = ["home", "self_harm", "fear", "general"];

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "safetyReport");
    const body = await readJsonBody(request, 8_000);
    const kind = body.kind as DeviceReportKind;
    if (!KINDS.includes(kind)) throw new HttpError(400, `kind must be one of ${KINDS.join(", ")}`);
    const text = body.message === undefined || body.message === "" ? undefined : asText(body.message, "message", 600);
    await reportFromDevice({
      kind,
      text,
      lang: asLang(body.lang),
      country: asOptionalCountry(body.country),
      childRef: asChildRef(body.childRef),
    });
    return json({ ok: true });
  });
}
