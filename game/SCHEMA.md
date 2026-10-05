# Cold Read case format

A case is one JavaScript file that sets `window.CASE = { ... }`. Art is a separate file that
sets `window.ART = { ... }`. The engine (`engine.js`) reads both. Everything below is the
contract between the case writer, the artist and the engine. All text is plain English, no HTML.

## Flags

Almost every id (evidence, fact, deduction, question, presentation, request, puzzle, twist,
location, person) becomes a **flag** once the player obtains, triggers or unlocks it.
`requires: [ids]` means all of those flags must be set. Ids are unique across the whole case,
lowercase with hyphens, e.g. `ev-torn-receipt`, `fact-alibi-gym`, `q-maya-last-call`.

## Time

The case has an in-game clock. Costs in minutes (engine defaults, can be overridden per item):
travel to a location 20, examine a hotspot 5, ask a question 10, present evidence 10,
connect two items on the board 5, wait 30 (player can wait at HQ).
Times are `"HH:MM"` on a 24h clock, plus `day` (1 = the day the body is found).

## Top-level shape

```js
window.CASE = {
  id: "case-001",
  chapter: 1, number: 1,
  title: "…",
  tagline: "…",                       // one line under the title
  start: { day: 1, time: "06:40", locationId: "loc-hq" },

  intro: [                            // opening sequence, 3–6 slides
    { art: "intro-1", caption: "…" }  // art = key in ART.intro
  ],
  briefing: "…",                      // what happened, 80–150 words, from Lena

  victim: {
    id: "p-victim", name: "…", age: 0, occupation: "…",
    bio: "…",                         // 60–120 words, includes hidden leads
    foundAt: "…", foundBy: "…",
    timeOfDeath: "…",                 // as estimated at start, e.g. "Between 22:00 and 01:00"
    causeOfDeath: "…"                 // as believed at start (may change later)
  },

  locations: [{
    id: "loc-…", name: "…", district: "Old Town|The Docks|Hillcrest|Eastgate|Financial Quarter|HQ",
    description: "…",                 // 1–3 sentences shown on arrival
    map: { x: 0, y: 0 },              // position on ART.map, viewBox 0 0 1000 600
    art: "loc-…",                     // key in ART.scenes, viewBox 0 0 1000 600
    requires: [],                     // empty = open from the start
    travelMinutes: 20,                // optional
    hotspots: [{
      id: "h-…", label: "…",          // short label, shown only after found
      x: 0, y: 0, r: 40,              // centre + radius in scene coords (0 0 1000 600)
      text: "…",                      // what Julian notices
      grants: ["ev-…"],               // optional
      requires: [],                   // optional: hidden until these flags are set
      puzzle: "pz-…"                  // optional
    }]
  }],

  people: [{
    id: "p-…", name: "…", age: 0, role: "…",   // role e.g. "Victim's husband"
    portrait: "p-…",                  // key in ART.portraits, viewBox 0 0 300 360
    locationId: "loc-…",              // where to find them
    available: { from: "08:00", to: "20:00" },  // optional, otherwise always
    requires: [],                     // when they appear in the case
    description: "…",                 // first impression, includes a body-language detail
    questions: [{
      id: "q-…", q: "…", a: "…",
      cue: "…",                       // optional body-language / behaviour observation
      requires: [], grants: [],
      lie: false                      // true if the answer is a lie (used in debrief)
    }],
    presentations: [{                 // showing them a piece of evidence or a fact
                                      // several for the same item: the LAST one whose requires are met wins
                                      // (put more specific, later-game reactions after the general one)
      item: "ev-…", a: "…", cue: "…", grants: [], requires: []
    }],
    defaultPresentation: "…"          // reply when shown something with no special reaction
  }],

  evidence: [{
    id: "ev-…", name: "…", key: false,  // key = important lead, shows "Lead confirmed"
    summary: "…",                       // one line for the board
    doc: {
      kind: "photo|object|report|statement|receipt|phone-log|messages|bank|camera|note|letter|autopsy|map",
      title: "…",
      meta: [["Label", "Value"]],       // optional key/value header lines
      table: { cols: ["…"], rows: [["…"]] },   // optional
      text: "…"                          // optional body text; use \n for new lines
    }
  }],

  facts: [{ id: "fact-…", text: "…", key: false }],   // statements that go in the notebook

  deductions: [{                      // connecting two items on the evidence board
    id: "ded-…", items: ["ev-…", "fact-…"],   // exactly two ids, order does not matter
    title: "…", text: "…", key: true,
    grants: [], requires: []
  }],

  requests: [{                        // things Theo (tech expert) can look up
    id: "rq-…", label: "…", requires: [],
    delayMinutes: 60, result: "…", grants: []
  }],

  puzzles: [{
    id: "pz-…", prompt: "…", answer: "…",       // compared case-insensitively, spaces ignored
    grants: [], hintToken: true
  }],

  twist: {
    id: "tw-…", requires: [], orAfter: { day: 1, time: "15:00" },  // fires when either is met
    title: "…", text: "…", art: "intro-…",     // optional art
    grants: [], unlocks: []                    // unlocks = location/person ids now available
  },

  hintTokensFrom: ["ded-…", "pz-…"],  // flags that earn the player one hint token each
  hints: [{                           // Lena's hints; engine picks the first relevant one
    id: "hint-…", requires: [], until: ["…"],  // relevant while requires met and NOT all `until` set
    text: "…"                         // points where to look, never the answer
  }],

  solution: {
    suspects: ["p-…"],                // people the player can accuse (3–5)
    killer: "p-…",
    motives: [{ id: "m-…", text: "…" }],  motive: "m-…",   // 4 options
    methods: [{ id: "md-…", text: "…" }], method: "md-…",  // 4 options
    proofs: ["ev-…", "ded-…"],         // valid key proofs; player picks 3 from what they found
    proofsNeeded: 2,                   // at least this many picks must be in proofs
    success: { title: "…", text: "…" },  // confession scene
    failure: { title: "…", text: "…" }   // wrong person charged, consequence
  },

  reopen: {                            // when a failed case is reopened: same killer, new trail
    intro: "…",
    evidence: { "ev-…": { /* fields to override */ } },
    hotspots: { "h-…": { /* fields to override */ } },
    questions: { "q-…": { /* fields to override */ } },
    addEvidence: [], addDeductions: [], removeDeductions: [],
    // addDeductions: a deduction whose id already exists replaces it
    proofs: [],                         // replaces solution.proofs if given
    briefing: "…",                      // optional: replaces briefing
    people: { "p-…": { /* fields to override, e.g. description, presentations, defaultPresentation */ } },
    twist: { /* fields to override */ },
    solution: { /* fields to override, e.g. success, failure, proofs */ },
    addHints: [],                       // extra hints for the reopened run
    hintTokensFrom: []                  // optional: replaces hintTokensFrom
  },

  debrief: [{
    flag: "…",                         // found if this flag is set
    title: "…", technique: "…",        // e.g. "Baseline behaviour"
    explanation: "…", tip: "…"
  }]
};
```

## Art

```js
window.ART = {
  map: "<svg viewBox='0 0 1000 600'>…</svg>",
  intro:     { "intro-1": "<svg viewBox='0 0 1000 600'>…</svg>" },
  scenes:    { "loc-…":   "<svg viewBox='0 0 1000 600'>…</svg>" },
  portraits: { "p-…":     "<svg viewBox='0 0 300 360'>…</svg>" }
};
```

Every SVG is a complete string. No external images or fonts. The engine draws hotspots on top
of scenes using the same 1000×600 coordinates, so each hotspot's object must be drawn at its
`x, y`. A missing art key shows a neutral placeholder, never an error.
