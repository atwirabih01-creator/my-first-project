# Case 001 review 1 (Reality Checker + psychologist lens)

Verdict: NEEDS WORK. Fair but not hard: killer readable early, method guessable by elimination,
case chargeable before the twist. Tone (16+) is fine. Keep: clean-boots + weather deduction,
out-of-style text + laptop metadata, Nico's corrected account, two independent ways to clear
Marcus and Petra, stomach-contents caveat, restrained scene.

## Blockers

**B1. Chargeable before the twist; method guessable.**
- Rewrite all four methods to similar length, each ruled out by different evidence:
  - md-staged: "Struck once from behind with the brass award in the archive, moved to the stairs after dark, and a text scheduled from her laptop to fake the time."
  - md-desk (replaces md-pushed): "Struck at her desk with a glass plaque, carried out through the lobby, and the 23:12 text typed on her own phone on the way to the stairs." (ruled out by carpet/archive, wound shape, phone metadata, badge log: she never badges out)
  - md-carpark (replaces md-followed): "Struck with a tool in the tower car park as she arrived, driven to the stairs, and the text scheduled from his own laptop." (ruled out by lobby badge-in, device HM-LT-0417)
  - keep md-mugged.
- Replace m-career with: "To stop her reporting that he had waved through Petra Lund's insurance fraud." (wrong: Petra's claim was not the fraud)
- proofsNeeded: 3. Base proofs: ded-alibi-collapse, ded-killed-in-office, ded-weapon, ded-motive, ev-garage-log, ded-sent-from-office (drop ded-the-call). Same in reopen (drop ded-the-call).

**B2. Opening times contradict.** Start 06:40 but report notes at 07:05 and temp at 06:52. Fix: start 07:30 and intro-5 caption "07:30. Lena drops a thin file…" (or move readings earlier).

**B3. Reopen replays day-one morning but intro says three weeks later.** Present the replay as the original file being reviewed; override only what is live now.
- reopen.intro: "Three weeks later the charge has collapsed and the file is back on Lena's desk. She lays out everything from the first morning: the scene as it was photographed, the statements as they were taken, the recordings the first team copied. 'That part doesn't change,' she says. 'What's still out there does. Whoever did this has had three weeks to tidy up, records have aged out, and people who talked freely have had time to be frightened.'"
- Hotspot overrides beginning "Scene photograph from the first morning:" (h-st-body) and "From the evidence store:" (h-st-pocket).
- h-ca-cctv: "The owner's recorder only keeps a week, but he burned a copy for the first investigation."
- q-hanna-message.a: "A text. Twelve minutes past eleven that night. I've read it a hundred times since."
- Engine now supports reopen.briefing, reopen.people, reopen.twist, reopen.solution, reopen.addHints, reopen.hintTokensFrom (see SCHEMA.md). Use them for anything else that reads as "this morning" in the reopen.

**B4. Failure text names the killer and is false if the right man was charged on a weak case.** Replace the middle with: "Whoever stood in that dock walks out into a city that has already made up its mind about them. Iris's colleagues send flowers to the funeral. Hanna Kellan stops returning Lena's calls." Keep the rest.

## Should fix

**S1. Narration flags Whitlock too early.**
- p-whitlock.description: "Silver hair, good suit, a black armband on his sleeve. He shakes your hand, offers coffee, and rests his forearms on an immaculate desk, hands open."
- q-wh-iris.cue: delete "Note also that he has handed you two suspects before you asked for any."
- q-wh-evening.cue: "Until now his answers have been short and easy. This one arrives as a complete, ordered paragraph, with a tram number and a football score nobody asked for. A change from his own baseline proves nothing: nervous innocent people prepare too. It tells you which part of his account to check. Only the club, from 22:40, comes with witnesses."
- ev-northline-check presentation cue: "He does not look at the page."
- q-wh-call.cue: "'Did I?' comes first, then 'yes'. It could be a real lapse or a man buying time. What you can test is the content: does a two-minute call about quarterly figures fit what she did next?"
- fact-nico-car presentation cue: remove "His hand has gone back to the cufflink."

**S2. Eye contact / self-touch used as lie signs.** Point cues at content instead:
- q-petra-wednesday.cue: "Two words. After the speech she just gave about her boat, the sudden lack of detail is the change to note. A short answer is not a lie, but it gives you nothing to check."
- q-nico-left.cue: "'On the dot', and 'same as always'. Two reassurances where one time would do, and nothing you could check: no who, no where."
- q-wh-calendar.cue: "His answer is general where the question was specific: all nine calendars, not the one appointment he asked Nico about."
- Petra ev-kiosk-cam presentation cue: "She meets your eyes now and gives you things you can check: the meeting, the Mission, the walk home."
- Add to q-wh-evening debrief explanation: "Gaze aversion, fidgeting and self-touching are the most widely believed signs of lying and among the least reliable in research."

**S3. Debrief accuracy.**
- fact-marcus-boat: technique "A lie is not a confession"; end explanation with: "A lie proves only that someone is hiding something; your job is to find out what. A related trap, which Paul Ekman called the Othello error, is reading a truthful person's fear of not being believed as a sign of lying."
- q-wh-evening: add "Even then, a change can come from stress or fear of the police rather than lying, and comparisons only help when the easy and hard questions are similar in kind."
- q-nico-badge: add "Whitlock's evening was full of detail too, but look at what kind: a tram number and a football score anyone could know, alone at home, with no witness and no record. The verifiability approach counts details that could be checked against a record or a person, not details that just sound specific." Drop "what he saw and why he noticed" and the award sentence (not true in reopen).

**S4. Forensic wording.**
- ev-autopsy item 1: "a curved edge, part of a circle roughly 16 to 20 cm across, interrupted at regular intervals by small rounded impressions. Consistent with a heavy object with a curved, knobbed rim; not consistent with the straight edge of a stone step."
- item 2: "show no visible vital reaction… They were most likely caused after death."
- item 6: "the 06:52 reading is compatible with death roughly between 19:30 and 21:30. This is an estimate resting on assumptions about room temperature and how long she was wrapped; narrow it with other records, not on its own."
- tw-autopsy: "she probably died between about half seven and half nine".
- ev-prelim-report: "Full post-mortem examination scheduled Thursday 08:00." ev-autopsy meta: ["Examined","Thu from 08:00 (preliminary findings by phone; written report to follow)"].
- ev-drag-marks: "Consistent with something heavy, perhaps wrapped, dragged upward. Mud from the scuffs still lies on the step edges, where run-off has washed the steps around them clean, so they were made after the heavy rain stopped at 21:40." Summary "dragged up, not walked down".
- ev-shoes: Condition "Damp, but clean"; "Uppers and soles damp from the wet step. Tread clean: no mud, no leaf litter, no grit."
- tw-autopsy debrief: "show no bleeding" → "usually show little or no bleeding".

**S5. Building access hole.**
- q-nico-badge.a: "I badge out at the front, then go round and down the ramp to the bike cage in the car park."
- ev-badge-log Theo's note add: "The car park has its own lift to the office floors. It doesn't pass the lobby gates."
- ev-garage-log text (base and reopen) add: "No other fob used the pedestrian door between 18:00 and 23:00."

**S6. Hints.**
- Add "ev-prelim-report" to hintTokensFrom.
- Engine: in askHint treat a requested (pending) Theo request as satisfying `until`.
- Add before hint-building: { id: "hint-device", requires: ["ev-phone-extract"], until: ["ded-sent-from-office"], text: "Theo gave you a device name, not a person. Things with names like that have a tag stuck on them somewhere. Find the tag." }
- Add: { id: "hint-alibi", requires: ["ev-garage-log"], until: ["ded-alibi-collapse"], text: "You have his account of the evening in your notebook and the building's account on the board. Lay one over the other." }
- Soften hint-scene: "You looked at her face. Now look at the rest of her, and at what last night was like out there. My whiteboard might help." Soften hint-weapon similarly.

**S7. tw-autopsy false line.** Use: "'We've been asking everyone about eleven o'clock,' she says. 'Nobody's been asked about eight.'"

**S8. Marcus's walk home vs geography.** Theo's note: "a dead end for cars at the Saltmarket Stairs; only a footpath carries on along the harbour wall". Move loc-restaurant west of the stairs on the map (around x 120, y 480). Tell the artist.

**S9. Reopen contradictions.**
- ded-weapon: delete "And it is no longer on his shelf."
- Nico ev-newsletter presentation: split: one requiring ev-shelf-ring (current line); one requiring ev-award-polished: "It was gone for a week or so. Now it's back and he polishes it himself. I've never seen him polish anything."
- Whitlock: add presentation for ev-award-polished.
- ded-alibi-collapse: same-id version in reopen.addDeductions with "his car did not leave the tower until about 22:09".
- solution.success in reopen: "the 22:04 barrier, the carpet" → "the car on Quay Road, the archive"; "The award is found the next day, wrapped in a dust sheet in his garage at home." → "By the end of the week the lab has the award."
- ev-new-tile, ded-killed-in-office-r: "the morning after" → "the day after she was found".
- ev-award-polished: "three years of tarnish" → "months of handling".
- Reopen coaching: change quote in q-nico-badge (reopen) and ev-nico-statement to: "You'd gone by six that Wednesday, hadn't you? So you wouldn't have seen anything in the car park. People get confused." In ev-nico-statement "Nobody had asked me about his times" → "I hadn't said anything to him about the car park". ded-tampering text: "Whitlock went out of his way to tell Nico what Nico had and hadn't seen, and dangled a promotion while he did it. A man with nothing to hide in that car park does not need a witness to have seen nothing there."
- Extra difference: in reopen the late shop recording is overwritten; the 22:21 car must come from the traffic camera.

## Nice to have
- "team of nine" vs eight staff: make consistent.
- Hanna: mention the Wed 08:12 call in q-hanna-call.
- ev-iris-copies: "Printed copy of the email she sent" (extraction shows it was sent Tue 23:14).
- fact-whitlock-alibi: remove "alone" (he never says it).
- Whitlock re-entry 19:55 instead of 19:40 (waits until Nico's bike has gone).
- IT line "last unlock 20:24" for the laptop.
- Carpet tile: "two tiles" (tiles are ~50 cm).
- h-fl-catbowl: "Probably not Iris."
- ev-kiosk-cam: state the recording window (stairs covered from 21:00).
- Give Nico one line of possible motive (Iris queried one of his files) so he is a fair fourth suspect.
- pz-docbox: "DIGITS BACKWARDS" instead of "read right to left".
- Confession: add a beat where the solicitor advises silence and Whitlock speaks anyway.
- Engine: "Wait until morning" option.
- Trim ~15% of document text to hit the 25–40 minute target.
