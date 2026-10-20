// SAFETY REVIEWER INBOX + family deletion, on top of the storage layer (getStore()):
// files (server/data/flags.jsonl) by default, or the online database when configured.
// The independent reviewer (not a family member) sees every flag. Flags with route
// "reviewer" (possible home involvement, or unclear) are NEVER given to parent-facing code.
import { timingSafeEqual } from "node:crypto";

import { aiEnabled } from "./config/models";
import { HttpError } from "./http";
import { getStore, type FlagStatus, type StoredFlag } from "./storage";

/** Statuses as the reviewer sees them, mapped onto the stored ones. */
export type ReviewStatus = "new" | "seen" | "referred" | "resolved";
export const REVIEW_STATUSES: ReviewStatus[] = ["new", "seen", "referred", "resolved"];
const TO_STORE: Record<ReviewStatus, FlagStatus> = { new: "pending_review", seen: "reviewed", referred: "referred", resolved: "closed" };
const FROM_STORE: Record<FlagStatus, ReviewStatus> = { pending_review: "new", reviewed: "seen", referred: "referred", closed: "resolved" };
export const DEMO_REVIEWER_CODE = "2468";

export type ReviewerFlag = {
  id: string;
  ts: string;
  category: string;
  route: "reviewer" | "parent";
  involvesHome: boolean;
  speaker: string;
  lang?: string;
  childRef?: string;
  excerpt: string;
  status: ReviewStatus;
  note?: string;
};

const toReviewer = (f: StoredFlag): ReviewerFlag => ({
  id: f.id,
  ts: f.ts,
  category: f.category,
  route: f.route,
  involvesHome: f.involvesHome,
  speaker: f.speaker,
  lang: f.lang,
  childRef: f.childRef,
  excerpt: f.excerpt,
  status: FROM_STORE[f.status] ?? "new",
  note: f.reviewerNote,
});

/** Reviewer view: every flag, newest first, scrubbed excerpt, childRef only (never names). */
export async function listFlagsForReviewer(): Promise<ReviewerFlag[]> {
  const flags = await getStore().listFlags();
  return flags.map(toReviewer).sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

export async function updateFlagReview(id: string, status: ReviewStatus, note?: string): Promise<ReviewerFlag> {
  if (!REVIEW_STATUSES.includes(status)) throw new HttpError(400, `status must be one of ${REVIEW_STATUSES.join(", ")}`);
  const updated = await getStore().reviewFlag(id, { status: TO_STORE[status], reviewerNote: note?.slice(0, 1000) });
  if (!updated) throw new HttpError(404, "flag not found", "not_found");
  return toReviewer(updated);
}

/**
 * The ONLY flag view parent-facing code may use: route "parent" flags (or ones the reviewer
 * chose to share) for these children, with no excerpt (category + time only).
 */
export async function flagsForParent(childRefs: string[]): Promise<{ category: string; ts: string }[]> {
  const refs = new Set(childRefs);
  const flags = await getStore().listFlags();
  return flags
    .filter((f) => (f.route === "parent" || f.sharedWithParent) && f.childRef !== undefined && refs.has(f.childRef))
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
 * Family deletion: flags of these children are kept for the reviewer (an open referral must
 * not vanish) but lose every link to the child/family (no childRef, no familyId).
 */
export async function anonymiseFlagsFor(childRefs: string[]): Promise<number> {
  return getStore().unlinkChildren(childRefs);
}
