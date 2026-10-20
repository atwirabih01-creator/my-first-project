// Plain-language consent text for parents (en + ar). Fixed text, reviewed with the founder.
// Bump CONSENT_VERSION whenever the meaning changes (families are then asked again).
import type { Lang } from './types';

export const CONSENT_VERSION = '2026-10-20.1';

export const CONSENT_SECTIONS: Record<Lang, { title: string; body: string }[]> = {
  en: [
    { title: 'What Zaki keeps', body: "Your child's nickname (never a full name), grade, language and lesson progress (scores, stars, summaries). Chat text with Zaki is kept about 90 days. Book-page photos are kept about 30 days. Lesson summaries and scores stay until you delete them." },
    { title: 'Who processes it', body: 'Anthropic (Claude) prepares lessons and answers questions. Your child\'s name is never sent to it, only a random code. OpenAI is used to check messages for safety only if we turn it on, with no-storage terms. Supabase stores the app\'s data on servers in Frankfurt, Germany. There are no ads and no tracking.' },
    { title: 'Where it goes', body: "These companies' servers are outside Lebanon and Qatar: Anthropic and OpenAI mainly in the USA, Supabase in Frankfurt, Germany." },
    { title: 'Safety', body: 'If your child writes something that suggests they may be unsafe, Zaki shows a help screen and sends a short, cleaned excerpt to a named safety reviewer who is not a member of your family. If a family member may be involved, that message is NOT shown in the parent area. Anthropic may keep conversations its systems flag as unsafe for up to 2 years. If you delete your data, a safety report that is still open stays with the reviewer (with the child\'s cleaned words, but no link to your family), so a safety case can\'t be erased; closed reports keep no words.' },
    { title: 'Your rights', body: 'You can ask to see, export or delete your data at any time. We answer data requests within 10 days. In Settings you can download all your data or delete everything, and you can withdraw this consent (Zaki then stops using AI for your family until you agree again).' },
  ],
  ar: [
    { title: 'ما يحفظه ذكي', body: 'الاسم المختصر لطفلك (وليس الاسم الكامل)، وصفّه، ولغته، وتقدّمه في الدروس (الدرجات والنجوم والملخّصات). تُحفَظ نصوص المحادثة مع ذكي نحو 90 يومًا. وتُحفَظ صور صفحات الكتب نحو 30 يومًا. وتبقى ملخّصات الدروس والدرجات حتى تحذفها أنت.' },
    { title: 'من يعالج البيانات', body: 'شركة Anthropic (‏Claude) تُحضّر الدروس وتجيب عن الأسئلة. لا يُرسَل إليها اسم طفلك أبدًا، بل رمز عشوائي فقط. تُستخدم OpenAI لفحص سلامة الرسائل فقط إذا فعّلناها، وبشروط عدم الحفظ. وتحفظ Supabase بيانات التطبيق على خوادم في فرانكفورت بألمانيا. لا إعلانات ولا تتبّع.' },
    { title: 'إلى أين تذهب البيانات', body: 'خوادم هذه الشركات خارج لبنان وقطر: Anthropic وOpenAI في الولايات المتحدة غالبًا، وSupabase في فرانكفورت بألمانيا.' },
    { title: 'السلامة', body: 'إذا كتب طفلك ما يدلّ على أنه قد لا يكون بأمان، يعرض ذكي شاشة مساعدة ويرسل مقتطفًا قصيرًا منقّحًا إلى مراجِع سلامة محدَّد بالاسم وليس من أفراد عائلتك. إذا كان أحد أفراد العائلة قد يكون معنيًّا، فلن تظهر هذه الرسالة في منطقة الأهل. وقد تحتفظ Anthropic بالمحادثات التي تصنّفها أنظمتها غير آمنة لمدة تصل إلى سنتين. إذا حذفتَ بياناتك، يبقى بلاغ السلامة الذي ما زال مفتوحًا لدى المراجِع (مع كلمات الطفل بعد تنقيحها، ولكن بلا صلة بعائلتك)، كي لا يمكن محو حالة سلامة؛ أما البلاغات المغلقة فلا تُحفَظ فيها أي كلمات.' },
    { title: 'حقوقك', body: 'يمكنك في أي وقت أن تطلب رؤية بياناتك أو تنزيلها أو حذفها. نجيب عن طلبات البيانات خلال 10 أيام. ومن الإعدادات يمكنك تنزيل كل بياناتك أو حذف كل شيء، ويمكنك سحب هذه الموافقة (عندها يتوقّف ذكي عن استخدام الذكاء الاصطناعي لعائلتك حتى توافق من جديد).' },
  ],
};
