import { normalizeDigits } from './i18n';
import { todayStr } from './store';

/** A real calendar date strictly after today, from day/month/year fields (Arabic digits OK). */
export function examDateFrom(d: string, m: string, y: string): string | null {
  const [dd, mm, yy] = [d, m, y].map((x) => Number(normalizeDigits(x.trim())));
  if (!Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yy) || yy < 2000 || yy > 2100) return null;
  const dt = new Date(yy, mm - 1, dd, 12);
  if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return null; // e.g. 30 February
  const iso = todayStr(dt);
  return iso > todayStr() ? iso : null;
}
