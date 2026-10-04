/* Cold Read — Chapter 1, Case 1: "The Long Way Home"
 * Pilot case. Standalone. Data format: game/SCHEMA.md.
 * Spoilers for testers: game/case-001-SPOILERS.md
 */
window.CASE = {
  id: "case-001",
  chapter: 1,
  number: 1,
  title: "The Long Way Home",
  tagline: "She texted her sister that she was walking home. She never took a step.",
  start: { day: 1, time: "06:40", locationId: "loc-hq" },

  intro: [
    { art: "intro-1", caption: "Port Halden. Thursday, 05:50. The rain stopped hours ago. The Saltmarket Stairs never dry." },
    { art: "intro-2", caption: "A street sweeper finds a woman on the lower landing. He stops his cart, takes off his cap, and calls it in." },
    { art: "intro-3", caption: "Julian Marsh used to tell strangers their secrets on live television. He was never psychic. He was paying attention, and someone was paying researchers." },
    { art: "intro-4", caption: "Now he pays attention for the Port Halden Police. Major Crimes gave him a desk, a visitor's badge and Detective Sergeant Lena Cruz, who did not ask for him." },
    { art: "intro-5", caption: "06:40. Lena drops a thin file in front of him. 'Don't read her. Read the evidence.'" }
  ],

  briefing: "Iris Kellan, thirty-four. Senior claims investigator at Halden Mutual Marine, Financial Quarter. A street sweeper found her at 05:50 on the lower landing of the Saltmarket Stairs in Old Town. Head injury, handbag missing. The doctor on scene says it looks like a fall, maybe helped along by someone who wanted the bag. Time of death between ten and one. Her sister got a text from Iris's phone at 23:12 saying she was walking home the long way. Uniform are knocking on doors. I would like this to be a mugging, because muggings are simple. That is not up to me. Scene first, then her flat in Hillcrest, then her office. And Marsh: no tricks with the family.",

  victim: {
    id: "p-victim",
    name: "Iris Kellan",
    age: 34,
    occupation: "Senior claims investigator, Halden Mutual Marine",
    bio: "Iris Kellan grew up in The Docks, the elder of two sisters. For six years she investigated marine insurance claims at Halden Mutual and was known for refusing to sign anything she had not checked twice. She lived alone in a fourth-floor flat at Calder Court, Hillcrest, with a grey cat called Ledger. She separated from Marcus Bell, a chef, three months ago; they still co-owned a small sailboat. For the past fortnight she had been working on a disputed trawler claim and, her sister says, sleeping with the light on. Her work diary for Thursday morning was marked private.",
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
          id: "h-hq-file", label: "Preliminary file", x: 270, y: 380, r: 45,
          text: "On Lena's desk, squared to the edge: a manila folder stamped MC-26-0412, the scene doctor's preliminary notes clipped to the front. Her pen lies parallel to it.",
          grants: ["ev-prelim-report"]
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
          text: "Iris Kellan lies face down across the lower landing, head towards the lower flight, arms tucked beneath her. Her coat is buttoned and neat. Her hair is matted at the back. No bag. She looks less like someone who fell than someone who was put down carefully.",
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
          text: "Ledger's bowl on the floor by the door, licked clean, and a second bowl with fresh food in it. Someone with a key fed the cat late last night. It was not Iris."
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
      description: "A busy fish restaurant on the quay with an open kitchen. At this hour the chairs are still on the tables and the grill is being scraped down.",
      map: { x: 420, y: 500 },
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
          a: "She rang me just after seven. She was in a café, I could hear cups and rain against a window. She said she had to go back into work for an hour. Someone wanted to talk to her before tomorrow. She said, 'He says he can explain.' I asked who. She said, 'Better you don't know until it's done.' She sounded relieved. Like it was going to be easier than she'd feared.",
          cue: "She gives the time, the cups and the rain without being asked. Small, checkable details, offered freely.",
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
          a: "Here. On the grill from four till just after eleven. Then I walked home along the quay to Eastgate, like every night. Nobody walks with me, before you ask.",
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
          cue: "Two words, delivered to the window instead of to you. After the speech she just gave about her boat, the brevity is loud."
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
          cue: "She meets your eyes now. The lie was about fear, not about anything she saw.",
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
      description: "Silver hair, good suit, a black armband already on his sleeve. He shakes your hand with both of his and holds it a beat too long. His desk is immaculate. He offers coffee before you have sat down.",
      questions: [
        {
          id: "q-wh-iris", q: "Tell me about Iris.",
          a: "One of the best investigators I've had in twenty-five years. Rigorous. Relentless, sometimes too much so. She'd got her teeth into a claim lately, the Grey Petrel, a very difficult claimant, Petra Lund. Threats, I gather. And there was a boyfriend, an ex, who came by in a temper a month ago. I hope you'll look at both of them.",
          cue: "Relaxed, fluent, warm. Open hands on the desk, steady eye contact, short natural sentences. This is his baseline. Note also that he has handed you two suspects before you asked for any."
        },
        {
          id: "q-wh-evening", q: "Where were you on Wednesday evening?",
          a: "I left here at ten past six. Took the number 4 tram home to Hillcrest, had a bowl of soup, watched the second half of the Halden-Varn match, which was dreadful, two-nil. Then I drove down to the Harbour Club for the quiz night. Arrived about twenty to eleven, stayed until half past twelve. Thirty people can tell you I was there.",
          lie: true,
          cue: "Until now his answers have been short and easy. This one arrives as a complete, ordered paragraph, with a tram number and a football score nobody asked for, and his fingers go to his cufflink. On its own that proves nothing. It is a change from his own baseline, and it tells you which part of his evening he has rehearsed. The verifiable part, the club, starts at 22:40.",
          grants: ["fact-whitlock-alibi"]
        },
        {
          id: "q-wh-call", q: "You phoned Iris at 18:52 on Wednesday.",
          requires: ["ev-phone-extract"],
          a: "Did I? Yes, I suppose I did. The quarterly figures. A deadline. Routine. Two minutes, if that.",
          lie: true,
          cue: "'Did I?' comes first, then 'yes'. He is deciding how much you already know before he answers.",
          grants: ["fact-whitlock-call"]
        },
        {
          id: "q-wh-calendar", q: "You asked Nico what Iris's private appointment on Thursday was.",
          requires: ["fact-whitlock-knew"],
          a: "I manage a team of nine. I keep an eye on their calendars. That's my job. Iris had been under strain; I was concerned.",
          cue: "For the first time in the conversation he breaks eye contact, to glance at the glass door behind you."
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
          cue: "Fast and smiling, and no name of an engraver, no ticket, no date it is due back. People telling the truth about errands usually reach for the boring details that make them easy to check."
        },
        {
          item: "fact-nico-car",
          a: "Nico's a nice lad with a poor memory. Half the car park drives a green estate.",
          cue: "He smiles with his mouth. His hand has gone back to the cufflink."
        },
        {
          item: "ev-garage-log",
          a: "I think I'd like to speak to a solicitor before I say anything else.",
          cue: "He sits very still. The warmth is gone, and in its place is something careful and tired."
        },
        {
          item: "ev-northline-check",
          a: "I'd like my solicitor present for any questions about company procurement.",
          cue: "He does not look at the page. He already knows what is on it."
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
          id: "q-nico-left", q: "What time did you leave on Wednesday?",
          a: "Six. On the dot. Same as always.",
          lie: true,
          cue: "'On the dot', and 'same as always'. Two reassurances where one time would do. It is the only number he has been precise about all morning, and he says it to the desk."
        },
        {
          id: "q-nico-badge", q: "The lobby log says you badged out at 19:52, not six.",
          requires: ["ev-badge-log"],
          a: "Okay. Okay. I was printing my CV on the colour printer. I've got an interview at Brightwater Re on Monday and I didn't want Graham to know. That's all. But listen. I go out through the car park to get my bike. Graham's green estate was in his bay, number twelve. I remember because he'd left at ten past six and I thought, he's got a taxi to his quiz, good for him. It was definitely there.",
          cue: "Now the details come in a rush: the printer, the interview, the bay number, the reason he noticed. Specific and checkable. He has stopped watching the glass office.",
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
          item: "ev-newsletter",
          a: "The Helm Award. He's very proud of it. It's been on that shelf since the spring. Actually... I haven't seen it this week."
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
      id: "ev-prelim-report", name: "Preliminary scene report", key: false,
      summary: "Scene doctor: head injury from a fall, death 22:00–01:00, bag missing.",
      doc: {
        kind: "report",
        title: "PHPD Major Crimes — Preliminary Scene Notes, MC-26-0412",
        meta: [["Deceased", "Iris KELLAN, 34"], ["Location", "Lower landing, Saltmarket Stairs, Old Town"], ["Found", "Thu 05:50 by T. Ferreira (street sweeper)"], ["Doctor on scene", "Dr. A. Sorensen, Medical Examiner's Office"], ["Notes made", "Thu 07:05"]],
        text: "Position: prone across lower landing, head downhill, arms beneath body. Coat buttoned. Fully clothed. Boots found on step below landing.\nInjuries: laceration with underlying depressed fracture, back of head (right side). Abrasions to face, palms and both knees.\nCore temperature 21.4°C at 06:52. Ambient 6°C, wind NW, ground wet. Estimate assumes body outdoors throughout: death approx. 22:00–01:00.\nProperty: phone in inner coat pocket (screen cracked). Handbag not located. Wallet not located.\nProvisional view: head injury consistent with a fall down stone steps. Robbery not excluded.\nFull post-mortem examination scheduled Thursday morning."
      }
    },
    {
      id: "ev-weather", name: "Met Office report, Wednesday night", key: false,
      summary: "Rain 17:50 to 21:40. Stairs were wet and muddy all night.",
      doc: {
        kind: "report",
        title: "Port Halden Met Office — Hourly Observations, Harbour Station",
        meta: [["Date", "Wednesday into Thursday"], ["Station", "PH-03 Harbour"]],
        table: {
          cols: ["Time", "Conditions", "Rain (mm)", "Temp (°C)"],
          rows: [
            ["17:00", "Overcast, dry", "0.0", "9"],
            ["17:50", "Rain begins", "—", "9"],
            ["18:00–21:00", "Moderate rain", "2.0–4.0 per hour", "8–7"],
            ["21:40", "Rain ends", "—", "7"],
            ["22:00–05:00", "Dry, cloudy, wind NW 18 km/h", "0.0", "6–5"]
          ]
        },
        text: "Surface water and run-off reported on Old Town stairways and lanes until morning."
      }
    },
    {
      id: "ev-scene-photo", name: "Scene photograph", key: false,
      summary: "Face down on the landing, coat buttoned, arms tucked under. Neat for a fall.",
      doc: {
        kind: "photo",
        title: "Scene photograph 4 of 22 — lower landing",
        meta: [["Taken", "Thu 06:21, PC Odell"]],
        text: "Wide shot from the turn of the stair. The deceased lies face down across the landing. Coat buttoned to the collar, hem straight. Both arms beneath the body. Boots off and set on the next step down. No scattered belongings. No blood trail on the steps above the landing."
      }
    },
    {
      id: "ev-shoes", name: "Her boots: clean soles", key: true,
      summary: "Soles clean and dry, though every step was mud. Grey fibres in the heel seam.",
      doc: {
        kind: "object",
        title: "Exhibit IK/3 — pair of black leather ankle boots, size 38",
        meta: [["Recovered", "Step below lower landing, Saltmarket Stairs"], ["Condition", "Dry"]],
        text: "Uppers dry, lightly scuffed at the toes. Soles and tread: clean. No mud, no leaf litter, no grit in the tread. A few short grey synthetic fibres caught in the stitching of the left heel.\nNote by Julian: the upper flight is ankle-deep in wet leaf mud. Nobody walks down it and arrives with clean soles."
      }
    },
    {
      id: "ev-phone", name: "Iris's phone", key: false,
      summary: "Her phone, cracked and locked. Theo could get into it.",
      doc: {
        kind: "object",
        title: "Exhibit IK/1 — mobile phone",
        meta: [["Recovered", "Inner coat pocket"], ["State", "Screen cracked, locked, 31% battery"]],
        text: "Lock screen shows one notification: a message from 'Hanna' at 06:33. The phone requires a passcode. Sealed and sent to digital forensics on request."
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
        },
        text: "Thank you. See you tomorrow."
      }
    },
    {
      id: "ev-kiosk-cam", name: "Late shop camera log", key: true,
      summary: "A car stops at the foot of the stairs 22:21–22:29. Petra passes 23:05, Marcus 23:16.",
      doc: {
        kind: "camera",
        title: "Saltmarket Late Shop — camera 2 (doorway), Wednesday night",
        meta: [["View", "Top flight of Saltmarket Stairs; at the far edge, a strip of Quay Road at the bottom"], ["Blind spot", "The lower landing is hidden by the turn of the stair"]],
        table: {
          cols: ["Time", "Observed"],
          rows: [
            ["21:47", "Shop shutter lowered halfway. Lane empty."],
            ["22:21", "A dark estate car stops on Quay Road at the foot of the stairs. Headlights off. Plate not readable."],
            ["22:22–22:28", "Movement at the foot of the stairs, too dark to make out. One figure, possibly two shapes."],
            ["22:29", "Headlights on. The car drives off east along Quay Road."],
            ["23:05", "A woman in a bright yellow oilskin walks along Saltmarket Lane across the top of the stairs. Does not look down. Continues east."],
            ["23:16", "A large man with a holdall walks east along Quay Road past the foot of the stairs, looking at a phone. Does not stop."],
            ["05:48", "Street sweeper's cart arrives at the top of the stairs."],
            ["05:50", "Sweeper goes down the stairs, returns running at 05:51."]
          ]
        },
        text: "No one goes down or comes up the top flight between 21:47 and 05:50."
      }
    },
    {
      id: "ev-drag-marks", name: "Drag marks at the foot of the stairs", key: true,
      summary: "Parallel scuffs up the bottom three steps from Quay Road: she was carried up, not down.",
      doc: {
        kind: "photo",
        title: "Scene photograph 23 (taken on revisit) — bottom steps at Quay Road",
        text: "Two parallel scuff lines through the moss on the front edges of the bottom three steps, about 30 cm apart, running from the Quay Road kerb up to the lower landing. Consistent with heels dragged upward. A smear of mud on the kerb edge. The scuffs are on top of the wet moss, so they were made after the rain stopped at 21:40."
      }
    },
    {
      id: "ev-fridge-note", name: "Sticky note on the fridge", key: false,
      summary: "'Box: Petrel's loss date, DDMM, read right to left.'",
      doc: {
        kind: "note",
        title: "Yellow sticky note, fridge door",
        text: "BOX: PETREL'S LOSS DATE, DDMM, READ RIGHT TO LEFT."
      }
    },
    {
      id: "ev-planner", name: "Iris's week planner", key: true,
      summary: "Thursday 09:00: Compliance, 'Bring everything. Tell nobody.'",
      doc: {
        kind: "note",
        title: "Paper week-planner, open on Iris's desk at home",
        table: {
          cols: ["Day", "Entries"],
          rows: [
            ["Monday", "Dentist 08:00 (moved). Ring Hanna re Saturday."],
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
        title: "Printed listing: 'WREN — 7.2 m sloop, sound, sails 2023'",
        meta: [["Asking", "€14,500"], ["Contact", "I. Kellan"]],
        text: "Well-kept day sailer, moored Hillcrest Marina. Joint ownership; sale agreed by both owners.\n\nHandwritten across the bottom in black ink, square capitals:\nM, I HAVE TOLD YOU. I WILL PAY YOU YOUR HALF, EVERY PENNY. I AM NOT DOING THIS TO HURT YOU. I.\n\nBeneath, in a different hand, pressed hard enough to tear the paper: 'IT'S NOT ABOUT THE MONEY.'"
      }
    },
    {
      id: "ev-iris-copies", name: "Iris's Northline file", key: true,
      summary: "14 claims surveyed by Northline. Fees 15 times market rate. Every one approved by GW.",
      doc: {
        kind: "report",
        title: "Private working file, from the document box: 'NSS — WHO IS NORTHLINE?'",
        meta: [["Contents", "Photocopied invoices, Iris's summary table, a printed draft email"], ["Sorted", "By vessel name"]],
        table: {
          cols: ["Vessel", "Claim no.", "Date of loss", "Northline fee (€)", "Approved by"],
          rows: [
            ["Baltic Rose", "1745", "02/08/2024", "41,200", "G. Whitlock"],
            ["Cormorant", "1588", "19/11/2023", "38,900", "G. Whitlock"],
            ["Dunlin", "2040", "07/04/2025", "44,000", "G. Whitlock"],
            ["Grey Petrel", "2291", "17/03/2026", "46,500", "G. Whitlock"],
            ["Halden Star", "1903", "23/01/2025", "43,100", "G. Whitlock"],
            ["Kittiwake", "1406", "11/05/2023", "39,800", "G. Whitlock"],
            ["Marram", "2176", "30/10/2025", "45,900", "G. Whitlock"],
            ["Norrland", "1811", "14/10/2024", "42,700", "G. Whitlock"],
            ["Osprey II", "1522", "28/08/2023", "40,300", "G. Whitlock"],
            ["Pelican Bay", "2233", "09/01/2026", "47,200", "G. Whitlock"],
            ["Sea Lavender", "1690", "15/03/2024", "44,600", "G. Whitlock"],
            ["Tern", "1967", "21/02/2025", "43,800", "G. Whitlock"],
            ["Westering", "2118", "03/07/2025", "46,100", "G. Whitlock"],
            ["Whimbrel", "1857", "29/11/2024", "48,300", "G. Whitlock"]
          ]
        },
        text: "Total Northline fees: €612,400. Market rate for a hull survey: €1,800–€3,500.\nEvery one marked EXPEDITE. Every one signed GW.\nNorthline: no listing with the Marine Surveyors' Register. Address is a mailbox in Eastgate.\n\nDraft email (printed, not sent): 'Ruth — I need to report a concern about approvals in Claims, and it involves my own line manager. I'd like to bring you documents in person, not by email. Thursday 9:00 if you can. Please do not copy anyone in Claims. — Iris'"
      }
    },
    {
      id: "ev-petrel-claim", name: "Grey Petrel claim file", key: false,
      summary: "Petra Lund's €340,000 claim. Lost 17/03. Northline survey names the wrong engine.",
      doc: {
        kind: "report",
        title: "Halden Mutual Marine — Hull Claim HM-M-2291",
        meta: [["Vessel", "GREY PETREL, 19 m stern trawler"], ["Owner / claimant", "Petra LUND, c/o Fishermen's Co-operative Hall, The Docks"], ["Date of loss", "17/03/2026"], ["Circumstances", "Flooding in heavy sea off Halden Light; vessel sank; crew of three rescued"], ["Sum claimed", "€340,000"], ["Survey", "Northline Survey Services Ltd. Fee €46,500"], ["Handler", "I. Kellan"], ["Status", "Under investigation"]],
        text: "Survey extract: 'Main engine: Volda 6-cylinder, in fair condition, inspected aboard.'\n\nIris's margin notes:\n'Co-op register: Petrel refitted 2019 with a BRANDT 8. Did anyone actually go aboard?'\n'Fee is 15x market. Who approved this? (GW. Again.)'\n'Lund angry, not evasive. Angry is not the same as guilty.'"
      }
    },
    {
      id: "ev-laptop", name: "Iris's work laptop, HM-LT-0417", key: false,
      summary: "Docked at her desk. Asset tag HM-LT-0417. Screen locks after 30 minutes idle.",
      doc: {
        kind: "object",
        title: "Company laptop on Iris Kellan's desk",
        meta: [["Asset tag", "HM-LT-0417"], ["IT sticker", "Screen lock after 30 min idle — Halden Mutual IT"], ["State", "Docked, lid closed, powered on"]],
        text: "The desktop version of her phone's messaging app is pinned to the taskbar, signed in. Anyone sitting at this desk while the screen was unlocked could send messages as Iris."
      }
    },
    {
      id: "ev-newsletter", name: "Company newsletter: the Helm Award", key: false,
      summary: "Whitlock's award: a solid brass ship's wheel, 18 cm across, on a granite base.",
      doc: {
        kind: "photo",
        title: "Halden Mutual Quarterly, Spring — 'Twenty-five years at the Helm'",
        text: "Head of Claims Graham Whitlock this spring received the company's Helm Award for twenty-five years' service: a solid brass ship's wheel, 18 cm across, with eight turned spoke-ends around the rim, mounted on a square polished granite base, 12 cm a side.\n\nPhoto caption: 'Graham at his desk, with the Helm in pride of place on the shelf behind him.' The photograph shows the wheel standing between three glass plaques and a framed photo of a yacht."
      }
    },
    {
      id: "ev-shelf-ring", name: "Gap on Whitlock's shelf", key: false,
      summary: "A clean 12 cm square in the dust where something heavy stood until recently.",
      doc: {
        kind: "photo",
        title: "Whitlock's office — award shelf",
        text: "Three glass plaques and a framed yacht photograph. Between them, a sharply edged square of clean wood, 12 cm a side, in an otherwise even film of dust. Whatever stood there was there for months and was moved within the last day or two."
      }
    },
    {
      id: "ev-carpet-patch", name: "Cleaned carpet in the archive", key: true,
      summary: "A freshly shampooed patch of grey loop-pile carpet at the end of archive aisle F.",
      doc: {
        kind: "photo",
        title: "4th floor file archive — end of aisle F",
        text: "Grey nylon loop-pile carpet, the same throughout the archive. One patch roughly 1 m across is visibly cleaner and still damp at the base, with a smell of carpet shampoo. The wall-mounted spill kit nearby has a broken seal; its log card's last entry reads 'March — coffee spill, Reception'. Nothing logged since. Sample taken for comparison with fibres from the body."
      }
    },
    {
      id: "ev-archive-file", name: "Archive file: claim 1406, Kittiwake", key: false,
      summary: "The first Northline claim: surveyor 'R. Dahl', fees approved by Whitlock, 'Expedite'.",
      doc: {
        kind: "report",
        title: "Archive box 1406 — Hull Claim HM-M-1406, KITTIWAKE",
        meta: [["Date of loss", "11/05/2023"], ["Surveyor", "Northline Survey Services Ltd., signed 'R. Dahl, MNSS'"], ["Fee", "€39,800"]],
        text: "Approval memo, typed, initialled in blue ink:\n'Survey fees approved in full. New panel firm — expedite payment, no further sign-off required. GW.'\n\nIris's sticky note on the front: 'MNSS does not exist. I checked. Who is R. Dahl?'"
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
            ["Tue", "14:28", "The woman stands, points at Iris, voice raised. Other customers look round."],
            ["Tue", "14:31", "The woman sits down again. They talk quietly. Iris writes in a small black notebook."],
            ["Tue", "14:40", "The woman leaves. Iris stays, writing, until 15:02."],
            ["Wed", "18:20", "Iris arrives alone, coat wet. Window table."],
            ["Wed", "18:41", "Pays by card."],
            ["Wed", "18:52", "Answers her phone. Listens more than she speaks, about two minutes. Afterwards sits very still."],
            ["Wed", "18:58", "Writes in the black notebook."],
            ["Wed", "19:05", "Makes a call, about six minutes. Shoulders drop; she nods while talking."],
            ["Wed", "19:24", "Leaves, turning uphill towards the Mercer Street tram stop (trams to the Financial Quarter)."]
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
        text: "FISHERMEN'S CO-OPERATIVE — OPEN MEETING\nWednesday, 19:30, Co-op Hall, The Docks\n'Insurance surveys: who is checking the checkers?'\nAll skippers and owners welcome. Tea from 19:00."
      }
    },
    {
      id: "ev-rota", name: "Anchor & Lamp clock cards and grill tickets", key: false,
      summary: "Marcus clocked in 15:52, out 23:04, and initialled grill tickets all evening.",
      doc: {
        kind: "report",
        title: "The Anchor & Lamp — kitchen records, Wednesday",
        meta: [["Clock card", "M. BELL — in 15:52, out 23:04"], ["Manager's note", "Short-staffed (Davey off sick). No breaks taken on grill."]],
        table: {
          cols: ["Ticket printed", "Station", "Initialled"],
          rows: [
            ["19:31", "Grill", "MB"], ["19:48", "Grill", "MB"], ["20:02", "Grill", "MB"], ["20:17", "Grill", "MB"],
            ["20:26", "Grill", "MB"], ["20:41", "Grill", "MB"], ["20:55", "Grill", "MB"], ["21:12", "Grill", "MB"],
            ["21:30", "Grill", "MB"], ["21:44", "Grill", "MB"], ["22:10", "Grill", "MB"], ["22:38", "Grill", "MB"]
          ]
        },
        text: "Each ticket is initialled by the cook when the dish leaves the pass."
      }
    },
    {
      id: "ev-coop-minutes", name: "Co-op meeting minutes", key: false,
      summary: "Petra signed in at 19:30 and spoke at 20:35 about Northline. Meeting ran to 21:50.",
      doc: {
        kind: "report",
        title: "Fishermen's Co-operative — Minutes of Open Meeting, Wednesday",
        meta: [["Opened", "19:30"], ["Closed", "21:50"], ["Attendance", "31 signatures (sheet attached), incl. P. Lund, GREY PETREL"]],
        text: "1. Fuel prices (19:35–20:30).\n2. Insurance surveys (20:35–20:55). P. Lund stated that no surveyor boarded her vessel, yet her claim includes a large survey fee. Asked whether others had been billed for surveys that never took place. J. Osei (CORMORANT) and K. Brandvold (TERN) reported the same firm: Northline. Secretary to write to the Marine Surveyors' Register.\n3. Harbour dues (21:00–21:45). P. Lund seconded the motion.\nMeeting closed 21:50."
      }
    },
    {
      id: "ev-hanna-messages", name: "Hanna's messages from Iris", key: true,
      summary: "Iris's real texts are formal and signed '— I'. The 23:12 text is not.",
      doc: {
        kind: "messages",
        title: "Messages: Hanna Kellan's phone, thread with 'Iris'",
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
            ["Tue 23:14", "Email out", "R. Achebe (personal account)", "Subject: Confidential — request to meet"],
            ["Wed 08:12", "Call out", "Hanna", "1 min 10 s"],
            ["Wed 12:40", "Call in (missed)", "Marcus", "—"],
            ["Wed 18:52", "Call in", "Graham Whitlock (mobile)", "2 min 14 s"],
            ["Wed 19:05", "Call out", "Hanna", "6 min 21 s"],
            ["Wed 23:12", "Message out", "Hanna", "'walking home the long way. need air. talk tmrw x' — see note"],
            ["Thu 06:33", "Message in", "Hanna", "?? since when do you walk anywhere at night. call me"]
          ]
        },
        text: "Theo's note: the 23:12 message was not typed on this phone. Server metadata: created Wed 20:51 on the linked desktop app, device name HM-LT-0417, with 'schedule send' set for 23:12. No other message in two years of history was ever scheduled."
      }
    },
    {
      id: "ev-badge-log", name: "Halden Mutual lobby badge log", key: true,
      summary: "Iris badged back in at 19:58 and never out. Nico out 19:52. Whitlock out 18:10.",
      doc: {
        kind: "report",
        title: "Halden Mutual — lobby access control, Wednesday (4th floor staff)",
        table: {
          cols: ["Name", "In", "Out", "In", "Out"],
          rows: [
            ["G. Whitlock", "08:15", "18:10", "—", "—"],
            ["N. Varga", "08:31", "19:52", "—", "—"],
            ["I. Kellan", "08:40", "17:38", "19:58", "(none)"],
            ["Six other claims staff", "08:20–09:05", "17:00–18:45", "—", "—"]
          ]
        },
        text: "Cleaning contractor attends Tuesdays and Fridays only. Night security patrols the exterior at 23:00 and 03:00.\nTheo's note: 'This is the lobby system only. The car park downstairs belongs to the building, not to Halden Mutual. Different system, different company.'"
      }
    },
    {
      id: "ev-garage-log", name: "Car park logs and traffic cameras", key: true,
      summary: "Whitlock's fob re-entered at 19:40. His car left the office car park at 22:04 and was on Quay Road at 22:17.",
      doc: {
        kind: "camera",
        title: "Harbour Point Tower car park + city traffic cameras (Theo Park)",
        table: {
          cols: ["Time", "Source", "Event"],
          rows: [
            ["Wed 19:40", "Car park pedestrian door", "Fob G-118 (registered: G. Whitlock, Halden Mutual) — entry"],
            ["Wed 22:04", "Car park exit barrier", "Bay 12 vehicle, green estate PH 62 KTR (G. Whitlock) — exit"],
            ["Wed 22:17", "Traffic camera, Quay Road west", "PH 62 KTR westbound"],
            ["Wed 22:31", "Traffic camera, Quay Road west", "PH 62 KTR eastbound"],
            ["Wed 22:38", "Harbour Club car park camera", "PH 62 KTR enters"]
          ]
        },
        text: "Theo's note: 'His car never left the office car park between 08:15 and 22:04. So he didn't drive to the Harbour Club from home. And Quay Road west of the cameras is a dead end at the Saltmarket Stairs.'"
      }
    },
    {
      id: "ev-northline-check", name: "Northline: company and bank records", key: true,
      summary: "Northline's director is Whitlock's brother-in-law. Its money goes to Whitlock's wife.",
      doc: {
        kind: "bank",
        title: "Northline Survey Services Ltd. — registry and account summary",
        meta: [["Registered", "2022, Eastgate (mailbox address)"], ["Director", "Rolf DAHL"], ["Marine Surveyors' Register", "No entry"], ["Records obtained", "Production order, Thu (DS Cruz)"]],
        table: {
          cols: ["Date", "Payer", "Payee", "Amount (€)"],
          rows: [
            ["06/06/2023", "Halden Mutual Marine", "Northline Survey Services", "39,800"],
            ["12/06/2023", "Northline Survey Services", "M. Whitlock", "27,860"],
            ["14/09/2023", "Halden Mutual Marine", "Northline Survey Services", "40,300"],
            ["20/09/2023", "Northline Survey Services", "M. Whitlock", "28,210"],
            ["…", "…", "…", "…"],
            ["02/04/2026", "Halden Mutual Marine", "Northline Survey Services", "46,500 (held: claim under investigation)"]
          ]
        },
        text: "Theo's note: 'Rolf Dahl is the brother of Margit Whitlock, née Dahl, married to Graham Whitlock since 1998. Northline has no staff, no surveyors and no other clients. Within a week of every fee, it pays seventy per cent on to an account in Margit Whitlock's name: €396,130 in three years.'"
      }
    },
    {
      id: "ev-autopsy", name: "Post-mortem report", key: true,
      summary: "One patterned blow, then moved. Fall injuries made after death. Grey carpet fibres. Death 19:30–21:30.",
      doc: {
        kind: "autopsy",
        title: "Medical Examiner's Office — Post-mortem Examination, Iris KELLAN",
        meta: [["Pathologist", "Dr. Anika Sorensen"], ["Examined", "Thu 10:00–13:30"], ["Case", "MC-26-0412"]],
        text: "1. Cause of death: a single blunt-force injury to the back of the head (right side), with depressed skull fracture. The injury is patterned: a curved edge consistent with a circle of about 18 cm diameter, interrupted at regular intervals by small rounded projections. Not consistent with the straight edge of a stone step.\n2. Abrasions to face, palms and knees show no vital reaction (no bleeding into the surrounding tissue). They were caused after death.\n3. Lividity: fixed pattern on the front, consistent with the position she was found in, plus a faint pattern across the shoulders and buttocks. She lay on her back on a flat surface for a period, likely one to three hours, before being placed face down.\n4. Trace: grey nylon loop-pile carpet fibres in the hair and in the wound margins; traces of a carpet-cleaning detergent on the left coat sleeve.\n5. Stomach: partly digested fish soup and bread. Digestion rates vary widely; this supports, but cannot fix, a time of death within a few hours of an early-evening meal.\n6. Time of death, revised: the scene estimate assumed the body lay outdoors all night. Allowing for a first period indoors at room temperature, and a period wrapped, the temperature reading of 06:52 fits death between 19:30 and 21:30.\nConclusion: homicide. She was killed indoors and moved to the Saltmarket Stairs afterwards."
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
    { id: "fact-whitlock-alibi", text: "Whitlock says: left 18:10, tram home, at home alone, then drove from home to the Harbour Club, arriving 22:40.", key: true },
    { id: "fact-whitlock-call", text: "Whitlock says his 18:52 call to Iris was about the quarterly figures.", key: false },
    { id: "fact-revised-tod", text: "Revised time of death: between 19:30 and 21:30 on Wednesday. Killed indoors, then moved.", key: true },
    { id: "fact-kill-site", text: "Iris was killed in the 4th-floor file archive at Halden Mutual.", key: true }
  ],

  /* ================================================================ DEDUCTIONS */
  deductions: [
    {
      id: "ded-clean-shoes", items: ["ev-shoes", "ev-weather"],
      title: "She never walked down those steps",
      text: "It rained until 21:40 and the stairs ran with mud all night, yet her soles are clean and dry. Iris did not walk to that landing. Someone put her there.",
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
      text: "The 23:12 message was created at 20:51 on device HM-LT-0417: the laptop docked at Iris's desk on the 4th floor. Whoever wrote it was sitting at her desk at 20:51, and her screen locks after 30 minutes idle.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-the-call", items: ["ev-phone-extract", "fact-hanna-call"],
      title: "Whitlock called her back to the office",
      text: "At 18:52 Whitlock rang Iris for two minutes. Thirteen minutes later she told Hanna she was going back to work because 'he says he can explain'. The camera shows her heading for the Financial Quarter tram. The quarterly figures story does not fit.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-alibi-collapse", items: ["ev-garage-log", "fact-whitlock-alibi"],
      title: "Whitlock's evening is a lie",
      text: "He said he went home by tram and drove to the club from home. In fact he slipped back into the building through the car park at 19:40, his car never left until 22:04, and at 22:17 it was on the dead-end stretch of Quay Road below the Saltmarket Stairs, exactly when the late shop camera saw a dark estate stop there.",
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
      text: "The wound is a curved edge about 18 cm across, broken by regular rounded projections. Whitlock's Helm Award is a brass ship's wheel 18 cm across with eight spoke-ends on the rim. And it is no longer on his shelf.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-motive", items: ["ev-iris-copies", "ev-northline-check"],
      title: "Northline is Whitlock",
      text: "Fourteen inflated survey fees, all approved and expedited by Whitlock, paid to a firm run by his brother-in-law that passes the money to his wife. Iris was taking it to Compliance at 09:00 on Thursday. Whitlock knew about the meeting by 16:00 on Wednesday.",
      key: true, grants: [], requires: []
    },
    {
      id: "ded-marcus-cleared", items: ["ev-rota", "fact-revised-tod"],
      title: "Marcus was on the grill",
      text: "Between 19:30 and 21:30 Marcus initialled a grill ticket every fifteen minutes on a short-staffed line with no breaks. His walk past the stairs at 23:16 came long after she was dead and placed there. His lie was about embarrassment, not murder.",
      key: false, grants: [], requires: []
    },
    {
      id: "ded-petra-cleared", items: ["ev-coop-minutes", "fact-revised-tod"],
      title: "Petra was at the co-op meeting",
      text: "From 19:30 to 21:50 Petra was in a hall with thirty witnesses, and at 20:35 she stood up to accuse Northline in public. She was furious with Iris, but she was also on the same side, and she was nowhere near Iris when Iris died.",
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
      id: "rq-badge", label: "Halden Mutual lobby badge records, Wednesday", requires: ["ded-sent-from-office"],
      delayMinutes: 45,
      result: "Lobby badge log's in. Iris came back at 19:58 and never badged out. On paper, the only person in that office at 20:51 was her. Paper is only the front door, mind.",
      grants: ["ev-badge-log"]
    },
    {
      id: "rq-garage", label: "Building car park logs and traffic cameras", requires: ["ev-badge-log"],
      delayMinutes: 60,
      result: "Building management finally answered. Car park door and barrier logs, plus traffic cameras for every car registered to a 4th-floor badge holder. One of them is interesting. Very interesting.",
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
      prompt: "A fireproof document box with a four-digit combination wheel. The fridge note said: 'Box: Petrel's loss date, DDMM, read right to left.' Enter the four digits.",
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
    text: "Dr. Sorensen rings Lena from the mortuary and Lena puts her on speaker. One blow to the back of the head, with a curved, patterned edge that no stone step ever made. The scrapes from the 'fall' were made after death. Grey carpet fibres in her hair. And because she spent her first hours indoors, the temperature reading means something else entirely: she died between 19:30 and 21:30. Lena hangs up and looks at the board for a long time. 'Everyone we've checked has an alibi for eleven o'clock,' she says. 'Nobody's been asked about eight.'",
    art: "intro-twist",
    grants: ["ev-autopsy", "fact-revised-tod"],
    unlocks: []
  },

  hintTokensFrom: ["ded-clean-shoes", "ded-text-not-hers", "ded-sent-from-office", "ded-the-call", "pz-docbox", "pz-archive"],

  /* ================================================================ HINTS (Lena) */
  hints: [
    {
      id: "hint-scene", requires: [], until: ["ded-clean-shoes"],
      text: "You looked at her face. Look at her feet. Then look at what the sky was doing last night. The weather sheet is on my whiteboard, where I left it for you."
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
      id: "hint-building", requires: ["ded-sent-from-office"], until: ["ev-garage-log"],
      text: "If that text was written in the building, the building knows who was in it. And a tower with a car park has more than one door. Ask whoever left last."
    },
    {
      id: "hint-carpet", requires: ["tw-autopsy"], until: ["fact-kill-site"],
      text: "Fibres don't walk. Somewhere near her work there is grey carpet that someone has been on their knees cleaning."
    },
    {
      id: "hint-weapon", requires: ["tw-autopsy"], until: ["ded-weapon"],
      text: "Sorensen has drawn you the edge of the weapon. Somebody in that office has been photographed with something that shape. Check what's pinned on the walls."
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
      { id: "m-career", text: "Fear that she would be promoted over him and expose his weak work." }
    ],
    motive: "m-exposure",
    methods: [
      { id: "md-staged", text: "Struck once from behind with a heavy brass object in the Halden Mutual archive, driven to the Saltmarket Stairs and arranged to look like a fall, with a scheduled text to fake the time." },
      { id: "md-pushed", text: "Pushed down the Saltmarket Stairs during a late-night confrontation." },
      { id: "md-mugged", text: "Attacked on the stairs by someone who wanted her bag, and left where she fell." },
      { id: "md-followed", text: "Followed from the Tidewater Café and struck from behind on the stairs on her way to the tram." }
    ],
    method: "md-staged",
    proofs: ["ded-alibi-collapse", "ded-sent-from-office", "ded-the-call", "ded-killed-in-office", "ded-weapon", "ded-motive", "ev-garage-log"],
    proofsNeeded: 2,
    success: {
      title: "The Helm",
      text: "Interview Room 2. Whitlock's solicitor reads the car park log twice and stops taking notes. Julian does not perform. He lays the pages down one at a time: the 18:52 call, the 19:40 door, the 20:51 text, the 22:04 barrier, the carpet, the photograph of the brass wheel on the shelf. Whitlock looks at the photograph longest. 'She was going to walk into Ruth Achebe's office and say my name like a diagnosis,' he says at last. 'Twenty-five years. I asked her to come back so I could explain. I only wanted her to listen.' He stops. 'She turned round to leave.' The award is found the next day, wrapped in a dust sheet in his garage at home. Lena writes the charge in her neat block capitals. In the corridor afterwards she says, without looking at Julian, 'Good work.' Then, because she is Lena: 'Don't get used to it.'"
    },
    failure: {
      title: "The wrong door",
      text: "The charge holds for nine days. Then the defence asks the questions you didn't, and the case comes apart in a single morning in court. Someone who did not kill Iris Kellan spent those nine days in a cell, and will be stopped in the street for the rest of their life. Graham Whitlock sends flowers to the funeral and a card in his own handwriting. Hanna Kellan stops returning Lena's calls. Lena closes the file on her desk and leaves her hand on it. 'We reopen,' she says. 'Quietly. And this time we read the evidence, not the people we already decided about.'"
    }
  },

  /* ================================================================ REOPEN */
  reopen: {
    intro: "Three weeks later, the charge has collapsed and the case is back on Lena's desk. Three weeks is a long time. Whoever killed Iris Kellan has had time to tidy up, records have aged out, and people who talked freely the first time have had time to be frightened. Same victim. Same city. The trail will not be where you left it.",
    evidence: {
      "ev-garage-log": {
        summary: "Barrier records gone, but traffic cameras and a backup still place Whitlock's car on Quay Road at 22:17.",
        doc: {
          title: "Car park records (partly purged) + city traffic cameras (Theo Park)",
          table: {
            cols: ["Time", "Source", "Event"],
            rows: [
              ["Wed 19:40", "Building management backup tape, pedestrian door", "Fob G-118 (G. Whitlock) — entry"],
              ["Wed 22:04", "Car park exit barrier", "Not available: barrier logs auto-deleted after 14 days"],
              ["Wed 22:09", "Traffic camera, Harbour Point Tower exit ramp", "Green estate PH 62 KTR (G. Whitlock) leaves the tower ramp"],
              ["Wed 22:17", "Traffic camera, Quay Road west", "PH 62 KTR westbound"],
              ["Wed 22:31", "Traffic camera, Quay Road west", "PH 62 KTR eastbound"],
              ["Wed 22:38", "Harbour Club car park camera", "PH 62 KTR enters"]
            ]
          },
          text: "Theo's note: 'The building only keeps barrier logs for fourteen days, so those are gone. But the city keeps traffic cameras for ninety, and the tower's exit ramp is on one. He drove out of his office car park at 22:09, not from home, and he went down the dead end below the Saltmarket Stairs.'"
        }
      }
    },
    hotspots: {
      "h-of-shelf": {
        text: "Through the glass of the corner office: the shelf of awards behind the desk. The brass ship's wheel is back between the glass plaques, glowing as if it had just been polished. Up close it smells of metal polish, and a brand-new green felt pad has been glued under its granite base.",
        grants: ["ev-award-polished"]
      },
      "h-of-carpet": {
        text: "At the end of archive aisle F, one carpet tile about a metre across is a brighter grey than the rest, its pile not yet trodden flat. Pinned to the archive door is a facilities work order.",
        grants: ["ev-new-tile"]
      }
    },
    questions: {
      "q-nico-badge": {
        a: "Okay. I was printing my CV; I've got an interview elsewhere. The car? I... I don't really remember. I wasn't paying attention. But there's something. Last week Graham took me for lunch. He's never done that. He said there'd be a senior adjuster post soon, and then he said, 'You remember I left at six that Wednesday, don't you? People get confused.' I said yes. I didn't know what else to say.",
        cue: "On the car his answers go vague and he watches the glass office again. On the lunch he is suddenly precise: the day, the restaurant, the exact words. He was not trying to remember the lunch. He has not been able to forget it.",
        grants: ["ev-nico-statement"]
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
          text: "Freshly polished: no tarnish in the crevices of the spoke-ends, where three years of tarnish would be expected. A new green felt pad has been glued under the base; the spring newsletter photograph shows bare granite. Taken for forensic examination: under the new felt, a dark residue in the joint between brass and granite."
        }
      },
      {
        id: "ev-new-tile", name: "Replaced carpet tile and work order", key: true,
        summary: "Archive carpet tile replaced, on a work order raised by Whitlock the morning after.",
        doc: {
          kind: "report",
          title: "Harbour Point Tower Facilities — Work Order 4471",
          meta: [["Raised by", "G. Whitlock, Halden Mutual"], ["Raised", "Friday 07:12"], ["Location", "4th floor archive, end of aisle F"], ["Completed", "Saturday"]],
          text: "Request: 'Replace one carpet tile, coffee spill. Urgent, please, before Monday.'\nFacilities note: old tile bagged for the skip; skip collected Monday. Contractor comment: 'No coffee smell. Tile had been shampooed already. Damp underneath.'\nThe surrounding tiles are grey nylon loop-pile, the same carpet throughout the archive."
        }
      },
      {
        id: "ev-nico-statement", name: "Nico's statement: the lunch", key: true,
        summary: "Whitlock took Nico to lunch, hinted at a promotion, and told him to remember 'I left at six'.",
        doc: {
          kind: "statement",
          title: "Witness statement — Nicolas VARGA",
          meta: [["Taken by", "DS L. Cruz"], ["Present", "J. Marsh (consultant)"]],
          text: "'On the Tuesday, about two weeks after Iris died, Graham Whitlock invited me to lunch at Calloway's on Dock Street. He has never done that before. He told me a senior adjuster post would be coming up. As we were leaving he said, \"You remember I left at six that Wednesday, don't you? People get confused.\" I said yes. I had not said anything to him about that Wednesday. Nobody had asked me about his times. I was frightened, which is why I was vague about the car park when you asked me.'"
        }
      }
    ],
    addDeductions: [
      {
        id: "ded-award-cleaned", items: ["ev-award-polished", "ev-autopsy"],
        title: "The weapon came back clean",
        text: "The wound is a curved edge 18 cm across with regular rounded projections. The Helm is a brass wheel 18 cm across with eight spoke-ends. Someone has polished it, padded its base and put it back, and there is residue in the joint they couldn't reach.",
        key: true, grants: [], requires: []
      },
      {
        id: "ded-killed-in-office-r", items: ["ev-autopsy", "ev-new-tile"],
        title: "She died in the archive",
        text: "Grey loop-pile fibres and carpet detergent on her body. In the archive, one tile of that carpet was shampooed, then replaced on Whitlock's own urgent work order the morning after, for a coffee spill that didn't smell of coffee.",
        key: true, grants: ["fact-kill-site"], requires: []
      },
      {
        id: "ded-tampering", items: ["ev-nico-statement", "fact-whitlock-alibi"],
        title: "Whitlock is coaching a witness",
        text: "Nobody had told Whitlock that his leaving time mattered, yet he took Nico to lunch to fix 'I left at six' in his memory, and dangled a promotion while he did it. People who were at home all evening do not need witnesses for six o'clock.",
        key: true, grants: [], requires: []
      }
    ],
    removeDeductions: ["ded-killed-in-office"],
    proofs: ["ded-alibi-collapse", "ded-sent-from-office", "ded-the-call", "ded-killed-in-office-r", "ded-award-cleaned", "ded-weapon", "ded-motive", "ded-tampering", "ev-garage-log"]
  },

  /* ================================================================ DEBRIEF */
  debrief: [
    {
      flag: "ded-clean-shoes",
      title: "The clean boots", technique: "Staging recognition",
      explanation: "Offenders sometimes arrange a scene to tell a story: a fall, a robbery, a suicide. Investigators test the story against small physical facts it cannot control, such as weather, mud, footwear, the order of injuries. Here the scene said 'she fell walking home', but her soles were clean on a staircase running with mud.",
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
      explanation: "There is no single gesture that means someone is lying. What is useful is change: how a person answers easy, neutral questions compared with the questions that matter. Whitlock was brief and relaxed about work, then gave a long, over-detailed account of exactly the hours that needed covering. A change like that is a signal to check the account, not a conclusion.",
      tip: "Before judging how someone answers a hard question, notice how they answer a few easy ones. Judge the difference, not the behaviour."
    },
    {
      flag: "fact-marcus-boat",
      title: "Marcus lied too", technique: "Lies have many motives (the Othello error)",
      explanation: "Marcus lied about seeing Iris on Tuesday, and Petra lied about being out on Wednesday. Both lies were real, and neither was about murder: embarrassment and fear. Treating an anxious or lying person as guilty because they are anxious or lying is a well-known trap, sometimes called the Othello error. A lie proves a lie. It tells you to find out why.",
      tip: "When you catch someone in a lie, ask what else they might be protecting before deciding what the lie means."
    },
    {
      flag: "q-nico-badge",
      title: "Checkable details", technique: "Verifiable detail",
      explanation: "Accounts that are truthful often contain details that can be checked: times, places, other people, records. Research on the 'verifiability approach' suggests liars tend to avoid such details because they can be checked. When Nico corrected his story, it came with checkable specifics: a printer, an interview, what he saw and why he noticed. Whitlock's story about the award came with no engraver, no ticket and no date.",
      tip: "Ask for details that could be checked, then check one. Notice who offers them freely and who goes vague."
    },
    {
      flag: "tw-autopsy",
      title: "Eleven o'clock was a fiction", technique: "Time of death is an estimate",
      explanation: "Body-temperature estimates depend on assumptions about where the body was and what covered it. The scene estimate assumed she lay outside all night; once the pathologist knew she had been indoors and wrapped, the same reading pointed hours earlier. Injuries made after death show no bleeding into the surrounding tissue, which is how the 'fall' was exposed.",
      tip: "Treat any time-of-death figure as a range resting on assumptions. If the assumptions change, the range changes."
    },
    {
      flag: "ded-alibi-collapse",
      title: "The car that never went home", technique: "Alibi verification and timeline consistency",
      explanation: "An alibi only matters if it covers the real time of the crime, and only if independent records agree with it. Whitlock's alibi was real but covered the wrong hours. His account of the right hours fell apart against door logs, a barrier record and traffic cameras that nobody could coach.",
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
