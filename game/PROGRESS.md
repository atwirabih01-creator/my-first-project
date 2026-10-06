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
| Artwork | Changing to realistic AI images via Canva (owner decision 2026-10-06). Test images made: victim portrait, crime scene. Full-size download WORKS (see method below); first two images saved in game/images/ (p-victim.jpg, loc-stairs.jpg). Owner asked: regenerate the stairs scene with the covered body larger and closer. Old code art stays until replaced. Previously: Mostly done: all scenes and portraits exist; needs update for revised case (restaurant moved to map x 120, y 480) and a hotspot-position check |
| Longer case file | Written (case-001.js: 393-word briefing, full victim profile, 5 opening documents in `caseFile`). Validator OK. Next: engine must display `caseFile` and the new victim fields (family, work, routine, lastSeen) on the opening case file screen |
| Full test play (Evidence Collector) | Not started |
| Publish link for the owner | Not started |

## Next session

1. Images: generate the rest with Canva and download them (method below).
2. Engine: show caseFile documents and new victim fields on the opening screen.
3. Generate remaining realistic images, place hotspots on them, wire into art.js (engine needs to support photo images instead of SVG strings).
4. Full test play (Evidence Collector), then publish link.

## How to get full-size images out of Canva

Network access is set to Full (owner, 2026-10-06). The thumbnail links from Canva are signed
and can't be resized, so: generate-image → note the media id → put it on a page of the export
design "Blank black game artwork canvas" (DAHXOFPgYVY): read-design with open_transaction,
add_page sized to the image (metadata width/height from get-assets), insert_fill the media id
at 0,0 full size, commit (owner approved using this design), then export-design as jpg with the
page numbers and curl the export URLs into game/images/<art key>.jpg.
Canva blocks visible bodies: show the body under a forensic sheet.
