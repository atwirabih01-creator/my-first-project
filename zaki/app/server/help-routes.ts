// Server copy of the fixed help-route table. The single source of truth lives in
// src/lib/helpRoutes.ts (so the app can show it OFFLINE); this file re-exports it so the
// server and the app can never disagree. Never let the AI write a phone number.
export {
  HELP_ROUTES,
  HELP_ROUTES_LAST_CHECKED,
  HELP_ROUTES_RECHECK_DAYS,
  getChildHelpRoutes,
  isHelpTableStale,
} from "../src/lib/helpRoutes";
export type { HelpRoute, HelpKind, HelpCountry, HelpLang } from "../src/lib/helpRoutes";
