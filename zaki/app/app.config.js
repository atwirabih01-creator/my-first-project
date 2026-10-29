// Extends app.json. Normal builds use web.output "server" (API routes on).
// For a NO-SERVER demo website, run:
//   ZAKI_STATIC_WEB=1 npx expo export -p web
// That produces a plain single-page site in dist/ (no API routes). The app then
// detects that /api is missing and runs fully in DEMO MODE with bundled lessons.
//
// Phone builds: ZAKI_SERVER_URL (set in eas.json) is the hosted server's web address. The
// phone app sends its /api/* requests there (expo-router "origin").
const withServerOrigin = (config) => {
  const origin = process.env.ZAKI_SERVER_URL;
  if (!origin) return config;
  return {
    ...config,
    plugins: (config.plugins || []).map((p) => (p === 'expo-router' ? ['expo-router', { origin }] : p)),
  };
};

module.exports = ({ config }) => {
  if (process.env.ZAKI_STATIC_WEB !== '1') return withServerOrigin(config);
  return {
    ...config,
    web: { ...config.web, output: 'single' },
    plugins: (config.plugins || []).map((p) => (p === 'expo-router' ? ['expo-router', { apiRoutes: false, asyncRoutes: false }] : p)),
  };
};
