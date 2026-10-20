// SAFETY REVIEWER INBOX + family deletion.
// The independent reviewer (not a family member) sees every flag. Flags with route
// "reviewer" (possible home involvement, or unclear) are NEVER given to parent-facing code.
// Source: the flag queue (memory + server/data/flags.jsonl). Reviewer status/notes are kept
// in server/data/flag-reviews.json (gitignored).
import { timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { aiEnabled } from "./config/models";
import { HttpError } from "./http";
import { __replaceFlags, getFlagQueue, type FlagRecord } from "./safety";

export type ReviewStatus = "new" | "seen" | "resolved";
export const REVIEW_STATUSES: ReviewStatus[] = ["new", "seen", "resolved"];
export const DEMO_REVIEWER_CODE = "2468";

export type ReviewerFlag = {
  id: string;
  ts: string;
  category: string;
  route: "reviewer" | "parent";
  involvesHome: boolean;
  speaker: "child" | "tutor";
  lang: string;
  childRef?: string;
  excerpt: string;
  status: ReviewStatus;
  note?: string;
};

type ReviewState = Record<string, { status: ReviewStatus; note?: string; updatedAt: string }>;
let reviews: ReviewState | null = null;
let fileOverride: { flags?: string | null; reviews?: string | null } = {};

const flagFile = () =>
  fileOverride.flags !== undefined ? fileOverride.flags : process.env.ZAKI_FLAG_FILE === "off" ? null : process.env.ZAKI_FLAG_FILE || path.join(process.cwd(), "server", "data", "flags.jsonl");
const reviewFile = () =>
  fileOverride.reviews !== undefined ? fileOverride.reviews : process.env.ZAKI_FLAG_FILE === "off" ? null : path.join(process.cwd(), "server", "data", "flag-reviews.json");

function loadReviews(): ReviewState {
  if (reviews) return reviews;
  reviews = {};
  const f = reviewFile();
  if (f) {
    try {
      reviews = JSON.parse(fs.readFileSync(f, "utf8")) as ReviewState;
    } catch {
      // none yet
    }
  }
  return reviews;
}

function saveReviews(): void {
  const f = reviewFile();
  if (!f || !reviews) return;
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(reviews));
  } catch {
    // read-only hosting
  }
}

/** All flags: the JSONL file (survives restarts) merged with the in-memory queue. */
function allFlags(): FlagRecord[] {
  const byId = new Map<string, FlagRecord>();
  const f = flagFile();
  if (f) {
    try {
      for (const line of fs.readFileSync(f, "utf8").split("\n")) {
        if (!line.trim()) continue;
        try {
          const rec = JSON.parse(line) as FlagRecord;
          if (rec && rec.id) byId.set(rec.id, rec);
        } catch {
          // skip a broken line
        }
      }
    } catch {
      // no file
    }
  }
  for (const rec of getFlagQueue()) byId.set(rec.id, rec);
  return [...byId.values()];
}

const routeOf = (f: FlagRecord): "reviewer" | "parent" => f.route ?? (f.alertParent && !f.involvesHome ? "parent" : "reviewer");

/** Reviewer view: every flag, newest first, scrubbed excerpt, childRef only (never names). */
export function listFlagsForReviewer(): ReviewerFlag[] {
  const r = loadReviews();
  return allFlags()
    .map((f) => ({
      id: f.id,
      ts: f.ts,
      category: f.category,
      route: routeOf(f),
      involvesHome: f.involvesHome,
      speaker: f.speaker,
      lang: f.lang,
      childRef: f.childRef,
      excerpt: f.excerpt,
      status: r[f.id]?.status ?? "new",
      note: r[f.id]?.note,
    }))
    .sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

export function updateFlagReview(id: string, status: ReviewStatus, note?: string): ReviewerFlag {
  if (!REVIEW_STATUSES.includes(status)) throw new HttpError(400, `status must be one of ${REVIEW_STATUSES.join(", ")}`);
  const flag = listFlagsForReviewer().find((f) => f.id === id);
  if (!flag) throw new HttpError(404, "flag not found", "not_found");
  const r = loadReviews();
  r[id] = { status, note: note?.slice(0, 1000), updatedAt: new Date().toISOString() };
  saveReviews();
  return { ...flag, status, note: r[id].note };
}

/**
 * The ONLY flag view parent-facing code may use: route "parent" flags for these children,
 * with no excerpt (category + time only). Reviewer-route flags are never included.
 */
export function flagsForParent(childRefs: string[]): { category: string; ts: string }[] {
  const refs = new Set(childRefs);
  return allFlags()
    .filter((f) => routeOf(f) === "parent" && f.childRef !== undefined && refs.has(f.childRef))
    .map((f) => ({ category: f.category, ts: f.ts }));
}

/** Reviewer code check (constant time). Demo mode (no AI key) accepts the demo code if none is set. */
export function checkReviewerCode(request: Request): void {
  const given = request.headers.get("x-reviewer-code") ?? "";
  const configured = process.env.ZAKI_REVIEWER_CODE || (!aiEnabled() ? DEMO_REVIEWER_CODE : "");
  if (!configured) throw new HttpError(503, "reviewer code is not set on the server", "not_configured");
  const a = Buffer.from(given);
  const b = Buffer.from(configured);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(401, "wrong reviewer code", "unauthorized");
}

/**
 * Family deletion: stored items for these childRefs are removed. Safety flags are kept ONLY in
 * anonymised form (no childRef, no excerpt) so the reviewer's safety record isn't lost.
 */
export function anonymiseFlagsFor(childRefs: string[]): number {
  const refs = new Set(childRefs);
  let n = 0;
  const scrub = (f: FlagRecord): FlagRecord => {
    if (!f.childRef || !refs.has(f.childRef)) return f;
    n++;
    return { ...f, childRef: undefined, excerpt: "[removed at the family's request]" };
  };
  __replaceFlags(scrub);
  const f = flagFile();
  if (f) {
    try {
      const lines = fs.readFileSync(f, "utf8").split("\n").filter((l) => l.trim());
      let changed = false;
      const out = lines.map((line) => {
        try {
          const rec = JSON.parse(line) as FlagRecord;
          if (rec.childRef && refs.has(rec.childRef)) {
            changed = true;
            return JSON.stringify({ ...rec, childRef: undefined, excerpt: "[removed at the family's request]" });
          }
        } catch {
          // keep as is
        }
        return line;
      });
      if (changed) fs.writeFileSync(f, out.join("\n") + "\n");
    } catch {
      // no file
    }
  }
  return n;
}

/** Tests only. */
export function __resetReviewForTests(files: { flags?: string | null; reviews?: string | null } = { flags: null, reviews: null }): void {
  reviews = null;
  fileOverride = files;
}
