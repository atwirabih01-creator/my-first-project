// WhatsApp-simulator handler for PARENTS. Parent-service jobs only (Meta 2026 rule):
// test dates, lesson names, study times, and the commands REPORT / PLAN / PAUSE / HELP /
// STOP / DELETE MY DATA (English and Arabic). Deterministic: no AI, so nothing a parent types
// goes to an AI company from here. Anything else gets a fixed, polite redirect to the app.
// Replies never contain the child's words or health/safety details.

import { normalizeBase, easternToWesternDigits } from "./normalize";
import type { Country, Lang, Subject } from "./types";

export type ParentIntent =
  | "test"
  | "lesson"
  | "study_time"
  | "report"
  | "plan"
  | "pause"
  | "help"
  | "stop"
  | "delete_data"
  | "other";

export type ParentPlan = {
  subject: Subject;
  topic: string;
  dueDate?: string; // YYYY-MM-DD
  sessions: number;
  studyTime?: string; // HH:MM, 24h
};

export type ParentResult = {
  reply: string;
  intent: ParentIntent;
  plan?: ParentPlan;
  /** For commands: what the app should do (the server does not change data itself). */
  action?: "send_report" | "show_plan" | "pause_reminders" | "opt_out" | "request_deletion";
  studyTime?: string;
};

const TZ: Record<Country, string> = { LB: "Asia/Beirut", QA: "Asia/Qatar" };

// ---------------------------------------------------------------------------------------
// Fixed texts
// ---------------------------------------------------------------------------------------

const T = {
  redirect: {
    en: "Sorry, here I can only help with your child's Zaki study plan: test dates, lesson names, study times, or REPORT, PLAN, PAUSE, HELP, STOP, DELETE MY DATA. For anything else, please open the Zaki app.",
    ar: "عذرًا، هنا أستطيع المساعدة فقط في خطة دراسة طفلك في ذكي: مواعيد الاختبارات، أسماء الدروس، أوقات الدراسة، أو الأوامر: تقرير، خطة، إيقاف مؤقت، مساعدة، إيقاف، احذف بياناتي. لأي شيء آخر، يُرجى فتح تطبيق ذكي.",
  },
  help: {
    en: "Zaki commands:\n• Send a test: \"Math test on Thursday about fractions\"\n• Send a lesson: \"Lesson: the water cycle (science)\"\n• Study time: \"Study at 5pm\"\n• REPORT, PLAN, PAUSE, STOP, DELETE MY DATA\nA person from the Zaki team can also help you in the app.",
    ar: "أوامر ذكي:\n• أرسل موعد اختبار: «اختبار رياضيات يوم الخميس عن الكسور»\n• أرسل درسًا: «درس: دورة الماء (علوم)»\n• وقت الدراسة: «الدراسة الساعة 5 مساءً»\n• تقرير، خطة، إيقاف مؤقت، إيقاف، احذف بياناتي\nويمكن لشخص من فريق ذكي مساعدتك داخل التطبيق.",
  },
  report: {
    en: "📊 Here is your child's latest Zaki report. You can see all details in the parent area of the app.",
    ar: "📊 هذا آخر تقرير لطفلك في ذكي. يمكنك رؤية كل التفاصيل في قسم الأهل داخل التطبيق.",
  },
  plan: {
    en: "🗓️ Here is your child's study plan. To add something, send a test date or a lesson name.",
    ar: "🗓️ هذه خطة دراسة طفلك. لإضافة شيء، أرسل موعد اختبار أو اسم درس.",
  },
  pause: {
    en: "⏸️ Zaki reminders are paused. Send PLAN or a new study time to start again.",
    ar: "⏸️ تم إيقاف تذكيرات ذكي مؤقتًا. أرسل «خطة» أو وقت دراسة جديدًا للبدء من جديد.",
  },
  stop: {
    en: "You will not get any more Zaki messages on WhatsApp. To start again, use the parent area of the app.",
    ar: "لن تصلك رسائل ذكي على واتساب بعد الآن. للبدء من جديد، استخدم قسم الأهل في التطبيق.",
  },
  deleteData: {
    en: "We received your request to delete your data. To protect your child, please confirm it in the parent area of the app. We will finish within 10 days.",
    ar: "وصلنا طلبك لحذف بياناتك. لحماية طفلك، يُرجى تأكيد الطلب في قسم الأهل داخل التطبيق. سننتهي خلال 10 أيام.",
  },
  needSubject: {
    en: "Thanks! Which subject and lesson is it about? For example: \"Math test on Thursday about fractions\".",
    ar: "شكرًا! ما المادة والدرس؟ مثلًا: «اختبار رياضيات يوم الخميس عن الكسور».",
  },
} as const;

// ---------------------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------------------

const SUBJECT_WORDS: [Subject, string[]][] = [
  ["math", ["math", "maths", "mathematics", "رياضيات", "الرياضيات", "حساب", "الحساب", "maths test"]],
  ["science", ["science", "sciences", "علوم", "العلوم"]],
  ["english", ["english", "انجليزي", "الانجليزي", "الانجليزيه", "انكليزي", "الانكليزي", "الانكليزيه"]],
  ["arabic", ["arabic", "عربي", "العربي", "العربيه", "لغه عربيه", "اللغه العربيه"]],
  ["social", ["social", "social studies", "geography", "اجتماعيات", "الاجتماعيات", "دراسات اجتماعيه", "الدراسات الاجتماعيه", "جغرافيا", "الجغرافيا"]],
];

const TEST_WORDS = ["test", "exam", "quiz", "assessment", "اختبار", "امتحان", "الاختبار", "الامتحان", "مسابقه", "فحص"];
const LESSON_WORDS = ["lesson", "chapter", "unit", "learned", "learnt", "studied", "homework", "درس", "الدرس", "الوحده", "وحده", "فصل", "تعلم", "تعلمت", "تعلموا", "واجب"];
const STUDY_WORDS = ["study", "studying", "study time", "revise", "دراسه", "الدراسه", "يدرس", "مذاكره", "المذاكره", "وقت الدراسه"];

const WEEKDAYS: [number, string[]][] = [
  [0, ["sunday", "sun", "الاحد", "احد"]],
  [1, ["monday", "mon", "الاثنين", "اثنين", "التنين"]],
  [2, ["tuesday", "tue", "tues", "الثلاثاء", "ثلاثاء", "التلاتا"]],
  [3, ["wednesday", "wed", "الاربعاء", "اربعاء", "الاربعا"]],
  [4, ["thursday", "thu", "thurs", "الخميس", "خميس"]],
  [5, ["friday", "fri", "الجمعه", "جمعه"]],
  [6, ["saturday", "sat", "السبت", "سبت"]],
];

const MONTHS: [number, string[]][] = [
  [1, ["january", "jan", "يناير", "كانون الثاني"]],
  [2, ["february", "feb", "فبراير", "شباط"]],
  [3, ["march", "mar", "مارس", "اذار"]],
  [4, ["april", "apr", "ابريل", "نيسان"]],
  [5, ["may", "مايو", "ايار"]],
  [6, ["june", "jun", "يونيو", "حزيران"]],
  [7, ["july", "jul", "يوليو", "تموز"]],
  [8, ["august", "aug", "اغسطس", "اب"]],
  [9, ["september", "sep", "sept", "سبتمبر", "ايلول"]],
  [10, ["october", "oct", "اكتوبر", "تشرين الاول"]],
  [11, ["november", "nov", "نوفمبر", "تشرين الثاني"]],
  [12, ["december", "dec", "ديسمبر", "كانون الاول"]],
];

const has = (base: string, words: string[]) => words.some((w) => (" " + base + " ").includes(" " + normalizeBase(w) + " "));

// ---------------------------------------------------------------------------------------
// Dates and times
// ---------------------------------------------------------------------------------------

function localToday(now: Date, country: Country): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: TZ[country], year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return new Date(ymd + "T00:00:00Z");
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

function validYmd(y: number, m: number, d: number): Date | null {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? dt : null;
}

/** Next date with this day-of-month/month on or after today. */
function nextOccurrence(today: Date, month: number, day: number, year?: number): Date | null {
  if (year) return validYmd(year, month, day);
  const y = today.getUTCFullYear();
  const d = validYmd(y, month, day);
  if (d && d >= today) return d;
  return validYmd(y + 1, month, day);
}

export function parseDate(text: string, now: Date, country: Country): string | undefined {
  const base = normalizeBase(text);
  const raw = easternToWesternDigits(text);
  const today = localToday(now, country);
  let m: RegExpMatchArray | null;

  if ((m = raw.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/))) {
    const d = validYmd(+m[1], +m[2], +m[3]);
    if (d) return iso(d);
  }
  // Day-first (Lebanon and Qatar): 22/10, 22/10/2026, 22-10
  if ((m = raw.match(/\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/))) {
    const yr = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : undefined;
    const d = nextOccurrence(today, +m[2], +m[1], yr);
    if (d) return iso(d);
  }
  // 22 October / October 22 / 22 تشرين الاول
  for (const [month, names] of MONTHS) {
    for (const name of names) {
      const n = normalizeBase(name);
      const re1 = new RegExp(`(?:^| )(\\d{1,2}) (?:of )?${n}(?: |$)`);
      const re2 = new RegExp(`(?:^| )${n} (\\d{1,2})(?: |$)`);
      const mm = base.match(re1) ?? base.match(re2);
      if (mm) {
        const d = nextOccurrence(today, month, +mm[1]);
        if (d) return iso(d);
      }
    }
  }
  if (has(base, ["today", "اليوم", "lyom", "el yom"])) return iso(today);
  if (has(base, ["tomorrow", "غدا", "غد", "بكرا", "بكره", "bukra", "bokra"])) return iso(addDays(today, 1));
  if (has(base, ["day after tomorrow", "بعد بكرا", "بعد غد"])) return iso(addDays(today, 2));
  if ((m = base.match(/(?:in|after|بعد) (\d{1,2}) (?:days?|ايام|يوم)/))) return iso(addDays(today, +m[1]));
  if (has(base, ["next week", "الاسبوع الجاي", "الاسبوع القادم", "الجمعه الجايه"])) {
    // fall through to weekday if one is also named
  }
  for (const [dow, names] of WEEKDAYS) {
    if (has(base, names)) {
      let diff = (dow - today.getUTCDay() + 7) % 7;
      if (diff === 0) diff = 7;
      return iso(addDays(today, diff));
    }
  }
  if (has(base, ["next week", "الاسبوع الجاي", "الاسبوع القادم"])) return iso(addDays(today, 7));
  return undefined;
}

export function parseStudyTime(text: string): string | undefined {
  const raw = easternToWesternDigits(text).toLowerCase();
  const m =
    raw.match(/(?:\bat|\bstudy|الساعة|الساعه|ساعة|عالساعة|عالساعه|الساعة)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|صباحا|صباحًا|ص|مساء|مساءً|م|عصرا|عصرًا|بعد الظهر|الظهر)?/u) ??
    raw.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (!m) return undefined;
  let h = +m[1];
  const min = m[2] ? +m[2] : 0;
  const suf = m[3] ?? "";
  if (h > 23 || min > 59) return undefined;
  const pm = /pm|p\.m\.|مساء|م$|عصر|بعد الظهر/.test(suf);
  const am = /am|a\.m\.|صباح|^ص$/.test(suf);
  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  // No am/pm and a small hour: after school is the likely meaning (3 -> 15:00).
  if (!pm && !am && h >= 1 && h <= 7) h += 12;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function parseSubject(base: string): Subject | undefined {
  for (const [s, words] of SUBJECT_WORDS) if (has(base, words)) return s;
  return undefined;
}

function parseTopic(text: string): string | undefined {
  const t = text.replace(/\s+/g, " ").trim();
  const m =
    t.match(/\b(?:about|on the topic of|topic|lesson(?: name)?(?: is)?|chapter|unit)\s*[:\-–]?\s*([^.,!?\n؟،]{2,60})/i) ??
    t.match(/(?:عن|موضوع|الموضوع|درس|الدرس|الوحدة|وحدة|فصل)\s*[:\-–]?\s*([^.,!?\n؟،]{2,60})/u);
  if (!m) return undefined;
  let topic = m[1].trim();
  // Trim trailing date/subject words that follow the topic.
  topic = topic
    .replace(/\s+(?:on|next|this|tomorrow|today|in|at|for)\b.*$/i, "")
    .replace(/\s+(?:يوم|بكرا|غدا|اليوم|الساعة|في|بعد)\s.*$/u, "")
    .replace(/\((?:math|science|english|arabic|social)[^)]*\)/i, "")
    .trim();
  return topic.length >= 2 ? topic.slice(0, 60) : undefined;
}

function sessionsFor(today: Date, dueDate?: string): number {
  if (!dueDate) return 2; // a new lesson: review after 1 day and 3 days
  const days = Math.round((new Date(dueDate + "T00:00:00Z").getTime() - today.getTime()) / 86_400_000);
  return Math.max(1, Math.min(4, days));
}

const SUBJECT_LABEL: Record<Subject, Record<Lang, string>> = {
  math: { en: "Math", ar: "الرياضيات" },
  science: { en: "Science", ar: "العلوم" },
  english: { en: "English", ar: "اللغة الإنجليزية" },
  arabic: { en: "Arabic", ar: "اللغة العربية" },
  social: { en: "Social Studies", ar: "الدراسات الاجتماعية" },
};

function arSessions(n: number): string {
  return n === 1 ? "جلسة دراسة واحدة" : n === 2 ? "جلستَي دراسة" : `${n} جلسات دراسة`;
}

function prettyDate(isoDate: string, lang: Lang): string {
  const d = new Date(isoDate + "T12:00:00Z");
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-LB-u-nu-latn" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

// ---------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------

export function handleParentMessage(text: string, lang: Lang, country: Country, now: Date = new Date()): ParentResult {
  const base = normalizeBase(text);
  const exact = (words: string[]) => words.map(normalizeBase).includes(base);

  // Commands (whole message).
  if (exact(["stop", "unsubscribe", "ايقاف", "توقف", "الغاء الاشتراك", "اوقف"])) return { reply: T.stop[lang], intent: "stop", action: "opt_out" };
  if (exact(["delete my data", "delete data", "delete", "احذف بياناتي", "حذف بياناتي", "امسح بياناتي", "احذف البيانات"]))
    return { reply: T.deleteData[lang], intent: "delete_data", action: "request_deletion" };
  if (exact(["pause", "pause reminders", "ايقاف مؤقت", "توقف مؤقت", "وقف مؤقت"])) return { reply: T.pause[lang], intent: "pause", action: "pause_reminders" };
  if (exact(["help", "مساعده", "مساعدة", "?", "؟", "menu", "قائمه"])) return { reply: T.help[lang], intent: "help" };
  if (exact(["report", "تقرير", "التقرير"])) return { reply: T.report[lang], intent: "report", action: "send_report" };
  if (exact(["plan", "خطه", "الخطه", "my plan"])) return { reply: T.plan[lang], intent: "plan", action: "show_plan" };

  const today = localToday(now, country);
  const subject = parseSubject(base);
  const isTest = has(base, TEST_WORDS);
  const isLesson = has(base, LESSON_WORDS);
  const isStudy = has(base, STUDY_WORDS);
  const studyTime = parseStudyTime(text);

  if (isTest || isLesson) {
    const topic = parseTopic(text) ?? (subject ? SUBJECT_LABEL[subject][lang] : undefined);
    const dueDate = isTest ? parseDate(text, now, country) : undefined;
    if (!subject) return { reply: T.needSubject[lang], intent: isTest ? "test" : "lesson" };
    const plan: ParentPlan = { subject, topic: topic!, sessions: sessionsFor(today, dueDate) };
    if (dueDate) plan.dueDate = dueDate;
    if (studyTime) plan.studyTime = studyTime;
    const label = SUBJECT_LABEL[subject][lang];
    let reply: string;
    if (isTest) {
      const when = dueDate ? prettyDate(dueDate, lang) : lang === "ar" ? "(أرسل التاريخ من فضلك)" : "(please send the date)";
      reply =
        lang === "ar"
          ? `تمّ ✅ اختبار ${label} ${when}: «${plan.topic}». خطّط ذكي ${arSessions(plan.sessions)}.`
          : `Got it ✅ ${label} test ${when}: "${plan.topic}". Zaki planned ${plan.sessions} study session${plan.sessions === 1 ? "" : "s"}.`;
    } else {
      reply =
        lang === "ar"
          ? `تمّ ✅ درس ${label}: «${plan.topic}». سيراجعه ذكي مع طفلك في ${arSessions(plan.sessions)}.`
          : `Got it ✅ ${label} lesson: "${plan.topic}". Zaki will review it with your child in ${plan.sessions} sessions.`;
    }
    return { reply, intent: isTest ? "test" : "lesson", plan };
  }

  if (studyTime && (isStudy || /\b(at|am|pm)\b|الساعه|الساعة/.test(text.toLowerCase()))) {
    return {
      reply: lang === "ar" ? `تمّ ✅ وقت الدراسة اليومي: ${studyTime}.` : `Got it ✅ Daily study time: ${studyTime}.`,
      intent: "study_time",
      studyTime,
    };
  }

  return { reply: T.redirect[lang], intent: "other" };
}
