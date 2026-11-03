import assert from "node:assert/strict";
import { test } from "node:test";

import { isCreditExhausted } from "../ai";

test("credit exhausted error is recognised", () => {
  assert.equal(isCreditExhausted({ status: 400, message: "Your credit balance is too low to access the Anthropic API." }), true);
  assert.equal(isCreditExhausted({ status: 400, message: "invalid schema" }), false);
  assert.equal(isCreditExhausted({ status: 500, message: "credit balance" }), false);
  assert.equal(isCreditExhausted(null), false);
});
