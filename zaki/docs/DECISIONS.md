# Zaki: Decisions log

Decisions 1–12 from the project plan (Section 2) are the starting point. New decisions are added below with a date.

| Date | Decision | Why |
|---|---|---|
| 2026-10-15 | Zaki lives in its own `zaki/` folder in this repository (plan, docs, and later the app) | The repository also holds the Cold Read game; keeping them apart avoids mix-ups |
| 2026-10-15 | Market is the Middle East, with the GCC countries as a key focus, not Qatar only (founder) | Founder's direction. Research now also covers GCC laws, WhatsApp rates, Arabic dialects, data-hosting regions and the name across the region |
| 2026-10-15 | First pilot: the founder's own family in Lebanon, then decide next steps (founder) | Founder's choice. Lebanon law (Law 81/2018), Lebanese help lines, Lebanese Arabic and local conditions are now researched first |
| 2026-10-15 | Zaki will be a native app on the Apple App Store, with proper tracking (founder) | Founder's choice. Replaces "web app only" in Section 10.1, pending the App Store / tech research; tracking must follow Apple Kids rules (no ad or third-party trackers) |
| 2026-10-16 | Build the real Phase 1 app now with the real AI teacher and research from trusted sources, not only scripted answers (founder) | Founder's request. Uses fake child profiles only; real AI connects once the founder adds an Anthropic key; demo mode works without it |
| 2026-10-16 | App built with Expo (iPhone + web from one codebase), server routes hold all AI keys and safety checks | From research 07; replaces "Next.js web app" in Section 10.1 |
| 2026-10-16 | Plan Section 8.7 added with the safety review's binding changes | Safety review condition for starting Phase 1 |
| 2026-10-19 | Core flow confirmed: mom adds each lesson (topic or book photos) → AI builds it once → child goes step by step with small checks → full test → next lesson unlocks only after passing (founder) | Founder's product rule. AI cost is per new lesson (~$0.15); the child's lesson, checks and tests run without AI |
| 2026-10-19 | Add a daily AI spending cap and a shared lesson library (typed topics only; photo-based lessons stay private) | Keeps the pay-as-you-go AI bill small and predictable |
