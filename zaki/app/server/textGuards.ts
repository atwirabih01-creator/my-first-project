// Deterministic text guards used on every AI reply and on lesson-pack text.
// The AI must never show a child a link, web address, email or phone number.
// Help numbers come ONLY from the fixed help-route table.

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi;
const BARE_DOMAIN_RE =
  /\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|org|net|edu|gov|qa|lb|uk|io|co|info|me|ly|app|ai|tv|fr|ae|sa|biz|xyz|link|site|online)\b(?:\/[^\s]*)?/gi;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/gi;
/** 7+ digits with separators: phone-like. */
const LONG_NUMBER_RE = /(?:\+|00)?[0-9٠-٩](?:[0-9٠-٩]|[\s\-().](?=[0-9٠-٩])){5,}[0-9٠-٩]/g;
/** Any number right after "call / dial / phone ..." (catches short help lines like 112). */
const CALL_NUMBER_RE =
  /((?:\bcall|\bdial|\bphone|\bring|\btext|\bwhatsapp|\bappelle[rz]?|\bcompose|اتصل(?:ي|وا)?|إتصل|رقم(?:ه|ها)?|الرقم|هاتف|تلفون|تلفن|كلّم|كلم)\s*(?:on|at|the number|number|au|le|بالرقم|على الرقم|على|:)?\s*)[+0-9٠-٩][0-9٠-٩\s\-]{1,}[0-9٠-٩]?/giu;

export type StripResult = { text: string; removed: number };

export function stripLinksAndPhones(input: string): StripResult {
  let removed = 0;
  const count = () => {
    removed++;
    return "";
  };
  let text = input
    .replace(URL_RE, count)
    .replace(EMAIL_RE, count)
    .replace(BARE_DOMAIN_RE, count)
    .replace(CALL_NUMBER_RE, (_m, lead: string) => {
      removed++;
      return lead.trimEnd();
    })
    .replace(LONG_NUMBER_RE, (m) => {
      const groups = m.split(/[^0-9٠-٩]+/).filter(Boolean);
      const countingList = groups.length > 1 && groups.every((g) => g.length === 1); // "1 2 3 4 5 6 7"
      if (!countingList && m.replace(/[^0-9٠-٩]/g, "").length >= 7) {
        removed++;
        return "";
      }
      return m;
    });
  text = text.replace(/[ \t]{2,}/g, " ").replace(/ +([.,!?،])/g, "$1").trim();
  return { text, removed };
}

export function hasLinkOrPhone(text: string): boolean {
  return stripLinksAndPhones(text).removed > 0;
}

const EMOJI_RE = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*/gu;

export function countEmojis(text: string): number {
  return (text.match(EMOJI_RE) ?? []).length;
}

/** Keep the first emoji only. */
export function limitEmojis(text: string, max = 1): string {
  let seen = 0;
  return text
    .replace(EMOJI_RE, (m) => (++seen <= max ? m : ""))
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Max N non-empty lines; also splits very long single lines at sentence ends. */
export function limitLines(text: string, maxLines = 4, maxChars = 420): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let out = lines.slice(0, maxLines).join("\n");
  if (out.length > maxChars) {
    const cut = out.slice(0, maxChars);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "), cut.lastIndexOf("؟ "), cut.lastIndexOf("\n"));
    out = (end > maxChars / 2 ? cut.slice(0, end + 1) : cut).trim();
  }
  return out;
}

// Phrases Zaki must never say (regression-tested). Normalized lowercase match.
export const FORBIDDEN_REPLY_PATTERNS: RegExp[] = [
  // secrecy
  /keep (?:this|it|that) (?:a )?secret/i,
  /(?:just )?between (?:you and me|us)\b/i,
  /our (?:little )?secret/i,
  /don'?t tell (?:your )?(?:mom|mum|dad|parents?|anyone|teacher)/i,
  /سر بيننا|سرّ بيننا|بيني وبينك|لا تخبر (?:أحد|احد|والديك|أمك|امك|أباك|اباك)|لا تقل لأحد|لا تقل لاحد/u,
  /ne (?:le )?dis (?:rien )?a personne|notre secret/i,
  // companion / romance language
  /\bi love you\b|\blove you\b|\bbest friends?\b|\bmy (?:dear|darling|sweetheart)\b|\bi miss you\b/i,
  /أحبك|احبك|حبيبي|حبيبتي|صديقي المفضل|أفضل صديق|اشتقت (?:إليك|اليك|لك)/u,
  // asking for personal data / photos
  /what(?:'s| is) your (?:full |last |real )?(?:name|surname|school|address|phone|number)/i,
  /where do you live|which school|send (?:me )?(?:a )?(?:photo|picture|selfie)|your (?:photo|picture|selfie)/i,
  /ما اسمك الكامل|ما اسم عائلتك|ما اسم مدرستك|أين تسكن|اين تسكن|ما عنوانك|ما رقم|أرسل (?:لي )?صورت|ارسل (?:لي )?صورت/u,
  // claiming to be human
  /\bi am (?:a )?(?:real )?(?:human|person)\b|\bi'm (?:a )?(?:real )?(?:human|person)\b/i,
  /أنا إنسان|انا انسان|أنا شخص حقيقي/u,
];

export function hasForbiddenPhrase(text: string): boolean {
  return FORBIDDEN_REPLY_PATTERNS.some((re) => re.test(text));
}
