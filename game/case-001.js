/* Cold Read — Chapter 1, Case 1: "The Long Way Home"
 * Pilot case. Standalone. Data format: game/SCHEMA.md.
 * Spoilers for testers: game/case-001-SPOILERS.md
 * Check with: node game/tools/validate-case.js
 */
window.CASE = {
  id: "case-001",
  chapter: 1,
  number: 1,
  title: "The Long Way Home",
  tagline: "She texted her sister that she was walking home. She never took a step.",
  start: { day: 1, time: "07:30", locationId: "loc-hq" },

  intro: [
    { art: "intro-1", caption: "Port Halden. Thursday, 05:50. The rain stopped hours ago. The Saltmarket Stairs never dry." },
    { art: "intro-2", caption: "A street sweeper finds a woman on the lower landing. He stops his cart, takes off his cap, and calls it in." },
    { art: "intro-3", caption: "Julian Marsh used to tell strangers their secrets on live television. He was never psychic. He was paying attention, and someone was paying researchers." },
    { art: "intro-4", caption: "Now he pays attention for the Port Halden Police. Major Crimes gave him a desk, a visitor's badge and Detective Sergeant Lena Cruz, who did not ask for him." },
    { art: "intro-5", caption: "07:30. Lena drops a thin file in front of him. 'Don't read her. Read the evidence.'" }
  ],

  briefing: "Iris Kellan, thirty-four. Senior claims investigator at Halden Mutual Marine, Harbour Point Tower, Financial Quarter. Lived alone in Hillcrest. At 05:50 a city street sweeper, Tomas Ferreira, found her on the lower landing of the Saltmarket Stairs in Old Town, face down, with a head injury. PC Odell was there at 06:04, the paramedics pronounced her at 06:10, and the stairs have been closed at both ends since. What we have: she was fully dressed, coat buttoned, boots off and standing on the step below her. Her phone was in her inside pocket, screen cracked, locked. No handbag, no wallet, no keys. Dr. Sorensen looked at her at the scene: one bad injury to the back of the head, scrapes to the face and hands, and on the temperature she puts death between ten last night and one this morning. Her view, for now, is a fall down the steps, possibly helped by someone who wanted the bag. There have been two bag snatches on Mercer Street this month, and uniform will tell you all about them. The emergency card on the phone gave us the sister, Hanna. PC Okafor told her at five past seven. Hanna had a text from Iris's phone at 23:12: walking home the long way, need air. If that's right, Iris was alive at 23:12 and on her way home, which puts her on those stairs exactly when the doctor likes. What we don't have: anyone who saw her after the early evening, where she spent it, where the bag went, and why a woman who lives in Hillcrest was on the Saltmarket Stairs at all, because they are nowhere near her way home. Nobody has viewed a camera yet. The late shop at the top of the stairs has one. Sorensen is holding the body at the scene until we've walked it, then she does the post-mortem and rings. Hanna will be at the flat from nine. The neighbour downstairs has a key. I've told her line manager; he's in from half past eight. The contacts are in the file. So: scene first, while it's still ours, then the flat, then the office. Anything with a password on it goes to Theo. I would like this to be a mugging, because muggings are simple. That is not up to me. And Marsh: no tricks with the family.",

  caseFile: ["ev-first-officer", "ev-scene-log", "ev-prelim-report", "ev-nok-note", "ev-contacts"],

  victim: {
    id: "p-victim",
    name: "Iris Kellan",
    age: 34,
    occupation: "Senior claims investigator, Halden Mutual Marine",
    bio: "Iris Kellan grew up in The Docks, the elder of two daughters of a harbour electrician. She left school at eighteen, studied accountancy at night, and spent four years at the Port Halden tax office before Halden Mutual Marine recruited her as a claims investigator. Six years on she was a senior investigator, known on the fourth floor as 'the auditor' for refusing to sign anything she had not checked twice. Colleagues describe her as private, precise and hard to fool; nobody describes her as warm. She lived alone in a fourth-floor flat at Calder Court, Hillcrest, with a grey cat called Ledger. She separated from Marcus Bell, a chef, three months ago; they still co-owned a small sailboat, the Wren, which she had recently put up for sale. For the past fortnight she had been working on a disputed trawler claim and, her sister says, sleeping with the light on. She had no criminal record, no known debts and no reported threats against her. Her work diary for Thursday morning was marked private.",
    family: "Mother, Annelie Kellan, 63, lives in the south; Hanna is telling her by phone. Father, Henrik Kellan, a harbour electrician, died two years ago; Iris dealt with the estate. One sister, Hanna Kellan, 29, a physiotherapist living in Eastgate, the person Iris spoke to most and the next of kin on her phone. No children. Ex-partner Marcus Bell, together about four years, separated three months ago; Hanna calls the break-up 'loud but not dangerous'. Mr Bell's address and workplace are not yet confirmed.",
    work: "Senior claims investigator, Halden Mutual Marine, 4th floor, Harbour Point Tower, Financial Quarter. She checks large hull and cargo claims before they are paid, which means questioning skippers and owners who do not always welcome her. Reports to Graham Whitlock, Head of Claims, who recruited her six years ago. No disciplinary record. Current caseload, according to her sister: one large disputed claim on a sunken trawler. The company was told of her death by phone at 07:25 and has offered full cooperation.",
    routine: "Weekdays: the Hillcrest tram at about 08:15, at her desk by 08:40. Often worked late and often ate alone in Old Town cafés after work. Swam at the Eastgate baths on Monday and Friday mornings. After dark she took the tram or a taxi and, her sister says, avoided the Saltmarket Stairs, which she called 'a broken ankle waiting to happen'. The neighbour, who has a key, feeds the cat when she works late. Texted her sister most evenings.",
    lastSeen: "As known at 07:30 on Thursday. Wednesday 08:05: seen leaving Calder Court with her work bag by the downstairs neighbour, Ms Finch (by phone to PC Okafor, 07:20). Wednesday early evening: spoke to her sister by phone; details still to be taken. Wednesday 23:12: text from her phone to her sister, 'walking home the long way. need air. talk tmrw x'. Overnight: did not come home; the neighbour fed the cat at midnight and the flat was empty. No confirmed sighting after the early evening. Found 05:50 Thursday.",
    foundAt: "Lower landing, Saltmarket Stairs, Old Town (between Saltmarket Lane and Quay Road)",
    foundBy: "Tomas Ferreira, city street sweeper, 05:50 Thursday",
    timeOfDeath: "Between 22:00 Wednesday and 01:00 Thursday",
    causeOfDeath: "Head injury consistent with a fall down stone steps; robbery not excluded"
  },

  /* ================================================================ LOCATIONS */
  locations: [
    {
      id: "loc-hq",
      name: "Major Crimes, PHPD Headquarters",
      district: "HQ",
      description: "Third floor, harbour side. Grey carpet, grey light, a coffee machine that has been broken since spring. Lena's desk is the tidy one.",
      map: { x: 430, y: 330 },
      art: "loc-hq",
      requires: [],
      hotspots: [
        {
          id: "h-hq-file", label: "Lena's working file", x: 270, y: 380, r: 45,
          text: "On Lena's desk, squared to the edge: her own copy of file MC-26-0412, already bristling with coloured tabs. Blue for anything someone has checked, red for anything nobody has. Most of the tabs are red. Her pen lies parallel to the folder."
        },
        {
          id: "h-hq-weather", label: "Weather sheet", x: 720, y: 170, r: 40,
          text: "Pinned to the whiteboard beside the rain-streaked window: a Met Office printout for Wednesday night. Someone has circled one line in red: 'Rain ends 21:40'.",
          grants: ["ev-weather"]
        },
        {
          id: "h-hq-desk", label: "Julian's desk", x: 520, y: 480, r: 40,
          text: "The desk they gave you. A dead plant, an empty in-tray, and the previous owner's nameplate, DS P. HALLORAN, turned face down. Nobody has explained Halloran. You have decided not to ask yet."
        }
      ]
    },
    {
      id: "loc-stairs",
      name: "Saltmarket Stairs",
      district: "Old Town",
      description: "A steep stone stairway dropping from Saltmarket Lane to Quay Road and the harbour. Ninety-one steps, one turn, one lower landing. No lights on the lower flight. Police tape flutters at both ends.",
      map: { x: 230, y: 300 },
      art: "loc-stairs",
      requires: [],
      hotspots: [
        {
          id: "h-st-kiosk", label: "Late shop camera", x: 140, y: 130, r: 50,
          text: "At the top of the stairs, a narrow late-night shop with its shutter half up. A small dome camera above the door points down the top flight; at the far edge of its view is a slice of Quay Road below. The owner, still in his slippers, lets you watch Wednesday night on his recorder.",
          grants: ["ev-kiosk-cam"]
        },
        {
          id: "h-st-steps", label: "Upper flight", x: 330, y: 250, r: 50,
          text: "Every step of the upper flight is slick with grey mud and leaf litter washed down from Saltmarket Lane. The uniformed officers' boot prints are smeared all over it. You could not walk down here last night without carrying some of it with you."
        },
        {
          id: "h-st-pocket", label: "Coat pocket", x: 470, y: 360, r: 35,
          text: "The left side of her dark wool coat, buttoned to the throat. In the inside pocket: her phone, screen cracked in a starburst, and a folded card slip from a café.",
          grants: ["ev-phone", "ev-cafe-receipt"]
        },
        {
          id: "h-st-body", label: "The body", x: 590, y: 420, r: 55,
          text: "A white forensic sheet ringed by numbered yellow evidence markers covers the lower landing. You lift its edge. Iris Kellan lies face down, head towards the lower flight, arms tucked beneath her. Her coat is buttoned and neat. Her hair is matted at the back. No bag. She looks less like someone who fell than someone who was put down carefully.",
          grants: ["ev-scene-photo"]
        },
        {
          id: "h-st-shoes", label: "Her boots", x: 730, y: 450, r: 35,
          text: "Black leather ankle boots, side by side on the step below the landing, toes down. You crouch and look at the soles.",
          grants: ["ev-shoes"]
        },
        {
          id: "h-st-drag", label: "Foot of the stairs", x: 860, y: 540, r: 45,
          requires: ["tw-autopsy"],
          text: "Now you know what to look for. The bottom three steps rise from the Quay Road kerb. Along their front edges, two parallel scuffs run upward through the moss, about thirty centimetres apart, ending at the lower landing. A curl of mud on the kerb where something heavy was set down.",
          grants: ["ev-drag-marks"]
        }
      ]
    },
    {
      id: "loc-flat",
      name: "Iris Kellan's flat, Calder Court",
      district: "Hillcrest",
      description: "Fourth floor, no lift. One large room with a kitchen at one end and a desk under the window at the other. Tidy in the way of someone who files things. A grey cat watches you from the bookshelf.",
      map: { x: 780, y: 130 },
      art: "loc-flat",
      requires: [],
      travelMinutes: 25,
      hotspots: [
        {
          id: "h-fl-fridge", label: "Fridge note", x: 130, y: 250, r: 45,
          text: "The fridge door is bare except for one yellow sticky note at eye level, in small, square capitals.",
          grants: ["ev-fridge-note"]
        },
        {
          id: "h-fl-kitchen", label: "Kitchen counter", x: 320, y: 330, r: 45,
          text: "Two wine glasses upside down on the drying rack, a cork on the counter, and a printed boat-sale listing with handwriting across the bottom. A plate is missing from the set of four on the shelf; there are white shards in the bin.",
          grants: ["ev-boat-listing"]
        },
        {
          id: "h-fl-desk", label: "Desk and planner", x: 580, y: 280, r: 50,
          text: "Under the window, a desk with a charging cable but no laptop, a mug of pens, and a paper week-planner left open at this week.",
          grants: ["ev-planner"]
        },
        {
          id: "h-fl-catbowl", label: "Cat bowl", x: 440, y: 520, r: 30,
          text: "Ledger's bowl on the floor by the door, licked clean, and a second bowl with fresh food in it. Someone with a key fed the cat late last night. Probably not Iris."
        },
        {
          id: "h-fl-box", label: "Document box", x: 830, y: 430, r: 45,
          text: "Pushed under the bottom bookshelf: a grey fireproof document box with a four-digit combination wheel. It is heavier than it should be for an empty box.",
          puzzle: "pz-docbox"
        }
      ]
    },
    {
      id: "loc-office",
      name: "Halden Mutual Marine, 4th floor",
      district: "Financial Quarter",
      description: "Claims department, Harbour Point Tower. Open-plan desks, a glass-walled corner office for the head of claims, and at the far end the door to the file archive. The building's car park is two floors below the street.",
      map: { x: 560, y: 170 },
      art: "loc-office",
      requires: [],
      hotspots: [
        {
          id: "h-of-desk", label: "Iris's desk", x: 180, y: 390, r: 50,
          text: "Iris's desk is the clearest on the floor: one thick claim file squared in the middle, sticky tabs down its edge, notes in the margins in the same square capitals as the fridge note.",
          grants: ["ev-petrel-claim"]
        },
        {
          id: "h-of-laptop", label: "Work laptop", x: 320, y: 330, r: 35,
          text: "A company laptop on a docking stand beside her desk, lid closed, a silver asset tag on the lid and an IT sticker underneath.",
          grants: ["ev-laptop"]
        },
        {
          id: "h-of-board", label: "Noticeboard", x: 500, y: 170, r: 45,
          text: "The staff noticeboard by the lifts: a fire drill notice, a leaving card, and the spring company newsletter pinned up with a photograph of a smiling man at his desk.",
          grants: ["ev-newsletter"]
        },
        {
          id: "h-of-shelf", label: "Whitlock's shelf", x: 760, y: 190, r: 40,
          text: "Through the glass of the corner office: a shelf of awards behind the desk. Three glass plaques, a framed photo of a yacht, and between them a gap where the dust stops.",
          grants: ["ev-shelf-ring"]
        },
        {
          id: "h-of-carpet", label: "Archive carpet", x: 640, y: 510, r: 45,
          requires: ["tw-autopsy"],
          text: "Through the open archive door, at the end of aisle F: a patch of grey loop-pile carpet about a metre across that is cleaner than the rest. You kneel. It is still faintly damp at the base and smells of carpet shampoo.",
          grants: ["ev-carpet-patch"]
        },
        {
          id: "h-of-archive", label: "Archive terminal", x: 880, y: 420, r: 45,
          requires: ["ev-iris-copies"],
          text: "Just inside the archive door, a box-retrieval terminal on a steel stand. A sticky note on its side in Iris's square capitals: START AT THE BEGINNING.",
          puzzle: "pz-archive"
        }
      ]
    },
    {
      id: "loc-cafe",
      name: "Tidewater Café",
      district: "Old Town",
      description: "A narrow café on Mercer Street, five minutes uphill from the Saltmarket Stairs. Fogged windows, fish soup on the board, a radio playing shipping forecasts.",
      map: { x: 170, y: 190 },
      art: "loc-cafe",
      requires: ["ev-cafe-receipt"],
      hotspots: [
        {
          id: "h-ca-cctv", label: "Camera over the till", x: 780, y: 130, r: 40,
          text: "A camera bracketed above the till covers the whole room. The owner keeps a week of recordings and is happy to have something useful to do with his hands.",
          grants: ["ev-cafe-cctv"]
        },
        {
          id: "h-ca-board", label: "Community board", x: 540, y: 260, r: 45,
          text: "A corkboard by the door: guitar lessons, a lost dog, a room to let, and a printed flyer from the Fishermen's Co-operative with this Wednesday's date on it.",
          grants: ["ev-coop-flyer"]
        },
        {
          id: "h-ca-table", label: "Window table", x: 260, y: 410, r: 55,
          text: "The corner table by the window, the one the owner says she always took. The glass is fogged; someone has drawn a small boat in the condensation and half wiped it out. He says she wrote in a little black notebook while she ate. There was no notebook at the scene."
        }
      ]
    },
    {
      id: "loc-restaurant",
      name: "The Anchor & Lamp",
      district: "The Docks",
      description: "A busy fish restaurant on the old quay west of the Saltmarket Stairs, with an open kitchen. At this hour the chairs are still on the tables and the grill is being scraped down.",
      map: { x: 120, y: 480 },
      art: "loc-restaurant",
      requires: ["fact-marcus-work"],
      hotspots: [
        {
          id: "h-re-clock", label: "Clock and ticket spike", x: 190, y: 260, r: 45,
          text: "By the kitchen pass: a punch clock with a rack of cards, and a steel spike holding last night's printed order tickets. The manager pulls Wednesday's for you.",
          grants: ["ev-rota"]
        },
        {
          id: "h-re-grill", label: "Grill station", x: 470, y: 450, r: 50,
          text: "The grill station, still warm. A rail above it where tickets hang while the cook works through them. Whoever stands here cannot step away for long without the whole line backing up."
        },
        {
          id: "h-re-backdoor", label: "Back door camera", x: 780, y: 320, r: 50,
          text: "The back door to the quay, propped open with a fish crate. A camera above it looks impressive until you notice it has no lens and no cable. A deterrent, not a witness."
        }
      ]
    },
    {
      id: "loc-coop",
      name: "Fishermen's Co-operative Hall",
      district: "The Docks",
      description: "A tin-roofed hall by the fish market with folding chairs, a tea urn, and a wall of photographs of boats, many of them gone.",
      map: { x: 650, y: 520 },
      art: "loc-coop",
      requires: ["ev-petrel-claim"],
      hotspots: [
        {
          id: "h-co-minutes", label: "Secretary's table", x: 240, y: 300, r: 45,
          text: "A trestle table with the co-op's minute book open at Wednesday night's meeting, and an attendance sheet clipped inside the cover.",
          grants: ["ev-coop-minutes"]
        },
        {
          id: "h-co-photos", label: "Wall of boats", x: 560, y: 170, r: 50,
          text: "Among the photographs: a blue-hulled trawler, GREY PETREL on the bow. The caption reads 'Refit 2019 — new Brandt 8 diesel fitted'. A black ribbon has been tucked into the frame."
        },
        {
          id: "h-co-oilskins", label: "Oilskin hooks", x: 820, y: 420, r: 45,
          text: "A row of hooks by the door with work jackets. One bright yellow oilskin has a name stitched in the collar: P. LUND."
        }
      ]
    }
  ],

  /* ================================================================ PEOPLE */
  people: [
    {
      id: "p-hanna",
      name: "Hanna Kellan",
      age: 29,
      role: "Victim's sister",
      portrait: "p-hanna",
      locationId: "loc-flat",
      available: { from: "09:00", to: "21:00" },
      requires: [],
      description: "She is sitting on the arm of her sister's sofa with the cat in her lap, still in a physiotherapist's tunic under her coat. She keeps turning her phone face down, then face up again.",
      questions: [
        {
          id: "q-hanna-iris", q: "Tell me about Iris. Not the obituary version.",
          a: "She checked the locks twice. She read contracts for fun. When Dad died she did the paperwork for the whole family in a weekend and then cried for a month where nobody could see. She wasn't warm, exactly. She was reliable. Those aren't the same, but they're close.",
          cue: "She answers easily and looks straight at you, hands loose around the cat. This is how she talks when she is not on guard. Remember it."
        },
        {
          id: "q-hanna-message", q: "When did you last hear from her?",
          a: "A text. Twelve minutes past eleven last night. I was asleep; I saw it this morning and thought, that's odd, and then the police knocked. Here. Read it yourself.",
          cue: "She holds the phone out at arm's length, as if it might be hot.",
          grants: ["ev-hanna-messages"]
        },
        {
          id: "q-hanna-style", q: "Does that last message sound like her?",
          requires: ["ev-hanna-messages"],
          a: "No. That's what's been bothering me. Iris writes texts like she's filling in a form. Capital letters, full stops, and she signs off with a dash and an I. She called kisses 'emotional punctuation'. And 'tmrw'? She'd rather die. Sorry. You know what I mean.",
          cue: "For the first time she looks at the message instead of at you, frowning, reading it the way you would read a stranger's handwriting.",
          grants: ["fact-iris-style"]
        },
        {
          id: "q-hanna-call", q: "Did you speak to her on Wednesday?",
          a: "Twice. Ten past eight in the morning, about Saturday; normal. Then just after seven in the evening. She was in a café, I could hear cups and rain against a window. She said she had to go back into work for an hour. Someone wanted to talk to her before tomorrow. She said, 'He says he can explain.' I asked who. She said, 'Better you don't know until it's done.' She sounded relieved. Like it was going to be easier than she'd feared.",
          cue: "She gives the times, the cups and the rain without being asked. Small, checkable details, offered freely.",
          grants: ["fact-hanna-call"]
        },
        {
          id: "q-hanna-marcus", q: "What about Marcus?",
          a: "Marcus shouts at the weather. He'd have cried at her feet before he laid a hand on her. They were fighting about the boat, the Wren. He works the grill at the Anchor & Lamp, if you want him. Nights, mostly.",
          grants: ["fact-marcus-work"]
        }
      ],
      presentations: [
        {
          item: "ev-phone-extract",
          a: "Scheduled? She scheduled it at ten to nine? She never scheduled anything. She thought it was a way of lying about when you were thinking of someone.",
          cue: "Her hand goes flat on the cat's back and stays there."
        },
        {
          item: "ev-planner",
          a: "Compliance. She said there was something at work she couldn't un-see. She wouldn't tell me what. She said if she told me, I'd have to decide whether to keep quiet too, and she didn't want that for me."
        }
      ],
      defaultPresentation: "She looks at it for a long time. 'I don't know what that means. Should I?'"
    },
    {
      id: "p-dolores",
      name: "Dolores Finch",
      age: 68,
      role: "Neighbour and friend (flat below)",
      portrait: "p-dolores",
      locationId: "loc-flat",
      available: { from: "07:00", to: "22:00" },
      requires: [],
      description: "Retired harbour pilot, cardigan buttoned wrong, reading glasses pushed up into white hair. She stands in the doorway with her arms folded, not hostile, just making sure you know whose landing this is.",
      questions: [
        {
          id: "q-dol-iris", q: "How well did you know her?",
          a: "She carried my shopping up four flights every Saturday and pretended it was on her way. I fed her cat when she worked late. I've got her key. Fed him at midnight last night, as it happens, because he wouldn't stop crying at the door.",
          cue: "Steady voice, steady eyes. She is used to giving reports."
        },
        {
          id: "q-dol-tuesday", q: "Anything unusual this week?",
          a: "Tuesday night. Her ex, Marcus, the chef from the Anchor & Lamp. You can smell the grill on him. He came round about half nine and they had it out. I heard a plate go. Just before ten he went down the stairs shouting, 'You'll regret this.' Then nothing. She knocked on my door after to say she was all right, which is how I knew she wasn't.",
          grants: ["fact-argument", "fact-marcus-work"]
        },
        {
          id: "q-dol-wednesday", q: "Did you see her on Wednesday?",
          a: "Left at five past eight with her work bag. Never came back. The cat told me that much."
        },
        {
          id: "q-dol-worried", q: "Did she seem worried about anything lately?",
          requires: ["q-dol-iris"],
          a: "Last week she asked me if I'd ever reported a friend. I said it depends on the friend and on what they'd done. She said, 'He's not a friend. That's the problem. He's been good to me.' I thought she meant Marcus. Now I'm not sure she did.",
          cue: "She stops halfway, and for the first time looks away from you, at Iris's door.",
          grants: ["fact-iris-reporting"]
        }
      ],
      presentations: [
        {
          item: "ev-boat-listing",
          a: "The Wren. She loved that boat and hated that it was half his. She told me she'd pay him his half, every penny. He wanted the boat, not the money."
        }
      ],
      defaultPresentation: "'I was a pilot, love, not a detective. I can tell you the tide tables, not that.'"
    },
    {
      id: "p-marcus",
      name: "Marcus Bell",
      age: 37,
      role: "Victim's ex-partner, grill chef",
      portrait: "p-marcus",
      locationId: "loc-restaurant",
      available: { from: "11:00", to: "23:30" },
      requires: [],
      description: "Big shoulders, burn scars on both forearms, apron tied twice round. His eyes are red. He keeps wiping a clean steel counter in short, hard strokes and does not stop when you speak.",
      questions: [
        {
          id: "q-mar-iris", q: "I'm sorry about Iris.",
          a: "Are you. Everyone's sorry. She'd have hated this, people being sorry at her. She was the only person I've ever met who actually read the instructions.",
          cue: "Loud, blunt, angry at everything in the room equally. That is his baseline: he is like this about the weather too."
        },
        {
          id: "q-mar-last-seen", q: "When did you last see her?",
          a: "A week ago. Maybe more. We weren't really talking.",
          lie: true,
          cue: "He answers before you finish the question, and the wiping stops. For a man who is loud about everything, this is the first thing he has said quietly."
        },
        {
          id: "q-mar-wednesday", q: "Where were you on Wednesday night?",
          a: "Here. On the grill from four till just after eleven. Then I walked home along the harbour wall and Quay Road to Eastgate, like every night. Nobody walks with me, before you ask.",
          cue: "Loud again, and annoyed. Back to his baseline."
        }
      ],
      presentations: [
        {
          item: "fact-argument",
          a: "Fine. Tuesday. I went round. She's selling the Wren, our boat, to some stranger off the internet. Half of it's mine. I said she'd regret it. I meant she'd regret selling it, not... God. I texted her twenty minutes later to say sorry. Check her phone. I'm the idiot who lied to you about it because I knew how it would sound.",
          cue: "His shoulders drop. The anger goes out of him all at once, and what is left is embarrassment.",
          grants: ["fact-marcus-boat"]
        },
        {
          item: "ev-kiosk-cam",
          a: "That's me. Quarter past eleven, along Quay Road, bag over my shoulder. I go that way every night. I didn't see anything, it's pitch black under those stairs. I was looking at my phone. I'd have walked right past her."
        },
        {
          item: "ev-rota",
          a: "Told you. Ask anyone on the line. Davey was off sick; I didn't even get a fag break."
        },
        {
          item: "ev-boat-listing",
          a: "'I'll pay you your half.' Yeah. She would have, too. That's what made me so angry. She was always right, even when she was being unfair."
        }
      ],
      defaultPresentation: "He looks at it, then at you. 'I cook fish. I don't know what you want me to say.'"
    },
    {
      id: "p-petra",
      name: "Petra Lund",
      age: 44,
      role: "Owner of the trawler Grey Petrel; claimant",
      portrait: "p-petra",
      locationId: "loc-coop",
      available: { from: "06:00", to: "19:00" },
      requires: ["ev-petrel-claim"],
      description: "Weathered, wiry, a mug of tea held in both hands like a weapon. She watches you come in the way she would watch weather coming in, and does not get up.",
      questions: [
        {
          id: "q-petra-know", q: "Did you know Iris Kellan?",
          a: "The insurance woman. She rang on Tuesday asking if I'd sunk my own boat for the money. Eighteen years I fished the Petrel. Three men in the water off Halden Light, and she wants to know if I pulled the plug. I told her where she could go.",
          cue: "Hot, fast, and direct. She does not mind you seeing that she is angry."
        },
        {
          id: "q-petra-wednesday", q: "Where were you on Wednesday evening?",
          a: "Home. All night.",
          lie: true,
          cue: "Two words. After the speech she just gave about her boat, the sudden lack of detail is the change to note. A short answer is not a lie, but it gives you nothing to check."
        },
        {
          id: "q-petra-surveyor", q: "Who surveyed the Petrel for the insurance?",
          requires: ["q-petra-know"],
          a: "Nobody. That's what I told her. A man rang once, asked the tonnage, the engine, the year she was built. Next thing there's a survey report in my claim with a fee on it bigger than my mortgage, from a firm called Northline. Nobody from Northline ever set foot on my deck.",
          cue: "She puts the tea down to count on her fingers: tonnage, engine, year. Specific, and easy to check against the boat itself.",
          grants: ["fact-no-surveyor"]
        },
        {
          id: "q-petra-cafe", q: "You met her at the Tidewater Café on Tuesday afternoon.",
          requires: ["ev-cafe-cctv"],
          a: "She asked to meet. I went to tell her to her face what I thought of her. I shouted, all right. But by the end she was different. She stopped asking about me and started asking about the survey. She said, 'I think I've been asking the wrong person the wrong questions.' I thought it was a trick.",
          grants: ["fact-petra-cafe"]
        }
      ],
      presentations: [
        {
          item: "ev-kiosk-cam",
          a: "All right. Yes. I walked past the top of the stairs. I live on Saltmarket Lane, I walk past them every night. I was at the co-op meeting till ten, then a drink at the Seamen's Mission. When I heard where she'd been found, and that I'd shouted at her in a café the day before... I panicked. I didn't look down the steps. Why would I?",
          cue: "She meets your eyes now and gives you things you can check: the meeting, the Mission, the walk home.",
          grants: ["fact-petra-saltmarket"]
        },
        {
          item: "ev-coop-minutes",
          a: "Thirty people saw me at that meeting. I stood up and asked who else had been billed for a survey that never happened. Two hands went up."
        },
        {
          item: "ev-petrel-claim",
          a: "Volda six-cylinder? The Petrel had a Brandt 8. Fitted it myself in 2019. Anyone who'd been in the engine room would know. There's a photo on that wall."
        }
      ],
      defaultPresentation: "'If that's not a cheque from your insurance company, I'm not interested.'"
    },
    {
      id: "p-whitlock",
      name: "Graham Whitlock",
      age: 55,
      role: "Head of Claims, Halden Mutual (Iris's manager)",
      portrait: "p-whitlock",
      locationId: "loc-office",
      available: { from: "08:30", to: "18:30" },
      requires: [],
      description: "Silver hair, good suit, a black armband on his sleeve. He shakes your hand, offers coffee, and rests his forearms on an immaculate desk, hands open.",
      questions: [
        {
          id: "q-wh-iris", q: "Tell me about Iris.",
          a: "One of the best investigators I've had in twenty-five years. Rigorous. Relentless, sometimes too much so. She'd got her teeth into a claim lately, the Grey Petrel, a very difficult claimant, Petra Lund. Threats, I gather. And there was a boyfriend, an ex, who came by in a temper a month ago. I hope you'll look at both of them.",
          cue: "Relaxed, fluent, warm. Open hands on the desk, steady eye contact, short natural sentences. This is his baseline."
        },
        {
          id: "q-wh-evening", q: "Where were you on Wednesday evening?",
          a: "I left here at ten past six. Took the number 4 tram home to Hillcrest, had a bowl of soup, watched the second half of the Halden-Varn match, which was dreadful, two-nil. Then I drove down to the Harbour Club for the quiz night. Arrived about twenty to eleven, stayed until half past twelve. Thirty people can tell you I was there.",
          lie: true,
          cue: "Until now his answers have been short and easy. This one arrives as a complete, ordered paragraph, with a tram number and a football score nobody asked for. A change from his own baseline proves nothing: nervous innocent people prepare too. It tells you which part of his account to check. Only the club, from 22:40, comes with witnesses.",
          grants: ["fact-whitlock-alibi"]
        },
        {
          id: "q-wh-call", q: "You phoned Iris at 18:52 on Wednesday.",
          requires: ["ev-phone-extract"],
          a: "Did I? Yes, I suppose I did. The quarterly figures. A deadline. Routine. Two minutes, if that.",
          lie: true,
          cue: "'Did I?' comes first, then 'yes'. It could be a real lapse or a man buying time. What you can test is the content: does a two-minute call about quarterly figures fit what she did next?",
          grants: ["fact-whitlock-call"]
        },
        {
          id: "q-wh-calendar", q: "You asked Nico what Iris's private appointment on Thursday was.",
          requires: ["fact-whitlock-knew"],
          a: "I manage a team of eight. I keep an eye on their calendars. That's my job. Iris had been under strain; I was concerned.",
          cue: "His answer is general where the question was specific: all eight calendars, not the one appointment he asked Nico about."
        },
        {
          id: "q-wh-northline", q: "Who does Halden Mutual use for hull surveys?",
          a: "Several firms. It varies. I'd have to check. Is this relevant?",
          cue: "The only question about his own job that he has not answered in detail."
        }
      ],
      presentations: [
        {
          item: "ev-shelf-ring",
          a: "The Helm? It's away being re-engraved. Twenty-five years, and they spelt my name wrong. Typical.",
          cue: "Fast and smiling, and no name of an engraver, no ticket, no date it is due back. Nothing you could check."
        },
        {
          item: "fact-nico-car",
          a: "Nico's a nice lad with a poor memory. Half the car park drives a green estate.",
          cue: "He smiles. He does not say where his own car was."
        },
        {
          item: "ev-garage-log",
          a: "I think I'd like to speak to a solicitor before I say anything else.",
          cue: "He sits very still. The warmth is gone, and in its place is something careful and tired."
        },
        {
          item: "ev-northline-check",
          a: "I'd like my solicitor present for any questions about company procurement.",
          cue: "He does not look at the page."
        },
        {
          item: "ev-phone-extract",
          a: "I really don't see what Iris's text messages have to do with me.",
          cue: "He reads the 23:12 line twice. His eyes do not go to the 18:52 call at all."
        }
      ],
      defaultPresentation: "He gives it a polite, careful look. 'I'm not sure what you'd like me to say. Anything I can do to help, of course.'"
    },
    {
      id: "p-nico",
      name: "Nico Varga",
      age: 29,
      role: "Junior claims adjuster, Iris's colleague",
      portrait: "p-nico",
      locationId: "loc-office",
      available: { from: "08:00", to: "19:30" },
      requires: [],
      description: "Thin, cycling clips still on his trousers, a desk covered in printouts. He keeps glancing towards the glass corner office and lowering his voice, though nobody is in it.",
      questions: [
        {
          id: "q-nico-iris", q: "What was Iris working on?",
          a: "The Grey Petrel claim. Then she sort of went quiet on it. Last week she stopped using the shared printer and started printing on the little one in the archive, at night. She asked me once if I'd ever looked at who our surveyors actually are. I said no. She said, 'Nobody has.'",
          cue: "Fluent and eager, leaning in. This is how he sounds when he is comfortable."
        },
        {
          id: "q-nico-files", q: "Did you and Iris ever clash?",
          a: "Once. Last month she sent back one of my files, the Halcyon claim, with 'not good enough' on it in red, and copied Graham in. I was furious for a day. I said things in the kitchen I'm not proud of. Then she sat with me for an evening and showed me what I'd missed. That's what she was like.",
          cue: "He offers the bad part himself, before you can find it."
        },
        {
          id: "q-nico-left", q: "What time did you leave on Wednesday?",
          a: "Six. On the dot. Same as always.",
          lie: true,
          cue: "'On the dot', and 'same as always'. Two reassurances where one time would do, and nothing you could check: no who, no where."
        },
        {
          id: "q-nico-badge", q: "The lobby log says you badged out at 19:52, not six.",
          requires: ["ev-badge-log"],
          a: "Okay. Okay. I was printing my CV on the colour printer. I've got an interview at Brightwater Re on Monday and I didn't want Graham to know. That's all. But listen. I badge out at the front, then go round and down the ramp to the bike cage in the car park. Graham's green estate was in his bay, number twelve. I remember because he'd left at ten past six and I thought, he's got a taxi to his quiz, good for him. It was definitely there.",
          cue: "Now the details come in a rush: the printer, the interview, the bay number, the reason he noticed. Specific and checkable.",
          grants: ["fact-nico-car"]
        },
        {
          id: "q-nico-calendar", q: "Did anyone ask you about Iris's diary this week?",
          requires: ["q-nico-iris"],
          a: "Graham did. Wednesday, about four. He's got delegate access to all our calendars. Iris had something marked private for nine on Thursday. He asked me if I knew what it was. I said no. He said, 'No, of course not,' and went back in his office and shut the door. He never shuts the door.",
          grants: ["fact-whitlock-knew"]
        }
      ],
      presentations: [
        {
          item: "ev-newsletter", requires: ["ev-shelf-ring"],
          a: "The Helm Award. He's very proud of it. It's been on that shelf since the spring. Actually... I haven't seen it this week."
        },
        {
          item: "ev-newsletter",
          a: "The Helm Award. He's very proud of it. It's been on that shelf behind his desk since the spring."
        },
        {
          item: "ev-iris-copies",
          a: "Northline. That's it, that's what she meant. Every one of these is a Graham sign-off. I've never seen a Northline surveyor in this building. Not once."
        }
      ],
      defaultPresentation: "He shakes his head quickly. 'Sorry. That's not my department. Honestly.'"
    }
  ],

  /* ================================================================ EVIDENCE */
  evidence: [
    {
      "id": "ev-first-officer",
      "name": "First officer's report",
      "key": false,
      "summary": "PC Odell: found 05:50, pronounced 06:10, cordon, canvass. A car heard on Quay Road 'after ten'.",
      "doc": {
        "kind": "report",
        "title": "PHPD Response — First Officer's Report, Saltmarket Stairs",
        "meta": [
          [
            "Officer",
            "PC J. Odell, Old Town Response"
          ],
          [
            "Call",
            "05:52, emergency call from T. Ferreira (street sweeper)"
          ],
          [
            "Arrived",
            "06:04"
          ],
          [
            "Written",
            "07:10 Thursday"
          ]
        ],
        "table": {
          "cols": [
            "Time",
            "Action"
          ],
          "rows": [
            [
              "06:04",
              "Arrived Saltmarket Lane. Mr Ferreira waiting by his cart at the top of the stairs, shaken but clear."
            ],
            [
              "06:06",
              "Went down by the left-hand rail. Female, face down on the lower landing. No breathing, no pulse, cold to the touch. Did not move her."
            ],
            [
              "06:10",
              "Paramedics (crew 14) confirmed life extinct."
            ],
            [
              "06:12",
              "Cordons at Saltmarket Lane and Quay Road. Scene log started. Single approach path down the left rail."
            ],
            [
              "06:21",
              "Scene photographs taken."
            ],
            [
              "06:30",
              "Forensic sheet placed over the deceased. Evidence markers 1 to 9 placed."
            ],
            [
              "06:40",
              "Spoke to the late shop owner at the top of the stairs. Shutter half down at 21:47; saw and heard nothing. His camera covers the steps; recording offered, not yet viewed."
            ],
            [
              "06:45",
              "Dr. Sorensen arrived."
            ],
            [
              "06:50–07:05",
              "House-to-house, Saltmarket Lane 2–14 and the Quay Road flats."
            ]
          ]
        },
        "text": "Finder: Mr Ferreira sweeps Saltmarket Lane at about 05:45 every morning and went down to clear leaves from the steps. He saw her on the landing, touched her shoulder, then ran up to call. Nobody else about.\nHouse-to-house: most residents heard nothing. Mrs R. Pell, ground floor, Quay Road flats, heard a car stop below her window 'some time after ten', engine running for a few minutes; she did not look. Saltmarket Lane no. 9: no answer, card left.\nNotes: steps wet and muddy throughout. No sign of a struggle on the steps; no blood trail. Two street robberies on Mercer Street this month (CR 26/3318 and 26/3402: young male on a bicycle snatching bags; both bags later found in the harbour with cash removed, both victims unhurt)."
      }
    },
    {
      "id": "ev-scene-log",
      "name": "Scene log and property inventory",
      "key": false,
      "summary": "What was on her and around her. No bag, wallet, keys or work pass. Watch and earrings left.",
      "doc": {
        "kind": "report",
        "title": "Scene Log and Property Inventory — Saltmarket Stairs, MC-26-0412",
        "meta": [
          [
            "Compiled by",
            "PC J. Odell"
          ],
          [
            "Searched",
            "Stairs, landing, bins at both ends, Quay Road drain (06:35)"
          ]
        ],
        "table": {
          "cols": [
            "Marker",
            "Item",
            "Where",
            "Notes"
          ],
          "rows": [
            [
              "1",
              "Deceased",
              "Lower landing",
              "Face down; under sheet from 06:30"
            ],
            [
              "2",
              "Wool coat, dark grey",
              "On deceased",
              "Buttoned to the collar"
            ],
            [
              "3",
              "Mobile phone (IK/1)",
              "Inner coat pocket",
              "Screen cracked, locked. Emergency card: 'Hanna (sister)'"
            ],
            [
              "4",
              "Card payment slip, folded",
              "Inner coat pocket",
              "From a café; bagged, not yet read"
            ],
            [
              "5",
              "Ankle boots, pair (IK/3)",
              "Step below the landing",
              "Side by side, toes down"
            ],
            [
              "6",
              "Wristwatch, steel",
              "Left wrist",
              "Glass intact, running, correct time"
            ],
            [
              "7",
              "Gold stud earrings, pair",
              "On deceased",
              "Both present"
            ],
            [
              "8",
              "Hair grip",
              "Landing, beside head",
              "Matches deceased's"
            ],
            [
              "9",
              "Cigarette end",
              "Upper flight, step 31",
              "Old and sodden; probably unrelated"
            ]
          ]
        },
        "text": "Not found: handbag, wallet, house keys, work pass.\nEntry log: 05:50 T. Ferreira (finder), landing and back. 06:06 PC Odell. 06:10 paramedics (2). 06:21 PC Odell, photographs. 06:45 Dr. A. Sorensen. Removal held for DS Cruz's walk-through."
      }
    },
    {
      "id": "ev-nok-note",
      "name": "Next-of-kin notification",
      "key": false,
      "summary": "Hanna told at 07:05. She asked twice whether Iris had 'really been walking'.",
      "doc": {
        "kind": "report",
        "title": "Next-of-Kin Notification — Hanna KELLAN",
        "meta": [
          [
            "Officer",
            "PC N. Okafor"
          ],
          [
            "Time",
            "07:05 Thursday"
          ],
          [
            "Place",
            "Hanna Kellan's flat, 22 Tanner Row, Eastgate"
          ]
        ],
        "text": "Next of kin taken from the emergency card on the deceased's phone. Told Ms Kellan in person at 07:05. She was dressed for work, phone in her hand. Disbelief at first; then she asked twice whether her sister had 'really been walking'. She showed me a text from Iris's number at 23:12 ('walking home the long way. need air. talk tmrw x'), which she read at about 06:30; she replied at 06:33 and had no answer. She confirmed the deceased from a scene photograph of the face at 07:12. Formal identification after the post-mortem.\nGiven so far, not yet a statement: Iris lived alone at 4C Calder Court, Hillcrest; downstairs neighbour Ms Finch holds a key. Works at Halden Mutual Marine. Ex-partner Marcus Bell, separated three months; Ms Kellan did not know his current address. Mother in the south; Ms Kellan will tell her. Last spoke to Iris by phone on Wednesday evening; too upset to give details.\nMs Kellan will be at her sister's flat from about 09:00 to feed the cat and will talk to us there. Welfare leaflet given."
      }
    },
    {
      "id": "ev-contacts",
      "name": "Initial contacts list",
      "key": false,
      "summary": "Who to see first, where and when: sister, neighbour, line manager, doctor, Theo.",
      "doc": {
        "kind": "report",
        "title": "Initial Contacts — MC-26-0412 (DS L. Cruz, 07:30)",
        "table": {
          "cols": [
            "Who",
            "Role",
            "Where",
            "When",
            "Notes"
          ],
          "rows": [
            [
              "Hanna Kellan",
              "Sister, next of kin",
              "Iris's flat, 4C Calder Court, Hillcrest",
              "From 09:00",
              "Told 07:05. Not yet interviewed."
            ],
            [
              "Dolores Finch",
              "Downstairs neighbour, keyholder",
              "3C Calder Court, Hillcrest",
              "Up from 07:00",
              "Saw Iris leave Wed 08:05 (by phone to PC Okafor, 07:20)."
            ],
            [
              "Graham Whitlock",
              "Head of Claims, line manager",
              "Halden Mutual Marine, 4th floor, Harbour Point Tower",
              "08:30–18:30",
              "Told by phone 07:25. Shocked. Said she had been dealing with 'a difficult claimant'."
            ],
            [
              "Marcus Bell",
              "Ex-partner, chef",
              "Not known",
              "—",
              "Ask the sister or the neighbour."
            ],
            [
              "Dr. Anika Sorensen",
              "Medical Examiner",
              "Saltmarket Stairs, then the mortuary",
              "—",
              "Post-mortem after our walk-through. Will ring."
            ],
            [
              "Theo Park",
              "Records and digital, Major Crimes",
              "By phone",
              "Any time",
              "Phone IK/1 when we're ready."
            ],
            [
              "Late shop owner",
              "Witness; camera",
              "Top of the Saltmarket Stairs",
              "Open",
              "Recording not yet viewed."
            ],
            [
              "Tomas Ferreira",
              "Finder",
              "City depot, Eastgate",
              "Off shift",
              "Statement taken. Nothing further expected."
            ]
          ]
        }
      }
    },
    {
      id: "ev-prelim-report", name: "Preliminary scene report", key: false,
      summary: "Scene doctor: head injury from a fall, death 22:00–01:00, bag missing.",
      doc: {
        kind: "report",
        title: "PHPD Major Crimes — Preliminary Scene Notes, MC-26-0412",
        meta: [["Deceased", "Iris KELLAN, 34"], ["Found", "Thu 05:50 by T. Ferreira (street sweeper)"], ["Doctor on scene", "Dr. A. Sorensen"], ["Notes made", "Thu 07:05"]],
        text: "Arrived 06:45. Prone on lower landing, arms beneath body. Clothing not removed at scene.\nInjuries: depressed fracture, back of head (right). Abrasions to face, palms, knees. No obvious defensive injuries to the hands.\nBleeding: little blood on the landing for a scalp wound of this kind; probably washed away by rain.\nRigor well established in jaw and limbs. Lividity on the front, consistent with the position found.\nCore temperature 21.4°C at 06:52. Ambient 6°C, wind, ground wet. Assuming body outdoors throughout: death approx. 22:00–01:00.\nProperty: phone in inner coat pocket. Handbag and wallet not located.\nProvisional: a fall down stone steps; robbery not excluded.\nBody held at scene for the investigating officers' walk-through (DS Cruz). Full post-mortem examination immediately after removal."
      }
    },
    {
      id: "ev-weather", name: "Met Office report, Wednesday night", key: false,
      summary: "Rain 17:50 to 21:40. Stairs were wet and muddy all night.",
      doc: {
        kind: "report",
        title: "Port Halden Met Office — Harbour Station, Wednesday night",
        table: {
          cols: ["Time", "Conditions", "Temp (°C)"],
          rows: [
            ["17:50", "Rain begins", "9"],
            ["18:00–21:00", "Moderate rain, 2–4 mm per hour", "8–7"],
            ["21:40", "Rain ends", "7"],
            ["22:00–05:00", "Dry, cloudy, wind NW 18 km/h", "6–5"]
          ]
        },
        text: "Run-off reported on Old Town stairways until morning."
      }
    },
    {
      id: "ev-scene-photo", name: "Scene photograph", key: false,
      summary: "Face down on the landing, coat buttoned, arms tucked under. Neat for a fall.",
      doc: {
        kind: "photo",
        title: "Scene photograph 4 of 22 — lower landing",
        meta: [["Taken", "Thu 06:21, PC Odell"]],
        text: "Face down across the landing, coat buttoned, hem straight, arms beneath the body. Boots on the next step down. No scattered belongings. No blood on the steps above."
      }
    },
    {
      id: "ev-shoes", name: "Her boots: clean soles", key: true,
      summary: "Tread clean, though every step was mud. Grey fibres in the heel seam.",
      doc: {
        kind: "object",
        title: "Exhibit IK/3 — black leather ankle boots, size 38",
        meta: [["Recovered", "Step below lower landing"], ["Condition", "Damp, but clean"]],
        text: "Uppers and soles damp from the wet step. Tread clean: no mud, no leaf litter, no grit. A few short grey synthetic fibres in the stitching of the left heel."
      }
    },
    {
      id: "ev-phone", name: "Iris's phone", key: false,
      summary: "Her phone, cracked and locked. Theo could get into it.",
      doc: {
        kind: "object",
        title: "Exhibit IK/1 — mobile phone",
        meta: [["State", "Screen cracked, locked"]],
        text: "Lock screen shows one notification: a message from 'Hanna' at 06:33. Passcode required."
      }
    },
    {
      id: "ev-cafe-receipt", name: "Tidewater Café card slip", key: false,
      summary: "Dinner at the Tidewater Café, paid 18:41 on Wednesday.",
      doc: {
        kind: "receipt",
        title: "TIDEWATER CAFÉ — 14 Mercer Street, Old Town",
        meta: [["Date", "Wednesday"], ["Time", "18:41"], ["Table", "4"], ["Card", "Visa ****2207 (I KELLAN)"]],
        table: {
          cols: ["Item", "Price"],
          rows: [["Fish soup", "9.50"], ["Bread", "2.00"], ["Pot of tea", "3.20"], ["Total", "14.70"]]
        }
      }
    },
    {
      id: "ev-kiosk-cam", name: "Late shop camera log", key: true,
      summary: "A car stops at the foot of the stairs 22:21–22:29. Petra passes 23:05, Marcus 23:16.",
      doc: {
        kind: "camera",
        title: "Saltmarket Late Shop — camera 2 (doorway), Wednesday night",
        meta: [["Recording reviewed", "Wed 21:00 to Thu 06:00"], ["View", "Top flight; at the far edge, a strip of Quay Road"], ["Blind spot", "Lower landing, hidden by the turn of the stair"]],
        table: {
          cols: ["Time", "Observed"],
          rows: [
            ["21:47", "Shutter lowered halfway. Lane empty."],
            ["22:21", "A dark estate car stops on Quay Road at the foot of the stairs. Lights off. Plate not readable."],
            ["22:22–22:28", "Movement at the foot of the stairs, too dark to see."],
            ["22:29", "Lights on. The car drives off east."],
            ["23:05", "A woman in a bright yellow oilskin crosses the top of the stairs. Does not look down."],
            ["23:16", "A large man with a holdall walks east along Quay Road, looking at a phone."],
            ["05:50", "Street sweeper goes down the stairs; returns running at 05:51."]
          ]
        },
        text: "No one goes down or comes up the top flight between 21:00 and 05:50."
      }
    },
    {
      id: "ev-drag-marks", name: "Drag marks at the foot of the stairs", key: true,
      summary: "Parallel scuffs up the bottom three steps from Quay Road: dragged up, not walked down.",
      doc: {
        kind: "photo",
        title: "Scene photograph 23 (revisit) — bottom steps at Quay Road",
        text: "Two parallel scuffs through the moss on the front edges of the bottom three steps, 30 cm apart, from the kerb up to the landing. Consistent with something heavy, perhaps wrapped, dragged upward. Mud from the scuffs still lies on the step edges, where run-off has washed the steps around them clean, so they were made after the heavy rain stopped at 21:40."
      }
    },
    {
      id: "ev-fridge-note", name: "Sticky note on the fridge", key: false,
      summary: "'Box: Petrel's loss date, DDMM, digits backwards.'",
      doc: {
        kind: "note",
        title: "Yellow sticky note, fridge door",
        text: "BOX: PETREL'S LOSS DATE, DDMM, DIGITS BACKWARDS."
      }
    },
    {
      id: "ev-planner", name: "Iris's week planner", key: true,
      summary: "Thursday 09:00: Compliance, 'Bring everything. Tell nobody.'",
      doc: {
        kind: "note",
        title: "Paper week-planner, Iris's desk at home",
        table: {
          cols: ["Day", "Entries"],
          rows: [
            ["Tuesday", "P. Lund, Tidewater 14:00. Sell Wren?? Tell M. tonight."],
            ["Wednesday", "Archive: pull ALL NSS files. Print in archive, not on the floor."],
            ["Thursday", "09:00 R. Achebe, Compliance, 6th floor. BRING EVERYTHING. TELL NOBODY."],
            ["Friday", "Vet: Ledger, jab."]
          ]
        }
      }
    },
    {
      id: "ev-boat-listing", name: "Boat sale listing, with note", key: false,
      summary: "Iris was selling the Wren, co-owned with Marcus. She wrote she'd pay him half.",
      doc: {
        kind: "letter",
        title: "Printed listing: 'WREN — 7.2 m sloop, sails 2023'",
        meta: [["Asking", "€14,500"], ["Contact", "I. Kellan"]],
        text: "Joint ownership.\n\nHandwritten across the bottom, square capitals:\nM, I HAVE TOLD YOU. I WILL PAY YOU YOUR HALF, EVERY PENNY. I AM NOT DOING THIS TO HURT YOU. I.\n\nBeneath, in a different hand, pressed hard enough to tear the paper: 'IT'S NOT ABOUT THE MONEY.'"
      }
    },
    {
      id: "ev-iris-copies", name: "Iris's Northline file", key: true,
      summary: "14 claims surveyed by Northline. Fees 15 times market rate. Every one approved by GW.",
      doc: {
        kind: "report",
        title: "From the document box: 'NSS — WHO IS NORTHLINE?'",
        meta: [["Contents", "Photocopied invoices, Iris's summary table, printed copy of the email she sent"], ["Sorted", "By vessel name"]],
        table: {
          cols: ["Vessel", "Claim no.", "Date of loss", "Northline fee (€)"],
          rows: [
            ["Baltic Rose", "1745", "02/08/2024", "41,200"],
            ["Cormorant", "1588", "19/11/2023", "38,900"],
            ["Dunlin", "2040", "07/04/2025", "44,000"],
            ["Grey Petrel", "2291", "17/03/2026", "46,500"],
            ["Halden Star", "1903", "23/01/2025", "43,100"],
            ["Kittiwake", "1406", "11/05/2023", "39,800"],
            ["Marram", "2176", "30/10/2025", "45,900"],
            ["Norrland", "1811", "14/10/2024", "42,700"],
            ["Osprey II", "1522", "28/08/2023", "40,300"],
            ["Pelican Bay", "2233", "09/01/2026", "47,200"],
            ["Sea Lavender", "1690", "15/03/2024", "44,600"],
            ["Tern", "1967", "21/02/2025", "43,800"],
            ["Westering", "2118", "03/07/2025", "46,100"],
            ["Whimbrel", "1857", "29/11/2024", "48,300"]
          ]
        },
        text: "Total €612,400; a hull survey costs €1,800–€3,500. Every one approved by G. Whitlock, marked EXPEDITE. Northline: not on the Marine Surveyors' Register; address a mailbox in Eastgate.\n\nEmail, sent Tuesday 23:14: 'Ruth — I need to report a concern about approvals in Claims, and it involves my own line manager. Documents in person, Thursday 9:00. Please copy nobody in Claims. — Iris'"
      }
    },
    {
      id: "ev-petrel-claim", name: "Grey Petrel claim file", key: false,
      summary: "Petra Lund's €340,000 claim. Lost 17/03. Northline survey names the wrong engine.",
      doc: {
        kind: "report",
        title: "Halden Mutual Marine — Hull Claim HM-M-2291",
        meta: [["Vessel", "GREY PETREL, 19 m stern trawler"], ["Claimant", "Petra LUND, c/o Fishermen's Co-operative Hall, The Docks"], ["Date of loss", "17/03/2026"], ["Circumstances", "Flooded and sank off Halden Light; crew of three rescued"], ["Sum claimed", "€340,000"], ["Survey", "Northline Survey Services Ltd., fee €46,500"], ["Handler", "I. Kellan — under investigation"]],
        text: "Survey extract: 'Main engine: Volda 6-cylinder, in fair condition, inspected aboard.'\n\nIris's margin notes:\n'Co-op register: refitted 2019 with a BRANDT 8. Did anyone actually go aboard?'\n'Fee 15x market. Approved by? GW. Again.'\n'Lund angry, not evasive. Angry is not the same as guilty.'"
      }
    },
    {
      id: "ev-laptop", name: "Iris's work laptop, HM-LT-0417", key: false,
      summary: "Docked at her desk. Asset tag HM-LT-0417. Screen locks after 30 minutes idle.",
      doc: {
        kind: "object",
        title: "Company laptop on Iris Kellan's desk",
        meta: [["Asset tag", "HM-LT-0417"], ["IT sticker", "Screen lock after 30 min idle"], ["State", "Docked, lid closed, powered on"]],
        text: "Her phone's messaging app is pinned to the taskbar, signed in. Anyone at this desk while it was unlocked could send messages as Iris."
      }
    },
    {
      id: "ev-newsletter", name: "Company newsletter: the Helm Award", key: false,
      summary: "Whitlock's award: a solid brass ship's wheel, 18 cm across, on a granite base.",
      doc: {
        kind: "photo",
        title: "Halden Mutual Quarterly, Spring — 'Twenty-five years at the Helm'",
        text: "Head of Claims Graham Whitlock receives the Helm Award for twenty-five years' service: a solid brass ship's wheel, 18 cm across, eight turned spoke-ends on the rim, on a granite base 12 cm square.\n\nCaption: 'Graham at his desk, the Helm on the shelf behind him, between three glass plaques and a photo of a yacht.'"
      }
    },
    {
      id: "ev-shelf-ring", name: "Gap on Whitlock's shelf", key: false,
      summary: "A clean 12 cm square in the dust where something heavy stood until recently.",
      doc: {
        kind: "photo",
        title: "Whitlock's office — award shelf",
        text: "Between three glass plaques and a yacht photograph: a sharp-edged square of clean wood, 12 cm a side, in an even film of dust. Something stood there for months and was moved in the last day or two."
      }
    },
    {
      id: "ev-carpet-patch", name: "Cleaned carpet in the archive", key: true,
      summary: "A freshly shampooed patch of grey loop-pile carpet at the end of archive aisle F.",
      doc: {
        kind: "photo",
        title: "4th floor file archive — end of aisle F",
        text: "Grey nylon loop-pile carpet throughout. One patch about 1 m across is cleaner, damp at the base, smelling of carpet shampoo. The wall spill kit has a broken seal; its log card's last entry: 'March — coffee spill, Reception'. Sample taken to compare with fibres from the body."
      }
    },
    {
      id: "ev-archive-file", name: "Archive file: claim 1406, Kittiwake", key: false,
      summary: "The first Northline claim: surveyor 'R. Dahl', fees approved by Whitlock, 'Expedite'.",
      doc: {
        kind: "report",
        title: "Archive box 1406 — Hull Claim HM-M-1406, KITTIWAKE",
        meta: [["Date of loss", "11/05/2023"], ["Surveyor", "Northline Survey Services Ltd., signed 'R. Dahl, MNSS'"], ["Fee", "€39,800"]],
        text: "Approval memo, initialled: 'Fees approved in full. New panel firm — expedite, no further sign-off required. GW.'\n\nIris's sticky note on the front: 'MNSS does not exist. I checked. Who is R. Dahl?'"
      }
    },
    {
      id: "ev-cafe-cctv", name: "Tidewater Café camera log", key: true,
      summary: "Tue: Iris and Petra argue. Wed: Iris takes a call at 18:52, rings someone at 19:05, leaves 19:24.",
      doc: {
        kind: "camera",
        title: "Tidewater Café — camera over the till",
        table: {
          cols: ["Day", "Time", "Observed"],
          rows: [
            ["Tue", "14:05", "Iris sits at the window table with a woman in a bright yellow oilskin."],
            ["Tue", "14:28", "The woman stands, points at Iris, voice raised."],
            ["Tue", "14:31", "She sits again; they talk quietly. Iris writes in a small black notebook."],
            ["Tue", "14:40", "The woman leaves. Iris stays, writing."],
            ["Wed", "18:20", "Iris arrives alone, coat wet. Window table."],
            ["Wed", "18:52", "Answers her phone; mostly listens, about two minutes. Then sits very still."],
            ["Wed", "18:58", "Writes in the black notebook."],
            ["Wed", "19:05", "Makes a call, about six minutes. Her shoulders drop."],
            ["Wed", "19:24", "Leaves uphill for the Mercer Street tram (to the Financial Quarter)."]
          ]
        }
      }
    },
    {
      id: "ev-coop-flyer", name: "Co-op meeting flyer", key: false,
      summary: "Open meeting at the Co-op Hall, Wednesday 19:30: insurance surveys.",
      doc: {
        kind: "note",
        title: "Flyer, Tidewater Café noticeboard",
        text: "FISHERMEN'S CO-OPERATIVE — OPEN MEETING\nWednesday 19:30, Co-op Hall, The Docks\n'Insurance surveys: who is checking the checkers?'"
      }
    },
    {
      id: "ev-rota", name: "Anchor & Lamp clock cards and grill tickets", key: false,
      summary: "Marcus clocked in 15:52, out 23:04, and initialled grill tickets all evening.",
      doc: {
        kind: "report",
        title: "The Anchor & Lamp — kitchen records, Wednesday",
        meta: [["Clock card", "M. BELL — in 15:52, out 23:04"], ["Manager's note", "Short-staffed. No breaks on grill."]],
        table: {
          cols: ["Ticket printed", "Station", "Initialled"],
          rows: [
            ["19:31", "Grill", "MB"], ["19:48", "Grill", "MB"], ["20:02", "Grill", "MB"], ["20:17", "Grill", "MB"],
            ["20:26", "Grill", "MB"], ["20:41", "Grill", "MB"], ["20:55", "Grill", "MB"], ["21:12", "Grill", "MB"],
            ["21:30", "Grill", "MB"], ["21:44", "Grill", "MB"], ["22:10", "Grill", "MB"], ["22:38", "Grill", "MB"]
          ]
        },
        text: "The cook initials each ticket as the dish leaves the pass."
      }
    },
    {
      id: "ev-coop-minutes", name: "Co-op meeting minutes", key: false,
      summary: "Petra signed in at 19:30 and spoke at 20:35 about Northline. Meeting ran to 21:50.",
      doc: {
        kind: "report",
        title: "Fishermen's Co-operative — Minutes of Open Meeting, Wednesday",
        meta: [["Opened", "19:30"], ["Closed", "21:50"], ["Attendance", "31 signatures, incl. P. Lund, GREY PETREL"]],
        text: "1. Fuel prices (19:35–20:30).\n2. Insurance surveys (20:35–20:55). P. Lund: no surveyor boarded her vessel, yet her claim carries a large survey fee. J. Osei (CORMORANT) and K. Brandvold (TERN) name the same firm: Northline.\n3. Harbour dues (21:00–21:45). Seconded P. Lund."
      }
    },
    {
      id: "ev-hanna-messages", name: "Hanna's messages from Iris", key: true,
      summary: "Iris's real texts are formal and signed '— I'. The 23:12 text is not.",
      doc: {
        kind: "messages",
        title: "Hanna Kellan's phone, thread with 'Iris'",
        table: {
          cols: ["When", "From", "Message"],
          rows: [
            ["Sun 19:02", "Iris", "I have booked the table for Saturday at 8. Please do not be late this time. — I"],
            ["Mon 21:15", "Hanna", "yes boss xx"],
            ["Mon 21:16", "Iris", "Thank you. — I"],
            ["Tue 22:40", "Iris", "Marcus came round. It went about as well as you would expect. I am fine. Do not ring him. — I"],
            ["Wed 23:12", "Iris", "walking home the long way. need air. talk tmrw x"],
            ["Thu 06:33", "Hanna", "?? since when do you walk anywhere at night. call me"]
          ]
        }
      }
    },
    {
      id: "ev-phone-extract", name: "Phone extraction: calls and messages", key: true,
      summary: "18:52 call from Whitlock. The 23:12 text was scheduled at 20:51 from her work laptop.",
      doc: {
        kind: "phone-log",
        title: "Digital forensics — extraction of Exhibit IK/1 (T. Park)",
        table: {
          cols: ["When", "Type", "Other party", "Detail"],
          rows: [
            ["Tue 10:31", "Call out", "Petra Lund", "3 min 02 s"],
            ["Tue 21:58", "Message in", "Marcus", "You'll regret this. I mean it. Half that boat is mine."],
            ["Tue 22:19", "Message in", "Marcus", "That came out wrong. I'm sorry. Call me when you're not angry."],
            ["Tue 23:14", "Email out", "R. Achebe", "Subject: Confidential — request to meet"],
            ["Wed 08:12", "Call out", "Hanna", "1 min 10 s"],
            ["Wed 18:52", "Call in", "Graham Whitlock (mobile)", "2 min 14 s"],
            ["Wed 19:05", "Call out", "Hanna", "6 min 21 s"],
            ["Wed 23:12", "Message out", "Hanna", "'walking home the long way. need air. talk tmrw x' — see note"],
            ["Thu 06:33", "Message in", "Hanna", "?? since when do you walk anywhere at night. call me"]
          ]
        },
        text: "Theo's note: the 23:12 message was not typed on this phone. Created Wed 20:51 on the linked desktop app, device HM-LT-0417, scheduled for 23:12. Nothing else in two years was ever scheduled. Halden Mutual IT: HM-LT-0417 was last unlocked with Iris's password at 20:24, so still unlocked at 20:51."
      }
    },
    {
      id: "ev-badge-log", name: "Halden Mutual lobby badge log", key: true,
      summary: "Iris badged back in at 19:58 and never out. Nico out 19:52. Whitlock out 18:10.",
      doc: {
        kind: "report",
        title: "Halden Mutual — lobby access control, Wednesday (4th floor staff)",
        meta: [["Released", "Under warrant, after the homicide finding"]],
        table: {
          cols: ["Name", "In", "Out", "In", "Out"],
          rows: [
            ["G. Whitlock", "08:15", "18:10", "—", "—"],
            ["N. Varga", "08:31", "19:52", "—", "—"],
            ["I. Kellan", "08:40", "17:38", "19:58", "(none)"],
            ["Six other claims staff", "08:20–09:05", "17:00–18:45", "—", "—"]
          ]
        },
        text: "Cleaners: Tuesdays and Fridays only.\nTheo's note: 'Lobby only. The car park belongs to the building: different system, different company. It has its own lift to the office floors. It doesn't pass the lobby gates.'"
      }
    },
    {
      id: "ev-garage-log", name: "Car park logs and traffic cameras", key: true,
      summary: "Whitlock's fob re-entered at 19:55. His car left the car park at 22:04 and was on Quay Road at 22:17.",
      doc: {
        kind: "camera",
        title: "Harbour Point Tower car park + city traffic cameras (Theo Park)",
        table: {
          cols: ["Time", "Source", "Event"],
          rows: [
            ["Wed 19:55", "Car park pedestrian door", "Fob G-118 (G. Whitlock, Halden Mutual) — entry"],
            ["Wed 22:04", "Car park exit barrier", "Bay 12, green estate PH 62 KTR (G. Whitlock) — exit"],
            ["Wed 22:17", "Traffic camera, Quay Road west", "PH 62 KTR westbound"],
            ["Wed 22:31", "Traffic camera, Quay Road west", "PH 62 KTR eastbound"],
            ["Wed 22:38", "Harbour Club car park camera", "PH 62 KTR enters"]
          ]
        },
        text: "No other fob used the pedestrian door between 18:00 and 23:00.\nTheo's note: 'His car sat in the car park from 08:15 to 22:04, so he didn't drive to the club from home. Quay Road west of that camera is a dead end for cars at the Saltmarket Stairs; only a footpath carries on along the harbour wall.'"
      }
    },
    {
      id: "ev-northline-check", name: "Northline: company and bank records", key: true,
      summary: "Northline's director is Whitlock's brother-in-law. Its money goes to Whitlock's wife.",
      doc: {
        kind: "bank",
        title: "Northline Survey Services Ltd. — registry and account summary",
        meta: [["Registered", "2022, Eastgate (mailbox address)"], ["Director", "Rolf DAHL"], ["Marine Surveyors' Register", "No entry"], ["Obtained", "Production order (DS Cruz)"]],
        table: {
          cols: ["Date", "Payer", "Payee", "Amount (€)"],
          rows: [
            ["06/06/2023", "Halden Mutual Marine", "Northline Survey Services", "39,800"],
            ["12/06/2023", "Northline Survey Services", "M. Whitlock", "27,860"],
            ["14/09/2023", "Halden Mutual Marine", "Northline Survey Services", "40,300"],
            ["20/09/2023", "Northline Survey Services", "M. Whitlock", "28,210"],
            ["…", "…", "…", "…"],
            ["02/04/2026", "Halden Mutual Marine", "Northline Survey Services", "46,500 (held: under investigation)"]
          ]
        },
        text: "Theo's note: 'Rolf Dahl's sister is Margit Whitlock, née Dahl, Graham's wife since 1998. Northline has no staff and no other clients. Within a week of every fee it passes seventy per cent to Margit: €396,130 in three years.'"
      }
    },
    {
      id: "ev-autopsy", name: "Post-mortem report", key: true,
      summary: "One patterned blow, then moved. Fall injuries most likely after death. Grey carpet fibres. Death about 19:30–21:30.",
      doc: {
        kind: "autopsy",
        title: "Medical Examiner's Office — Post-mortem Examination, Iris KELLAN",
        meta: [["Pathologist", "Dr. Anika Sorensen"], ["Examined", "Thu, on arrival at the mortuary (preliminary findings by phone; written report to follow)"], ["Case", "MC-26-0412"]],
        text: "1. Cause: one blunt-force blow to the back of the head (right), depressed skull fracture. Patterned: a curved edge, part of a circle roughly 16 to 20 cm across, interrupted at regular intervals by small rounded impressions. Consistent with a heavy object with a curved, knobbed rim; not consistent with the straight edge of a stone step.\n2. Abrasions to face, palms and knees show no visible vital reaction (no bleeding into the surrounding tissue). They were most likely caused after death.\n3. Lividity: fixed on the front, matching the position found, with a faint pattern across shoulders and buttocks: she lay on her back on a flat surface, likely one to three hours, before being placed face down.\n4. Trace: grey nylon loop-pile carpet fibres in the hair and wound margins; carpet-cleaning detergent on the left coat sleeve.\n5. Stomach: partly digested fish soup and bread. Digestion varies widely; this supports, but cannot fix, a death within a few hours of an early meal.\n6. Time of death, revised: the scene estimate assumed she lay outdoors all night. Allowing for a period indoors and a period wrapped, the 06:52 reading is compatible with death roughly between 19:30 and 21:30. This is an estimate resting on assumptions about room temperature and how long she was wrapped; narrow it with other records, not on its own.\nConclusion: homicide; killed indoors and moved."
      }
    }
  ],

  /* ================================================================ FACTS */
  facts: [
    { id: "fact-argument", text: "Dolores heard Marcus and Iris argue on Tuesday night. He left shouting 'You'll regret this.'", key: true },
    { id: "fact-marcus-work", text: "Marcus Bell works the grill at the Anchor & Lamp on the quay, mostly nights.", key: false },
    { id: "fact-iris-reporting", text: "Iris asked Dolores if she had ever reported a friend: 'He's not a friend. He's been good to me.'", key: false },
    { id: "fact-iris-style", text: "Hanna: Iris texted formally, full sentences, signed '— I'. Never kisses, never 'tmrw'.", key: true },
    { id: "fact-hanna-call", text: "At 19:05 Wednesday Iris told Hanna she was going back to work: someone wanted to talk first. 'He says he can explain.'", key: true },
    { id: "fact-marcus-boat", text: "Marcus admits the Tuesday row was about selling their boat, the Wren. He apologised by text the same night.", key: false },
    { id: "fact-petra-saltmarket", text: "Petra admits walking past the top of the Saltmarket Stairs at 23:05, going home from the co-op and the Seamen's Mission.", key: false },
    { id: "fact-petra-cafe", text: "Petra: by the end of Tuesday's meeting Iris said she'd been 'asking the wrong person the wrong questions'.", key: false },
    { id: "fact-no-surveyor", text: "Petra: no surveyor from Northline ever boarded the Grey Petrel.", key: true },
    { id: "fact-nico-car", text: "Nico left at 19:52 via the car park. Whitlock's green estate was still in bay 12.", key: true },
    { id: "fact-whitlock-knew", text: "Whitlock asked Nico at 16:00 Wednesday what Iris's private Thursday 09:00 appointment was.", key: true },
    { id: "fact-whitlock-alibi", text: "Whitlock says: left 18:10, tram home, soup and football at home, then drove from home to the Harbour Club, arriving 22:40.", key: true },
    { id: "fact-whitlock-call", text: "Whitlock says his 18:52 call to Iris was about the quarterly figures.", key: false },
    { id: "fact-revised-tod", text: "Revised time of death: roughly 19:30 to 21:30 on Wednesday. Killed indoors, then moved.", key: true },
    { id: "fact-kill-site", text: "Iris was killed in the 4th-floor file archive at Halden Mutual.", key: true }
  ],

  /* ================================================================ DEDUCTIONS */
  deductions: [
    {
      id: "ded-clean-shoes", items: ["ev-shoes", "ev-weather"],
      title: "She never walked down those steps",
      text: "It rained until 21:40 and the stairs ran with mud all night, yet her tread is clean. Iris did not walk to that landing. Someone put her there.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-text-not-hers", items: ["ev-hanna-messages", "fact-iris-style"],
      title: "Someone else wrote the 23:12 text",
      text: "No capitals, no full stops, 'tmrw', a kiss and no '— I'. It breaks every habit in two years of her messages. The last 'proof' that she was alive at 23:12 was written by someone else.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-sent-from-office", items: ["ev-phone-extract", "ev-laptop"],
      title: "The fake text came from inside Halden Mutual",
      text: "The 23:12 message was created at 20:51 on HM-LT-0417, the laptop docked at Iris's desk, unlocked since 20:24. Whoever wrote it was at her desk at 20:51. Next: who was in the building. Halden Mutual's lawyers will not release staff access records for what is still officially a fall.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-the-call", items: ["ev-phone-extract", "fact-hanna-call"],
      title: "Whitlock called her back to the office",
      text: "At 18:52 Whitlock rang Iris for two minutes. Thirteen minutes later she told Hanna she was going back to work because 'he says he can explain', and the camera shows her heading for the Financial Quarter tram. The quarterly figures story does not fit.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-alibi-collapse", items: ["ev-garage-log", "fact-whitlock-alibi"],
      title: "Whitlock's evening is a lie",
      text: "He said he went home by tram and drove to the club from home. In fact he came back into the building through the car park at 19:55, his car never left until 22:04, and at 22:17 it was on the dead-end stretch of Quay Road below the Saltmarket Stairs, just before the late shop camera saw a dark estate stop there.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-killed-in-office", items: ["ev-autopsy", "ev-carpet-patch"],
      title: "She died in the archive",
      text: "Grey loop-pile fibres and carpet detergent on her body; a freshly shampooed patch of the same carpet at the end of archive aisle F, cleaned from a spill kit nobody logged. Iris was killed in the archive where she printed her Northline files.",
      key: true, grants: ["fact-kill-site"], requires: []
    },
    {
      id: "ded-weapon", items: ["ev-autopsy", "ev-newsletter"],
      title: "The weapon was the Helm Award",
      text: "The wound is a curved edge roughly 16 to 20 cm across, broken by regular rounded impressions. Whitlock's Helm Award is a brass ship's wheel 18 cm across with eight spoke-ends on the rim.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-motive", items: ["ev-iris-copies", "ev-northline-check"],
      title: "Northline is Whitlock",
      text: "Fourteen inflated survey fees, all approved and expedited by Whitlock, paid to a firm run by his brother-in-law that passes the money to his wife. Iris was taking it to Compliance at 09:00 on Thursday.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-marcus-cleared", items: ["ev-rota", "fact-revised-tod"],
      title: "Marcus was on the grill",
      text: "Between 19:30 and 21:30 Marcus initialled a grill ticket every fifteen minutes on a short-staffed line with no breaks. His walk past the stairs at 23:16 came long after she was placed there. His lie was about embarrassment, not murder.",
      key: false, grants: [], requires: []
    },
    {
      id: "ded-petra-cleared", items: ["ev-coop-minutes", "fact-revised-tod"],
      title: "Petra was at the co-op meeting",
      text: "From 19:30 to 21:50 Petra was in a hall with thirty witnesses, and at 20:35 she stood up to accuse Northline in public. She was furious with Iris, but on the same side, and nowhere near her when she died.",
      key: false, grants: [], requires: []
    }
  ],

  /* ================================================================ THEO */
  requests: [
    {
      id: "rq-phone", label: "Unlock and extract Iris's phone", requires: ["ev-phone"],
      delayMinutes: 90,
      result: "Got into the phone. Calls and messages are on the board. Look at the 23:12 text to the sister: it wasn't typed on the phone at all. Scheduled at 20:51 from a linked desktop called HM-LT-0417. Also, her boss rang her at 18:52.",
      grants: ["ev-phone-extract"]
    },
    {
      id: "rq-badge", label: "Halden Mutual lobby badge records, Wednesday (warrant)", requires: ["ded-sent-from-office", "tw-autopsy"],
      delayMinutes: 45,
      result: "Warrant came through, so their lawyers coughed up the lobby log. Iris came back at 19:58 and never badged out. On paper, the only person in that office at 20:51 was her. Paper is only the front door, mind.",
      grants: ["ev-badge-log"]
    },
    {
      id: "rq-garage", label: "Building car park logs and traffic cameras", requires: ["ev-badge-log"],
      delayMinutes: 60,
      result: "Building management finally answered. Car park door and barrier logs, plus traffic cameras for every car registered to a 4th-floor badge holder. One of them is very interesting.",
      grants: ["ev-garage-log"]
    },
    {
      id: "rq-northline", label: "Background on Northline Survey Services", requires: ["ev-iris-copies"],
      delayMinutes: 120,
      result: "Northline is a mailbox and a director. Lena got a production order for the bank account. Follow the money one step further than Iris could.",
      grants: ["ev-northline-check"]
    }
  ],

  /* ================================================================ PUZZLES */
  puzzles: [
    {
      id: "pz-docbox",
      prompt: "A fireproof document box with a four-digit combination wheel. The fridge note said: 'Box: Petrel's loss date, DDMM, digits backwards.' Enter the four digits.",
      answer: "3071",
      grants: ["ev-iris-copies"],
      hintToken: true
    },
    {
      id: "pz-archive",
      prompt: "Archive retrieval terminal: 'ENTER FOUR-DIGIT CLAIM NUMBER TO LOCATE BOX.' A sticky note on its side reads: START AT THE BEGINNING. Iris's Northline file lists fourteen claims.",
      answer: "1406",
      grants: ["ev-archive-file"],
      hintToken: true
    }
  ],

  /* ================================================================ TWIST */
  twist: {
    id: "tw-autopsy",
    requires: ["ded-clean-shoes", "ded-text-not-hers", "fact-whitlock-alibi", "ev-phone-extract"],
    orAfter: { day: 1, time: "15:00" },
    title: "She was dead before the rain stopped",
    text: "Dr. Sorensen rings Lena from the mortuary and Lena puts her on speaker. One blow to the back of the head, with a curved, patterned edge that no stone step ever made. The scrapes from the 'fall' were most likely made after death. Grey carpet fibres in her hair. And because she spent her first hours indoors, the temperature reading means something else entirely: she probably died between about half seven and half nine. Lena hangs up and looks at the board for a long time. 'We've been asking everyone about eleven o'clock,' she says. 'Nobody's been asked about eight.' Then she picks the phone up again. 'It's a homicide now. I can get warrants.'",
    art: "intro-twist",
    grants: ["ev-autopsy", "fact-revised-tod"],
    unlocks: []
  },

  hintTokensFrom: ["ev-prelim-report", "ded-clean-shoes", "ded-text-not-hers", "ded-sent-from-office", "ded-the-call", "pz-docbox", "pz-archive"],

  /* ================================================================ HINTS (Lena) */
  hints: [
    {
      id: "hint-scene", requires: [], until: ["ded-clean-shoes"],
      text: "You looked at her face. Now look at the rest of her, and at what last night was like out there. My whiteboard might help."
    },
    {
      id: "hint-sister", requires: ["ev-hanna-messages"], until: ["ded-text-not-hers"],
      text: "Her sister has two years of messages from her. Read the last one the way the sister reads it, not the way we did."
    },
    {
      id: "hint-phone", requires: ["ev-phone"], until: ["rq-phone"],
      text: "We have a locked phone in an evidence bag doing nothing. Theo likes a challenge. Ask him."
    },
    {
      id: "hint-box", requires: ["ev-fridge-note"], until: ["pz-docbox"],
      text: "That note is about a date. Somebody's claim file will have it printed on the front. Her desk at work, probably."
    },
    {
      id: "hint-device", requires: ["ev-phone-extract"], until: ["ded-sent-from-office"],
      text: "Theo gave you a device name, not a person. Things with names like that have a tag stuck on them somewhere. Find the tag."
    },
    {
      id: "hint-building", requires: ["ded-sent-from-office", "tw-autopsy"], until: ["ev-garage-log"],
      text: "If that text was written in the building, the building knows who was in it. And a tower with a car park has more than one door. Ask whoever left last."
    },
    {
      id: "hint-alibi", requires: ["ev-garage-log"], until: ["ded-alibi-collapse"],
      text: "You have his account of the evening in your notebook and the building's account on the board. Lay one over the other."
    },
    {
      id: "hint-carpet", requires: ["tw-autopsy"], until: ["fact-kill-site"],
      text: "Fibres don't walk. Somewhere near her work there is grey carpet that someone has been on their knees cleaning."
    },
    {
      id: "hint-weapon", requires: ["tw-autopsy"], until: ["ded-weapon"],
      text: "Sorensen has described the edge of whatever hit her. Something that shape lives somewhere in that office. Walls and shelves are worth a second look."
    },
    {
      id: "hint-money", requires: ["ev-iris-copies"], until: ["ded-motive"],
      text: "She circled one company name fourteen times. Iris couldn't find out who owns it. Theo can."
    }
  ],

  /* ================================================================ SOLUTION */
  solution: {
    suspects: ["p-marcus", "p-petra", "p-whitlock", "p-nico"],
    killer: "p-whitlock",
    motives: [
      { id: "m-exposure", text: "To stop her exposing a survey-fee fraud at her Compliance meeting the next morning." },
      { id: "m-claim", text: "To stop her rejecting a €340,000 insurance claim." },
      { id: "m-boat", text: "Rage over the sale of a boat they co-owned and the end of their relationship." },
      { id: "m-cover", text: "To stop her reporting that he had waved through Petra Lund's insurance fraud." }
    ],
    motive: "m-exposure",
    methods: [
      { id: "md-staged", text: "Struck once from behind with the brass award in the archive, moved to the stairs after dark, and a text scheduled from her laptop to fake the time." },
      { id: "md-desk", text: "Struck at her desk with a glass plaque, carried out through the lobby, and the 23:12 text typed on her own phone on the way to the stairs." },
      { id: "md-carpark", text: "Struck with a tool in the tower car park as she arrived, driven to the stairs, and the text scheduled from his own laptop." },
      { id: "md-mugged", text: "Attacked on the stairs late at night by someone who wanted her bag, left where she fell, and her phone missed in her coat." }
    ],
    method: "md-staged",
    proofs: ["ded-alibi-collapse", "ded-killed-in-office", "ded-weapon", "ded-motive", "ev-garage-log", "ded-sent-from-office"],
    proofsNeeded: 3,
    success: {
      title: "The Helm",
      text: "Interview Room 2. Whitlock's solicitor reads the car park log twice and stops taking notes. Julian does not perform. He lays the pages down one at a time: the 18:52 call, the 19:55 door, the 20:51 text, the 22:04 barrier, the carpet, the photograph of the brass wheel on the shelf. The solicitor leans in and murmurs that his client has nothing to say. Whitlock looks at the photograph and says it anyway. 'She was going to walk into Ruth Achebe's office and say my name like a diagnosis. Twenty-five years. I asked her to come back so I could explain. I only wanted her to listen.' He stops. 'She turned round to leave.' The award is found the next day, wrapped in a dust sheet in his garage at home. Lena writes the charge in her neat block capitals. In the corridor afterwards she says, without looking at Julian, 'Good work.' Then, because she is Lena: 'Don't get used to it.'"
    },
    failure: {
      title: "The wrong door",
      text: "The charge holds for nine days. Then the defence asks the questions you didn't, and the case comes apart in a single morning in court. Whoever stood in that dock walks out into a city that has already made up its mind about them. Iris's colleagues send flowers to the funeral. Hanna Kellan stops returning Lena's calls. Lena closes the file on her desk and leaves her hand on it. 'We reopen,' she says. 'Quietly. And this time we read the evidence, not the people we already decided about.'"
    }
  },

  /* ================================================================ REOPEN
   * The reopened run is the original file reviewed three weeks later. What the first team
   * photographed, recorded and took statements on is replayed "from the file"; what is still
   * out in the world (the shelf, the carpet, Nico, the car park logs, the late shop recorder)
   * has changed.
   */
  reopen: {
    intro: "Three weeks later the charge has collapsed and the file is back on Lena's desk. She lays out everything from the first morning: the scene as it was photographed, the statements as they were taken, the recordings the first team copied. 'That part doesn't change,' she says. 'What's still out there does. Whoever did this has had three weeks to tidy up, records have aged out, and people who talked freely have had time to be frightened.'",
    briefing: "The file, three weeks on. Iris Kellan, thirty-four, senior claims investigator at Halden Mutual Marine. Found at 05:50 on a Thursday morning on the lower landing of the Saltmarket Stairs by a street sweeper: face down, head injury, handbag gone. The first team worked it the way the scene asked them to. A fall down the steps, maybe helped by someone who wanted the bag, some time between ten and one, with a text from her phone at 23:12 to prove she was alive and walking home. They charged the wrong person, and it came apart in court in a single morning. Here is what has not changed. Everything they photographed, bagged, copied and wrote down is in these boxes: the scene photographs, the property, the statements, the doctor's notes, the café recording. Paper doesn't get frightened and it doesn't tidy up. Treat it as if you'd collected it yourself this morning, and read every page, including the ones they skimmed. Here is what has. Three weeks is long enough for recordings to be overwritten and logs to be deleted. It is long enough for whoever did this to put things back where they belong and clean what they couldn't move. And it is long enough for people who talked freely the first time to start working out what talking costs them. Expect the trail to be thinner in some places and newer in others. We start where they started. Scene, flat, office. Anything with a password or a log on it goes to Theo, and the sooner the better. Sorensen will walk us through her report when we're ready for it. And this time, Marsh, nobody gets charged because we liked the look of them for it.",

    evidence: {
      "ev-contacts": {
        "name": "Contacts list, annotated for the review",
        "summary": "The first morning's contacts, with Lena's notes three weeks on.",
        "doc": {
          "title": "Initial Contacts — MC-26-0412, annotated for the review (DS L. Cruz)",
          "table": {
            "cols": [
              "Who",
              "Role",
              "Where",
              "When",
              "Notes"
            ],
            "rows": [
              [
                "Hanna Kellan",
                "Sister, next of kin",
                "Iris's flat, 4C Calder Court, Hillcrest",
                "From 09:00",
                "Still feeding the cat. Will see us there. Not happy with us."
              ],
              [
                "Dolores Finch",
                "Downstairs neighbour, keyholder",
                "3C Calder Court, Hillcrest",
                "Up from 07:00",
                "Re-interview. First statement in box 2."
              ],
              [
                "Graham Whitlock",
                "Head of Claims, line manager",
                "Halden Mutual Marine, 4th floor, Harbour Point Tower",
                "08:30–18:30",
                "Cooperative the first time. Re-interview."
              ],
              [
                "Marcus Bell",
                "Ex-partner, chef",
                "See box 2",
                "—",
                "Re-interview. Ask the neighbour where to find him."
              ],
              [
                "Dr. Anika Sorensen",
                "Medical Examiner",
                "Mortuary",
                "—",
                "Full report in the file. She will walk us through it."
              ],
              [
                "Theo Park",
                "Records and digital, Major Crimes",
                "By phone",
                "Any time",
                "Logs age out. Ask early."
              ],
              [
                "Late shop owner",
                "Witness",
                "Top of the Saltmarket Stairs",
                "Open",
                "Recording overwritten. Statement in the file."
              ],
              [
                "Tomas Ferreira",
                "Finder",
                "City depot, Eastgate",
                "Off shift",
                "Nothing further."
              ]
            ]
          }
        }
      },
      "ev-kiosk-cam": {
        name: "Late shop owner's statement",
        summary: "The recording is gone. The owner remembers a car at the foot of the stairs around 22:20, a woman in yellow after 23:00, a big man later.",
        doc: {
          kind: "statement",
          title: "Statement of the Saltmarket Late Shop owner, taken by PC Odell, Thursday 11:20",
          meta: [["Recording", "Overwritten after 14 days. The first team did not copy it."]],
          table: null,
          text: "'I watched it with the constable later that morning. Nobody came down the top steps all night. About twenty past ten a car stopped on Quay Road at the bottom. Dark, an estate maybe; no plate at that distance. Lights off a few minutes, then off east. Just after eleven a woman in one of those yellow fishing coats went along the lane. Bit later a big fella with a bag walked along the road at the bottom. That's all.'"
        }
      },
      "ev-drag-marks": {
        doc: { title: "Scene photograph 19 (first morning, re-examined) — bottom steps at Quay Road" }
      },
      "ev-garage-log": {
        summary: "Barrier records gone, but a backup and traffic cameras still show Whitlock re-entering at 19:55 and his car on Quay Road at 22:17.",
        doc: {
          title: "Car park records (partly purged) + city traffic cameras (Theo Park)",
          table: {
            cols: ["Time", "Source", "Event"],
            rows: [
              ["Wed 19:55", "Building management backup, pedestrian door", "Fob G-118 (G. Whitlock) — entry"],
              ["Wed 22:04", "Car park exit barrier", "Not available: barrier logs auto-deleted after 14 days"],
              ["Wed 22:09", "Traffic camera, Harbour Point Tower exit ramp", "Green estate PH 62 KTR (G. Whitlock) leaves the tower ramp"],
              ["Wed 22:17", "Traffic camera, Quay Road west", "PH 62 KTR westbound"],
              ["Wed 22:31", "Traffic camera, Quay Road west", "PH 62 KTR eastbound"],
              ["Wed 22:38", "Harbour Club car park camera", "PH 62 KTR enters"]
            ]
          },
          text: "No other fob used the pedestrian door between 18:00 and 23:00.\nTheo's note: 'Barrier logs only last fourteen days, but the city keeps traffic cameras for ninety, and the tower's exit ramp is on one. He drove out of his office car park at 22:09, not from home, and went down Quay Road west, a dead end for cars at the Saltmarket Stairs; only a footpath carries on along the harbour wall.'"
        }
      }
    },

    hotspots: {
      "h-st-kiosk": {
        text: "The late shop at the top of the stairs, shutter half up, the dome camera still above the door. The owner shrugs: the recorder keeps a fortnight and has long since recorded over that night. All that survives is the statement a constable took from him on the first morning."
      },
      "h-st-steps": {
        text: "Scene photograph from the first morning: every step of the upper flight slick with grey mud and leaf litter, the uniformed officers' boot prints smeared across it. Nobody could have walked down there that night without carrying some of it."
      },
      "h-st-pocket": {
        text: "From the evidence store: her dark wool coat, buttoned to the throat when she was found. Bagged from the inside pocket: her phone, screen cracked in a starburst, and a folded card slip from a café."
      },
      "h-st-body": {
        text: "Scene photograph from the first morning: Iris Kellan face down across the lower landing, head towards the lower flight, arms tucked beneath her, coat buttoned and neat, no bag. Looked at again, she seems less like someone who fell than someone who was put down carefully."
      },
      "h-st-shoes": {
        text: "From the evidence store: her black leather ankle boots, photographed side by side on the step below the landing, toes down. You turn them over and look at the soles."
      },
      "h-st-drag": {
        text: "The moss has been scoured by three weeks of rain. But in the first morning's wide shots of the bottom steps, now you know what to look for: two parallel scuffs running up the front edges from the Quay Road kerb to the landing, and a curl of mud on the kerb."
      },
      "h-fl-catbowl": {
        text: "Ledger's bowls by the door; Hanna has been feeding him since. In the first team's photographs: one bowl licked clean, one filled late that night by someone with a key. Probably not Iris."
      },
      "h-of-desk": {
        text: "Iris's desk has been cleared into two archive boxes labelled KELLAN — HOLD FOR POLICE. On top, one thick claim file with sticky tabs down its edge and notes in the margins in square capitals."
      },
      "h-of-shelf": {
        text: "Through the glass of the corner office: the shelf of awards behind the desk. The brass ship's wheel is back between the glass plaques, glowing as if just polished. Up close it smells of metal polish, and a new green felt pad has been glued under its granite base.",
        grants: ["ev-award-polished"]
      },
      "h-of-carpet": {
        requires: ["tw-autopsy"],
        text: "At the end of archive aisle F, two carpet tiles, a metre of floor, are a brighter grey than the rest, their pile not yet trodden flat. Pinned to the archive door is a facilities work order.",
        grants: ["ev-new-tile"]
      },
      "h-ca-cctv": {
        text: "The camera above the till. The owner's recorder only keeps a week, but he burned a copy for the first investigation, and it is in the file."
      },
      "h-re-clock": {
        text: "By the kitchen pass: the punch clock and a rack of cards. The first team took that Wednesday's cards and order tickets; the copies are in the file."
      }
    },

    questions: {
      "q-hanna-message": {
        a: "A text. Twelve minutes past eleven that night. I've read it a hundred times since. Here. Read it yourself."
      },
      "q-dol-iris": {
        a: "She carried my shopping up four flights every Saturday and pretended it was on her way. I fed her cat when she worked late. I've got her key. Fed him at midnight that night, as it happens, because he wouldn't stop crying at the door."
      },
      "q-nico-badge": {
        a: "Okay. I was printing my CV; I've got an interview elsewhere. I badge out at the front, then go round and down the ramp to the bike cage. The car? I... I don't really remember. I wasn't paying attention. But there's something. Last week Graham took me for lunch. He's never done that. He said there'd be a senior adjuster post soon, and then he said, 'You'd gone by six that Wednesday, hadn't you? So you wouldn't have seen anything in the car park. People get confused.' I said yes. I didn't know what else to say.",
        cue: "On the car his answers go vague and he watches the glass office. On the lunch he is suddenly precise: the day, the restaurant, the exact words. He was not trying to remember the lunch. He has not been able to forget it.",
        grants: ["ev-nico-statement"]
      }
    },

    people: {
      "p-whitlock": {
        description: "Silver hair, good suit. The black armband has gone. He shakes your hand, offers coffee, and rests his forearms on an immaculate desk, hands open. He has been interviewed before and is not worried about being interviewed again.",
        presentations: [
          {
            item: "ev-award-polished",
            a: "Back from the engraver. Looks rather well, doesn't it? I'd like it back when you're finished with it.",
            cue: "Still no engraver's name, no ticket, no date. Nothing you could check."
          },
          {
            item: "ev-nico-statement",
            a: "I took a junior colleague to lunch. If that's a crime, half this building should be arrested.",
            cue: "He answers the lunch. He does not answer the sentence about the car park."
          },
          {
            item: "ev-garage-log",
            a: "I think I'd like to speak to a solicitor before I say anything else.",
            cue: "He sits very still. The warmth is gone, and in its place is something careful and tired."
          },
          {
            item: "ev-northline-check",
            a: "I'd like my solicitor present for any questions about company procurement.",
            cue: "He does not look at the page."
          },
          {
            item: "ev-phone-extract",
            a: "I really don't see what Iris's text messages have to do with me.",
            cue: "He reads the 23:12 line twice. His eyes do not go to the 18:52 call at all."
          }
        ]
      },
      "p-nico": {
        presentations: [
          {
            item: "ev-newsletter", requires: ["ev-award-polished"],
            a: "It was gone for a week or so. Now it's back and he polishes it himself. I've never seen him polish anything."
          },
          {
            item: "ev-newsletter",
            a: "The Helm Award. He's very proud of it. It's on the shelf behind his desk."
          },
          {
            item: "ev-iris-copies",
            a: "Northline. That's it, that's what she meant. Every one of these is a Graham sign-off. I've never seen a Northline surveyor in this building. Not once."
          }
        ]
      }
    },

    twist: {
      text: "Lena asks Dr. Sorensen to come up and walk them through her full post-mortem report, the one the first team read only as far as 'head injury'. One blow to the back of the head, with a curved, patterned edge no stone step ever made. The scrapes from the 'fall' were most likely made after death. Grey carpet fibres in her hair. And because she spent her first hours indoors, the temperature reading means she probably died between about half seven and half nine. Lena looks at the board for a long time. 'They asked everyone about eleven o'clock,' she says. 'Nobody was asked about eight.' Then she picks up the phone. 'Homicide, on paper this time. Now I can get warrants.'"
    },

    solution: {
      success: {
        title: "The Helm",
        text: "Interview Room 2. Whitlock's solicitor reads the traffic camera log twice and stops taking notes. Julian does not perform. He lays the pages down one at a time: the 18:52 call, the 19:55 door, the 20:51 text, the car on Quay Road, the archive, the photograph of the brass wheel on the shelf. The solicitor leans in and murmurs that his client has nothing to say. Whitlock looks at the photograph and says it anyway. 'She was going to walk into Ruth Achebe's office and say my name like a diagnosis. Twenty-five years. I asked her to come back so I could explain. I only wanted her to listen.' He stops. 'She turned round to leave.' By the end of the week the lab has the award. Lena writes the charge in her neat block capitals. In the corridor afterwards she says, without looking at Julian, 'Good work.' Then, because she is Lena: 'Don't get used to it.'"
      }
    },

    addEvidence: [
      {
        id: "ev-award-polished", name: "The Helm Award, back and polished", key: true,
        summary: "Returned to the shelf, freshly polished, with a new felt pad hiding the base.",
        doc: {
          kind: "object",
          title: "Brass ship's wheel on granite base, Whitlock's shelf",
          meta: [["Diameter", "18 cm, eight spoke-ends on the rim"], ["Base", "Granite, 12 cm square"]],
          text: "Freshly polished: no tarnish in the crevices of the spoke-ends, where months of handling would leave some. A new green felt pad is glued under the base; the spring newsletter photo shows bare granite. Taken for forensic examination: under the felt, a dark residue in the joint between brass and granite."
        }
      },
      {
        id: "ev-new-tile", name: "Replaced carpet tiles and work order", key: true,
        summary: "Two archive carpet tiles replaced, on a work order Whitlock raised the day after she was found.",
        doc: {
          kind: "report",
          title: "Harbour Point Tower Facilities — Work Order 4471",
          meta: [["Raised by", "G. Whitlock, Halden Mutual"], ["Raised", "Friday 07:12"], ["Location", "4th floor archive, end of aisle F"], ["Completed", "Saturday"]],
          text: "Request: 'Replace two carpet tiles, coffee spill. Urgent, please, before Monday.'\nContractor's note: 'No coffee smell. Tiles already shampooed, damp underneath. Old tiles bagged for the skip.' Skip collected Monday.\nThe surrounding carpet is grey nylon loop-pile, the same throughout the archive."
        }
      },
      {
        id: "ev-nico-statement", name: "Nico's statement: the lunch", key: true,
        summary: "Whitlock took Nico to lunch, hinted at a promotion, and told him what he had and hadn't seen.",
        doc: {
          kind: "statement",
          title: "Witness statement — Nicolas VARGA",
          meta: [["Taken by", "DS L. Cruz"], ["Present", "J. Marsh (consultant)"]],
          text: "'About two weeks after Iris died, Graham Whitlock took me to lunch at Calloway's on Dock Street. He has never done that before. He told me a senior adjuster post would be coming up. As we were leaving he said, \"You'd gone by six that Wednesday, hadn't you? So you wouldn't have seen anything in the car park. People get confused.\" I said yes. I hadn't said anything to him about the car park. I was frightened, which is why I was vague when you asked me.'"
        }
      }
    ],

    addDeductions: [
      {
        id: "ded-alibi-collapse", items: ["ev-garage-log", "fact-whitlock-alibi"],
        title: "Whitlock's evening is a lie",
        text: "He said he went home by tram and drove to the club from home. In fact his fob let him back into the building through the car park at 19:55, his car did not leave the tower until about 22:09, and at 22:17 it was heading down the dead-end stretch of Quay Road below the Saltmarket Stairs.",
        key: true, grants: [], requires: []
      },
      {
        id: "ded-award-cleaned", items: ["ev-award-polished", "ev-autopsy"],
        title: "The weapon came back clean",
        text: "The wound is a curved edge roughly 16 to 20 cm across with regular rounded impressions. The Helm is a brass wheel 18 cm across with eight spoke-ends. Someone has polished it, padded its base and put it back, and there is residue in the joint they couldn't reach.",
        key: true, grants: [], requires: []
      },
      {
        id: "ded-killed-in-office-r", items: ["ev-autopsy", "ev-new-tile"],
        title: "She died in the archive",
        text: "Grey loop-pile fibres and carpet detergent on her body. In the archive, two tiles of that carpet were shampooed, then replaced on Whitlock's own urgent work order the day after she was found, for a coffee spill that didn't smell of coffee.",
        key: true, grants: ["fact-kill-site"], requires: []
      },
      {
        id: "ded-tampering", items: ["ev-nico-statement", "fact-whitlock-alibi"],
        title: "Whitlock is coaching a witness",
        text: "Whitlock went out of his way to tell Nico what Nico had and hadn't seen, and dangled a promotion while he did it. A man with nothing to hide in that car park does not need a witness to have seen nothing there.",
        key: true, grants: [], requires: []
      }
    ],
    removeDeductions: ["ded-killed-in-office"],
    proofs: ["ded-alibi-collapse", "ded-sent-from-office", "ded-killed-in-office-r", "ded-award-cleaned", "ded-weapon", "ded-motive", "ded-tampering", "ev-garage-log"],

    addHints: [
      {
        id: "hint-r-nico", requires: ["ev-badge-log"], until: ["ded-tampering"],
        text: "Nico was frightened the first time. Three weeks on he's more frightened. Ask him about that night again, and listen for the part he's sure of."
      }
    ]
  },

  /* ================================================================ DEBRIEF */
  debrief: [
    {
      flag: "ded-clean-shoes",
      title: "The clean boots", technique: "Staging recognition",
      explanation: "Offenders sometimes arrange a scene to tell a story: a fall, a robbery, a suicide. Investigators test the story against small physical facts it cannot control, such as weather, mud, footwear, the order of injuries. Here the scene said 'she fell walking home', but her tread was clean on a staircase running with mud.",
      tip: "When a scene tells you a story, ask what else would have to be true if the story were real, and go and check one of those things."
    },
    {
      flag: "ded-text-not-hers",
      title: "The wrong kind of text", technique: "Linguistic baseline (authorship comparison)",
      explanation: "People write with consistent habits: punctuation, abbreviations, greetings, sign-offs. Comparing a questioned message with a set of known messages can show it is out of character. One odd message is not proof on its own, but it is a solid reason to check how and where it was really sent.",
      tip: "If a message from someone you know feels 'off', compare it with their last ten messages before deciding. Habits are more reliable than impressions."
    },
    {
      flag: "q-wh-evening",
      title: "The rehearsed paragraph", technique: "Baseline deviation",
      explanation: "There is no single gesture that means someone is lying. Gaze aversion, fidgeting and self-touching are the most widely believed signs of lying and among the least reliable in research. What is more useful is change: how a person answers easy, neutral questions compared with the questions that matter. Whitlock was brief and relaxed about work, then gave a long, over-detailed account of exactly the hours that needed covering. Even then, a change can come from stress or fear of the police rather than lying, and comparisons only help when the easy and hard questions are similar in kind. A change is a signal to check the account, not a conclusion.",
      tip: "Before judging how someone answers a hard question, notice how they answer a few easy ones. Judge the difference, not the behaviour."
    },
    {
      flag: "fact-marcus-boat",
      title: "Marcus lied too", technique: "A lie is not a confession",
      explanation: "Marcus lied about seeing Iris on Tuesday, and Petra lied about being out on Wednesday. Both lies were real, and neither was about murder: one was embarrassment, the other fear. A lie proves only that someone is hiding something; your job is to find out what. A related trap, which Paul Ekman called the Othello error, is reading a truthful person's fear of not being believed as a sign of lying.",
      tip: "When you catch someone in a lie, ask what else they might be protecting before deciding what the lie means."
    },
    {
      flag: "q-nico-badge",
      title: "Checkable details", technique: "Verifiable detail",
      explanation: "Truthful accounts often contain details that can be checked: times, places, other people, records. Research on the verifiability approach suggests liars tend to avoid such details, because they can be checked. When Nico corrected his story, it came with checkable specifics: a printer, an interview, where he went and when. Whitlock's evening was full of detail too, but look at what kind: a tram number and a football score anyone could know, at home, with no witness named and no record. The verifiability approach counts details that could be checked against a record or a person, not details that just sound specific.",
      tip: "Ask for details that could be checked, then check one. Notice who offers them freely and who goes vague."
    },
    {
      flag: "tw-autopsy",
      title: "Eleven o'clock was a fiction", technique: "Time of death is an estimate",
      explanation: "Body-temperature estimates depend on assumptions about where the body was and what covered it. The scene estimate assumed she lay outside all night; once the pathologist knew she had been indoors and wrapped, the same reading pointed hours earlier. Injuries made after death usually show little or no bleeding into the surrounding tissue, which is how the 'fall' was exposed.",
      tip: "Treat any time-of-death figure as a range resting on assumptions. If the assumptions change, the range changes."
    },
    {
      flag: "ded-alibi-collapse",
      title: "The car that never went home", technique: "Alibi verification and timeline consistency",
      explanation: "An alibi only matters if it covers the real time of the crime, and only if independent records agree with it. Whitlock's alibi was real but covered the wrong hours. His account of the right hours fell apart against door logs, car park records and traffic cameras that nobody could coach.",
      tip: "Build the timeline from records first, then lay each person's account on top of it. The gaps and overlaps do the work."
    },
    {
      flag: "ded-motive",
      title: "Follow the fees", technique: "Motive, means, opportunity",
      explanation: "A strong case shows why (motive), how (means) and when and where (opportunity), each supported by evidence, not by impressions. Marcus and Petra had visible motives but no opportunity at the real time. Whitlock had a hidden motive, the means on his own shelf, and the only unexplained access to the building that night.",
      tip: "When one suspect has an obvious motive, ask who else gains or avoids losing something, especially someone who has been helpful."
    }
  ]
};
