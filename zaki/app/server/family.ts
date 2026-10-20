// FAMILY IDENTITY (decision (a)): when a family gives consent, the server creates the family
// and issues a long random SECRET KEY to that phone. Only the key's SHA-256 hash is stored
// (files: families/<id>.json; database: public.family_keys, service role only).
// Every family route (sync, export, consent, delete) calls verifyFamily() FIRST: no family
// data is read or written with the service role before the key is checked.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { forgetChildren } from "./budget";
import { HttpError } from "./http";
import { getStore, StorageError, type ProgressSnapshot, type Relationship } from "./storage";
import type { Country, Lang } from "./types";

const hashKey = (key: string) => createHash("sha256").update(key, "utf8").digest("hex");

export function relationshipOf(text: string): Relationship {
  const t = text.trim().toLowerCase();
  if (/(mother|mom|mum|mama|maman|mère|mere|أم|ام|ماما)/.test(t)) return "mother";
  if (/(father|dad|papa|baba|père|pere|أب|اب|بابا)/.test(t)) return "father";
  if (/(guardian|grand|aunt|uncle|وليّ|ولي|جد|جدة|عم|خال)/.test(t)) return "guardian";
  return "other";
}

export type RegisterInput = {
  guardians: { firstName: string; relationship: string }[];
  consentVersion: string;
  country?: Country | null;
  reportLang?: Lang;
};

/** Creates the family + consent and returns the secret key ONCE (the server keeps only a hash). */
export async function registerFamily(input: RegisterInput): Promise<{ familyId: string; familyKey: string; consentId: string }> {
  if (!input.guardians.length || input.guardians.length > 2) throw new HttpError(400, "1 or 2 guardians");
  const store = getStore();
  const first = input.guardians[0];
  const { family, guardian } = await store.createFamily({
    country: input.country ?? null,
    reportLang: input.reportLang,
    guardian: { firstName: first.firstName.trim().split(/\s+/)[0], relationship: relationshipOf(first.relationship) },
  });
  const consent = await store.addConsent(family.id, { version: input.consentVersion.slice(0, 40), method: "in_app_gate", guardianId: guardian.id });
  const familyKey = randomBytes(32).toString("base64url");
  await store.setFamilyKeyHash(family.id, hashKey(familyKey));
  return { familyId: family.id, familyKey, consentId: consent.id };
}

/** Throws 401 unless the key matches this family's stored hash (constant-time compare). */
export async function verifyFamily(familyId: unknown, familyKey: unknown): Promise<string> {
  if (typeof familyId !== "string" || typeof familyKey !== "string" || familyKey.length < 20 || familyKey.length > 200) {
    throw new HttpError(401, "family key required", "unauthorized");
  }
  let stored: string | null;
  try {
    stored = await getStore().getFamilyKeyHash(familyId);
  } catch (e) {
    if (e instanceof StorageError) throw new HttpError(401, "unknown family", "unauthorized");
    throw e;
  }
  const given = Buffer.from(hashKey(familyKey), "hex");
  const ok = !!stored && Buffer.from(stored, "hex").length === given.length && timingSafeEqual(Buffer.from(stored, "hex"), given);
  if (!ok) throw new HttpError(401, "wrong family key", "unauthorized");
  return familyId;
}

export type SyncChildInput = {
  childRef: string;
  nickname: string;
  grade: number;
  lang: Lang;
  avatar: string;
  dailyLimitMin: number;
  progress?: ProgressSnapshot;
};

export async function syncFamily(familyId: string, children: SyncChildInput[]): Promise<number> {
  const store = getStore();
  for (const c of children) {
    await store.upsertChild({ familyId, childRef: c.childRef, nickname: c.nickname, grade: c.grade, lang: c.lang, avatar: c.avatar, dailyLimitMin: c.dailyLimitMin });
    if (c.progress) await store.syncProgress(familyId, c.childRef, c.progress);
  }
  return children.length;
}

/** Deletes everything for a VERIFIED family. Its flags stay (open referrals) with no link to the children. */
export async function deleteVerifiedFamily(familyId: string): Promise<{ children: number; flagsUnlinked: number }> {
  const store = getStore();
  const refs = (await store.listChildren(familyId)).map((c) => c.childRef);
  const flagsUnlinked = await store.unlinkChildren(refs);
  await forgetChildren(refs);
  await store.deleteFamily(familyId);
  return { children: refs.length, flagsUnlinked };
}
