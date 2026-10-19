// Daily AI spending cap (founder rule: never surprise bills).
//  - ZAKI_DAILY_BUDGET_USD (default 1.00): estimated US$ per day for the whole server.
//  - ZAKI_CHILD_DAILY_AI_TURNS (default 40): Ask-Zaki AI turns per child per day.
//  - Safety classifier calls may use a small extra reserve (10% of the budget) so child
//    messages can still be checked by AI after the teaching budget is used up.
//    Keyword safety checks never use AI and ALWAYS run.
// Cost is estimated from each reply's token usage x prices in config/models.ts.
// State: in memory + a small JSON file (server/data/budget.json, gitignored). Day = UTC date.
import fs from "node:fs";
import path from "node:path";

import { PRICES_USD_PER_MTOK, WEB_SEARCH_USD_EACH } from "./config/models";

export type SpendPurpose = "lesson" | "tutor" | "safety";

export const SAFETY_RESERVE_RATIO = 0.1;

export class BudgetExceededError extends Error {
  constructor(public readonly purpose: SpendPurpose) {
    super("daily AI budget reached");
  }
}

type BudgetState = { date: string; spentUsd: number; byPurpose: Record<SpendPurpose, number>; childTurns: Record<string, number> };

export type UsageLike = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  server_tool_use?: { web_search_requests?: number | null } | null;
} | null | undefined;

let state: BudgetState | null = null;
let fileOverride: string | null | undefined; // undefined = default path, null = no file (tests)

const today = (now = new Date()) => now.toISOString().slice(0, 10);
const fresh = (date: string): BudgetState => ({ date, spentUsd: 0, byPurpose: { lesson: 0, tutor: 0, safety: 0 }, childTurns: {} });

function filePath(): string | null {
  if (fileOverride !== undefined) return fileOverride;
  return process.env.ZAKI_BUDGET_FILE || path.join(process.cwd(), "server", "data", "budget.json");
}

function load(now = new Date()): BudgetState {
  const d = today(now);
  if (state && state.date === d) return state;
  if (!state) {
    const f = filePath();
    if (f) {
      try {
        const saved = JSON.parse(fs.readFileSync(f, "utf8")) as BudgetState;
        if (saved && saved.date === d && typeof saved.spentUsd === "number") state = { ...fresh(d), ...saved };
      } catch {
        // no file yet / unreadable: start fresh
      }
    }
  }
  if (!state || state.date !== d) state = fresh(d);
  return state;
}

function save(): void {
  const f = filePath();
  if (!f || !state) return;
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(state));
  } catch {
    // read-only hosting: keep the in-memory total
  }
}

export function dailyBudgetUsd(): number {
  const v = Number(process.env.ZAKI_DAILY_BUDGET_USD);
  return Number.isFinite(v) && v >= 0 && process.env.ZAKI_DAILY_BUDGET_USD !== undefined && process.env.ZAKI_DAILY_BUDGET_USD !== "" ? v : 1.0;
}

export function childDailyTurns(): number {
  const v = Number(process.env.ZAKI_CHILD_DAILY_AI_TURNS);
  return Number.isInteger(v) && v >= 0 && process.env.ZAKI_CHILD_DAILY_AI_TURNS ? v : 40;
}

/** Estimated US$ for one reply. Unknown models are priced like the most expensive one. */
export function estimateCostUsd(model: string, usage: UsageLike): number {
  if (!usage) return 0;
  const key = Object.keys(PRICES_USD_PER_MTOK).find((k) => model.startsWith(k));
  const p = key ? PRICES_USD_PER_MTOK[key] : PRICES_USD_PER_MTOK["claude-sonnet-5-5"];
  const m = 1_000_000;
  const searches = usage.server_tool_use?.web_search_requests ?? 0;
  return (
    ((usage.input_tokens ?? 0) * p.input) / m +
    ((usage.output_tokens ?? 0) * p.output) / m +
    ((usage.cache_read_input_tokens ?? 0) * p.cacheRead) / m +
    ((usage.cache_creation_input_tokens ?? 0) * p.cacheWrite) / m +
    searches * WEB_SEARCH_USD_EACH
  );
}

/** May a call for this purpose start now? Safety calls may also use the reserve. */
export function canSpend(purpose: SpendPurpose, now = new Date()): boolean {
  const s = load(now);
  const limit = dailyBudgetUsd() * (purpose === "safety" ? 1 + SAFETY_RESERVE_RATIO : 1);
  return s.spentUsd < limit;
}

export function assertCanSpend(purpose: SpendPurpose, now = new Date()): void {
  if (!canSpend(purpose, now)) throw new BudgetExceededError(purpose);
}

export function recordUsage(model: string, usage: UsageLike, purpose: SpendPurpose, now = new Date()): number {
  const cost = estimateCostUsd(model, usage);
  if (cost <= 0) return 0;
  const s = load(now);
  s.spentUsd += cost;
  s.byPurpose[purpose] = (s.byPurpose[purpose] ?? 0) + cost;
  save();
  return cost;
}

/** Counts one Ask-Zaki AI turn for a child. Returns false (and counts nothing) when over the cap. */
export function takeChildTurn(childRef: string, now = new Date()): boolean {
  const s = load(now);
  const used = s.childTurns[childRef] ?? 0;
  if (used >= childDailyTurns()) return false;
  s.childTurns[childRef] = used + 1;
  save();
  return true;
}

export function budgetStatus(now = new Date()) {
  const s = load(now);
  const limit = dailyBudgetUsd();
  const r = (x: number) => Math.round(x * 10000) / 10000;
  return {
    date: s.date,
    limitUsd: limit,
    spentUsd: r(s.spentUsd),
    remainingUsd: r(Math.max(0, limit - s.spentUsd)),
    safetyReserveUsd: r(limit * SAFETY_RESERVE_RATIO),
    reached: s.spentUsd >= limit,
    childTurnLimit: childDailyTurns(),
  };
}

/** Tests only. `file: null` keeps everything in memory. */
export function __resetBudgetForTests(file: string | null = null): void {
  state = null;
  fileOverride = file;
}
