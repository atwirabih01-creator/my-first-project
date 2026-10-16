// Which Claude model does which job. Change here only.
export const MODELS = {
  /** Main teacher for teach/check steps and for building lesson packs. */
  tutor: "claude-sonnet-5-5",
  lessonPack: "claude-sonnet-5-5",
  /** Light turns (recap, short chat) and the safety classifier. */
  light: "claude-haiku-5-5",
  classifier: "claude-haiku-5-5",
} as const;

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
