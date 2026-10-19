// GET /api/health -> { ok, ai, moderation, budget: { limitUsd, spentUsd, remainingUsd, reached, ... } }
import { aiEnabled, openAiModerationEnabled } from "../../../server/config/models";
import { budgetStatus } from "../../../server/budget";
import { handle, json, rateLimit } from "../../../server/http";

export async function GET(request: Request): Promise<Response> {
  return handle(async () => {
    rateLimit(request, "health");
    return json({
      ok: true,
      ai: aiEnabled(),
      moderation: openAiModerationEnabled() ? "openai" : "fallback",
      budget: budgetStatus(),
    });
  });
}
