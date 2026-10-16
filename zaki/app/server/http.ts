// Small helpers shared by the API routes: size-capped JSON bodies, simple rate limiting,
// input validation and error responses. Nothing here ever logs message text.

import type { Country, Lang, Subject } from "./types";
import { SUBJECTS } from "./types";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "bad_request",
  ) {
    super(message);
  }
}

export const SIZE_LIMITS = {
  lessonPack: 7_000_000, // up to 3 photos
  tutor: 200_000, // the pack travels with each turn
  checkAnswer: 200_000,
  parent: 4_000,
} as const;

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export async function readJsonBody(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new HttpError(413, "request too large", "too_large");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new HttpError(413, "request too large", "too_large");
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new HttpError(400, "body must be JSON", "bad_json");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "body must be a JSON object", "bad_json");
  return body as Record<string, unknown>;
}

// ---------------------------------------------------------------------------------------
// Rate limiting (per server instance, fixed window). Good enough for a family pilot.
// ---------------------------------------------------------------------------------------

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export const RATE_LIMITS = {
  lessonPack: { limit: 10, windowMs: 60 * 60_000 },
  tutor: { limit: 30, windowMs: 60_000 },
  checkAnswer: { limit: 120, windowMs: 60_000 },
  parent: { limit: 20, windowMs: 60_000 },
  health: { limit: 60, windowMs: 60_000 },
} as const;

function clientKey(request: Request): string {
  const h = request.headers;
  const ip =
    h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return ip.slice(0, 64);
}

/** Throws 429 when the caller is over the limit for this route. */
export function rateLimit(request: Request, route: keyof typeof RATE_LIMITS, now = Date.now()): void {
  const { limit, windowMs } = RATE_LIMITS[route];
  const key = `${route}:${clientKey(request)}`;
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count++;
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
  if (b.count > limit) {
    throw new HttpError(429, "too many requests, please wait a moment", "rate_limited");
  }
}

export function __resetRateLimitsForTests(): void {
  buckets.clear();
}

// ---------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------

export function asLang(v: unknown): Lang {
  if (v === "en" || v === "ar") return v;
  throw new HttpError(400, 'lang must be "en" or "ar"');
}

export function asCountry(v: unknown): Country {
  if (v === "LB" || v === "QA") return v;
  throw new HttpError(400, 'country must be "LB" or "QA"');
}

export function asGrade(v: unknown): number {
  if (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 6) return v;
  throw new HttpError(400, "grade must be a whole number from 1 to 6");
}

export function asSubject(v: unknown): Subject {
  if (typeof v === "string" && (SUBJECTS as readonly string[]).includes(v)) return v as Subject;
  throw new HttpError(400, `subject must be one of ${SUBJECTS.join(", ")}`);
}

export function asText(v: unknown, field: string, max: number, min = 1): string {
  if (typeof v !== "string") throw new HttpError(400, `${field} must be text`);
  const t = v.trim();
  if (t.length < min) throw new HttpError(400, `${field} is empty`);
  if (t.length > max) throw new HttpError(400, `${field} is too long (max ${max} characters)`);
  return t;
}

/** childRef must be a random id (letters, digits, - and _), never a name. Optional. */
export function asChildRef(v: unknown): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(v)) return v;
  throw new HttpError(400, "childRef must be a random id (8-64 letters, digits, - or _)");
}

/** Wrap a route handler: turns errors into JSON responses without logging any body text. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message, code: e.code }, e.status);
    // Log only the error type, never request content.
    console.error("[zaki] route error:", (e as Error)?.name ?? "Error");
    return json({ error: "something went wrong", code: "server_error" }, 500);
  }
}
