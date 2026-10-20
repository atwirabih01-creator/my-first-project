// supabaseStore: the private online database (Supabase, EU / Frankfurt). SERVER ONLY.
// It uses the service role key, which skips Row-Level Security, so it must never be bundled
// into the phone app. Every family check is done here (family_id on every query) and by the
// database itself (foreign keys + the child/family trigger in 0001_init.sql).
// The real client comes from ./supabaseClient (the only file that imports @supabase/supabase-js);
// tests pass a fake client with the same small surface.
import {
  RETENTION,
  StorageError,
  assertChildRef,
  assertFamilyId,
  cleanName,
  newChildRef,
  type BudgetDay,
  type Child,
  type Consent,
  type Family,
  type FlagInput,
  type FlagStatus,
  type Guardian,
  type LibraryEntry,
  type ProgressSnapshot,
  type SpendPurpose,
  type StoredFlag,
  type ZakiStore,
} from "./types";

// ---------------------------------------------------------------- minimal client surface
type PgError = { message: string; code?: string } | null;
type Result<T = any> = { data: T; error: PgError };
/** The parts of the supabase-js query builder we use. Each call returns the builder. */
export interface QueryLike extends PromiseLike<Result> {
  select(cols?: string): QueryLike;
  insert(rows: unknown): QueryLike;
  upsert(rows: unknown, opts?: { onConflict?: string; ignoreDuplicates?: boolean }): QueryLike;
  update(values: unknown): QueryLike;
  delete(): QueryLike;
  eq(col: string, v: unknown): QueryLike;
  in(col: string, v: unknown[]): QueryLike;
  order(col: string, opts?: { ascending?: boolean }): QueryLike;
  maybeSingle(): QueryLike;
}
export interface SupabaseLike {
  from(table: string): QueryLike;
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<Result>;
  storage: {
    from(bucket: string): {
      list(prefix?: string, opts?: { limit?: number; offset?: number }): PromiseLike<Result<{ name: string }[] | null>>;
      remove(paths: string[]): PromiseLike<Result>;
    };
  };
}

export const PHOTO_BUCKET = "page-photos";
/** Photos (if ever kept) go under "<YYYY-MM-DD>/<random>.jpg" so the clean-up can go by folder date. */
export const photoPath = (day: string, id: string = crypto.randomUUID()) => `${day}/${id}.jpg`;

async function run<T = any>(p: PromiseLike<Result<T>>, what: string): Promise<T> {
  const { data, error } = await p;
  if (error) throw new StorageError(`supabase_${what}: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------- row <-> object mapping
const flagFromRow = (r: any): StoredFlag => ({
  id: r.id,
  ts: r.created_at,
  category: r.category,
  route: r.route,
  involvesHome: r.involves_home,
  alertLevel: r.alert_level ?? undefined,
  speaker: r.speaker,
  lang: r.lang ?? undefined,
  country: r.country ?? undefined,
  layers: r.layers ?? [],
  childRef: r.child_ref ?? undefined,
  familyId: r.family_id ?? undefined,
  excerpt: r.excerpt,
  status: r.status,
  sharedWithParent: r.shared_with_parent,
  reviewerNote: r.reviewer_note ?? undefined,
  reviewedAt: r.reviewed_at ?? undefined,
});
const familyFromRow = (r: any): Family => ({
  id: r.id,
  createdAt: r.created_at,
  country: r.country ?? null,
  reportLang: r.report_lang,
  settings: r.settings ?? {},
});
const guardianFromRow = (r: any): Guardian => ({
  id: r.id,
  familyId: r.family_id,
  firstName: r.first_name,
  relationship: r.relationship,
  createdAt: r.created_at,
});
const consentFromRow = (r: any): Consent => ({
  id: r.id,
  familyId: r.family_id,
  guardianId: r.guardian_id ?? undefined,
  kind: r.kind,
  version: r.version,
  method: r.method,
  givenAt: r.given_at,
  withdrawnAt: r.withdrawn_at ?? undefined,
});
const childFromRow = (r: any): Child => ({
  familyId: r.family_id,
  childRef: r.child_ref,
  nickname: r.nickname,
  grade: r.grade,
  lang: r.lang,
  avatar: r.avatar,
  dailyLimitMin: r.daily_limit_min,
});

function lessonStatus(p: ProgressSnapshot["plan"][number], state: ProgressSnapshot["state"]): string {
  if (p.status) return p.status;
  if (p.pending) return "pending";
  const rec = p.packKey ? (state.lessons?.[p.packKey] as { passDates?: string[] } | undefined) : undefined;
  if (!rec) return "new";
  const passes = rec.passDates?.length ?? 0;
  return passes >= 2 ? "mastered" : passes === 1 ? "learned" : "learning";
}

// ---------------------------------------------------------------- the store
export function createSupabaseStore(getClient: () => Promise<SupabaseLike>): ZakiStore {
  let clientP: Promise<SupabaseLike> | null = null;
  const db = () => (clientP ??= getClient());

  async function childRow(familyId: string, childRef: string): Promise<{ id: string } | null> {
    assertFamilyId(familyId);
    assertChildRef(childRef);
    const c = await db();
    return run(c.from("children").select("id").eq("family_id", familyId).eq("child_ref", childRef).maybeSingle(), "child");
  }
  async function audit(action: string, familyId: string | null, detail: Record<string, unknown> = {}) {
    const c = await db();
    await run(c.from("audit_log").insert({ actor: "server", family_id: familyId, action, detail }), "audit");
  }

  const store: ZakiStore = {
    kind: "supabase",

    async addFlag(f: FlagInput) {
      const c = await db();
      const row = await run(
        c
          .from("flags")
          .insert({
            family_id: f.familyId ?? null,
            child_ref: f.childRef ?? null,
            category: f.category,
            route: f.route,
            involves_home: f.involvesHome,
            alert_level: f.alertLevel ?? null,
            speaker: f.speaker,
            lang: f.lang ?? null,
            country: f.country ?? null,
            layers: f.layers,
            excerpt: String(f.excerpt ?? "").slice(0, 200),
          })
          .select()
          .maybeSingle(),
        "add_flag",
      );
      return flagFromRow(row);
    },

    async listFlags(o) {
      const c = await db();
      let q = c.from("flags").select();
      if (o?.status) q = q.eq("status", o.status);
      const rows = await run(q.order("created_at", { ascending: true }), "list_flags");
      return (rows ?? []).map(flagFromRow);
    },

    async reviewFlag(id, review) {
      const c = await db();
      const row = await run(
        c
          .from("flags")
          .update({
            status: review.status,
            reviewer_note: review.reviewerNote?.slice(0, 1000) ?? null,
            shared_with_parent: Boolean(review.sharedWithParent),
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .maybeSingle(),
        "review_flag",
      );
      if (!row) return null;
      await audit("flag_reviewed", row.family_id ?? null, { flag_id: id, status: review.status, by: review.reviewer ?? "server" });
      return flagFromRow(row);
    },

    async parentAlerts(familyId) {
      assertFamilyId(familyId);
      const c = await db();
      const rows = await run(
        c.from("flags").select("id, created_at, category, status, child_ref, route, shared_with_parent").eq("family_id", familyId).order("created_at", { ascending: false }),
        "parent_alerts",
      );
      return (rows ?? [])
        .filter((r: any) => r.route === "parent" || r.shared_with_parent)
        .map((r: any) => ({ id: r.id, ts: r.created_at, category: r.category, status: r.status as FlagStatus, childRef: r.child_ref ?? undefined }));
    },

    async libraryGet(key) {
      const c = await db();
      const r = await run(c.from("library").select().eq("key", key).maybeSingle(), "library_get");
      if (!r) return null;
      return { key: r.key, pack: r.pack, sources: r.sources ?? [], verify: r.verify ?? { checked: 0, removed: 0 }, savedAt: r.saved_at };
    },

    async libraryPut(e: LibraryEntry) {
      const [subject, topicNorm, grade, lang] = e.key.split("|");
      const c = await db();
      await run(
        c.from("library").upsert(
          {
            key: e.key,
            subject: e.pack?.subject ?? subject,
            topic_norm: topicNorm ?? "",
            grade: e.pack?.grade ?? Number(grade),
            lang: e.pack?.lang ?? lang,
            pack: e.pack,
            sources: e.sources ?? [],
            verify: e.verify ?? { checked: 0, removed: 0 },
            saved_at: e.savedAt ?? new Date().toISOString(),
          },
          { onConflict: "key" },
        ),
        "library_put",
      );
    },

    async budgetGet(day): Promise<BudgetDay> {
      const c = await db();
      const r = await run(c.from("budget_daily").select().eq("day", day).maybeSingle(), "budget_get");
      const bp = r?.by_purpose ?? {};
      return {
        date: day,
        spentUsd: Number(r?.spent_usd ?? 0),
        byPurpose: { lesson: Number(bp.lesson ?? 0), tutor: Number(bp.tutor ?? 0), safety: Number(bp.safety ?? 0) },
      };
    },

    async budgetAdd(day, purpose: SpendPurpose, usd) {
      if (!(usd >= 0)) throw new StorageError("bad_budget_entry");
      const c = await db();
      return Number(await run(c.rpc("zaki_budget_add", { p_day: day, p_purpose: purpose, p_usd: usd }), "budget_add"));
    },

    async childTurnTake(day, childRef, limit) {
      const c = await db();
      return Boolean(await run(c.rpc("zaki_take_child_turn", { p_day: day, p_child_ref: childRef, p_limit: limit }), "child_turn"));
    },

    async createFamily(input) {
      const c = await db();
      const firstName = cleanName(input.guardian.firstName, 40);
      const fam = await run(
        c.from("families").insert({ country: input.country ?? null, report_lang: input.reportLang ?? "ar" }).select().maybeSingle(),
        "create_family",
      );
      const g = await run(
        c.from("guardians").insert({ family_id: fam.id, first_name: firstName, relationship: input.guardian.relationship }).select().maybeSingle(),
        "create_guardian",
      );
      await audit("family_created", fam.id);
      return { family: familyFromRow(fam), guardian: guardianFromRow(g) };
    },

    async getFamily(familyId) {
      assertFamilyId(familyId);
      const c = await db();
      const r = await run(c.from("families").select().eq("id", familyId).maybeSingle(), "get_family");
      return r ? familyFromRow(r) : null;
    },

    async addConsent(familyId, k) {
      assertFamilyId(familyId);
      const c = await db();
      const r = await run(
        c
          .from("consents")
          .insert({ family_id: familyId, guardian_id: k.guardianId ?? null, kind: k.kind ?? "main", version: k.version, method: k.method ?? "in_app_gate" })
          .select()
          .maybeSingle(),
        "add_consent",
      );
      await audit("consent_given", familyId, { kind: r.kind, version: r.version });
      return consentFromRow(r);
    },

    async withdrawConsent(familyId, consentId) {
      assertFamilyId(familyId);
      const c = await db();
      const r = await run(
        c.from("consents").update({ withdrawn_at: new Date().toISOString() }).eq("id", consentId).eq("family_id", familyId).select("id").maybeSingle(),
        "withdraw_consent",
      );
      if (r) await audit("consent_withdrawn", familyId, { consent_id: consentId });
      return Boolean(r);
    },

    async upsertChild(input) {
      assertFamilyId(input.familyId);
      const childRef = input.childRef ?? newChildRef();
      assertChildRef(childRef);
      const c = await db();
      const r = await run(
        c
          .from("children")
          .upsert(
            {
              family_id: input.familyId,
              child_ref: childRef,
              nickname: cleanName(input.nickname, 20, true),
              grade: input.grade,
              lang: input.lang,
              avatar: input.avatar,
              daily_limit_min: input.dailyLimitMin,
            },
            { onConflict: "child_ref" },
          )
          .select()
          .maybeSingle(),
        "upsert_child",
      );
      if (r.family_id !== input.familyId) throw new StorageError("child_belongs_to_another_family");
      return childFromRow(r);
    },

    async listChildren(familyId) {
      assertFamilyId(familyId);
      const c = await db();
      const rows = await run(c.from("children").select().eq("family_id", familyId), "list_children");
      return (rows ?? []).map(childFromRow);
    },

    async syncProgress(familyId, childRef, s) {
      const child = await childRow(familyId, childRef);
      if (!child) throw new StorageError("child_not_found");
      const c = await db();
      const base = { family_id: familyId, child_id: child.id };

      await run(
        c.from("children").update({ progress_state: s.state ?? {} }).eq("id", child.id).eq("family_id", familyId),
        "sync_state",
      );
      if (s.plan.length) {
        await run(
          c.from("lessons").upsert(
            s.plan.map((p, i) => ({
              ...base,
              client_id: p.id,
              subject: p.subject,
              topic: p.topic,
              kind: p.kind,
              position: i,
              status: lessonStatus(p, s.state ?? {}),
              unlocked: Boolean(p.unlocked),
              test_date: p.dueDate ?? null,
              pack_key: p.packKey ?? null,
              sessions: p.sessions ?? null,
              added_at: p.addedAt,
            })),
            { onConflict: "child_id,client_id" },
          ),
          "sync_lessons",
        );
      }
      if (s.packs?.length) {
        await run(
          c.from("lesson_packs").upsert(
            s.packs.map((p) => ({
              ...base,
              pack_key: p.packKey,
              subject: p.subject,
              topic: p.topic,
              grade: p.grade,
              lang: p.lang,
              source: p.source,
              library_key: p.source === "photo" ? null : (p.libraryKey ?? null), // photo packs never shared
              pack: p.pack,
              sources: p.sources ?? [],
              demo: Boolean(p.demo),
            })),
            { onConflict: "family_id,pack_key" },
          ),
          "sync_packs",
        );
      }
      const examIds = new Map<string, string>();
      if (s.exams.length) {
        const rows = await run(
          c
            .from("exams")
            .upsert(
              s.exams.map((e) => ({
                ...base,
                client_id: e.id,
                subject: e.subject,
                title: e.title,
                exam_date: e.date,
                lesson_keys: e.lessonKeys,
                lesson_topics: e.lessonTopics,
                questions: e.questions,
                added_by_ai: e.addedByAi ?? 0,
                created_at: e.createdAt,
              })),
              { onConflict: "child_id,client_id" },
            )
            .select("id, client_id"),
          "sync_exams",
        );
        for (const r of rows ?? []) examIds.set(r.client_id, r.id);
      }
      const attempts = [
        ...s.tests.map((t) => ({
          ...base,
          client_key: `t|${t.lessonKey}|${t.at}`,
          kind: "test",
          lesson_key: t.lessonKey,
          exam_id: null,
          score: t.score,
          total: t.total,
          passed: t.passed,
          practice: false,
          attempt_no: t.attempt,
          seconds: t.seconds,
          per_question: t.perQuestion ?? [],
          per_lesson: null,
          day: t.date,
          finished_at: t.at,
        })),
        ...s.examResults
          .filter((r) => examIds.has(r.examId))
          .map((r) => ({
            ...base,
            client_key: `e|${r.examId}|${r.at}`,
            kind: "exam",
            lesson_key: null,
            exam_id: examIds.get(r.examId),
            score: r.score,
            total: r.total,
            passed: null,
            practice: r.practice,
            attempt_no: 1,
            seconds: r.seconds,
            per_question: [],
            per_lesson: r.perLesson,
            day: r.date,
            finished_at: r.at,
          })),
      ];
      if (attempts.length) {
        await run(c.from("attempts").upsert(attempts, { onConflict: "child_id,client_key", ignoreDuplicates: true }), "sync_attempts");
      }
      if (s.sessions.length) {
        await run(
          c.from("sessions").upsert(
            s.sessions.map((x) => ({ ...base, day: x.date, minutes: x.minutes, lesson_key: x.lessonKey ?? null, started_at: x.at })),
            { onConflict: "child_id,started_at" },
          ),
          "sync_sessions",
        );
      }
      if (s.chat?.length) {
        const cutoff = Date.now() - RETENTION.chatDays * 86_400_000;
        const fresh = s.chat.filter((m) => Date.parse(m.at) >= cutoff);
        if (fresh.length) {
          await run(
            c.from("chat_messages").insert(
              fresh.map((m) => ({ ...base, kind: m.kind ?? "chat", role: m.role, lesson_key: m.lessonKey ?? null, text: m.text.slice(0, 2000), created_at: m.at })),
            ),
            "sync_chat",
          );
        }
      }
    },

    async getProgress(familyId, childRef) {
      const child = await childRow(familyId, childRef);
      if (!child) return null;
      const c = await db();
      const [state, lessons, packs, exams, attempts, sessions] = await Promise.all([
        run(c.from("children").select("progress_state").eq("id", child.id).maybeSingle(), "get_state"),
        run(c.from("lessons").select().eq("child_id", child.id).order("position", { ascending: true }), "get_lessons"),
        run(c.from("lesson_packs").select().eq("child_id", child.id), "get_packs"),
        run(c.from("exams").select().eq("child_id", child.id), "get_exams"),
        run(c.from("attempts").select().eq("child_id", child.id).order("finished_at", { ascending: true }), "get_attempts"),
        run(c.from("sessions").select().eq("child_id", child.id).order("started_at", { ascending: true }), "get_sessions"),
      ]);
      const examClient = new Map<string, string>((exams ?? []).map((e: any) => [e.id, e.client_id]));
      return {
        state: state?.progress_state ?? {},
        plan: (lessons ?? []).map((l: any) => ({
          id: l.client_id,
          subject: l.subject,
          topic: l.topic,
          kind: l.kind,
          dueDate: l.test_date ?? undefined,
          addedAt: l.added_at,
          packKey: l.pack_key ?? undefined,
          sessions: l.sessions ?? undefined,
          unlocked: l.unlocked || undefined,
          pending: l.status === "pending" || undefined,
          status: l.status,
        })),
        packs: (packs ?? []).map((p: any) => ({
          packKey: p.pack_key,
          subject: p.subject,
          topic: p.topic,
          grade: p.grade,
          lang: p.lang,
          source: p.source,
          libraryKey: p.library_key ?? undefined,
          pack: p.pack,
          sources: p.sources ?? [],
          demo: p.demo,
          savedAt: p.created_at,
        })),
        exams: (exams ?? []).map((e: any) => ({
          id: e.client_id,
          subject: e.subject,
          title: e.title,
          date: e.exam_date,
          lessonKeys: e.lesson_keys ?? [],
          lessonTopics: e.lesson_topics ?? {},
          questions: e.questions ?? [],
          createdAt: e.created_at,
          addedByAi: e.added_by_ai,
        })),
        tests: (attempts ?? [])
          .filter((a: any) => a.kind === "test")
          .map((a: any) => ({
            lessonKey: a.lesson_key,
            date: a.day,
            at: a.finished_at,
            score: a.score,
            total: a.total,
            passed: Boolean(a.passed),
            seconds: a.seconds,
            attempt: a.attempt_no,
            perQuestion: a.per_question?.length ? a.per_question : undefined,
          })),
        examResults: (attempts ?? [])
          .filter((a: any) => a.kind === "exam" && examClient.has(a.exam_id))
          .map((a: any) => ({
            examId: examClient.get(a.exam_id)!,
            date: a.day,
            at: a.finished_at,
            score: a.score,
            total: a.total,
            seconds: a.seconds,
            practice: a.practice,
            perLesson: a.per_lesson ?? {},
          })),
        sessions: (sessions ?? []).map((x: any) => ({ date: x.day, minutes: x.minutes, lessonKey: x.lesson_key ?? undefined, at: x.started_at })),
      };
    },

    async setFamilyKeyHash(familyId, keyHash) {
      assertFamilyId(familyId);
      if (!/^[0-9a-f]{64}$/.test(keyHash)) throw new StorageError("bad_key_hash");
      const c = await db();
      await run(c.from("family_keys").upsert({ family_id: familyId, key_hash: keyHash }, { onConflict: "family_id" }), "set_family_key");
      await audit("family_key_set", familyId);
    },

    async getFamilyKeyHash(familyId) {
      assertFamilyId(familyId);
      const c = await db();
      const r = await run(c.from("family_keys").select("key_hash").eq("family_id", familyId).maybeSingle(), "get_family_key");
      return r?.key_hash ?? null;
    },

    async unlinkChildren(childRefs) {
      if (!childRefs.length) return 0;
      childRefs.forEach(assertChildRef);
      const c = await db();
      const rows = await run(c.from("flags").update({ child_ref: null, family_id: null }).in("child_ref", childRefs).select("id"), "unlink_children");
      return Array.isArray(rows) ? rows.length : 0;
    },

    async exportFamily(familyId) {
      assertFamilyId(familyId);
      const c = await db();
      const data = await run(c.rpc("zaki_export_family", { p_family_id: familyId }), "export_family");
      return data ? { exportedAt: new Date().toISOString(), storage: "supabase", data } : null;
    },

    async deleteFamily(familyId) {
      assertFamilyId(familyId);
      const c = await db();
      return Boolean(await run(c.rpc("zaki_delete_family", { p_family_id: familyId }), "delete_family"));
    },

    async runRetention(now = new Date()) {
      const c = await db();
      const r = (await run(
        c.rpc("zaki_run_retention", { p_chat_days: RETENTION.chatDays, p_flag_days: RETENTION.reviewedFlagDays }),
        "retention",
      )) as Record<string, number>;
      // Page photos: folders are named by upload day; remove whole days older than ~30 days.
      const cutoffDay = new Date(now.getTime() - RETENTION.photoDays * 86_400_000).toISOString().slice(0, 10);
      const bucket = c.storage.from(PHOTO_BUCKET);
      let photos = 0;
      const folders = (await run(bucket.list("", { limit: 1000 }), "photo_list")) ?? [];
      for (const folder of folders) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(folder.name) || folder.name >= cutoffDay) continue;
        const files = (await run(bucket.list(folder.name, { limit: 1000 }), "photo_list_day")) ?? [];
        const paths = files.map((f) => `${folder.name}/${f.name}`);
        if (paths.length) {
          await run(bucket.remove(paths), "photo_remove");
          photos += paths.length;
        }
      }
      return {
        chat: Number(r?.chat ?? 0),
        flags: Number(r?.flags ?? 0),
        photos,
        other: Number(r?.turns ?? 0) + Number(r?.budget ?? 0) + Number(r?.audit ?? 0),
      };
    },
  };
  return store;
}
