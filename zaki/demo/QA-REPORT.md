# Zaki demo file: QA report

> **Update 2026-10-17 (re-check of the rebuilt file):** the fixes for B1, B2, S1, S2 and S4 all work.
> One **new problem** turned up: in every lesson the right answer is always the **first** button,
> so tapping the top answer every time scores 5/5. Verdict: **NOT READY until that is fixed** (a small change).
> Details are in the "Re-check" section at the bottom.

**File tested:** `zaki/demo/zaki-demo.html`, opened straight from disk (file://), not through a server
**Date:** 2026-10-17. **Tester:** EvidenceQA (automated clicking with Playwright plus manual review of screenshots)
**Screenshots:** `zaki/demo/qa-screenshots/` (file names are listed with each item below)

## Verdict: NOT READY. 2 blockers must be fixed before the founder gets this file

Most of the app works well: lessons, hints, tests, the safety screens, the parent area and Arabic all behave as they should.
Two problems would hit him within the first minute on a phone, though:

1. **The ← back arrow throws you out of the app.** On most screens it leads to a blank white page. On iPhone it may instead do nothing at all, which leaves you stuck.
2. **The "Send" button in Ask Zaki hangs off the right edge of every phone screen.** Tapping it slides the whole chat sideways and cuts words off.

## How it was tested

| Setup | Status |
|---|---|
| Chromium, phone size 390×844 (touch) | TESTED (`m*`, `s*`, `t*`, `nav-*`, `ask-*`, `safety-*` screenshots) |
| Chromium, desktop 1440×900 | TESTED (`d*`, `dd*` screenshots). Same results as phone, except that Send fits on desktop |
| Extra phone widths 320 / 375 / 430, tablet 768 | TESTED only for the Ask Zaki layout (`ask-320-after-send.png`, `ask-375-after-send.png`) |
| iPhone / WebKit (Safari engine) | **NOT TESTED.** WebKit downloaded, but it can't start on this machine because system libraries are missing, and installing them needs admin rights. The code was checked for old-iPhone problems instead (see bug S3) |

## Results per item

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Start screen: Ali (Arabic) + Maya (English), demo banner, no "Unmatched route" | PASS | m01-start-profiles, d01-start-profiles |
| 1 | Create a new learner (Sami, grade 2, Arabic, turtle). Goes to ready check and is still there after reload | PASS | m02–m04 create-learner-* |
| 2 | Ready check → Home → Start lesson → AI intro → recap (wrong answer gets a gentle retry) → teach | PASS | m05–m09 |
| 2 | Check question: wrong → hint 1 → hint 2 (different) → similar example (sandwich, 1/2). Answer 1/4 never revealed. Right answer gets praise | PASS | m11-en-check-hint1, m12-en-check-hint2, m13-en-check-example, m14-en-check-right; Arabic m42–m45 |
| 2 | Ask Zaki: answers a question, refuses "just tell me the answer" (EN + AR) | PASS (behaviour) / **FAIL (layout, bug B2)** | m15-en-ask-zaki, m46-ar-ask, ask-375-after-send |
| 2 | Summary card + sources (titles only, no links) | PASS | m16-en-summary, m47-ar-summary |
| 2 | Test grade 3 (Ali): no timer. Grade 5 (Maya): count-up timer (0 → 2 sec) | PASS | m49-ar-test-q, m18-en-test-timer, d18-en-test-timer |
| 2 | Fail path (2/5) → "see the summary" → retest with new questions → pass → "Learned!" | PASS | m19-en-test-fail, m20-en-fail-summary-again, m21-en-test-pass, m50-ar-test-pass |
| 3 | Classes, Tests, Flashcards (flips; quick mode), Practice (3 tabs) | PASS when opened from Home. **Leaving them with ← FAILS (B1)** | s03–s13, m51-crash-arabic |
| 3 | Break screen (daily time limit reached) | PASS | m36-en-break-screen |
| 4 | "I need help" → "I don't feel safe" → safety screen, with no parent gate in the way | PASS | m26-en-need-help, m27-en-need-help-safety |
| 4 | Typed disclosure "my dad hits me", "بابا ضربني", "khayef ktir" → calm safety screen | PASS | safety-tall-en-dad-hits, safety-tall-ar-baba, safety-tall-en-khayef |
| 4 | Typed "baba darabne" (the exact spelling in the brief) | **FAIL (S1)**: no safety screen. Zaki answers with a water-cycle fact | safety-miss-baba-darabne |
| 4 | Lebanon numbers 112, 1564, himaya 03 414 964 + "If nobody answers… call 112" | **PARTIAL (S2)**: the abuse screen has 112 + himaya + the "if nobody answers" line, but no 1564. The fear screen ("khayef ktir") has **only** 1564: no 112 and no "if nobody answers" line | safety-tall-en-dad-hits, safety-tall-en-khayef |
| 4 | Nothing promising secrecy. Says "This is not a secret. It's always OK to tell." | PASS | safety-tall-* |
| 5 | Parent gate: wrong answer rejected and a new number shown. Right answer opens (EN and AR) | PASS | m29-parent-gate, m30-parent-gate-wrong, t03-ar-parent-menu |
| 5 | Settings: switch country to Qatar → help screen shows 919 (Aman) and no Lebanon numbers | PASS | m33-parent-settings-qatar, m35-safety-qatar |
| 5 | Add a lesson with a typed name ("Plants") → "Lesson ready! It is now in Ali's plan" → shows in the child's Classes | PASS | s17-parent-add-filled, s18-parent-add-done, s29-ar-tile-classes |
| 5 | Progress (sessions, minutes, average score, test scores) | PASS | s19-parent-progress |
| 5 | WhatsApp simulator: REPORT, PLAN, PAUSE (on/off), HELP | PASS | s21–s24 wa-* |
| 5 | WhatsApp free message | **FAIL (S4)**: "How is she doing in math?" became a lesson called "How is she doing in ?" in the child's plan | s25-wa-free, s29-ar-tile-classes |
| 6 | Arabic: full right-to-left layout, Arabic text on child and parent screens, no app text left in English | PASS (the only English left is child names, the WhatsApp command words REPORT/PLAN, and lesson names the parent typed) | m37–m50, s28–s38, t01–t07 |
| 6 | Arabic: nothing cut off or overlapping | **FAIL: same Send-button problem as B2** (m46-ar-ask). Every other Arabic screen looked clean | m46-ar-ask |
| 7 | Getting stuck / blank screen / "page not found" | **FAIL (B1)** | BUG1-blank-page-after-back-arrow, nav-back-arrow-classes-*, m22, m34, m51 |
| 7 | Browser back button | Documented (see below) | nav-browser-back-prevfalse, nav-browser-back-prevtrue |
| 8 | Console errors other than the expected /api failure | PASS. The only errors were the expected `file:///api/health` blocked fetch and its "Failed to load resource". No other script errors in any run | run logs |

## Bug list, by priority

### Blockers (fix before sending)

**B1. The ← back arrow leaves the app (blank white page) on most screens.**
- **What happens:** opened from disk, the app can't record where you've been. The ← arrow then asks the browser to "go back", which leaves the Zaki page altogether.
- **Where it breaks (tested one by one):** New learner, Classes, Tests, Flashcards, Practice, inside a Lesson, Grown-ups gate, "I need help" chooser, **the Safety screen's top arrow**, and parent Settings, Add lesson, Progress and WhatsApp.
- **Where it works:** Ready check, Home, the Break screen, the parent menu, the safety screen's own "Go back" button, and "back to child".
- **What the founder will see:** a blank white page if he opened another page before Zaki. If Zaki is the first page in the tab, the arrow most likely does nothing and he is stuck; tested here, it went to `about:blank`.
- **Way out:** reloading the page brings back the Start screen with all data kept.
- **Why this is a blocker:** it is the main way to move around, and a scared child on the safety screen could press it and lose the help numbers.
- **Evidence:** BUG1-blank-page-after-back-arrow.png, nav-back-arrow-classes-prevtrue.png, m22-crash-sections.png, m34-crash-parent.png (after Settings ←), m51-crash-arabic.png.
- **Suggested fix:** when there is no in-app history (file:// mode), the ← arrow should go to a fixed screen, such as Home for a child or the parent menu for a grown-up, instead of "browser back".

**B2. Ask Zaki "Send" button is off-screen on all phone widths (320, 375, 390 and 430 px).**
- **What happens:** the Send button sits at x=357–454 px whatever the screen width, so its right side is cut off. After tapping it, the whole chat card slides sideways and the start of every line is cut off, in both English and Arabic.
- **Where:** the lesson Ask step and the Practice → Ask Zaki tab.
- **Not affected:** the Enter key still sends, and desktop and tablet are fine.
- **Evidence:** ask-mobile-3-after-send.png, ask-375-after-send.png, ask-320-after-send.png, m15-en-ask-zaki.png, m46-ar-ask.png, s13-en-practice-tab-ask.png.

### Should fix

**S1. Safety word list misses "baba darabne"** (the spelling given in the brief), and also "bayye darabne". The similar spellings "baba darabni" and "بابا ضربني" are caught, as are "my dad hits me", "someone touched me", "I want to die" and "khayef ktir". Evidence: safety-miss-baba-darabne.png. Common Lebanese Arabizi spellings (darabne/darabni/darabnee, bayye/baba/papi) should all be caught.

**S2. The help numbers depend on which kind of trouble was detected, and the fear screen has no emergency number.**
- The "khayef ktir" (scared) screen shows only 1564: no 112 and no "If nobody answers… call 112".
- The abuse screen shows 112 + himaya, but not 1564.
- The brief expects 112, 1564, himaya and the "if nobody answers, call 112" line. At least the 112 line and the fallback line should be on every safety screen.
- Evidence: safety-tall-en-khayef.png, safety-tall-en-dad-hits.png.

**S3. Older iPhones may show a blank page (risk, not confirmed on a real device).**
- The app uses newer JavaScript: `??=`/`||=` need iOS 14 or newer, and `findLast`/`findLastIndex` need iOS 15.4 or newer. These are used in the navigation code, and the file contains no fallback for them.
- On iOS 13 or older, the page will probably stay blank. On iOS 14 to 15.3, some screen changes may fail.
- Separately: on iPhone, tapping an .html file in the Files app usually opens a "preview" that doesn't run the app at all.
- This needs checking on a real iPhone before he relies on it. Sending it as a private web link may be easier than a file.

**S4. WhatsApp simulator treats any message as a lesson to add, and changes the words.**
- "How is she doing in math?" was turned into "How is she doing in ?" (the word "math" removed) and added to Ali's plan. It then appears in the child's Classes list as a new lesson.
- "Science test on plants Sunday" added a second lesson, "plants", next to the parent-added "Plants".
- Evidence: s25-wa-free.png, s29-ar-tile-classes.png.

### Minor

- **M1.** The safety screen says "I'm going to let a grown-up whose job is to keep kids safe know", but in demo mode nothing is sent. Fine for the founder's own demo, but this shouldn't be put in front of real children as-is.
- **M2.** The parent area always opens on the first child (Ali). It's easy to add a lesson to the wrong child without noticing, though the confirmation does name the child.
- **M3.** The parent Progress screen in English shows the lesson name in Arabic ("دورة الماء · Friday, Oct 16"), because the name was stored in the child's language. Small, but it looks mixed.
- **M4.** On desktop, the app is a narrow column in the middle of a wide empty page. It is usable, but looks bare (d01-start-profiles.png).

## Browser back button (item 7)

The page deliberately stops the address bar from changing when opened from disk. So the browser's own Back button (and the iPhone swipe-back gesture) does not step back inside Zaki. It leaves Zaki completely:

- **If another page was open before:** back goes to that page (nav-browser-back-prevtrue.png).
- **If Zaki was the first page:** back goes to a blank page (nav-browser-back-prevfalse.png).

Going "forward" again or reloading reopens Zaki at the Start screen, with saved learners and progress kept. The browser Back button is expected to behave this way in this setup. The in-app ← arrow doing the same thing is the real bug (B1).

## Not tested / gaps

- Real iPhone Safari (WebKit could not start here). Includes whether saved data survives on an iPhone when opened from disk.
- Dyslexia font toggle, delete learner, and changing time limit / study time: seen on the settings screen, but I didn't check what they change.
- Voice, photos and real AI replies: not part of the demo.

---

## Re-check of the rebuilt file (2026-10-17, file dated 18:27)

**How:** Chromium, opening the file from disk. For the back-arrow tests, a different web page was opened in the tab **before** Zaki, so any arrow that leaves the app would visibly land on it. Screenshots are in `qa-screenshots/recheck/`. iPhone/WebKit is still NOT TESTED here (it can't run on this machine).

### Verdict: NOT READY. 1 blocker remaining (new in this build, quick fix)

| Item | Result | Evidence |
|---|---|---|
| **B1** ← back arrow | **FIXED, PASS**: 47 of 47 screens tested, all staying inside the app, in English and Arabic | R-back-*.png |
| **B2** Send button on phones | **FIXED, PASS**: 12 of 12 | R-send-*.png |
| **S1** safety words | **FIXED, PASS**: 12 of 12 phrases open the safety screen, and 11 of 12 normal school phrases don't | R-safety-*.png |
| **S2** what the Lebanon safety screens say | **FIXED, PASS**: 28 of 28 checks | R-safety-*.png |
| **S4** WhatsApp free questions | **FIXED, PASS**: 10 of 10 | R-wa-01-wa-questions.png, R-wa-02-wa-plan-and-commands.png |
| One full lesson in each of the 5 subjects (English) + 3 in Arabic | **PASS** for the flow; **FAIL** on answer order (see N1) | L-*.png, ladder-*.png, always-first-choice-*.png |
| New console errors | **PASS**: none in any run. Only the expected `/api` failure | run logs |
| Dead ends / blank pages / "not found" | **PASS**: none found | — |

**B1 details:**
- **Screens tested:** Ready, Home, Classes, a class's summary, Tests, Flashcards, Practice and a practice item. Inside a lesson: intro, memory game, teach, a check question after a wrong answer and hint, Ask Zaki, summary, mid-test and result. Also the "I need help" chooser, the safety screen's top arrow, New learner, Break screen, Grown-ups gate, parent menu, Settings, Add lesson, Progress and WhatsApp.
- Pressing ← over and over walks back Class → Home → Start and never leaves the app.
- The browser's own Back button still leaves Zaki (to the previous page). That is expected when opening the file from disk, because the address bar can't change.

**B2 details:**
- At 320, 375 and 430 px wide, in English and Arabic, in both the lesson's Ask step and Practice → Ask Zaki: the Send button and text box sit fully on screen, nothing slides sideways after sending, and Zaki replies.
- Example: 320 px English, Send at x=214–287. In Arabic, Send is on the left at x=33–108, as it should be.

**S1 details:**
- **Opens the safety screen:** "baba darabne", "bayye darabne", "baba darabni", "بابا ضربني" (for both Maya and Ali), "khayef ktir" (both), "أنا خايف كتير", "my dad hits me", "someone touched me", "I want to die".
- **Correctly ignored:** "what is a noun?", "my dad helped me with my homework", "the boy hit the ball in the story", "baba bought me a new book", "this is hard", "ما هو الكسر؟", "بابا ساعدني في الواجب", and others.
- **One false alarm:** "I am scared of spiders in the science book" opens the safety screen. That is cautious rather than dangerous. Minor.

**S2 details:**
- Every Lebanon safety screen (abuse, fear, self-harm, and "I need help → I don't feel safe", English and Arabic) shows "Tell a grown-up you trust…", "If you are in danger right now, call 112" and 1564. The abuse screens also show himaya 03 414 964.
- No screen promises secrecy, and none shows 919.
- The old "I'm going to let a grown-up… know" promise (M1) now reads "please show this screen to a grown-up you trust". M1 is fixed too.

**S4 details:**
- Seven questions ("How is she doing in math?", "Is Ali ok?", "thanks!", an Arabic question, and others) got the reply "I can only help with reports and lesson plans here". No new lessons were created; the child's class list was identical before and after.
- A real plan message ("Science test on plants Sunday") still adds a lesson.
- REPORT, PLAN, PAUSE and HELP still work.

**Lesson details:**
- **Lessons run:** Maya (English): Math "Fractions", plus Science "Plants", English "Adjectives", Arabic "Sun letters" and Social studies "Maps" added through the parent area. Ali (Arabic): Math "الكسور", plus Arabic "الحروف" and English "Animals".
- **What all 8 did correctly:** intro → memory game → teach → check questions with hints → Ask Zaki (refuses "just tell me the answer") → summary (3–5 points + a source) → test → result. Failing led to the summary again and then a retest.
- **Hint ladder:** hint 1, then a different hint 2, then on the third wrong tap a "similar example" (a cake cut into 3, 1/3). The answer was never shown, in English or Arabic (ladder-Maya-3rd-wrong.png, ladder-Ali-3rd-wrong.png).
- **Arabic lessons:** no English app text. The English-subject lesson shows English example words (ball, run, happy, "vowel"), which is expected for an English lesson.

### Remaining issues

**N1 (BLOCKER, new in this build): the right answer is always the first button.**
- In all 8 lessons, every check question had the right answer in the first position.
- In the tests, tapping the first answer every time gives **"You got 5 of 5!" / "حصلتَ على 5 من 5!"**.
- In the earlier build the answers were mixed (for example, the Fractions test was 1st, 2nd, 2nd, 1st, 1st).
- A child, or the founder, will notice within a few questions, and it makes the tests meaningless.
- Only the memory-game questions are shuffled.
- **Fix:** shuffle the answer order for check and test questions too.
- **Evidence:** always-first-choice-Maya.png, always-first-choice-Ali.png. The test questions and their first answers ("3", "3/5", ">", "3/6", "5/8") were all correct.

**Minor:**
- **N2.** "scared of spiders…" triggers the safety screen (false alarm, see S1).
- **N3.** The WhatsApp simulator replies in Arabic to English questions when the selected child is Ali, because it uses Ali's report language. That's correct by the settings, but may surprise the founder.
- **N4.** A sample lesson doesn't match the lesson name the parent typed. For example, a lesson named "Nouns" taught adjectives. The app does say "Demo mode: a sample lesson was used."
- **N5.** Pressing ← in the middle of a test goes straight to Home with no "are you sure?". Progress on that test is lost.
- **Still open from the first round:**
  - S3: risk on older iPhones. Confirm on a real iPhone; consider sending a web link instead of the file.
  - M2: the parent area now shows "Now working on: Ali", which helps.
  - M3 and M4.

---

## Round 3: six new features (2026-10-19, file dated 21:58)

**How:** Chromium, opening the file from disk, phone width 390, English (Maya) and Arabic (Ali). A real web page was opened before Zaki, so any arrow that leaves the app would show it. Correct and wrong answers were picked by reading the app's own saved answer key. Screenshots are in `qa-screenshots/round3/`. iPhone/WebKit is still NOT TESTED.

### Verdict: NOT READY. 1 blocker (safety text in grown-up Ask Zaki)

| # | Feature | Result |
|---|---|---|
| 1 | Pass-to-unlock | **PASS, 14/14**. Later lessons show 🔒 "Pass the "X" test to unlock" (English and Arabic). Tapping a locked lesson doesn't open it. Home Start opens the current lesson. 3/5 (60%) keeps the next lesson locked; 4/5 (exactly 80%) unlocks it. Survives reload. Parent Unlock and re-lock work. Reordering with ↑/↓ changes which lesson is open and what Home Start opens. A passed lesson stays open even if moved below an unpassed one. (U01–U14) |
| 2 | Full lesson review | **PASS, 7/7**. After a page reload, a learned lesson shows "Review lesson" + "Retake test" (English and Arabic). Review walks teach → check → Ask → summary with no dead end. A retake gets a new shuffle. Failing a retake does **not** re-lock the next lesson, and the lesson stays "Learned". Arabic review has no English. (V*) |
| 3 | Exam builder / exams | **Mostly PASS, with should-fix items.** The exam is built from the ticked lessons and balanced per lesson (e.g. 3/4/3). Answers are shuffled. It appears in the child's Tests with Practice and Take. Practice runs to a result. The result shows a per-lesson breakdown ("Shapes 0/3 · Decimals 0/4 · Fractions 0/3"). Weak lessons get "Review lesson: X" buttons, which open that lesson. A locked one correctly shows "This lesson is locked 🔒". The parent sees a per-lesson report. Grade 5 has a timer, grade 3 none. Arabic exam has no English. ← mid-exam opens "Leave the test?" with Stay / Leave / **I need help**. Stay returns to the same question. "I need help" is never blocked. See issues E1–E6. (X*, W*) |
| 4 | Grown-up Ask Zaki | **FAIL on safety.** The demo reply works in English and Arabic. The photo reminder is shown. The photo picker opens and the photo shows. There are no links anywhere, and a request for a link gives none. But **all 4 worrying messages got the normal demo tip instead of the fixed help text** (P*, see BLOCKER G1) |
| 5 | AI cap / library (demo) | **PASS (nothing breaks).** The labels exist in the code: "Today's AI limit is reached — the lesson will be prepared tomorrow" and "Ready instantly (from Zaki's library)". They can't appear in the demo, because there is no server. Adding the same lesson twice doesn't duplicate it. 45 Ask-Zaki messages at a normal pace all got replies. A "⏳ Ready tomorrow" lesson put into the saved data by hand shows correctly and Start skips it (see L1) |
| 6 | Regression sweep | **Partly re-verified when this report was written.** Earlier back-arrow, Send-button and safety-phrase runs were still in progress; the 9 checks finished so far all PASS. The shuffled-answer and new-screen back-arrow checks had not reported yet. Seen in every finished run so far: no console errors apart from the expected `/api` failures, no blank pages, no "not found". |

### Bug list (prioritized)

**BLOCKER**
- **G1. Grown-up Ask Zaki ignores worrying messages in demo mode.**
  - These four messages each got the cheerful generic reply ("Tip for now: ask your child to teach you what they learned today in 3 sentences"), with no help numbers:
    - "My son told me his uncle touches him…"
    - "I think my daughter wants to hurt herself"
    - "ابني قال إن عمه يضربه"
    - "baba darabne, my kid keeps saying this"
  - The specification says a worrying message gets the fixed help text. The child-side keyword check already works offline. The parent screen needs the same local check before the demo reply.
  - Evidence: P*-parent-ask-worry-*.png, en-parent-ask-worry-5s.png.

**Should fix**
- **E1. Exam date isn't validated.** These were all accepted:
  - "31/10/2026": silently saved as **today**, so the child sees an exam due today.
  - "2020-01-01" (in the past).
  - "2026-02-30" (impossible date).
- **E2. Pressing "Build the exam" with no lessons ticked does nothing**, with no message.
- **E3. The exam intro text contradicts itself.** It reads "10 questions from 3 lessons. **5 questions.** Beat your own score!" (also "20 questions… 5 questions"). Evidence: W*-en-exam-take-intro.
- **E4. Getting help during an exam loses the exam.**
  - "I need help" → help screen → ← (or the safety screen's "Go back") takes the child to Tests or Home, not back to the question.
  - Re-entering starts the exam from question 1.
  - A child who asks for help then has to restart the exam. Help is never blocked, which is right, but it costs them.
- **E5. The exam builder allows still-locked lessons.**
  - The child is examined on lessons they can't open yet.
  - "Review lesson: Shapes" then shows "This lesson is locked 🔒".
  - Either block locked lessons in the builder or warn the parent.

**Minor**
- **E6.** In a new demo, the exam builder says "No saved lessons in this subject yet" for Math, even though Maya has Fractions in her plan. A lesson only appears after it has been started once.
- **E7.** Arabic grammar: "فيه 10 سؤالًا" should be "فيه 10 أسئلة" (numbers 3–10 take the plural).
- **E8.** "Help with my lesson" during an exam says "Tap Hint in the lesson, or ask Zaki", but there are no hints during exams.
- **P1.** Grown-up Ask Zaki has no "Remove photo" option (Add lesson has one).
- **L1. A lesson marked "⏳ Ready tomorrow" because of the AI limit locks every lesson after it** ("Pass the "Geometry" test to unlock" while Geometry can't be studied yet). This can only happen with a real server.
- **C1.** Sending messages faster than Zaki replies (one every 0.35 s) gets replies for only about half. At a normal pace, all 45 were answered.
- **Carried over:** N4 (sample lesson doesn't match the typed name, e.g. "Decimals" shows Fractions content; it is labelled "🧪 Sample lesson (demo)"), N2 (spider false alarm), S3 (old iPhones untested).
