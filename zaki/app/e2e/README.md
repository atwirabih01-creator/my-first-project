# Zaki click-through tests (Playwright, demo mode)

1. Build the no-server website: `ZAKI_STATIC_WEB=1 npx expo export -p web --output-dir /tmp/zaki-static`
2. Serve it: `node e2e/serve.js /tmp/zaki-static 8090 &`
3. Run: `NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node e2e/e2e.js`
   and `node e2e/e2e-api.js` (same env; mocks the /api routes with ai:true).
Screenshots go to `test-screenshots/`.
