// FIXED, VERIFIED help-route table for the child safety screen.
// Source: docs/research/08-safety-review-phase0.md (help-route table), research files 04 and 06.
// Rules (from the safety review):
//  - A child only ever sees entries listed here. The AI never writes or changes a number.
//  - "Tell a grown-up you trust" always comes first (many children use Wi-Fi tablets that cannot call).
//  - Any line not confirmed 24/7 always carries the "If nobody answers, or you are in danger now, call 112" line.
//  - Country comes from the parent's setting, never from location. Unknown country => trusted adult only.
//  - If the table is past its re-check date, fall back to trusted adult + emergency number only.
//  - Show numbers as big text (no tap-to-call link) by default.
// This file is safe to import from screens (no secrets, no server code).
// A copy of the same table is re-exported by server/help-routes.ts.

export type HelpCountry = "LB" | "QA";
export type HelpLang = "en" | "ar";
export type HelpKind = "home" | "self_harm" | "fear" | "general";

export type HelpRoute = {
  id: string;
  /** Short local number the child sees, or null for "tell a grown-up". */
  number: string | null;
  /** International form: parent / reviewer messages only, never shown to the child. */
  intlNumber: string | null;
  text: Record<HelpLang, string>;
  /** Extra line that must always be shown under this route (e.g. 112 fallback). */
  fallback?: Record<HelpLang, string>;
  available247: boolean;
  /** Which safety-screen kinds show this route. */
  kinds: HelpKind[];
  /** true = emergency line kept even when the table is stale. */
  emergency?: boolean;
};

export const HELP_ROUTES_LAST_CHECKED = "2026-10-16";
/** Re-check cadence from the safety review: Lebanon monthly (war), Qatar every 3 months. */
export const HELP_ROUTES_RECHECK_DAYS: Record<HelpCountry, number> = { LB: 31, QA: 92 };

const TRUSTED_ADULT: HelpRoute = {
  id: "trusted_adult",
  number: null,
  intlNumber: null,
  text: {
    en: "Tell a grown-up you trust right now: a parent, grandparent, aunt, uncle or teacher. Ask them to help you call.",
    ar: "أخبِر الآن شخصًا كبيرًا تثق به: أحد والديك، أو جدّك أو جدّتك، أو عمّك أو خالتك، أو معلّمك. اطلب منه أن يساعدك في الاتصال.",
  },
  available247: true,
  kinds: ["home", "self_harm", "fear", "general"],
};

const LB_112_FALLBACK: Record<HelpLang, string> = {
  en: "If nobody answers, or you are in danger now, call 112.",
  ar: "إذا لم يُجِب أحد، أو كنت في خطر الآن، اتصل بالرقم 112.",
};

export const HELP_ROUTES: Record<HelpCountry, HelpRoute[]> = {
  LB: [
    TRUSTED_ADULT,
    {
      id: "lb_112",
      number: "112",
      intlNumber: "+961 112",
      text: {
        en: "If you are in danger now, call 112 (police, all day and all night).",
        ar: "إذا كنت في خطر الآن، اتصل بالرقم 112 (الشرطة، طوال النهار والليل).",
      },
      available247: true,
      kinds: ["home", "self_harm", "general"],
      emergency: true,
    },
    {
      id: "lb_1564",
      number: "1564",
      intlNumber: "+961 1564",
      text: {
        en: "Very sad, or scared? Call 1564 (Embrace). Kind people answer all day and all night.",
        ar: "إذا كنت حزينًا جدًّا أو خائفًا، اتصل بالرقم 1564 (إمبريس). يجيبك أشخاص لطفاء طوال النهار والليل.",
      },
      available247: true,
      kinds: ["self_harm", "fear", "general"],
    },
    {
      id: "lb_himaya",
      number: "03 414 964",
      intlNumber: "+961 3 414 964",
      text: {
        en: "Someone at home or someone you know is hurting you? Tell another grown-up you trust. You can also call himaya on 03 414 964 (a charity that helps children).",
        ar: "إذا كان أحد في البيت أو شخص تعرفه يؤذيك، أخبِر شخصًا كبيرًا آخر تثق به. يمكنك أيضًا الاتصال بجمعية حماية على الرقم 03 414 964 (جمعية تساعد الأطفال).",
      },
      fallback: LB_112_FALLBACK,
      available247: false,
      kinds: ["home", "general"],
    },
  ],
  QA: [
    TRUSTED_ADULT,
    {
      id: "qa_919",
      number: "919",
      intlNumber: "+974 919",
      text: {
        en: "To talk to someone who helps children, call 919 (Aman). It's free, all day and all night.",
        ar: "لتتحدث مع شخص يساعد الأطفال، اتصل بالرقم 919 (مركز أمان). الاتصال مجاني طوال النهار والليل.",
      },
      available247: true,
      kinds: ["home", "self_harm", "fear", "general"],
    },
    // Qatar 999 is NOT shown yet: "Partly confirmed" only. Re-read from an official MOI/Hukoomi page first.
  ],
};

function daysBetween(fromIso: string, now: Date): number {
  const from = new Date(fromIso + "T00:00:00Z").getTime();
  return Math.floor((now.getTime() - from) / 86_400_000);
}

export function isHelpTableStale(country: HelpCountry, now: Date = new Date()): boolean {
  return daysBetween(HELP_ROUTES_LAST_CHECKED, now) > HELP_ROUTES_RECHECK_DAYS[country];
}

/**
 * The routes a child should see, in display order.
 * Unknown country => trusted adult only. Stale table => trusted adult + emergency line only.
 */
export function getChildHelpRoutes(
  country: HelpCountry | string | null | undefined,
  kind: HelpKind = "general",
  now: Date = new Date(),
): HelpRoute[] {
  if (country !== "LB" && country !== "QA") return [TRUSTED_ADULT];
  const all = HELP_ROUTES[country];
  if (isHelpTableStale(country, now)) {
    return all.filter((r) => r.id === "trusted_adult" || r.emergency);
  }
  return all.filter((r) => r.kinds.includes(kind));
}
