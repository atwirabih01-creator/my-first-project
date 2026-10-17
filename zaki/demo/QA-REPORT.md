# Zaki demo file: QA report

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
