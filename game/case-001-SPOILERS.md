# Case 001, "The Long Way Home": SPOILERS (testers only)

Data: `game/case-001.js`. Check it with `node game/tools/validate-case.js`.

## The true story

Iris Kellan was a claims investigator at Halden Mutual Marine. While working on Petra Lund's claim for her sunken trawler *Grey Petrel*, she found that the survey report described the wrong engine (a "Volda 6", when the boat had a Brandt 8). When she met Petra, Petra told her no surveyor had ever come aboard, and Iris's suspicion moved from Petra to the survey firm, **Northline Survey Services**. Northline had billed fourteen claims at about fifteen times the market rate, €612,400 in all. Every invoice was approved and marked "expedite" by her manager, **Graham Whitlock**, Head of Claims. Northline is a mailbox run by Whitlock's brother-in-law Rolf Dahl, and about 70% of every fee goes on to an account belonging to Whitlock's wife Margit.

Iris booked a confidential meeting with Compliance (Ruth Achebe) for Thursday 09:00 and marked it "private" in her work calendar. Whitlock can see his team's calendars. On Wednesday afternoon he read the entry, asked Nico about it, and realised what was coming. He phoned Iris at 18:52 and asked her to come back to the office at eight so he could "explain". In the 4th-floor file archive she refused to back down. As she turned to leave, he hit her once on the back of the head with his Helm Award, a brass ship's wheel on a granite base.

He then set up a false time of death. At 20:51, using her unlocked work laptop, he scheduled a message from her linked messaging account to her sister for 23:12 ("walking home the long way…"), at a time when he would be in plain view at the Harbour Club quiz. He cleaned the carpet using the archive spill kit, wrapped her in a dust sheet, took her down to the car park, and drove to the dead-end foot of the Saltmarket Stairs. There he dragged her up three steps to the unlit lower landing, laid her face down, and took her handbag (with her notebook) to suggest a robbery. Then he drove to the Harbour Club. The award was later found in his garage at home.

The scene estimate (22:00–01:00) assumed she had lain outside all night, and that error is exactly what the staging needed.

## Full timeline

**Tuesday (day before)**
| Time | Event | How the player learns it |
|---|---|---|
| 10:31 | Iris phones Petra about the claim | Phone extraction |
| 14:05–14:40 | Iris and Petra at Tidewater Café; Petra shouts at 14:28, then they talk quietly | Café camera; Petra (`q-petra-cafe`) |
| ~21:30–21:55 | Marcus at Iris's flat; row about selling their boat *Wren*; a plate broken; he leaves shouting "You'll regret this" | Dolores; flat kitchen; Marcus once confronted |
| 21:58 / 22:19 | Marcus texts a threat, then an apology | Phone extraction |
| 22:40 | Iris texts Hanna, in her usual formal style | Hanna's messages |
| 23:14 | Iris emails R. Achebe asking to meet | Phone extraction; planner; draft email in the box |

**Wednesday (day of)**
| Time | Event | Source |
|---|---|---|
| 08:05 | Iris leaves home | Dolores |
| 08:15 / 08:31 / 08:40 | Whitlock, Nico and Iris badge in | Badge log |
| ~16:00 | Whitlock asks Nico about Iris's private 09:00 Thursday | Nico (`q-nico-calendar`) |
| 17:38 | Iris badges out | Badge log |
| 17:50 | Rain starts | Weather |
| 18:10 | Whitlock badges out of the lobby (so the record shows him leaving) | Badge log |
| 18:20–19:24 | Iris has dinner at Tidewater Café (paid 18:41) | Receipt; café camera |
| 18:52 | Whitlock phones Iris for 2 min 14 s | Phone extraction; café camera |
| 19:05 | Iris rings Hanna: going back to work, "He says he can explain" | Hanna; phone extraction |
| 19:24 | Iris leaves towards the Financial Quarter tram | Café camera |
| 19:30–21:50 | Co-op meeting; Petra present, speaks 20:35–20:55 against Northline | Co-op minutes |
| 15:52–23:04 | Marcus on the grill, initialling tickets every ~15 min | Rota and tickets |
| 19:40 | Whitlock re-enters through the car park door (building's system, not Halden Mutual's) | Car park logs |
| 19:52 | Nico leaves via the car park and sees Whitlock's green estate in bay 12 | Nico (`q-nico-badge`) |
| 19:58 | Iris badges back in. She never badges out | Badge log |
| ~20:10–20:30 | Killed in the archive, aisle F | Autopsy; carpet patch |
| 20:51 | Fake text created on laptop HM-LT-0417, scheduled for 23:12 | Phone extraction metadata |
| 21:00–21:55 | Carpet cleaned; body wrapped | Carpet patch; detergent on her sleeve |
| 21:40 | Rain stops | Weather |
| 22:04 | Whitlock's car leaves the car park | Car park barrier log |
| 22:17 | His car heads west on Quay Road (dead end at the stairs) | Traffic camera |
| 22:21–22:29 | Dark estate stops at the foot of the stairs, then leaves east | Late shop camera |
| 22:31 / 22:38 | His car eastbound; enters Harbour Club car park | Traffic cameras |
| 22:40–00:30 | Whitlock at the quiz (true, and irrelevant) | His statement |
| 23:05 | Petra walks past the top of the stairs on her way home | Late shop camera; Petra |
| 23:12 | Scheduled text arrives on Hanna's phone | Hanna's messages |
| 23:16 | Marcus walks past the foot of the stairs on his way home | Late shop camera; Marcus |
| ~00:00 | Dolores feeds the cat | Dolores; cat bowl |

**Thursday (day 1, play starts 06:40)**: body found 05:50 by Tomas Ferreira; scene notes 07:05; post-mortem 10:00–13:30. In game, the twist fires once the player has the clean-shoes and wrong-text deductions, Whitlock's alibi statement and the phone extraction, or at 15:00 at the latest.

## Intended solve path

1. **HQ**: preliminary report and weather sheet (rain ended 21:40).
2. **Saltmarket Stairs**: body, coat pocket (phone and café slip), boots (clean soles), late shop camera (car 22:21–22:29, Petra 23:05, Marcus 23:16). Ask Theo to open the phone (90 min).
   - Board: **boots + weather → "She never walked down those steps"**.
3. **Flat (Hillcrest)**: Dolores (Tuesday row with Marcus, "You'll regret this"; the "reported a friend" remark). Fridge note, planner (Compliance 09:00, "tell nobody"), boat listing. The document box stays locked for now. Hanna from 09:00: the 23:12 text, Iris's writing style, the 19:05 call.
   - Board: **Hanna's messages + Iris's style → "Someone else wrote the 23:12 text"**.
4. **Office (Financial Quarter)**: Iris's desk (Grey Petrel claim, loss date 17/03), laptop HM-LT-0417, noticeboard newsletter (the Helm Award, 18 cm brass wheel), Whitlock's shelf (clean 12 cm square in the dust). Whitlock: relaxed baseline, then a rehearsed alibi from 22:40, and he points at Petra and Marcus. Nico: claims he left "at six on the dot" (a lie); Whitlock asked about the private meeting.
5. **Puzzle 1**: box code = loss date 17/03 → DDMM 1703 → read right to left **3071** → Iris's Northline file. Ask Theo about Northline (120 min).
6. **Phone extraction arrives**: the 18:52 Whitlock call; the 23:12 text was created at 20:51 on HM-LT-0417.
   - **extraction + laptop → "The fake text came from inside Halden Mutual"** (unlocks the badge request).
   - **extraction + Hanna's 19:05 call → "Whitlock called her back to the office"**.
7. **Twist (autopsy)**: one patterned blow, the "fall" injuries made after death, grey carpet fibres, killed indoors, death **19:30–21:30**. New hotspots appear at the stairs (drag marks up from Quay Road) and the office (shampooed carpet in archive aisle F).
   - **autopsy + carpet → "She died in the archive"**; **autopsy + newsletter → "The weapon was the Helm Award"**.
8. **Badge log** (45 min): Iris back in at 19:58 and never out; Nico out at 19:52. Confront Nico: CV printing, and **Whitlock's car still in bay 12 at 19:52**. Request car park logs (60 min): fob back in at 19:40, car out at 22:04, Quay Road 22:17.
   - **car park logs + Whitlock's alibi → "Whitlock's evening is a lie"**.
9. **Northline check**: brother-in-law, money to his wife. **Iris's file + Northline check → "Northline is Whitlock"** (motive).
10. Optional: **Puzzle 2** at the archive terminal ("start at the beginning"). Oldest claim on Iris's list (sorted by vessel, so read the dates) = Kittiwake, **1406** → Whitlock's "expedite, no further sign-off" memo and "R. Dahl".
11. **Charge**: Whitlock; motive "stop her exposing the survey-fee fraud"; method "struck in the archive, moved, staged, scheduled text". Any 3 picks with at least 2 from: alibi collapse, sent-from-office, the call, killed-in-archive, weapon, motive, car park log.

Clearing the others: **rota + revised time → Marcus cleared**, **co-op minutes + revised time → Petra cleared**.

## Why each wrong suspect fails

- **Marcus Bell (ex-partner)**. *Why suspect him:* a loud row the night before, "You'll regret this" both shouted and texted, a lie about when he last saw her, no alibi after 23:04, and the camera shows him at the foot of the stairs at 23:16. *Why he fails:* his lie was embarrassment (he admits it when shown Dolores's account, and he had apologised by text at 22:19). The row was about the boat and Iris had promised him his half. Clock card and initialled grill tickets every ~15 minutes cover 19:30–21:30 on a short-staffed line with no breaks. At 23:16 she had already been on the landing for 45 minutes, out of sight in the dark.
- **Petra Lund (claimant)**. *Why suspect her:* €340,000 at stake, she shouted at Iris in public on Tuesday, she lied ("home all night"), and the camera puts her at the top of the stairs at 23:05. *Why she fails:* the lie was panic (she lives on Saltmarket Lane and walks past every night). Thirty-one signatures and the minutes put her in the Co-op Hall 19:30–21:50, speaking at 20:35. Her claim was not the fraud. She is a victim of Northline too, and she pointed Iris at it.
- **Nico Varga (colleague)**. *Why suspect him:* he lied about leaving at six and was the last badge-holder out before Iris came back. *Why he fails:* he badged out at 19:52, before Iris badged in at 19:58. His lie hid a job interview, and his corrected account is specific and checkable (printer, interview, bay 12). He is the witness who breaks Whitlock's alibi.
- **Red herrings:** the missing handbag (staged robbery); the dummy camera at the Anchor & Lamp (not a witness, and nothing depends on it); the Harbour Club alibi (true, but it starts after the death); Whitlock's helpful pointing at Petra and Marcus.

## Behaviour cues (what testers should see)

- **Baseline deviation**: Whitlock is short and easy on `q-wh-iris`, then gives a long, over-detailed paragraph with a cufflink touch on `q-wh-evening`. The cue says outright that this is not proof.
- **Lies that contradict evidence**: Marcus (`q-mar-last-seen` vs Dolores), Petra (`q-petra-wednesday` vs the shop camera), Nico (`q-nico-left` vs the badge log), Whitlock (`q-wh-evening` vs Nico and the car park, `q-wh-call` vs Hanna's call).
- **Verifiable detail**: the award is "away being re-engraved", with no engraver, ticket or date; compare Nico's detailed correction.

## How the reopen trail differs

Framing: three weeks later. The killer has tidied up, records have aged out, and a witness has been leaned on. Same killer, motive and method.

| Original route | Reopen route |
|---|---|
| Whitlock's shelf shows a dust gap (`ev-shelf-ring`) | The award is **back**, freshly polished, with a new felt pad hiding the base; residue in the joint (`ev-award-polished`). New deduction: **award + autopsy → "The weapon came back clean"** |
| Damp shampooed carpet in archive aisle F (`ev-carpet-patch`) | The tile has been **replaced**, on Whitlock's own urgent facilities work order for a "coffee spill" that didn't smell of coffee (`ev-new-tile`). Deduction `ded-killed-in-office` is swapped for **`ded-killed-in-office-r`** (autopsy + new tile) |
| Nico remembers the car in bay 12 (`fact-nico-car`) | Nico now goes vague about the car, but reveals that Whitlock took him to lunch, hinted at a promotion, and said "You remember I left at six" (`ev-nico-statement`). New deduction: **statement + alibi → "Whitlock is coaching a witness"** |
| Car park barrier log shows the 22:04 exit | Barrier logs were **deleted after 14 days**. Theo uses the backup tape (19:40 door) and a city camera on the tower's exit ramp (22:09) instead. Same id, so "Whitlock's evening is a lie" still works |

Unchanged in both runs: the clean boots, the wrong-style text, the laptop metadata, the 18:52 call, the newsletter, the autopsy and Northline. Reopen proofs: alibi collapse, sent-from-office, the call, killed-in-archive (reopen version), award cleaned, weapon, motive, tampering, car park log.

## Known soft spots for testers to watch

- After the twist, the "faint lividity" and the temperature recalculation are presented carefully as estimates. Medical reviewers may still want to tune the wording.
- Puzzle 1 needs the Grey Petrel claim (office) for the date. The box hotspot appears before then; the hint points to the claim file.
- The twist can come as early as about 11:00 for a very efficient player (it needs the phone extraction, which takes 90 minutes, and Whitlock, who is available from 08:30). The fallback is 15:00.
