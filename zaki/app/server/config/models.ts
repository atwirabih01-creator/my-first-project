// Which Claude model does which job. Change here only.
export const MODELS = {
  /** Main teacher for teach/check steps and for building lesson packs. */
  tutor: "claude-sonnet-5-5",
  lessonPack: "claude-sonnet-5-5",
  /** Light turns (recap, short chat) and the safety classifier. */
  light: "claude-haiku-5-5",
  classifier: "claude-haiku-5-5",
} as const;

/**
 * Prices in US$ per million tokens (MTok), used ONLY to estimate spend for the daily
 * budget. Check them against the provider's price page before relying on them.
 * Cache writes are estimated at 1.25x the input price.
 */
export const PRICES_USD_PER_MTOK: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  "claude-sonnet-5-5": { input: 2.0, output: 10.0, cacheRead: 0.1, cacheWrite: 2.5 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
};
/** Web search: US$10 per 1,000 searches. */
export const WEB_SEARCH_USD_EACH = 10 / 1000;

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * OpenAI moderation is used only when a key is set AND the founder has confirmed that
 * OpenAI zero-data-retention is approved (safety review gate G4: no child text to OpenAI
 * without ZDR). Text only, never identity.
 */
export function openAiModerationEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY) && process.env.OPENAI_ZDR_APPROVED === "true";
}
