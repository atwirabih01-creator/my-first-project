// Test helpers: a fake Claude message and env setup. No network, no keys.
import { __setClaudeForTests, type ClaudeImpl, type ClaudeMessage, type ClaudeParams } from "../ai";
import { __resetBudgetForTests } from "../budget";
import { __resetLibraryForTests } from "../library";

process.env.ZAKI_FLAG_FILE = "off";
// Budget and library stay in memory in tests (no files written), fresh for every mock.
__resetBudgetForTests(null);
__resetLibraryForTests(null);

export function fakeMessage(content: unknown[], stop_reason = "end_turn"): ClaudeMessage {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-test",
    content,
    stop_reason,
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  } as unknown as ClaudeMessage;
}

export const textMsg = (t: string) => fakeMessage([{ type: "text", text: t, citations: null }]);

/** Install a fake Claude. Returns the list of calls for assertions. */
export function mockClaude(handler: (p: ClaudeParams, call: number) => ClaudeMessage): ClaudeParams[] {
  const calls: ClaudeParams[] = [];
  const impl: ClaudeImpl = async (p) => {
    calls.push(p);
    return handler(p, calls.length);
  };
  __setClaudeForTests(impl);
  __resetBudgetForTests(null);
  __resetLibraryForTests(null);
  process.env.ANTHROPIC_API_KEY = "test-key-not-real";
  return calls;
}

export function demoMode(): void {
  __setClaudeForTests(null);
  __resetBudgetForTests(null);
  __resetLibraryForTests(null);
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ZAKI_ANTHROPIC_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_ZDR_APPROVED;
}

/** The Haiku classifier always says "none" (used when a test mocks the tutor). */
export function isClassifierCall(p: ClaudeParams): boolean {
  return p.model.startsWith("claude-haiku") && JSON.stringify(p.output_config ?? {}).includes("involvesHome");
}
