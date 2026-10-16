// Thin wrapper around the official Anthropic SDK. All Claude calls go through here so that:
//  - the API key stays on the server (read from the environment by the SDK),
//  - tests can swap in a fake (no network, no key),
//  - Sonnet calls get the server-side refusal fallback by default.
// Nothing here logs prompt or reply text.

import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaMessage,
  MessageCreateParamsNonStreaming,
} from "@anthropic-ai/sdk/resources/beta/messages/messages";

export type ClaudeParams = MessageCreateParamsNonStreaming;
export type ClaudeMessage = BetaMessage;
export type ClaudeImpl = (params: ClaudeParams, opts: { stream: boolean }) => Promise<ClaudeMessage>;

let testImpl: ClaudeImpl | null = null;
let client: Anthropic | null = null;

/** Tests only: replace the real Claude call with a fake. Pass null to restore. */
export function __setClaudeForTests(impl: ClaudeImpl | null): void {
  testImpl = impl;
}

function getClient(): Anthropic {
  if (!client) {
    // Reads ANTHROPIC_API_KEY from the environment. Never pass a key in code.
    client = new Anthropic({ maxRetries: 2, timeout: 120_000 });
  }
  return client;
}

/** Sonnet 5.5 on the Claude API supports the server-side refusal fallback ("default" form). */
function withFallback(params: ClaudeParams): ClaudeParams {
  if (!params.model.startsWith("claude-sonnet-5-5")) return params;
  if (process.env.ZAKI_DISABLE_FALLBACKS === "true") return params;
  const betas = new Set(params.betas ?? []);
  betas.add("server-side-fallback-2026-07-01");
  return { ...params, betas: Array.from(betas), fallbacks: "default" };
}

/**
 * Call Claude. `stream: true` uses the SDK stream helper and waits for the final message
 * (avoids HTTP timeouts for long outputs such as lesson packs).
 */
export async function callClaude(params: ClaudeParams, opts: { stream?: boolean } = {}): Promise<ClaudeMessage> {
  const stream = opts.stream ?? false;
  const p = withFallback(params);
  if (testImpl) return testImpl(p, { stream });
  const c = getClient();
  if (stream) {
    return c.beta.messages.stream(p).finalMessage();
  }
  return c.beta.messages.create(p);
}

/** Concatenate the text blocks of a reply. */
export function textOf(msg: ClaudeMessage): string {
  return msg.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export function isRefusal(msg: ClaudeMessage): boolean {
  return msg.stop_reason === "refusal";
}

/** Parse the JSON text of a structured-output reply. Returns null on any problem. */
export function jsonOf<T = unknown>(msg: ClaudeMessage): T | null {
  if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") return null;
  const t = textOf(msg).trim();
  if (!t) return null;
  try {
    return JSON.parse(t) as T;
  } catch {
    // Tolerate a fenced block, just in case.
    const m = t.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as T;
    } catch {
      return null;
    }
  }
}

export { Anthropic };
