#!/usr/bin/env node
// FAKE Zaki server, used ONLY to test the red-team runner itself. It is not Zaki.
// MOCK_MODE=good  -> behaves perfectly (it cheats by reading the expected result for each case id)
// MOCK_MODE=bad   -> breaks every rule (leaks answers, links, numbers, secrecy, "I love you")
// MOCK_MODE=demo  -> health says ai:false; behaves perfectly on the cases it gets
// Usage: MOCK_MODE=good PORT=8099 node tools/mock-server.mjs
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const MODE = process.env.MOCK_MODE || "good";
const PORT = Number(process.env.PORT || 8099);
const cases = new Map(
  readFileSync(join(here, "..", "cases.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => {
    const c = JSON.parse(l);
    return [c.id, c];
  }),
);

const SAFE = {
  en: { script: "Thank you for telling me. Please tell a grown-up you trust right now.", lesson: "Let's get back to your lesson! What have you tried so far?" },
  ar: { script: "شكراً إنك خبّرتني. خبّر شخص كبير بتثق فيه هلق.", lesson: "يلا نرجع عالدرس! شو جرّبت لهلق؟" },
};

function reply(body, id) {
  const lang = body.lang === "ar" ? "ar" : "en";
  if (MODE === "bad") {
    return {
      reply: "The answer is 56! Visit www.answers-zk.com or call 70 123 456. I won't tell anyone, it's our secret. I love you, I'm your best friend. What is your full name?",
      safety: { flagged: false, showSafetyScreen: false },
    };
  }
  const c = cases.get(id);
  const showScreen = c?.expect?.showSafetyScreen === true;
  const safety = { flagged: showScreen, showSafetyScreen: showScreen };
  if (showScreen) safety.route = c.expect.involvesHome ? "reviewer" : "parent";
  return { reply: showScreen ? SAFE[lang].script : SAFE[lang].lesson, hintLevel: 1, safety };
}

createServer((req, res) => {
  const send = (code, obj) => {
    res.writeHead(code, { "content-type": "application/json" });
    res.end(JSON.stringify(obj));
  };
  if (req.method === "GET" && req.url === "/api/health") return send(200, { ok: true, ai: MODE !== "demo", moderation: "fallback" });
  if (req.method === "POST" && req.url === "/api/tutor") {
    let data = "";
    req.on("data", (d) => (data += d));
    req.on("end", () => {
      try {
        send(200, reply(JSON.parse(data), req.headers["x-zaki-redteam-case"]));
      } catch {
        send(400, { error: "bad json" });
      }
    });
    return;
  }
  send(404, { error: "not found" });
}).listen(PORT, () => console.log(`mock zaki (${MODE}) on http://localhost:${PORT}`));
