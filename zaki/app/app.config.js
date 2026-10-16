// Extends app.json. Normal builds use web.output "server" (API routes on).
// For a NO-SERVER demo website, run:
//   ZAKI_STATIC_WEB=1 npx expo export -p web
// That produces a plain single-page site in dist/ (no API routes). The app then
// detects that /api is missing and runs fully in DEMO MODE with bundled lessons.
module.exports = ({ config }) => {
  if (process.env.ZAKI_STATIC_WEB !== '1') return config;
  return {
    ...config,
    web: { ...config.web, output: 'single' },
    plugins: (config.plugins || []).map((p) => (p === 'expo-router' ? ['expo-router', { apiRoutes: false }] : p)),
  };
};
