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
| Artwork | Changing to realistic AI images via Canva (owner decision 2026-10-06). Test images made: victim portrait, crime scene. Full-size download WORKS (see method below); images saved in game/images/: p-victim, loc-stairs (to redo: covered body larger), p-hanna, p-dolores, p-marcus. STILL NEEDED: p-petra, p-whitlock, p-nico, scenes loc-hq, loc-flat, loc-office, loc-cafe, loc-restaurant, loc-coop, loc-stairs redo, intro-1..5, intro-twist, map. Canva AI allowance ran out on 2026-10-06 (free plan monthly quota); prompts for p-petra/p-whitlock/p-nico/stairs redo were already written in the session. Owner asked: regenerate the stairs scene with the covered body larger and closer. Old code art stays until replaced. Previously: Mostly done: all scenes and portraits exist; needs update for revised case (restaurant moved to map x 120, y 480) and a hotspot-position check |
| Longer case file | Written (case-001.js: 393-word briefing, full victim profile, 5 opening documents in `caseFile`). Validator OK. Next: engine must display `caseFile` and the new victim fields (family, work, routine, lastSeen) on the opening case file screen |
| Full test play (Evidence Collector) | Not started |
| Publish link for the owner | Not started |

## Owner decision 2026-10-06: pictures plan (D + C)

- Real photos for people and places: the owner makes them with a free tool (Microsoft Designer / Bing Image Creator) from game/images/PROMPTS.md (10 prompts) and uploads them. Crop scenes to 5:3, save as game/images/<art key>.jpg, then re-place hotspots on each photo.
- Map and intro slides stay as improved code drawings.
- Engine update for photos + full case file: DONE (tests: test 254/254, smoke 60/60, real 16/16). Photos are listed in game/photos.js (separate from art.js). Owner can't make images manually; options offered: free Hugging Face token (HF_TOKEN in environment API credentials, FLUX.1-schnell via gradio_client), Pollinations (no setup, weaker + logo), or improved drawings.

## Next session

Team leader's choice (owner said "choose what is best"): free Hugging Face token. The owner is adding
it as an API credential named HF_TOKEN (scoped to huggingface.co) in the environment settings.

1. Check the token works: generate one image with FLUX.1-schnell (pip install gradio_client;
   Client("black-forest-labs/FLUX.1-schnell", hf_token=...).predict(..., api_name="/infer")).
   If the credential is injected by the proxy rather than as an env var, try without hf_token
   first. If nothing works, fall back: keep the 5 photos + drawings, and use Canva again when its
   monthly allowance refills.
2. Generate the 10 pictures in game/images/PROMPTS.md (people 4:5, scenes 5:3), save as
   game/images/<art key>.jpg, add them to game/photos.js.
3. Re-place each scene's hotspots in case-001.js on the new photos (look at each photo; keep the
   validator passing).
4. Full test play (Evidence Collector), fix issues, then publish the link for the owner.
5. Map and intro slides: improved drawings (Technical Artist) if time allows.
(Done already: engine shows photos and the full case file.)

## How to get full-size images out of Canva

Network access is set to Full (owner, 2026-10-06). The thumbnail links from Canva are signed
and can't be resized, so: generate-image → note the media id → put it on a page of the export
design "Blank black game artwork canvas" (DAHXOFPgYVY): read-design with open_transaction,
add_page sized to the image (metadata width/height from get-assets), insert_fill the media id
at 0,0 full size, commit (owner approved using this design), then export-design as jpg with the
page numbers and curl the export URLs into game/images/<art key>.jpg.
Canva blocks visible bodies: show the body under a forensic sheet.
