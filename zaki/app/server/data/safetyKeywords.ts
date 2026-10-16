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
    "kill myself", "killing myself", "want to die", "wanna die", "want to be dead", "wish i was dead",
    "wish i were dead", "hurt myself", "hurting myself", "cut myself", "end my life", "suicide",
    "don't want to live", "dont want to live", "do not want to live", "better off dead", "die tonight",
  ],
  fr: [
    "me tuer", "je veux mourir", "envie de mourir", "me faire du mal", "suicide", "me suicider",
    "plus envie de vivre",
  ],
  ar: [
    "اقتل نفسي", "بقتل نفسي", "انتحر", "انتحار", "بدي موت", "بدي اموت", "ابي اموت", "ابغى اموت",
    "اريد ان اموت", "اريد الموت", "اذي نفسي", "اؤذي نفسي", "ما بدي عيش", "لا اريد ان اعيش",
    "نفسي اموت", "اجرح نفسي",
  ],
  arabizi: [
    "a2tol nafse", "a2tol nafsi", "bi2tol nafse", "ente7ar", "bade mout", "badde mout", "bdde mout",
    "beddi mout", "abi amoot", "abgha amoot", "ma bade 3ish", "ma badde 3ish", "2azi nafse",
  ],
};

/** Child tells that someone hurts / hits / touches them (abuse disclosure). */
export const DISCLOSURE_HARM: KeywordGroup = {
  en: [
    "hits me", "hit me", "hitting me", "beats me", "beat me", "beating me", "hurts me", "hurt me",
    "hurting me", "touches me", "touched me", "touching me", "touch my private", "touches my private",
    "kicks me", "kicked me", "slaps me", "slapped me", "burns me", "locks me", "locked me in",
    "chokes me", "pinches me", "makes me take off", "take off my clothes", "abuse", "abused me",
  ],
  fr: [
    "me frappe", "m'a frappe", "me bat", "me touche", "m'a touche", "me fait mal", "m'a fait mal",
    "m'enferme",
  ],
  ar: [
    "يضربني", "بيضربني", "ضربني", "عم يضربني", "يلمسني", "بيلمسني", "لمسني", "يؤذيني", "بيأذيني",
    "اذاني", "يعذبني", "بيعذبني", "يحبسني", "بيحبسني", "يرفسني", "يكويني", "يقرصني", "يخنقني",
    "يشلحني", "يتحرش", "تحرش",
  ],
  arabizi: [
    "byedrabne", "byedrabni", "yedrabne", "yedrabni", "darabne", "darabni", "byelmesne", "byelmesni",
    "yelmesne", "lamasne", "lamasni", "bye2zine", "bye2zini", "ye2zine", "bi3azebne", "byi7bosne",
    "yetharash", "ta7arosh",
  ],
};

/** An adult asked the child to keep a secret / not tell (grooming / abuse signal). */
export const SECRECY: KeywordGroup = {
  en: [
    "keep a secret", "our secret", "our little secret", "don't tell anyone", "dont tell anyone",
    "not to tell", "told me not to tell", "said not to tell", "don't tell your mom", "don't tell mom",
    "don't tell your parents", "keep it between us",
  ],
  fr: ["notre secret", "ne dis a personne", "ne le dis a personne", "pas le dire", "garder le secret"],
  ar: [
    "سر بيننا", "سر بيناتنا", "لا تقول لحدا", "ما تقول لحدا", "ما تقولي لحدا", "لا تخبر احدا",
    "ما تخبر احد", "خليها سر", "خليه سر", "لا تقولي لماما", "ما تقول لامك",
  ],
  arabizi: ["sir baynetna", "ma t2oul la7ada", "ma t2ole la7ada", "khaliya sir", "khalliha sir", "la t2oul la7ada"],
};

/** Fear, war fear, displacement, grief and strong sadness (calm route, 1564, never police). */
export const FEAR_DISTRESS: KeywordGroup = {
  en: [
    "scared of the bombs", "bomb", "bombs", "bombing", "airstrike", "air strike", "drones", "missile",
    "missiles", "explosion", "war", "the war", "i'm scared", "im scared", "i am scared", "so scared",
    "very scared", "i'm afraid", "i am afraid", "terrified", "we had to leave our house",
    "had to leave our home", "my house was destroyed", "will we die", "are we going to die",
    "died in the war", "i'm very sad", "i am very sad", "so sad", "nobody loves me", "i'm lonely",
    "i cry every", "can't stop crying",
  ],
  fr: [
    "j'ai peur", "tres peur", "les bombes", "bombe", "la guerre", "bombardement", "explosion",
    "je suis triste", "tres triste", "personne ne m'aime",
  ],
  ar: [
    "خايف", "خايفة", "خايفه", "اخاف", "انا خايف", "قصف", "القصف", "صاروخ", "صواريخ", "انفجار", "غارة",
    "غارات", "الحرب", "حرب", "الدرون", "قنبلة", "قنابل", "تركنا بيتنا", "هربنا من البيت",
    "رح نموت", "حنموت", "زعلان كتير", "حزين جدا", "حزينة جدا", "ما حدا بيحبني", "لا احد يحبني",
    "بكي كل يوم",
  ],
  arabizi: [
    "khayef", "khayfe", "khayfi", "5ayef", "5ayfe", "a5af", "2asf", "el 2asf", "sarou5", "sawarikh",
    "sawari5", "infijar", "ghara", "el 7arb", "7arb", "2anbale", "ra7 nmout", "ze3lan ktir",
    "ma 7ada bi7ebne",
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
    "بالبيت", "بيتنا", "اهلي", "عيلتي", "الخادمة", "الشغالة", "السواق", "المربية", "مرت ابي", "زوج امي",
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
    "photo of me",
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
  ar: ["سكس", "اباحي", "اباحية", "عاري", "عارية", "مخدرات", "حشيش"],
  arabizi: ["seks", "sexy"],
};

/** Politics, armed groups, sects, contested history (Lebanon rule): fixed polite redirect. */
export const POLITICS: KeywordGroup = {
  en: ["hezbollah", "politics", "political party", "election", "elections", "israel", "sunni", "shia", "shiite", "sect", "civil war", "militia"],
  fr: ["politique", "hezbollah", "israel", "guerre civile", "milice"],
  ar: ["حزب الله", "سياسة", "السياسة", "انتخابات", "اسرائيل", "طائفة", "طائفي", "سني", "شيعي", "الحرب الاهلية", "ميليشيا"],
  arabizi: ["7ezb", "7ezbollah", "siyese", "siyasa", "isra2il", "isra2eel"],
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
