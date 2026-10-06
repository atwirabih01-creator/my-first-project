# QA play-through 1 (Evidence Collector), 2026-10-06

Verdict: nearly ready. Full play-through works on desktop and phone: no errors, no dead ends,
no horizontal scroll. Fix the phone tables and the hint gap before the owner plays on a phone.
Scripts/screenshots were in the session scratchpad (qa/), not kept.

## To fix (engine)
1. Phone: document tables are squeezed (~320px), words break mid-letter (contacts list, phone
   extraction, scene log, first officer report, café camera log). Thinner padding on phone and
   let tables scroll sideways (or stack rows).
2. Phone Solve: "DEDUCTION" tag breaks across lines; unpicked proofs too faint.
3. Hotspot labels: stairs "Her boots" overlaps "The body" on phone; office "Whitlock's shelf" and
   "Archive terminal" labels cut off at the picture edge. Keep labels inside the scene box.
4. Desktop tab bar: "Solve" pushed off the edge when badges show. Shorten labels/badges.
5. Toasts: max 2 at once, dismiss sooner, never over event cards or conversations; stamp not
   over the tab bar.
6. Hints: add a fallback hint ("go here next": an unvisited place or unquestioned person) so a
   token is never wasted; consider fewer tokens.
7. "Wait until morning": confirm on the page first, and/or only offer it in the evening.
8. Hotspots hard to see before tapping (HQ, flat): slightly brighter, or a short pulse on arrival.
9. Theo: show each request's wait time on its button.
10. Phone header: label the case meter and show the current location.
11. Lena warns when a charge is very weak (e.g. charging with only opening paperwork).
12. Timeline: add a "night of the murder" view sorted by event time, not by when learned.

## To fix (case content)
13. Body still on the stairs after the post-mortem (Day 2, or arriving after the twist): change
    the body hotspot text/state after the twist.
14. Break Lena's briefing into short paragraphs ("What we have / What we don't have").
15. Office: carpet patch and archive terminal look clickable before the twist; tone down or give
    a "nothing yet" observation.
16. Confession uses the smiling drawn Whitlock portrait and cites "the photograph of the brass
    wheel on the shelf" when the shelf only shows the dust mark; fix wording (photo will replace art).
17. Optional: nudge players to rule out Marcus/Petra (currently skippable).

## Art
Photo portraits crop well. Hotspots sit on visible objects in all drawn scenes. Stairs text
(sheet, markers) doesn't match the drawing; fixed when the stairs photo is redone.
