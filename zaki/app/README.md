# Zaki app (Phase 1, fake child profiles only)

## Try it in a web browser
```bash
npm install
npx expo start --web        # opens the app; press "w" if it doesn't open by itself
```
If the server or AI key isn't ready, the app shows a small yellow
"Demo mode: AI not connected yet" banner and still works with built-in sample lessons.

## Try it on an iPhone
Install "Expo Go" from the App Store, run `npx expo start`, and scan the QR code with the iPhone camera.

## Make a no-server website (demo mode only)
```bash
ZAKI_STATIC_WEB=1 npx expo export -p web
```
The `dist/` folder is a plain website that can be put on any simple web host. Everything runs in demo mode.

## Checks
```bash
npx tsc --noEmit
npx expo lint
```
Click-through tests: see `e2e/README.md`. Screenshots: `test-screenshots/`.

See `ARCHITECTURE.md` for how the app talks to the server.
