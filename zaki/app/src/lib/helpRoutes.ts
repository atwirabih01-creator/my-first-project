// PLACEHOLDER help-route table (app engineer). The server engineer may overwrite this
// file; keep the same exports: `HelpRoute`, `HELP_ROUTES`, `getChildHelpRoutes`.
//
// Fixed, bundled data: works offline, never comes from the AI.
// Source: docs/research/08-safety-review-phase0.md "Help-route table". Only numbers
// marked "Child-facing: YES" appear here. Children see the short local form only.
// Qatar 999 is NOT shown yet (not re-verified). Lebanon lines that are not confirmed
// 24/7 always carry the 112 fallback.
import type { Country, Lang } from './types';

export type HelpRoute = {
  id: string;
  /** Short local number for children, or undefined for "tell a grown-up". */
  number?: string;
  text: Record<Lang, string>;
  /** Which situations this route fits. "any" = always show. */
  situations: ('any' | 'danger' | 'sad' | 'hurt' | 'scared')[];
  lastVerified: string; // YYYY-MM-DD
};

export const HELP_ROUTES: Record<Country, HelpRoute[]> = {
  LB: [
    {
      id: 'lb-trusted-adult',
      text: {
        en: 'Tell a grown-up you trust right now: a parent, grandparent, aunt, uncle or teacher.',
        ar: 'أخبِرْ شخصًا كبيرًا تثق به الآن: أحد والديك، أو جدّك أو جدّتك، أو عمّك أو خالتك، أو معلّمك.',
      },
      situations: ['any'],
      lastVerified: '2026-10-16',
    },
    {
      id: 'lb-1564',
      number: '1564',
      text: {
        en: '1564: kind people answer all day and all night.',
        ar: '1564: أشخاص لطفاء يُجيبون طوال النهار وطوال الليل.',
      },
      situations: ['sad', 'scared'],
      lastVerified: '2026-10-16',
    },
    {
      id: 'lb-himaya',
      number: '03 414 964',
      text: {
        en: 'Someone hurting you? Tell another grown-up you trust. You can also call himaya on 03 414 964 (a charity that helps children).',
        ar: 'هل يؤذيك أحد؟ أخبِرْ شخصًا كبيرًا آخر تثق به. ويمكنك أيضًا الاتصال بجمعية "حماية" على 03 414 964 (جمعية تساعد الأطفال).',
      },
      situations: ['hurt'],
      lastVerified: '2026-10-16',
    },
    {
      id: 'lb-112',
      number: '112',
      text: {
        en: 'If you are in danger now, or nobody answers, call 112.',
        ar: 'إذا كنتَ في خطر الآن، أو لم يُجِبْ أحد، اتّصلْ بالرقم 112.',
      },
      situations: ['any'],
      lastVerified: '2026-10-16',
    },
  ],
  QA: [
    {
      id: 'qa-trusted-adult',
      text: {
        en: 'Tell a grown-up you trust right now.',
        ar: 'أخبِرْ شخصًا كبيرًا تثق به الآن.',
      },
      situations: ['any'],
      lastVerified: '2026-10-16',
    },
    {
      id: 'qa-919',
      number: '919',
      text: {
        en: "To talk to someone who helps children, call 919. It's free, all day and all night.",
        ar: 'للتحدّث مع شخص يساعد الأطفال، اتّصلْ بالرقم 919. الاتصال مجاني، طوال النهار وطوال الليل.',
      },
      situations: ['any'],
      lastVerified: '2026-10-16',
    },
  ],
};

/** Child-facing routes for a country. Unknown country -> "trusted adult" only. */
export function getChildHelpRoutes(country: Country | undefined | null): HelpRoute[] {
  if (!country || !HELP_ROUTES[country]) {
    return [HELP_ROUTES.LB[0]].map((r) => ({ ...r, id: 'trusted-adult' }));
  }
  return HELP_ROUTES[country];
}
