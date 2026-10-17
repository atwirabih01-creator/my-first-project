# Zaki click-through tests (Playwright, demo mode)

Env for every command: `NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`

1. Build the no-server site: `ZAKI_STATIC_WEB=1 npx expo export -p web --output-dir /tmp/claude-0/zdist`
2. Single-file demo: `python3 scripts/make-single-file-demo.py ../demo/zaki-demo.html`
3. Main flow + QA checks against the single file (file://):
   `BASE=file:///home/user/my-first-project/zaki/demo/zaki-demo.html node e2e/e2e.js`
   `BASE=file:///home/user/my-first-project/zaki/demo/zaki-demo.html node e2e/qa-checks.js`
4. Mocked-API test (needs http): `node e2e/serve.js /tmp/claude-0/zdist 8090 &` then `BASE=http://localhost:8090 node e2e/e2e-api.js`

Screenshots go to `test-screenshots/`.
