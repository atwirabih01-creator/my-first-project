/* Cold Read: tiny development case that exercises every schema feature.
   Not the real case. Used only by test.html and tools/e2e-test.js. */
window.CASE = {
  id: "test-001",
  chapter: 0, number: 0,
  title: "The Test Tide",
  tagline: "A small case for checking the machinery.",
  start: { day: 1, time: "06:40", locationId: "loc-hq" },

  intro: [
    { art: "intro-1", caption: "Port Halden. The fog comes in before the sun does." },
    { art: "intro-2", caption: "A body behind the Anchor Bar. Lena Cruz calls before six." },
    { art: "intro-missing", caption: "Julian Marsh used to read strangers for a living. Now he reads crime scenes." }
  ],

  briefing: "Morning, Marsh. Dana Holt, 41, found behind the Anchor Bar on the Docks at 05:50 by a delivery driver. Uniforms say she fell down the cellar steps after closing. I don't like it. Her sister is waiting here at headquarters. The bartender, Sam, closed up last night. Start with the report on my desk, then go and look at the bar yourself. Try not to tell anyone their future.",

  victim: {
    id: "p-victim", name: "Dana Holt", age: 41, occupation: "Co-owner, Holt & Vance Shipping",
    bio: "Dana ran the books at a small shipping firm with her partner Rex Vance. Friends describe her as careful with money and careless with sleep. She had recently asked an accountant about an audit. She drank at the Anchor Bar most Thursdays and always paid in cash, except, apparently, last night.",
    foundAt: "Cellar steps behind the Anchor Bar, The Docks",
    foundBy: "A delivery driver",
    timeOfDeath: "Between 23:00 and 01:00",
    causeOfDeath: "Head injury, consistent with a fall"
  },

  locations: [
    {
      id: "loc-hq", name: "Major Crimes Unit", district: "HQ",
      description: "Third floor of the Port Halden police building. Cold coffee, warm radiators.",
      map: { x: 520, y: 300 }, art: "loc-hq", requires: [],
      hotspots: [
        { id: "h-hq-report", label: "Lena's desk", x: 300, y: 380, r: 50,
          text: "The incident report is squared neatly on the desk. Lena underlined 'fall' twice and then wrote a question mark.",
          grants: ["ev-report"] },
        { id: "h-hq-letter", label: "Mail tray", x: 720, y: 330, r: 40,
          requires: ["tw-test-autopsy"],
          text: "An envelope addressed to Dana, forwarded from her office. Someone opened it and resealed it badly.",
          grants: ["ev-letter"] }
      ]
    },
    {
      id: "loc-bar", name: "The Anchor Bar", district: "The Docks",
      description: "A low bar that smells of rope and spilled beer. The cellar door is still taped off.",
      map: { x: 230, y: 420 }, art: "loc-bar", requires: [], travelMinutes: 25,
      hotspots: [
        { id: "h-bar-glass", label: "Two glasses", x: 420, y: 300, r: 45,
          text: "Two glasses at the end of the bar. One has lipstick. The other has been wiped, but not well enough.",
          grants: ["ev-glass"] },
        { id: "h-bar-receipt", label: "Till receipt", x: 640, y: 310, r: 35,
          text: "A card receipt spiked by the till. Dana always paid cash.",
          grants: ["ev-receipt"] },
        { id: "h-bar-door", label: "Back door", x: 860, y: 260, r: 55,
          requires: ["q-sam-backdoor"],
          text: "The back door latch has fresh scratches. Someone opened it from the outside without a key.",
          grants: ["ev-camera", "fact-latch"] }
      ]
    },
    {
      id: "loc-flat", name: "Dana's Flat", district: "Hillcrest",
      description: "A tidy flat on the hill. Too tidy: someone has straightened things that were never crooked.",
      map: { x: 760, y: 170 }, art: "loc-flat", requires: ["fact-flat-key"],
      hotspots: [
        { id: "h-flat-note", label: "Fridge note", x: 250, y: 260, r: 40,
          text: "A note on the fridge in Dana's hand.",
          grants: ["ev-note"] },
        { id: "h-flat-safe", label: "Wall safe", x: 700, y: 280, r: 45,
          text: "A small wall safe behind a print of the harbour. Four digits. The fridge note mentioned a year.",
          puzzle: "pz-safe" }
      ]
    }
  ],

  people: [
    {
      id: "p-sam", name: "Sam Okafor", age: 33, role: "Bartender at the Anchor Bar",
      portrait: "p-sam", locationId: "loc-bar",
      available: { from: "06:00", to: "23:00" }, requires: [],
      description: "Tall, careful, drying a glass that is already dry. He keeps his eyes on the door.",
      questions: [
        { id: "q-sam-night", q: "Who was here last night?", a: "Dana, a few regulars, and a man in a good coat. He left before Dana did.",
          cue: "He answers quickly, as if he rehearsed it.", grants: ["fact-good-coat"] },
        { id: "q-sam-close", q: "When did you lock up?", a: "Midnight. I locked the back door myself.",
          cue: "His hand goes to his neck when he says 'myself'.", lie: true, grants: ["fact-sam-locked"] },
        { id: "q-sam-backdoor", q: "Did anyone use the back door?", requires: ["q-sam-close"],
          a: "Fine. I didn't check it. I was in a hurry. You can look.",
          cue: "His shoulders drop. The rehearsed tone is gone." }
      ],
      presentations: [
        { item: "ev-receipt", a: "That's Dana's card, but she never used a card. Somebody paid for two drinks on it. Her address is on the tab file if you need it.",
          cue: "He frowns at the time printed on it, genuinely puzzled.", grants: ["fact-flat-key"] },
        { item: "ev-receipt", requires: ["ev-camera"], a: "Two drinks on her card, and someone at my back door twenty minutes later. You think he waited for me to leave.",
          cue: "He goes quiet and checks the back door over your shoulder." }
      ],
      defaultPresentation: "Can't help you with that."
    },
    {
      id: "p-ivy", name: "Ivy Holt", age: 36, role: "Victim's sister",
      portrait: "p-ivy", locationId: "loc-hq", requires: [],
      description: "Red eyes, coat still buttoned. She keeps turning her phone over in her hands, face down.",
      questions: [
        { id: "q-ivy-dana", q: "Tell me about Dana.", a: "She was the sensible one. Lately she was scared of something at work. She wouldn't say what.",
          cue: "She glances at her phone before answering.", grants: ["fact-scared"] },
        { id: "q-ivy-rex", q: "What about her partner, Rex?", requires: ["fact-good-coat"],
          a: "Rex wears a coat that costs more than my car. Dana said he'd been 'creative' with the accounts.",
          cue: "Her voice hardens on his name." }
      ],
      presentations: [],
      defaultPresentation: "I don't know what that is."
    },
    {
      id: "p-rex", name: "Rex Vance", age: 47, role: "Victim's business partner",
      portrait: "p-rex", locationId: "loc-hq",
      available: { from: "09:00", to: "18:00" }, requires: ["tw-test-autopsy"],
      description: "Good coat, good watch, bad night's sleep. He smiles a fraction too early.",
      questions: [
        { id: "q-rex-where", q: "Where were you last night?", a: "At home. Alone. I went to bed at eleven.",
          cue: "He looks up and to the side, then straight at you, as if correcting himself.", lie: true, grants: ["fact-rex-alibi"] }
      ],
      presentations: [
        { item: "ev-bank", a: "Those transfers were approved. Dana signed off on them.",
          cue: "He touches his watch. It is the second time.", grants: [] }
      ],
      defaultPresentation: "I'm not sure why you're showing me this."
    }
  ],

  evidence: [
    { id: "ev-report", name: "Incident report", key: false, summary: "Uniform report: accidental fall.",
      doc: { kind: "report", title: "Incident Report 26-0412",
        meta: [["Reporting officer", "PC A. Moreno"], ["Date", "Day 1, 06:05"], ["Location", "Anchor Bar, Quay Street"]],
        text: "Deceased female found at foot of cellar steps.\nNo signs of forced entry noted.\nProbable accidental fall. Refer to coroner." } },
    { id: "ev-glass", name: "Two glasses", key: false, summary: "Two drinks, one glass wiped.",
      doc: { kind: "photo", title: "Exhibit 1: glasses on bar", text: "Two whisky tumblers. Left: lipstick trace. Right: wiped, partial print on base." } },
    { id: "ev-receipt", name: "Card receipt", key: true, summary: "Dana's card, two drinks, 23:52.",
      doc: { kind: "receipt", title: "THE ANCHOR BAR",
        meta: [["Date", "Day 0"], ["Time", "23:52"], ["Card", "**** 4471 HOLT D"]],
        table: { cols: ["Item", "Price"], rows: [["Malt whisky", "7.50"], ["Malt whisky", "7.50"], ["TOTAL", "15.00"]] } } },
    { id: "ev-camera", name: "Alley camera log", key: true, summary: "Back door opened at 00:20.",
      doc: { kind: "camera", title: "Quay St. camera 3, motion log",
        table: { cols: ["Time", "Event"], rows: [["23:58", "Figure exits front door (Sam)"], ["00:20", "Back door opens, figure in long coat"], ["00:31", "Back door closes"]] } } },
    { id: "ev-note", name: "Fridge note", key: false, summary: "Note: 'Mum's year'.",
      doc: { kind: "note", title: "Note on fridge", text: "Safe = Mum's year.\nShe was born in 1958, don't forget again!" } },
    { id: "ev-bank", name: "Company bank statement", key: true, summary: "Transfers to a shell account.",
      doc: { kind: "bank", title: "Harbour Mutual Bank: business account",
        meta: [["Account", "Holt & Vance Shipping"], ["Period", "Last 30 days"]],
        table: { cols: ["Date", "Description", "Out", "Balance"], rows: [["03", "Transfer to RV Holdings", "12,000.00", "88,400.00"], ["11", "Transfer to RV Holdings", "18,500.00", "69,900.00"], ["19", "Transfer to RV Holdings", "22,000.00", "47,900.00"]] } } },
    { id: "ev-phone", name: "Dana's call log", key: false, summary: "Calls from Rex late at night.",
      doc: { kind: "phone-log", title: "Call records: 07700 900 412",
        table: { cols: ["Time", "Direction", "Number", "Duration"], rows: [["22:41", "Incoming", "Rex Vance", "0:42"], ["23:30", "Outgoing", "Ivy Holt", "missed"], ["23:47", "Incoming", "Rex Vance", "1:15"]] } } },
    { id: "ev-messages", name: "Messages to Ivy", key: false, summary: "Dana: 'he knows I know'.",
      doc: { kind: "messages", title: "Dana Holt and Ivy Holt", me: "Dana",
        table: { cols: ["Time", "From", "Message"], rows: [["23:31", "Dana", "Call me when you can"], ["23:33", "Ivy", "At the cinema, later?"], ["23:34", "Dana", "He knows I know. Meeting him at the Anchor."]] } } },
    { id: "ev-statement", name: "Sam's statement", key: false, summary: "Sam's written account of closing.",
      doc: { kind: "statement", title: "Witness statement: S. Okafor",
        meta: [["Taken by", "DS L. Cruz"], ["Time", "Day 1, 07:30"]],
        text: "I closed at midnight. Dana was still finishing her drink with a man I didn't know. I left by the front." } },
    { id: "ev-autopsy", name: "Autopsy summary", key: true, summary: "Two head wounds: not a fall.",
      doc: { kind: "autopsy", title: "Coroner's preliminary findings",
        meta: [["Pathologist", "Dr. H. Lindqvist"], ["Subject", "Holt, Dana, 41"]],
        text: "Two distinct impact wounds to the back of the skull.\nThe second is inconsistent with a single fall.\nEstimated time of death: 00:15 to 00:45." } },
    { id: "ev-letter", name: "Auditor's letter", key: false, summary: "Audit booked for next week.",
      doc: { kind: "letter", title: "Letter from Brandt & Co. Auditors",
        text: "Dear Ms Holt,\n\nFurther to your call, we confirm the independent audit of Holt & Vance Shipping for Monday the 14th.\n\nYours sincerely,\nM. Brandt" } }
  ],

  facts: [
    { id: "fact-good-coat", text: "A man in an expensive coat was drinking with Dana last night.", key: false },
    { id: "fact-sam-locked", text: "Sam claims he locked the back door himself.", key: false },
    { id: "fact-flat-key", text: "The bar's tab file has Dana's home address in Hillcrest.", key: false },
    { id: "fact-latch", text: "The back door latch was forced from outside.", key: false },
    { id: "fact-scared", text: "Dana was frightened of something at work.", key: false },
    { id: "fact-rex-alibi", text: "Rex says he was at home alone from 23:00.", key: false },
    { id: "fact-motive", text: "Rex had a reason to want Dana silent before the audit.", key: true }
  ],

  deductions: [
    { id: "ded-alibi-broken", items: ["ev-camera", "fact-rex-alibi"],
      title: "The coat at the back door", text: "A figure in a long coat came through the back door at 00:20, inside the time of death. Rex claims he was in bed.",
      key: true, grants: [] },
    { id: "ded-motive", items: ["ev-bank", "ev-letter"],
      title: "The audit", text: "Rex was moving money to his own company. Dana booked an audit that would expose it.",
      key: true, grants: ["fact-motive"] }
  ],

  requests: [
    { id: "rq-phone", label: "Pull Dana's phone records for last night", requires: ["ev-receipt"],
      delayMinutes: 60, result: "Got her call log and messages. Two calls from Rex Vance just before midnight. Sending them over.",
      grants: ["ev-phone", "ev-messages"] }
  ],

  puzzles: [
    { id: "pz-safe", prompt: "Enter the four-digit code for the wall safe.", answer: "1958", grants: ["ev-bank"], hintToken: true }
  ],

  twist: {
    id: "tw-test-autopsy", requires: ["ev-receipt", "fact-good-coat"], orAfter: { day: 1, time: "12:00" },
    title: "Not a fall", text: "The coroner calls Lena. Two blows to the head, minutes apart. Somebody made sure. Dana's partner, Rex Vance, has just walked into headquarters asking for her laptop.",
    art: "intro-2", grants: ["ev-autopsy"], unlocks: ["p-rex"]
  },

  hintTokensFrom: ["ded-alibi-broken", "pz-safe"],
  hints: [
    { id: "hint-theo", requires: ["ev-receipt"], until: ["rq-phone"],
      text: "A card receipt has a phone number behind it somewhere. Theo could pull her records." },
    { id: "hint-door", requires: ["q-sam-close"], until: ["ev-camera"],
      text: "Sam touched his neck when he talked about the back door. Ask him about it again." },
    { id: "hint-money", requires: ["tw-test-autopsy"], until: ["ded-motive"],
      text: "Money moves quietly. Has anyone looked at what Dana kept locked away at home?" }
  ],

  solution: {
    suspects: ["p-sam", "p-ivy", "p-rex"],
    killer: "p-rex",
    motives: [
      { id: "m-audit", text: "To stop an audit exposing his theft" },
      { id: "m-jealous", text: "Jealousy over a relationship" },
      { id: "m-debt", text: "An unpaid bar debt" },
      { id: "m-inherit", text: "An inheritance" }
    ],
    motive: "m-audit",
    methods: [
      { id: "md-push", text: "Pushed her down the cellar steps after closing" },
      { id: "md-blows", text: "Struck her twice, then staged a fall" },
      { id: "md-poison", text: "Poisoned her drink" },
      { id: "md-car", text: "Hit her with a car" }
    ],
    method: "md-blows",
    proofs: ["ev-camera", "ev-autopsy", "ded-alibi-broken", "ded-motive", "ev-bank"],
    proofsNeeded: 2,
    success: { title: "Confession", text: "Rex looks at the camera log for a long time. 'She was going to ruin me over numbers,' he says. 'Just numbers.'" },
    failure: { title: "The wrong door", text: "The charge does not hold. By the time the court lets your suspect go, Rex Vance has flown to Lisbon and the shell account is empty." }
  },

  reopen: {
    intro: "Three weeks later, Lena drops the file back on your desk. 'Same body, same bar. This time, read it properly.'",
    evidence: { "ev-receipt": { summary: "Dana's card, two drinks, 23:52 (re-examined).", doc: { text: "Signature on the slip does not match Dana's." } } },
    hotspots: { "h-bar-receipt": { text: "Second look: the receipt is signed, and the signature is not Dana's." } },
    questions: { "q-sam-night": { a: "Dana, a few regulars, and Rex Vance. I know him now; he's been in the papers." } },
    addEvidence: [
      { id: "ev-signature", name: "Signature comparison", key: true, summary: "Receipt signed by Rex.",
        doc: { kind: "report", title: "Handwriting comparison", text: "The signature on the 23:52 receipt matches Rex Vance's company cheques." } }
    ],
    addDeductions: [
      { id: "ded-alibi-broken", items: ["ev-camera", "fact-rex-alibi"], title: "The coat at the back door (reviewed)",
        text: "The camera puts a long coat at the back door at 00:20; Rex says he was asleep.", key: true, grants: [] },
      { id: "ded-motive-2", items: ["ev-bank", "fact-scared"], title: "What scared her", text: "Dana was scared of what the accounts showed: Rex was stealing.", key: true, grants: ["fact-motive"] }
    ],
    removeDeductions: ["ded-motive"],
    briefing: "Reopened file. Same body, same bar, three weeks colder. Read what we have again and do not trust the first team's version.",
    people: { "p-sam": { description: "Sam looks thinner. He has been reading about the case and keeps his hands flat on the bar." } },
    twist: { title: "The coroner, again" },
    solution: { success: { title: "Confession", text: "Second time, it holds. Rex reads the camera log and puts the pen down. 'Just numbers,' he says." } },
    addHints: [{ id: "hint-reopen", requires: [], until: ["ev-camera"], text: "The first team never opened the back door. Start there." }],
    hintTokensFrom: ["ded-alibi-broken", "pz-safe", "q-sam-backdoor"],
    proofs: ["ev-camera", "ev-autopsy", "ded-alibi-broken", "ded-motive-2", "ev-bank"]
  },

  debrief: [
    { flag: "ded-alibi-broken", title: "The broken alibi", technique: "Testing a statement against an independent record",
      explanation: "Rex's account was detailed and calm, but the camera does not care how calm he was.",
      tip: "When someone gives you a time, check it against something that cannot lie: a receipt, a log, a camera." },
    { flag: "q-sam-backdoor", title: "Sam's neck touch", technique: "Self-soothing gestures",
      explanation: "Touching the neck while speaking is a common self-calming gesture under stress. It does not prove a lie, but it marks a topic worth revisiting.",
      tip: "Note where a gesture happens, not just that it happens." },
    { flag: "ev-letter", title: "The auditor's letter", technique: "Following the money",
      explanation: "An audit date is a deadline. Deadlines create motives.",
      tip: "Ask what was about to change in the victim's life." }
  ]
};
