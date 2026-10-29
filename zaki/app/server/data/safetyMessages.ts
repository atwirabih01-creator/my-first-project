// FIXED, reviewed texts. The AI never writes these. Each must be reviewed by the safety
// reviewer and by native speakers before any real child uses Zaki. The app should also
// ship pre-recorded audio of the safety texts (iPhone silent mode mutes read-aloud).
// Arabic: clear Modern Standard Arabic with simple words.

import type { Lang } from "../types";

export type FixedMessageKey =
  | "safety_disclosure"
  | "safety_self_harm"
  | "safety_fear"
  | "safety_checkin"
  | "personal_data"
  | "adult_topic"
  | "politics"
  | "prompt_injection"
  | "reply_blocked"
  | "answer_protected"
  | "demo_tutor"
  | "ai_unavailable"
  | "ai_intro"
  | "budget_tutor";

export const FIXED_MESSAGES: Record<FixedMessageKey, Record<Lang, string>> = {
  // Disclosure of harm / abuse / secrecy. Honest in both routes: it does NOT say "Mom will see this".
  safety_disclosure: {
    en: "Thank you for telling me. You did the right thing.\nWhat happened is not your fault.\nPlease tell a grown-up you trust who is not hurting you, right now.\nI'm going to let a grown-up whose job is to keep kids safe know.",
    ar: "شكرًا لأنك أخبرتني. لقد فعلت الصواب.\nما حدث ليس ذنبك.\nأخبِر الآن شخصًا كبيرًا تثق به ولا يؤذيك.\nسأُعلِم شخصًا كبيرًا عمله أن يحافظ على سلامة الأطفال.",
  },
  safety_self_harm: {
    en: "Thank you for telling me. You matter a lot.\nPlease tell a grown-up you trust right now.\nYou can also call one of the numbers on this screen.\nI'm going to let a grown-up whose job is to keep kids safe know.",
    ar: "شكرًا لأنك أخبرتني. أنت مهمّ جدًّا.\nأخبِر الآن شخصًا كبيرًا تثق به.\nيمكنك أيضًا الاتصال بأحد الأرقام في هذه الشاشة.\nسأُعلِم شخصًا كبيرًا عمله أن يحافظ على سلامة الأطفال.",
  },
  // War fear / sadness: calm, no promise of safety, no police, no news or politics.
  safety_fear: {
    en: "It's OK to feel scared or sad. Many kids feel this way.\nTell a grown-up you trust how you feel.\nYou can take a deep breath with me: in... and out.\nWe can go back to the lesson when you are ready.",
    ar: "لا بأس أن تشعر بالخوف أو الحزن. كثير من الأطفال يشعرون بذلك.\nأخبِر شخصًا كبيرًا تثق به بما تشعر به.\nلنتنفّس معًا ببطء: شهيق... وزفير.\nنعود إلى الدرس عندما تكون مستعدًّا.",
  },
  // Cautious default when filters disagree or the message is unclear.
  safety_checkin: {
    en: "Are you OK? You can always tell a grown-up you trust.\nIf something is wrong, tell them right now.",
    ar: "هل أنت بخير؟ يمكنك دائمًا أن تخبر شخصًا كبيرًا تثق به.\nإذا كان هناك شيء خطأ، أخبِره الآن.",
  },
  personal_data: {
    en: "You don't need to tell me your full name, school, address, phone or photos.\nLet's keep those private! 🔒\nNow, back to our lesson.",
    ar: "لا تحتاج أن تخبرني باسمك الكامل أو مدرستك أو عنوانك أو رقم هاتفك أو صورك.\nلنحافظ عليها خاصة بك! 🔒\nوالآن، لنعد إلى درسنا.",
  },
  adult_topic: {
    en: "That's not something I can talk about. I'm here for school lessons.\nYou can ask a grown-up you trust about it.\nShall we go back to our lesson?",
    ar: "لا أستطيع التحدث عن هذا. أنا هنا لدروس المدرسة.\nيمكنك أن تسأل شخصًا كبيرًا تثق به.\nهل نعود إلى درسنا؟",
  },
  politics: {
    en: "That's a big question for a grown-up you trust.\nI'm here to help with school lessons.\nShall we go back to our lesson?",
    ar: "هذا سؤال كبير، اسأل عنه شخصًا كبيرًا تثق به.\nأنا هنا لأساعدك في دروس المدرسة.\nهل نعود إلى درسنا؟",
  },
  prompt_injection: {
    en: "I'm Zaki, your AI teacher, and my rules stay the same.\nLet's keep learning together!",
    ar: "أنا ذكي، معلّمك الآلي، وقواعدي لا تتغيّر.\nلنواصل التعلّم معًا!",
  },
  reply_blocked: {
    en: "Let's go back to our lesson.\nFor other questions, ask a grown-up you trust.\nWhat do you think the first step is?",
    ar: "لنعد إلى درسنا.\nللأسئلة الأخرى، اسأل شخصًا كبيرًا تثق به.\nما الخطوة الأولى في رأيك؟",
  },
  answer_protected: {
    en: "I can't tell you the answer, but I know you can find it!\nLet's look at it one small step at a time.",
    ar: "لا أستطيع أن أخبرك بالجواب، لكنني أعرف أنك تستطيع أن تجده!\nلننظر إليه خطوة صغيرة بعد خطوة.",
  },
  demo_tutor: {
    en: "Demo mode: Zaki's AI is not connected yet.\nI'm Zaki, an AI helper (not a person).\nTry the questions in this lesson and tap a hint if you need one.",
    ar: "وضع التجربة: ذكاء ذكي الاصطناعي غير متصل بعد.\nأنا ذكي، مساعد آلي (لست إنسانًا).\nجرّب أسئلة هذا الدرس واضغط على التلميح إذا احتجت إليه.",
  },
  ai_unavailable: {
    en: "Zaki can't think right now. Your work is saved.\nTry again in a little while.\nIf something is worrying you, tell a grown-up you trust or tap \"I need help\".",
    ar: "لا يستطيع ذكي التفكير الآن. عملك محفوظ.\nحاول مرة أخرى بعد قليل.\nإذا كان شيء يقلقك، أخبر شخصًا كبيرًا تثق به أو اضغط «أحتاج إلى مساعدة».",
  },
  budget_tutor: {
    en: "Zaki has done a lot of thinking today!\nLet's keep practising with your flashcards and practice questions.\nWe can chat again tomorrow.",
    ar: "فكّر ذكي كثيرًا اليوم!\nلنتابع التدريب بالبطاقات وأسئلة التدريب.\nيمكننا أن نتحدّث مرة أخرى غدًا.",
  },
  ai_intro: {
    en: "Hi! I'm Zaki, an AI helper (not a person).",
    ar: "مرحبًا! أنا ذكي، مساعد آلي يعمل بالذكاء الاصطناعي (لست إنسانًا).",
  },
};

export function fixedMessage(key: FixedMessageKey, lang: Lang): string {
  return FIXED_MESSAGES[key][lang] ?? FIXED_MESSAGES[key].en;
}
