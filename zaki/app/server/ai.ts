// Thin wrapper around the official Anthropic SDK. All Claude calls go through here so that:
//  - the API key stays on the server (read from the environment by the SDK),
//  - tests can swap in a fake (no network, no key),
//  - Sonnet calls get the server-side refusal fallback by default.
// Nothing here logs prompt or reply text.

import Anthropic from "@anthropic-ai/sdk";
import { assertCanSpend, recordUsage, type SpendPurpose } from "./budget";
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
    // baseURL is set explicitly so a stray ANTHROPIC_BASE_URL (e.g. a dev tool's proxy) is ignored.
    client = new Anthropic({
      baseURL: process.env.ZAKI_ANTHROPIC_BASE_URL || "https://api.anthropic.com",
      maxRetries: 2,
      timeout: 120_000,
    });
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
export async function callClaude(
  params: ClaudeParams,
  opts: { stream?: boolean; purpose?: SpendPurpose } = {},
): Promise<ClaudeMessage> {
  const stream = opts.stream ?? false;
  const purpose = opts.purpose ?? "tutor";
  // Daily spending cap: throws BudgetExceededError before any money is spent.
  await assertCanSpend(purpose);
  const p = withFallback(params);
  let msg: ClaudeMessage;
  if (testImpl) msg = await testImpl(p, { stream });
  else {
    const c = getClient();
    msg = stream ? await c.beta.messages.stream(p).finalMessage() : await c.beta.messages.create(p);
  }
  await recordUsage(p.model, msg.usage, purpose);
  return msg;
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
