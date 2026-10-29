// FIXED keyword lists for the safety layer (layer "keywords").
// Languages: English (en), French (fr), Arabic script (ar: MSA + Lebanese + Gulf) and
// Arabizi (Latin letters + digits). Arabic and Arabizi entries are matched on the
// consonant-skeleton view from server/normalize.ts, so one entry covers many spellings.
// English/French entries are matched as whole words/phrases on the normalized text.
//
// IMPORTANT: these lists are a starting point written without native-speaker review.
// Two Lebanese native speakers must review and extend them (safety review gate G5).
// Gentle false alarms are acceptable; silent misses are not.

export type KeywordGroup = {
  en?: string[];
  fr?: string[];
  ar?: string[];
  arabizi?: string[];
};

/** Child says they want to hurt / kill themselves or die. */
export const SELF_HARM: KeywordGroup = {
  en: [
    "kill myself", "killing myself", "want to die", "i want to die", "wanna die", "want to die", "wanna die", "want to be dead", "wish i was dead",
    "wish i were dead", "hurt myself", "hurting myself", "cut myself", "end my life", "suicide",
    "don't want to live", "dont want to live", "do not want to live", "better off dead", "die tonight",
    "i hate myself", "hate myself",
    "nobody would miss me", "no one would miss me", "nobody will miss me", "no one will miss me",
    "go to sleep and never wake up", "sleep forever and never wake",
    "wish i was never born", "wish i wasn't born", "wish i wasnt born", "never been born",
    "happier if i wasn't here", "happier if i wasnt here", "better if i wasn't here", "better if i wasnt here", "better without me",
    "stop existing", "don't want to exist", "dont want to exist", "want to disappear forever",
    "want everything to stop", "want it all to stop", "goodbye letter", "jump from the roof", "jump off the roof",
    "want to be ded", "wanna be ded", "until it bleeds", "cut my skin", "cut my arm", "i hit myself when", "i hit myself because", "hurt myself on purpose",
    "not feel anything anymore", "make me sleep forever", "how many pills would", "how many pills to", "how much medicine can", "too many pills",
  ],
  fr: [
    "me tuer", "je veux mourir", "envie de mourir", "me faire du mal", "suicide", "me suicider",
    "plus envie de vivre", "je veux mourir", "je vais me tuer",
    "je me deteste", "je me hais",
    "disparaitre pour toujours", "je veux disparaitre", "si je mourais", "me faire mal", "je me suis coupe", "je me suis coupee",
    "jamais ne", "pas etre ne", "pas etre nee",
  ],
  ar: [
    "اقتل نفسي", "بقتل نفسي", "انتحر", "انتحار", "بدي موت", "بدي اموت", "ابي اموت", "ابغى اموت",
    "اريد ان اموت", "اريد الموت", "اذي نفسي", "اؤذي نفسي", "ما بدي عيش", "لا اريد ان اعيش",
    "نفسي اموت", "اجرح نفسي", "اقتل حالي", "بدي اقتل حالي", "بقتل حالي", "اذي حالي", "بدي اذي حالي",
    "ما عاد بدي عيش", "لو متت", "اذا متت", "احسن لو متت", "بتمنى موت", "اتمنى الموت", "اريد ان انتحر",
    "انا بكره حالي", "بكره نفسي", "اكره نفسي", "اكره حالي",
    "بدي روح لعند تيتا بالسما", "بدي روح عند تيتا بالسما", "بدي روح لعند جدو بالسما", "بدي روح عند جدو بالسما",
    "ما حدا رح يشتقلي", "ما حدا رح يشتاقلي", "ما حدا بيشتقلي", "لا احد سيشتاق لي",
    "بدي اختفي", "ما بدي كون موجود", "ما عاد بدي كون موجود", "ضربت راسي بالحيط", "بضرب راسي بالحيط", "بجرح حالي",
    "رسالة وداع", "ليتني لم اولد", "ريتني ما انخلقت", "يا ريتني ما خلقت",
  ],
  arabizi: [
    "a2tol nafse", "a2tol nafsi", "bi2tol nafse", "ente7ar", "bade mout", "badde mout", "bdde mout",
    "beddi mout", "abi amoot", "abgha amoot", "ma bade 3ish", "ma badde 3ish", "2azi nafse",
    "b2de mout", "b2de moot", "e2tol 7ale", "a2tol 7ale", "i2tol 7aleh", "2e2tol 7ale", "ma 3ad badde 3ish",
    "ma 3ad bade 3ish", "ma3ad bade 3ish", "ma3ad badde 3ish", "2azze 7ale", "2azi 7ale", "low mitt", "iza mitt",
    "ma 3ad badde 3ich", "ma 3ad bade 3ich", "ma3ad badde 3ich", "ma3ad bade 3ich", "ma bade 3ich", "ma badde 3ich",
    "ma 3ad bade 3eesh", "ma 3ad badde 3eesh", "ma3ad bade 3eesh",
    "ana bekrah 7ale", "ana bekra 7ale", "ana bikrah 7ale", "ana bekreh 7ale", "bekrah nafse", "akrah nafsi", "ekrah nafse",
    "rou7 3and teta bel sama", "rou7 la3and teta bel sama", "rou7 3and jeddo bel sama",
    "ma 7ada rah yeshta2le", "ma 7ada ra7 yeshta2le", "ma 7ada ra7 yesht2le", "ma 7ada bisht2le",
    "badde 2ekhtefe", "bade 2ekhtefe", "badde e5tefe", "ma 3ad badde koun mawjoud", "ma badde koun mawjoud",
    "ma 3ad bade koun mawjoud", "ma fi2 abadan", "ma 2oum abadan", "ya retne ma khole2et",
  ],
};

/**
 * Child asks where to get help, a helpline or who to call, or says they need help now (not
 * about schoolwork). Shown the help screen from the app's checked table, never AI numbers.
 */
export const HELP_SEEKING: KeywordGroup = {
  en: [
    "helpline", "help line", "hotline", "kids helpline", "child helpline", "number for kids", "number for children",
    "who do kids call", "who can i call", "who do i call", "who should i call", "who can i talk to",
    "i need help now", "need help now", "i need help right now",
  ],
  fr: ["qui j'appelle", "qui appeler", "qui je peux appeler", "numero pour les enfants", "j'ai besoin d'aide maintenant", "ligne d'ecoute"],
  ar: [
    "رقم الشرطة", "رقم البوليس", "خط مساعدة", "خط المساعدة", "خط مساعده", "رقم المساعدة", "رقم مساعدة", "خط نجدة", "مين بحكي", "مين بتصل", "لمين بحكي",
    "بدي احكي مع حدا", "بدي مساعدة هلق", "بدي مساعده هلق", "احتاج مساعدة الان", "بمن اتصل", "من اكلم",
    "رقم للاطفال", "رقم الاطفال", "116 111",
  ],
  arabizi: [
    "ra2m el police", "ra2m el shorta", "meen be7ki", "min be7ki", "la meen be7ki", "meen bettesel", "min bettasel",
    "bade msa3de hala2", "badde msa3de halla2", "ra2m el msa3de",
    "ra2m la wlad", "ra2m lal wlad", "ra2m lal atfal", "7ada redd 3al ra2m", "7ada byerod 3al ra2m",
  ],
};

/** Child tells that someone hurts / hits / touches them (abuse disclosure). */
export const DISCLOSURE_HARM: KeywordGroup = {
  en: [
    "hits me", "hit me", "hitting me", "beats me", "beat me", "beating me", "hurts me", "hurt me",
    "hurting me", "touches me", "touched me", "touching me", "touch my private", "touches my private",
    "kicks me", "kicked me", "slaps me", "slapped me", "burns me", "locks me", "locked me in",
    "chokes me", "pinches me", "makes me take off", "take off my clothes", "abuse", "abused me",
    "wants to kill me", "threatens me", "threatened me",
    "asked for my photo", "asked for a photo", "wants my photo", "asked me to send", "send him a photo",
    "send her a photo", "asked me for pictures", "wants to meet me", "touched my private", "touched my privates",
    "touchd me", "touchd my", "said i should die", "told me to die", "told me to kill myself", "go die",
    "someone hurts me", "someone is hurting me",
    "send me ur foto", "send me ur pic", "send me ur photo", "send me ur picture", "send ur foto", "send me a foto", "send him ur pic",
    "send me your foto", "asked for my foto", "wants my foto",
    "if i tell anyone", "if i tell anybody", "post my pic", "post my picture", "post my photo", "send more pics", "send more pictures",
    "get in his car", "get in her car", "into his car", "meet him alone", "meet me alone", "photos of adults", "pictures of adults",
    "people with no clothes", "naked people", "doesn't give me food", "doesnt give me food", "don't give me food", "left me alone at home", "bully me", "bullying me", "bullies me",
    "don't eat so i don't get fat", "dont eat so i dont get fat", "so i don't get fat", "so i dont get fat", "so i won't get fat",
    "boy bit me", "girl bit me", "kid bit me", "he bit me", "she bit me", "brother bit me", "sister bit me", "bit me and it bled", "made me bleed",
    "no food at home", "nothing to eat at home",
  ],
  fr: [
    "me frappe", "m'a frappe", "me bat", "me touche", "m'a touche", "me fait mal", "m'a fait mal",
    "m'enferme", "me tue", "va me tuer", "me menace", "veut ma photo", "me tape", "me tapent", "me frappent",
    "me fait du mal", "m'a tape", "me touche la",
    "monter dans sa voiture", "photos bizarres", "photos d'adultes", "me rencontrer seul", "me rencontrer seule",
    "je ne mange plus", "me trouve grosse", "me trouve gros",
    "m'a mordu", "me mord", "rien a manger a la maison",
  ],
  ar: [
    "يضربني", "بيضربني", "ضربني", "عم يضربني", "يلمسني", "بيلمسني", "لمسني", "يؤذيني", "بيأذيني",
    "اذاني", "يعذبني", "بيعذبني", "يحبسني", "بيحبسني", "يرفسني", "يكويني", "يقرصني", "يخنقني",
    "يشلحني", "يتحرش", "تحرش", "يهددني", "بيهددني", "طلب صورتي",
    "بدو صورتي", "بدها صورتي", "طلب مني صورة", "ضربتني", "بتضربني", "تضربني", "عم تضربني", "وجعني",
    "بيوجعني", "بتوجعني", "عم يوجعني", "عم توجعني", "اذتني", "بتأذيني", "لمستني", "بتلمسني",
    "ما تقول لاهلك", "ما تقول لأهلك", "الا اخبر اهلي", "ان لا اخبر اهلي", "اقابله وحدي", "بدو يشوفني", "وبدو يشوفني", "صور عيب",
    "ما بتعطيني اكل", "ما بيعطيني اكل", "ما عم اكل لانو", "بدي صير رفيعة", "تركوني لحالي", "بيهددني",
    "ما في اكل بالبيت", "ما اكلت من يومين", "ما اكلنا من يومين", "ما في شي ناكل", "لا يوجد طعام في البيت",
  ],
  arabizi: [
    "byedrabne", "byedrabni", "yedrabne", "yedrabni", "darabne", "darabni", "byelmesne", "byelmesni",
    "yelmesne", "lamasne", "lamasni", "bye2zine", "bye2zini", "ye2zine", "bi3azebne", "byi7bosne",
    "yetharash", "ta7arosh", "bihaddedne",
    "talab soorte", "talab sourte", "baddo soorte", "baddo sourte", "darbetne", "darabetne", "darbitne",
    "btedrabne", "btidrabne", "wajja3ne", "bewaj3ne", "btewaj3ne", "btwaj3ne", "lamasetne", "btelmesne",
    "ma t2oul la ahlak", "ma t2oul la ahlik", "sowar 3ayb", "sowar 3eib", "eb3atlo sowartak", "eb3atle sowartak",
    "la ghorfto wa7dak", "2e3de 7adde", "trakoune la wa7de", "trakouni la wa7di", "3am yhaddedne",
    "ma fi akel bel bet", "ma fi akel bel beit", "ma akalet men yomen", "ma akalna men yomen",
  ],
};

/** An adult asked the child to keep a secret / not tell (grooming / abuse signal). */
export const SECRECY: KeywordGroup = {
  en: [
    "keep a secret", "our secret", "our little secret", "don't tell anyone", "dont tell anyone",
    "not to tell", "told me not to tell", "said not to tell", "don't tell your mom", "don't tell mom",
    "don't tell your parents", "keep it between us",
    "special secret", "not tell my parents", "not to tell my parents", "dont tell your parents",
  ],
  fr: ["notre secret", "ne dis a personne", "ne le dis a personne", "pas le dire", "garder le secret", "garder un secret", "le dis pas a tes parents"],
  ar: [
    "سر بيننا", "سر بيناتنا", "لا تقول لحدا", "ما تقول لحدا", "ما تقولي لحدا", "لا تخبر احدا",
    "ما تخبر احد", "خليها سر", "خليه سر", "لا تقولي لماما", "ما تقول لامك",
    "ما خبر حدا", "ما خبّر حدا", "قلي ما خبر", "ما تخبر حدا", "الا اخبر", "عنا سر",
  ],
  arabizi: ["sir baynetna", "ma t2oul la7ada", "ma t2ole la7ada", "khaliya sir", "khalliha sir", "la t2oul la7ada",
    "3anna sir", "ma lazem 2oul la mama", "ma lezem 2oul la mama", "ma t2oul la mama", "ma t2oul la baba"],
};

/** Fear, war fear, displacement, grief and strong sadness (calm route, 1564, never police). */
export const FEAR_DISTRESS: KeywordGroup = {
  en: [
    "scared of the bombs", "i'm scared", "im scared", "i am scared", "so scared",
    "very scared", "i'm afraid", "i am afraid", "terrified", "we had to leave our house",
    "had to leave our home", "my house was destroyed", "will we die", "are we going to die",
    "died in the war", "i'm very sad", "i am very sad", "so sad", "nobody loves me", "i'm lonely",
    "i cry every", "can't stop crying",
    "scared to go home", "afraid to go home", "scared of going home", "scared to go back home",
    "don't want to go home", "dont want to go home", "do not want to go home",
    "is my teta in heaven", "is my grandma in heaven", "he is not coming back", "she is not coming back", "my heart is broken",
  ],
  fr: [
    "j'ai peur", "tres peur", "je suis triste", "tres triste", "personne ne m'aime", "le coeur brise",
  ],
  ar: [
    "خايف", "خايفة", "خايفه", "اخاف", "انا خايف", "تركنا بيتنا", "سنموت", "هل سنموت", "حنموت", "رح نموت", "هربنا من البيت",
    "رح نموت", "حنموت", "زعلان كتير", "حزين جدا", "حزينة جدا", "ما حدا بيحبني", "لا احد يحبني",
    "بكي كل يوم", "بيخوفني", "بتخوفني", "بتخوف", "قلبي مكسور", "صار بالسما", "اخذ الله",
    "خايف روح عالبيت", "خايف ارجع عالبيت", "ما بدي روح عالبيت", "ما بدي ارجع عالبيت", "اخاف ارجع الى البيت",
  ],
  arabizi: [
    "khayef", "khayfe", "khayfi", "5ayef", "5ayfe", "a5af", "ra7 nmout", "rah nmout", "ra7 nmoot",
    "rah nmoot", "ze3lan ktir",
    "ma 7ada bi7ebne", "bkhaf", "ma 3am b2der nem", "2albe maksour", "albe maksour", "ma 3ad fi tshoufna",
    "khayef rou7 3al bet", "khayfe rou7 3al bet", "ma bade rou7 3al bet", "ma badde rou7 3al bet", "ma bade erja3 3al bet",
  ],
};

/** Words that mean "someone at home / in the family". If present with a disclosure, the
 *  parent must NOT be alerted (reviewer queue only). Matched as whole words. */
export const HOME_TERMS: KeywordGroup = {
  en: [
    "dad", "daddy", "father", "papa", "mom", "mommy", "mum", "mummy", "mother", "mama", "brother",
    "sister", "uncle", "aunt", "auntie", "grandpa", "grandma", "grandfather", "grandmother", "cousin",
    "stepdad", "stepmom", "stepfather", "stepmother", "at home", "my family", "nanny", "maid",
    "driver", "parents", "my parent",
  ],
  fr: ["papa", "maman", "pere", "mere", "frere", "soeur", "oncle", "tante", "cousin", "cousine", "a la maison", "grand pere", "grand mere"],
  ar: [
    "بابا", "ابي", "ابوي", "ابويا", "بيي", "امي", "ماما", "امّي", "اخي", "خيي", "اخوي", "اختي", "خيتي",
    "عمي", "عمو", "خالي", "خالو", "عمتي", "خالتي", "جدي", "جدو", "ستي", "تيتا", "جدتي", "البيت",
    "بالبيت", "بيتنا", "اهلي", "عيلتي", "الخادمة", "الشغالة", "السواق", "المربية", "مرت ابي", "زوج امي", "والدي", "والدتي", "ابوي",
  ],
  arabizi: [
    "baba", "bayye", "bayyi", "abouye", "mama", "emme", "emmi", "ummi", "khayye", "khayyi", "akhoui",
    "ekhte", "ekhti", "3ammo", "3amme", "3ammi", "khalo", "khalto", "khale", "jeddo", "teta", "sitti",
    "bel bet", "bel beit", "bi beit", "fil bayt", "ahle", "ahli",
  ],
};

/** Words that clearly point outside the family (stranger, school, online). */
export const OUTSIDE_TERMS: KeywordGroup = {
  en: ["stranger", "online", "in a game", "at school", "classmate", "a man", "a boy at school", "a girl at school", "on the internet", "someone online"],
  fr: ["un inconnu", "en ligne", "a l'ecole"],
  ar: ["غريب", "بالمدرسة", "في المدرسة", "اونلاين", "عالانترنت", "رفيقي بالصف"],
  arabizi: ["gharib", "8arib", "bel madrase", "bil madrase", "online"],
};

/** Child shares (or is asked for) private details. Regexes for numbers/emails live in safety.ts. */
export const PERSONAL_DATA: KeywordGroup = {
  en: [
    "my full name", "my last name", "my surname", "my family name", "my school is", "my school's name",
    "i go to school at", "i live in", "i live at", "my address", "my phone", "my number is",
    "my mom's number", "my dad's number", "send you a photo", "send a picture of me", "picture of me",
    "photo of me", "my photo", "my picture",
  ],
  fr: ["mon nom de famille", "mon adresse", "j'habite a", "mon ecole s'appelle", "mon numero"],
  ar: [
    "اسم عائلتي", "اسم عيلتي", "اسمي الكامل", "مدرستي اسمها", "اسم مدرستي", "عنواني", "ساكن ب",
    "ساكنة ب", "اسكن في", "رقم تلفوني", "رقم تلفوني هو", "رقم هاتفي", "رقمي هو", "صورتي", "صورة الي",
  ],
  arabizi: ["esm 3ayelte", "madraste esma", "esm madraste", "3enwane", "saken b", "sekne b", "ra2m telefone", "ra2me"],
};

/** Adult / sexual topics (polite fixed refusal). Kept short; the classifier does the rest. */
export const ADULT_TOPIC: KeywordGroup = {
  en: ["porn", "sex", "sexy", "nude", "nudes", "naked", "xxx", "drugs", "cocaine", "weed"],
  fr: ["porno", "sexe", "nue", "drogue"],
  ar: ["سكس", "اباحي", "اباحية", "عاري", "عارية", "مخدرات"],
  arabizi: ["seks", "sexy"],
};

/** Politics, armed groups, sects, contested history (Lebanon rule): fixed polite redirect. */
export const POLITICS: KeywordGroup = {
  en: ["hezbollah", "politics", "political party", "election", "elections", "israel", "sunni", "shia", "shiite", "sect", "civil war", "militia"],
  fr: ["politique", "hezbollah", "israel", "guerre civile", "milice"],
  ar: ["حزب الله", "سياسة", "السياسة", "احزاب", "الاحزاب", "انتخابات", "اسرائيل", "طائفة", "طائفي", "طائفية", "الحرب الاهلية", "ميليشيا"],
  arabizi: ["7ezb", "7ezbollah", "siyese", "siyasa", "isra2il", "isra2eel", "ahzeb", "ahzab", "a7zeb", "a7zab", "el ahzeb", "el a7zeb"],
};

/** Attempts to change Zaki's rules. */
export const PROMPT_INJECTION: KeywordGroup = {
  en: [
    "ignore previous", "ignore all previous", "ignore your instructions", "ignore the instructions",
    "ignore your rules", "forget your rules", "system prompt", "you are now", "developer mode",
    "jailbreak", "dan mode", "turn off safety", "disable safety", "admin mode", "new instructions",
    "pretend you are not",
  ],
  fr: ["ignore les instructions", "oublie les instructions", "oublie tes regles", "mode developpeur"],
  ar: ["تجاهل التعليمات", "تجاهل كل التعليمات", "انسى التعليمات", "انس التعليمات", "تجاهل القواعد", "اوقف الحماية"],
  arabizi: ["tjehal el ta3limet", "ensa el ta3limet"],
};

/** War words. WEAK: they trigger the fear route only when the message is not school talk
 *  ("we learned about the war of 1812 in history", "volcanoes explode like bombs"). */
export const WAR_WORDS: KeywordGroup = {
  en: ["bomb", "bombs", "bom", "boms", "bombing", "bombed", "airstrike", "air strike", "airstrikes", "drone", "drones", "missile", "missiles", "explosion", "explosions", "the war", "war", "shelling", "jets", "warplanes", "the planes came"],
  fr: ["les bombes", "bombe", "la guerre", "bombardement", "explosion", "les drones", "les avions"],
  ar: ["قصف", "القصف", "صاروخ", "صواريخ", "انفجار", "غارة", "غارات", "الحرب", "حرب", "الدرون", "قنبلة", "قنابل", "الطائرات", "الطيارات", "الطيران", "المسيرات", "ام كامل"],
  arabizi: ["2asf", "el 2asf", "sarou5", "sawarikh", "sawari5", "infijar", "ghara", "el 7arb", "7arb", "2anbale", "el tayyarat", "drone", "el drone", "um kamel", "em kemel"],
};

/** "X is killing me" idioms. WEAK: ignored in school talk ("el math 3am yi2telne"). */
export const THREAT_IDIOMS: KeywordGroup = {
  en: ["killing me", "kills me", "going to kill me", "will kill me", "gonna kill me"],
  ar: ["يقتلني", "بيقتلني", "عم يقتلني", "رح يقتلني", "قتلني"],
  arabizi: ["bi2tolne", "byi2tolne", "ye2tolne", "yi2telne", "ra7 ye2tolne", "3am yi2telne", "2atalne"],
};

/** School / exam context words used to suppress WEAK words and exam worries. Whole words. */
export const SCHOOL_CONTEXT: KeywordGroup = {
  en: ["learn", "learned", "learning", "learnt", "lesson", "history", "class", "studying", "study", "homework", "math", "maths", "science", "volcano", "volcanoes", "book", "story", "game", "movie", "test", "exam", "quiz"],
  fr: ["apprendre", "appris", "lecon", "histoire", "classe", "devoirs", "maths", "sciences", "livre", "jeu", "film", "controle", "examen"],
  ar: ["ندرس", "درسنا", "درس", "الدرس", "التاريخ", "بالتاريخ", "الصف", "بالصف", "الفرض", "الواجب", "الرياضيات", "الحساب", "العلوم", "البركان", "القصه", "اللعبه", "الفيلم", "الامتحان", "امتحان", "الاختبار", "اختبار", "الكتاب"],
  arabizi: ["ndrous", "darasna", "el dars", "el tarikh", "el math", "math", "el science", "el exam", "exam", "el fard", "el game", "film"],
};

/** Exam / test words: "I'm scared of the exam" is normal worry, not a safety case. */
/**
 * A GROWN-UP describing a worry about a child, in the third person (parent Ask Zaki).
 * Matched together with the child lists, so "baba darabne" also counts.
 */
export const PARENT_CONCERN_HARM: KeywordGroup = {
  en: [
    "touches him", "touches her", "touched him", "touched her", "touching him", "touching her",
    "hits him", "hits her", "hit him", "hit her", "beats him", "beats her", "beat him", "beat her",
    "hurts him", "hurts her", "hurt him", "hurt her", "abuses him", "abuses her", "abused him", "abused her",
    "is being abused", "being abused", "abuse", "molested", "molests", "inappropriately", "private parts",
    "slaps him", "slaps her", "kicks him", "kicks her", "locks him", "locks her", "threatens him", "threatens her",
  ],
  fr: ["le frappe", "la frappe", "le touche", "la touche", "abus", "maltraite", "maltraitee"],
  ar: [
    "يضربه", "يضربها", "بيضربه", "بيضربها", "ضربه", "ضربها", "يلمسه", "يلمسها", "بيلمسه", "بيلمسها", "لمسه", "لمسها",
    "يؤذيه", "يؤذيها", "بيأذيه", "بيأذيها", "يتحرش", "تحرش", "اعتداء", "يعنفه", "يعنفها", "تعنيف",
  ],
  arabizi: ["byedrabo", "byedraba", "darabo", "daraba", "byelmeso", "byelmesa", "bi2zi", "bey2zi", "ta7arosh"],
};

export const PARENT_CONCERN_SELF: KeywordGroup = {
  en: [
    "hurt herself", "hurt himself", "hurting herself", "hurting himself", "kill herself", "kill himself",
    "wants to die", "want to die", "suicide", "suicidal", "self harm", "self-harm", "cuts herself", "cuts himself",
    "cutting herself", "cutting himself", "end her life", "end his life",
  ],
  fr: ["se faire du mal", "se tuer", "veut mourir", "suicide"],
  ar: [
    "يؤذي نفسه", "تؤذي نفسها", "يريد ان يموت", "تريد ان تموت", "بدو يموت", "بدها تموت", "ينتحر", "تنتحر", "انتحار",
    "يقتل نفسه", "تقتل نفسها", "يجرح نفسه", "تجرح نفسها",
  ],
  arabizi: ["bi2zi 7alo", "bt2zi 7ala", "bado ymout", "bada tmout", "yente7er", "tente7er"],
};

/**
 * Everyday things children are "scared of" in a learning context (animals, insects, the
 * dark, monsters). Fear + one of these, with NO family/outside person, war or death word,
 * is not a safety event ("I'm scared of spiders in the science book"). Whole-word match.
 */
export const BENIGN_FEAR_OBJECTS: KeywordGroup = {
  en: [
    "spider", "spiders", "snake", "snakes", "dog", "dogs", "cat", "cats", "bee", "bees", "wasp", "wasps",
    "insect", "insects", "bug", "bugs", "worm", "worms", "mouse", "mice", "rat", "rats", "cockroach",
    "cockroaches", "shark", "sharks", "lion", "lions", "tiger", "tigers", "bear", "bears", "crocodile",
    "crocodiles", "dinosaur", "dinosaurs", "frog", "frogs", "lizard", "lizards", "scorpion", "scorpions",
    "the dark", "dark", "darkness", "monster", "monsters", "ghost", "ghosts", "clown", "clowns",
    "volcano", "volcanoes", "heights", "the dentist",
  ],
  fr: ["araignee", "araignees", "serpent", "serpents", "chien", "chiens", "insecte", "insectes", "le noir", "monstre", "monstres", "fantome", "fantomes"],
  ar: [
    "عنكبوت", "العنكبوت", "العناكب", "عناكب", "حيه", "الحيه", "افعى", "الافعى", "الافاعي", "كلب", "الكلب", "الكلاب",
    "قطه", "القطه", "صرصور", "الصرصور", "الصراصير", "نحله", "النحل", "حشره", "الحشرات", "حشرات", "فار", "الفار",
    "الفيران", "دود", "الدود", "اسد", "الاسد", "دب", "الدب", "تمساح", "التمساح", "ديناصور", "الديناصورات", "ضفدع",
    "الضفدع", "عقرب", "العقرب", "العتمه", "الظلام", "العتم", "وحش", "الوحش", "الوحوش", "شبح", "الشبح", "الاشباح",
  ],
  arabizi: ["3ankabout", "3ankabut", "3anakeb", "7ayye", "kalb", "el kalb", "sarsour", "na7le", "7ashara", "far", "el 3atme", "3atme", "wa7ch", "wa7sh", "shabah", "shaba7"],
};

export const EXAM_WORDS: KeywordGroup = {
  en: ["test", "exam", "quiz", "exams", "tests", "spelling test", "homework", "grades", "marks"],
  fr: ["controle", "examen", "interro", "devoirs", "note"],
  ar: ["امتحان", "الامتحان", "اختبار", "الاختبار", "مسابقه", "المسابقه", "الفرض", "العلامه", "العلامات", "الواجب"],
  arabizi: ["exam", "el exam", "test", "el test", "mosab2a", "el fard", "3alame"],
};

/** Death words (grief). Trigger the calm fear route only with a person word (GRIEF_PERSON). */
export const DEATH_WORDS: KeywordGroup = {
  en: ["died", "passed away", "has died", "is dead", "was killed", "got killed"],
  fr: ["est mort", "est morte", "mort", "morte", "decede", "decedee"],
  ar: ["مات", "ماتت", "توفي", "توفى", "توفيت", "توفت", "متوفي", "استشهد", "استشهدت", "قتل", "انقتل"],
  arabizi: ["met", "mat", "matet", "maatet", "twaffa", "twaffet", "este4had", "en2atal"],
};

/** People words for grief (home terms count too). Whole words. */
export const GRIEF_PERSON: KeywordGroup = {
  en: ["my", "our", "friend", "classmate", "teacher", "neighbour", "neighbor"],
  fr: ["mon", "ma", "mes", "notre", "ami", "amie", "copain", "copine", "grand-pere", "grand pere", "grand-mere"],
  ar: ["والدي", "والدتي", "ابي", "امي", "رفيقي", "رفيقتي", "صاحبي", "صاحبتي", "صديقي", "صديقتي", "جارنا", "جارتنا", "معلمتي", "استاذي"],
  arabizi: ["jiddo", "teta", "sitti", "re2e", "rfi2e", "sa7be", "sa7bte", "jarna"],
};
