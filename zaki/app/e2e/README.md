# Zaki click-through tests (Playwright, demo mode)

Env for every command: `NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`

1. Build the no-server site: `ZAKI_STATIC_WEB=1 npx expo export -p web --output-dir /tmp/claude-0/zdist`
2. Single-file demo: `python3 scripts/make-single-file-demo.py ../demo/zaki-demo.html` (another build folder: `ZDIST=/tmp/claude-0/other python3 scripts/...`)
3. Main flow + QA checks against the single file (file://):
   `BASE=file:///home/user/my-first-project/zaki/demo/zaki-demo.html node e2e/e2e.js`
   `BASE=file:///home/user/my-first-project/zaki/demo/zaki-demo.html node e2e/qa-checks.js`
   `BASE=file:///home/user/my-first-project/zaki/demo/zaki-demo.html node e2e/round4.js` (age + grade, grade subjects, today's lesson, homework help, 360px EN/AR; screenshots in `test-screenshots/round4/`)
4. Mocked-API test (needs http): `node e2e/serve.js /tmp/claude-0/zdist 8090 &` then `BASE=http://localhost:8090 node e2e/e2e-api.js`
5. Round 5 (mocked API, same http server): `BASE=http://localhost:8090 node e2e/round5.js` (grown-up homework photos -> child card -> chat with thumbnails, pageImages + parentNote on every turn, "I finished"; teach-step titles; old lessons re-made; sensitive_topic parent notes; 360px EN/AR; test photos in `e2e/fixtures/`; screenshots in `test-screenshots/round5/`)

6. Round 7 (mocked API, same http server): `BASE=http://localhost:8090 node e2e/round7.js` (school country + school program on the learner card: chips, hint, British/French grade notes, Iraq + National sent with every lesson/tutor/homework request, edit to French, old cards send neither, export includes them, delete removes them, 360px EN/AR; screenshots in `test-screenshots/round7/`)

Screenshots go to `test-screenshots/`.

Consent: `consent-helper.js` reads `CONSENT_VERSION` from `src/lib/consentText.ts`, so the test consent always matches the current consent text (an older version makes the app ask the family again).
