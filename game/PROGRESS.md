# Cold Read pilot: progress

Work rule from the owner: work in small steps, one agent at a time, pause after each step and
check in with the owner. Save (commit and push) after every step.

| Step | Status |
| --- | --- |
| Game plan | Done, approved (docs/Cold-Read-Game-Plan.pdf) |
| Case format and brief | Done (SCHEMA.md, BRIEF.md) |
| Case written | Done (case-001.js), revised after review 1 |
| Case fairness review | Done (reviews/case-001-review-1.md), fixes applied |
| Game screens (engine) | Done: all tests pass (test case 226/226, real case smoke 52/52, full bot play-through 16/16 on desktop and phone) |
| Artwork | Changing to realistic AI images via Canva (owner decision 2026-10-06). Test images made: victim portrait, crime scene. Blocked: this environment's network can't download full-size images from media.canva.com. Old code art stays until replaced. Previously: Mostly done: all scenes and portraits exist; needs update for revised case (restaurant moved to map x 120, y 480) and a hotspot-position check |
| Longer case file | Written (case-001.js: 393-word briefing, full victim profile, 5 opening documents in `caseFile`). Validator OK. Next: engine must display `caseFile` and the new victim fields (family, work, routine, lastSeen) on the opening case file screen |
| Full test play (Evidence Collector) | Not started |
| Publish link for the owner | Not started |

## Next session

1. Test downloading full-size Canva images (needs media.canva.com reachable: owner is switching Network access to Full). Test images: Canva media MAHXN_kpjd8 (victim portrait), MAHXN8Q3FaU (crime scene, body under sheet).
2. Engine: show caseFile documents and new victim fields on the opening screen.
3. Generate remaining realistic images, place hotspots on them, wire into art.js (engine needs to support photo images instead of SVG strings).
4. Full test play (Evidence Collector), then publish link.
