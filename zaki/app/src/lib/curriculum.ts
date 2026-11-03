// Curriculum map for grades 1-9: which subjects a grade has, the typical topics taught in
// each grade and subject, and a short "level guide" used in AI prompts so Zaki stays at the
// child's level. Plain data, no dependencies: imported by both the app and the server.
//
// Scope: general international / Arab-region primary and middle school (NOT one country's
// official syllabus). Topic names are written to pass the safety word lists (tested), so a
// child can pick any of them as a lesson topic.

import type { Lang, Subject } from './types';

export type CurriculumTopic = { en: string; ar: string };

export const MIN_GRADE = 1;
export const MAX_GRADE = 9;
export const MIN_AGE = 5;
export const MAX_AGE = 16;
export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Every subject, in display order. */
export const ALL_SUBJECTS: readonly Subject[] = ['math', 'science', 'physics', 'chemistry', 'biology', 'english', 'arabic', 'social'];

/** Subjects only offered from grade 7 (for grades 1-6, "science" covers them). */
export const MIDDLE_SCHOOL_SUBJECTS: readonly Subject[] = ['physics', 'chemistry', 'biology'];

export const SUBJECT_LABELS: Record<Subject, Record<Lang, string>> = {
  math: { en: 'Math', ar: 'الرياضيات' },
  science: { en: 'Science', ar: 'العلوم' },
  physics: { en: 'Physics', ar: 'الفيزياء' },
  chemistry: { en: 'Chemistry', ar: 'الكيمياء' },
  biology: { en: 'Biology', ar: 'الأحياء' },
  english: { en: 'English', ar: 'اللغة الإنجليزية' },
  arabic: { en: 'Arabic', ar: 'اللغة العربية' },
  social: { en: 'Social studies', ar: 'الدراسات الاجتماعية' },
};

const t = (en: string, ar: string): CurriculumTopic => ({ en, ar });

type GradeMap = Partial<Record<Subject, CurriculumTopic[]>>;

export const CURRICULUM: Record<number, GradeMap> = {
  1: {
    math: [
      t('Counting to 100', 'العدّ حتى 100'),
      t('Tens and ones', 'الآحاد والعشرات'),
      t('Addition within 20', 'الجمع ضمن 20'),
      t('Subtraction within 20', 'الطرح ضمن 20'),
      t('Comparing numbers (more, less, equal)', 'مقارنة الأعداد (أكبر، أصغر، يساوي)'),
      t('Flat shapes (circle, square, triangle, rectangle)', 'الأشكال المستوية (الدائرة، المربع، المثلث، المستطيل)'),
      t('Measuring length (longer and shorter)', 'قياس الطول (أطول وأقصر)'),
      t('Telling time to the hour', 'قراءة الساعة بالساعات الكاملة'),
      t('Patterns', 'الأنماط'),
    ],
    science: [
      t('Living and non-living things', 'الكائنات الحية والأشياء غير الحية'),
      t('My body and the five senses', 'جسمي والحواس الخمس'),
      t('Parts of a plant', 'أجزاء النبات'),
      t('Animals and their homes', 'الحيوانات وبيوتها'),
      t('Weather and seasons', 'الطقس وفصول السنة'),
      t('Day and night', 'الليل والنهار'),
      t('Materials around us', 'المواد من حولنا'),
      t('Healthy food and keeping clean', 'الغذاء الصحي والنظافة'),
    ],
    english: [
      t('The alphabet and letter sounds', 'الحروف الإنجليزية وأصواتها'),
      t('Short vowel sounds', 'أصوات الحروف المتحركة القصيرة'),
      t('Sight words', 'الكلمات الشائعة'),
      t('Capital letters and full stops', 'الحروف الكبيرة والنقطة'),
      t('Nouns (naming words)', 'الأسماء'),
      t('Reading short sentences', 'قراءة جمل قصيرة'),
      t('Rhyming words', 'الكلمات المتشابهة في القافية'),
      t('Colours, numbers and family words', 'الألوان والأعداد وكلمات العائلة'),
    ],
    arabic: [
      t('The Arabic alphabet', 'الحروف الهجائية'),
      t('Short vowels (fatha, damma, kasra)', 'الحركات القصيرة (الفتحة والضمة والكسرة)'),
      t('Long vowels', 'المدود (الألف والواو والياء)'),
      t('Letter shapes at the start, middle and end of a word', 'أشكال الحرف في أول الكلمة ووسطها وآخرها'),
      t('Sukun', 'السكون'),
      t('Tanween', 'التنوين'),
      t('Shadda', 'الشدّة'),
      t('Reading short words and sentences', 'قراءة كلمات وجمل قصيرة'),
    ],
    social: [
      t('Me and my family', 'أنا وأسرتي'),
      t('My school and classmates', 'مدرستي وزملائي'),
      t('Rules and good manners', 'القواعد والأخلاق الحسنة'),
      t('People who help us', 'أشخاص يساعدوننا'),
      t('My home and neighbourhood', 'بيتي وحيّي'),
      t('Days of the week and months', 'أيام الأسبوع والأشهر'),
      t('Keeping our environment clean', 'الحفاظ على نظافة البيئة'),
      t('Road safety', 'السلامة على الطريق'),
    ],
  },
  2: {
    math: [
      t('Numbers up to 1000', 'الأعداد حتى 1000'),
      t('Hundreds, tens and ones', 'الآحاد والعشرات والمئات'),
      t('Addition within 100', 'الجمع ضمن 100'),
      t('Subtraction within 100', 'الطرح ضمن 100'),
      t('Multiplication as equal groups', 'الضرب كمجموعات متساوية'),
      t('Division as sharing', 'القسمة كتوزيع بالتساوي'),
      t('Halves and quarters', 'النصف والربع'),
      t('Telling time (half and quarter hours)', 'قراءة الساعة (النصف والربع)'),
      t('Measuring length, mass and capacity', 'قياس الطول والكتلة والسعة'),
      t('Pictograms and bar charts', 'المخططات بالصور والأعمدة'),
    ],
    science: [
      t('Animal groups (mammals, birds, fish, reptiles, insects)', 'مجموعات الحيوانات (الثدييات، الطيور، الأسماك، الزواحف، الحشرات)'),
      t('Life cycles of a butterfly and a frog', 'دورة حياة الفراشة والضفدع'),
      t('What plants need to grow', 'ما يحتاجه النبات لينمو'),
      t('Healthy eating and exercise', 'الغذاء الصحي والرياضة'),
      t('Materials and their properties', 'المواد وخصائصها'),
      t('Pushes and pulls', 'الدفع والسحب'),
      t('Habitats', 'المواطن البيئية'),
      t('Light and shadows', 'الضوء والظل'),
    ],
    english: [
      t('Long vowel sounds', 'أصوات الحروف المتحركة الطويلة'),
      t('Plurals with s and es', 'الجمع بإضافة s و es'),
      t('Verbs (action words)', 'الأفعال'),
      t('Adjectives (describing words)', 'الصفات'),
      t('Simple past tense', 'الماضي البسيط'),
      t('Asking questions', 'طرح الأسئلة'),
      t('Reading short stories', 'قراءة قصص قصيرة'),
      t('Writing simple sentences', 'كتابة جمل بسيطة'),
    ],
    arabic: [
      t('Sun and moon letters', 'اللام الشمسية واللام القمرية'),
      t('Taa marbuta and open taa', 'التاء المربوطة والتاء المفتوحة'),
      t('Singular, dual and plural', 'المفرد والمثنى والجمع'),
      t('Pronouns', 'الضمائر المنفصلة'),
      t('Demonstrative words', 'أسماء الإشارة'),
      t('Simple nominal sentences', 'الجملة الاسمية البسيطة'),
      t('Understanding a short story', 'فهم قصة قصيرة'),
      t('Writing a full sentence', 'كتابة جملة مفيدة'),
    ],
    social: [
      t('Maps of my classroom and school', 'خريطة صفي ومدرستي'),
      t('Directions (left, right, near, far)', 'الاتجاهات (يمين، يسار، قريب، بعيد)'),
      t('Jobs and work', 'المهن والعمل'),
      t('Needs and wants', 'الحاجات والرغبات'),
      t('Means of transport', 'وسائل النقل'),
      t('Celebrations around the world', 'الاحتفالات حول العالم'),
      t('Water and why it matters', 'الماء وأهميته'),
      t('Rights and responsibilities of children', 'حقوق الأطفال وواجباتهم'),
    ],
  },
  3: {
    math: [
      t('Numbers up to 10,000', 'الأعداد حتى 10000'),
      t('Adding and subtracting 3-digit numbers', 'جمع وطرح الأعداد المكوّنة من 3 أرقام'),
      t('Multiplication tables (2 to 10)', 'جداول الضرب (من 2 إلى 10)'),
      t('Division facts', 'حقائق القسمة'),
      t('Fractions', 'الكسور'),
      t('Time and the calendar', 'الوقت والتقويم'),
      t('Length, mass and capacity in standard units', 'الطول والكتلة والسعة بالوحدات المعيارية'),
      t('Perimeter', 'المحيط'),
      t('Angles and lines', 'الزوايا والخطوط'),
      t('Tables and bar graphs', 'الجداول والتمثيل بالأعمدة'),
    ],
    science: [
      t('Plants: parts and their jobs', 'النبات: أجزاؤه ووظائفها'),
      t('How animals adapt', 'تكيّف الحيوانات'),
      t('Food chains', 'السلاسل الغذائية'),
      t('Rocks and soil', 'الصخور والتربة'),
      t('Solids, liquids and gases', 'المواد الصلبة والسائلة والغازية'),
      t('The water cycle', 'دورة الماء'),
      t('Magnets', 'المغناطيس'),
      t('Forces and friction', 'القوى والاحتكاك'),
    ],
    english: [
      t('Common and proper nouns', 'أسماء الجنس وأسماء العلم'),
      t('Pronouns', 'الضمائر'),
      t('Present and past verbs', 'الأفعال في المضارع والماضي'),
      t('Comparing adjectives (big, bigger, biggest)', 'مقارنة الصفات'),
      t('Joining words (and, but, because)', 'أدوات الربط'),
      t('Writing a paragraph', 'كتابة فقرة'),
      t('Finding the main idea', 'إيجاد الفكرة الرئيسة'),
      t('Commas and apostrophes', 'الفاصلة والفاصلة العليا'),
    ],
    arabic: [
      t('Noun, verb and particle', 'الاسم والفعل والحرف'),
      t('Subject and predicate (nominal sentence)', 'المبتدأ والخبر'),
      t('Verb and doer (verbal sentence)', 'الفعل والفاعل'),
      t('Past, present and imperative verbs', 'الفعل الماضي والمضارع والأمر'),
      t('Relative pronouns', 'الأسماء الموصولة'),
      t('Hamza at the start of a word', 'همزة الوصل وهمزة القطع'),
      t('Punctuation marks', 'علامات الترقيم'),
      t('Describing a picture in writing', 'التعبير الكتابي: وصف صورة'),
    ],
    social: [
      t('Reading maps and map keys', 'قراءة الخريطة ومفتاحها'),
      t('North, south, east and west', 'الشمال والجنوب والشرق والغرب'),
      t('Landforms (mountains, plains, rivers, seas)', 'أشكال سطح الأرض (الجبال، السهول، الأنهار، البحار)'),
      t('Natural resources', 'الموارد الطبيعية'),
      t('Villages and cities', 'القرى والمدن'),
      t('Goods and services', 'السلع والخدمات'),
      t('Helping our community', 'مساعدة مجتمعنا'),
      t('Inventions that changed our lives', 'اختراعات غيّرت حياتنا'),
    ],
  },
  4: {
    math: [
      t('Large numbers and rounding', 'الأعداد الكبيرة والتقريب'),
      t('Multiplying multi-digit numbers', 'ضرب الأعداد متعددة الأرقام'),
      t('Long division', 'القسمة الطويلة'),
      t('Equivalent fractions', 'الكسور المتكافئة'),
      t('Adding and subtracting fractions with the same denominator', 'جمع الكسور وطرحها ذات المقامات المتساوية'),
      t('Decimals (tenths and hundredths)', 'الأعداد العشرية (الأجزاء من عشرة ومن مئة)'),
      t('Measuring angles', 'قياس الزوايا'),
      t('Area and perimeter of rectangles', 'مساحة المستطيل ومحيطه'),
      t('Factors and multiples', 'العوامل والمضاعفات'),
      t('Line graphs', 'التمثيل بالخطوط'),
    ],
    science: [
      t('The digestive system', 'الجهاز الهضمي'),
      t('Teeth and healthy habits', 'الأسنان والعادات الصحية'),
      t('Food webs', 'الشبكات الغذائية'),
      t('Classifying living things', 'تصنيف الكائنات الحية'),
      t('Electricity and simple circuits', 'الكهرباء والدوائر البسيطة'),
      t('Sound and hearing', 'الصوت والسمع'),
      t('Melting, freezing and evaporation', 'الانصهار والتجمّد والتبخّر'),
      t('The water cycle', 'دورة الماء'),
    ],
    english: [
      t('Simple and continuous tenses', 'الأزمنة البسيطة والمستمرة'),
      t('Adverbs', 'الظروف'),
      t('Prepositions', 'حروف الجر'),
      t('Synonyms and antonyms', 'المترادفات والأضداد'),
      t('Direct speech and quotation marks', 'الكلام المباشر وعلامات التنصيص'),
      t('Writing a story (beginning, middle, end)', 'كتابة قصة (بداية، وسط، نهاية)'),
      t('Reading between the lines', 'الاستنتاج من النص'),
      t('Prefixes and suffixes', 'السوابق واللواحق'),
    ],
    arabic: [
      t('Subject and predicate', 'المبتدأ والخبر'),
      t('Kana and its sisters', 'كان وأخواتها'),
      t('Inna and its sisters', 'إنّ وأخواتها'),
      t('Doer and object', 'الفاعل والمفعول به'),
      t('Prepositions', 'حروف الجر'),
      t('The adjective (naat)', 'النعت'),
      t('Hamza in the middle of a word', 'الهمزة المتوسطة'),
      t('Writing a paragraph', 'كتابة فقرة'),
    ],
    social: [
      t('Continents and oceans', 'القارات والمحيطات'),
      t('Climate zones', 'المناطق المناخية'),
      t('Latitude and longitude basics', 'مبادئ خطوط الطول ودوائر العرض'),
      t('Ancient civilizations of Mesopotamia and Egypt', 'حضارات بلاد الرافدين ومصر القديمة'),
      t('Trade and markets', 'التجارة والأسواق'),
      t('Laws and why we need them', 'القوانين ولماذا نحتاجها'),
      t('Pollution and caring for the environment', 'التلوّث والعناية بالبيئة'),
      t('Population and where people live', 'السكان وأماكن عيشهم'),
    ],
  },
  5: {
    math: [
      t('Place value with decimals', 'القيمة المنزلية في الأعداد العشرية'),
      t('Operations with decimals', 'العمليات على الأعداد العشرية'),
      t('Adding and subtracting fractions with different denominators', 'جمع الكسور وطرحها ذات المقامات المختلفة'),
      t('Multiplying fractions', 'ضرب الكسور'),
      t('Introduction to percentages', 'مقدمة في النسب المئوية'),
      t('Introduction to ratio', 'مقدمة في النسبة'),
      t('Volume of cuboids', 'حجم متوازي المستطيلات'),
      t('Triangles and quadrilaterals', 'المثلثات والأشكال الرباعية'),
      t('Coordinates', 'الإحداثيات'),
      t('Order of operations', 'ترتيب العمليات'),
    ],
    science: [
      t('The heart and blood circulation', 'القلب والدورة الدموية'),
      t('Breathing and the lungs', 'التنفس والرئتان'),
      t('Microorganisms', 'الكائنات الدقيقة'),
      t('Flowers, seeds and pollination', 'الأزهار والبذور والتلقيح'),
      t('Ecosystems', 'الأنظمة البيئية'),
      t('Mixtures and solutions', 'المخاليط والمحاليل'),
      t('Gravity, friction and air resistance', 'الجاذبية والاحتكاك ومقاومة الهواء'),
      t('The Earth, Sun and Moon', 'الأرض والشمس والقمر'),
      t('Reflection of light', 'انعكاس الضوء'),
    ],
    english: [
      t('Present perfect tense', 'المضارع التام'),
      t('Introduction to the passive voice', 'مقدمة في المبني للمجهول'),
      t('Relative clauses (who, which, that)', 'جمل الصلة'),
      t('Modal verbs', 'الأفعال الناقصة المساعدة'),
      t('Introduction to reported speech', 'مقدمة في الكلام المنقول'),
      t('Writing a letter or email', 'كتابة رسالة أو بريد إلكتروني'),
      t('Persuasive writing', 'الكتابة الإقناعية'),
      t("The author's purpose", 'هدف الكاتب'),
    ],
    arabic: [
      t('Sound and weak verbs', 'الفعل الصحيح والفعل المعتل'),
      t('The five verbs', 'الأفعال الخمسة'),
      t('Adverbs of time and place', 'ظرف الزمان وظرف المكان'),
      t('The haal (state)', 'الحال'),
      t('Sound plurals', 'جمع المذكر السالم وجمع المؤنث السالم'),
      t('Broken plurals', 'جمع التكسير'),
      t('Hamza at the end of a word', 'الهمزة المتطرفة'),
      t('Writing a short story', 'كتابة قصة قصيرة'),
    ],
    social: [
      t('Physical geography of the world', 'الجغرافيا الطبيعية للعالم'),
      t('Early civilizations and their inventions', 'الحضارات القديمة واختراعاتها'),
      t('Explorers and trade routes', 'المستكشفون وطرق التجارة'),
      t('Farming, industry and services', 'الزراعة والصناعة والخدمات'),
      t("Children's rights", 'حقوق الطفل'),
      t('Map scale', 'مقياس الرسم'),
      t('Climate and plant life', 'المناخ والنبات الطبيعي'),
      t('Cities and how they grow', 'المدن وكيف تنمو'),
    ],
  },
  6: {
    math: [
      t('Negative numbers (integers)', 'الأعداد السالبة (الأعداد الصحيحة)'),
      t('Ratio and rate', 'النسبة والمعدل'),
      t('Percentages', 'النسب المئوية'),
      t('Fractions, decimals and percentages', 'الكسور والأعداد العشرية والنسب المئوية'),
      t('Introduction to algebra', 'مقدمة في الجبر'),
      t('Simple equations', 'المعادلات البسيطة'),
      t('Area of triangles and parallelograms', 'مساحة المثلث ومتوازي الأضلاع'),
      t('Circles', 'الدائرة'),
      t('Angles in triangles and on a straight line', 'زوايا المثلث والزوايا على خط مستقيم'),
      t('Mean, median, mode and range', 'المتوسط والوسيط والمنوال والمدى'),
      t('Prime numbers, HCF and LCM', 'الأعداد الأولية والقاسم المشترك الأكبر والمضاعف المشترك الأصغر'),
    ],
    science: [
      t('Cells: the building blocks of life', 'الخلية: وحدة بناء الكائن الحي'),
      t('Classification of living things', 'تصنيف الكائنات الحية'),
      t('The skeleton and muscles', 'الهيكل العظمي والعضلات'),
      t('Particles in solids, liquids and gases', 'الجسيمات في المواد الصلبة والسائلة والغازية'),
      t('Physical and chemical changes', 'التغيرات الفيزيائية والكيميائية'),
      t('Forms of energy', 'أشكال الطاقة'),
      t('Series and parallel circuits', 'الدوائر على التوالي والتوازي'),
      t('The solar system', 'المجموعة الشمسية'),
      t("Earth's resources", 'موارد الأرض'),
    ],
    english: [
      t('Review of the main tenses', 'مراجعة الأزمنة الرئيسة'),
      t('Zero and first conditionals', 'الجمل الشرطية (الصفرية والأولى)'),
      t('The passive voice', 'المبني للمجهول'),
      t('Reported speech', 'الكلام المنقول'),
      t('Common phrasal verbs', 'الأفعال المركبة الشائعة'),
      t('Essay writing (introduction, body, conclusion)', 'كتابة المقال (مقدمة، عرض، خاتمة)'),
      t('Summarising a text', 'تلخيص نص'),
      t('Similes and metaphors', 'التشبيه والاستعارة في الإنجليزية'),
    ],
    arabic: [
      t('Nominal and verbal sentences', 'الجملة الاسمية والجملة الفعلية'),
      t('The absolute object (maf\'ul mutlaq)', 'المفعول المطلق'),
      t('Tamyeez', 'التمييز'),
      t('Exception with illa', 'الاستثناء بإلّا'),
      t('Numbers and counted nouns', 'العدد والمعدود'),
      t('Alif layyina', 'الألف اللينة'),
      t('Writing a short essay', 'كتابة مقال قصير'),
      t('Simile (tashbeeh)', 'التشبيه'),
    ],
    social: [
      t('Ancient civilizations of the world', 'الحضارات القديمة في العالم'),
      t('Using an atlas', 'استخدام الأطلس'),
      t("Earth's rotation, revolution and time zones", 'دوران الأرض وحركتها حول الشمس وفروق التوقيت'),
      t('World climates and biomes', 'مناخات العالم وأقاليمه الحيوية'),
      t('Resources and economic activities', 'الموارد والأنشطة الاقتصادية'),
      t('Taking part in the community', 'المشاركة في المجتمع'),
      t('Countries working together', 'التعاون بين الدول'),
      t('Population and migration', 'السكان والهجرة'),
    ],
  },
  7: {
    math: [
      t('Integers and their operations', 'الأعداد الصحيحة والعمليات عليها'),
      t('Rational numbers', 'الأعداد النسبية'),
      t('Simplifying and expanding expressions', 'تبسيط العبارات الجبرية وفكّها'),
      t('Linear equations in one variable', 'المعادلات الخطية بمتغيّر واحد'),
      t('Proportion and percentage change', 'التناسب ونسبة التغيّر المئوية'),
      t('Angles and parallel lines', 'الزوايا والمستقيمات المتوازية'),
      t('Area of composite shapes', 'مساحة الأشكال المركّبة'),
      t('Volume and surface area of prisms', 'حجم المنشور ومساحة سطحه'),
      t('Introduction to probability', 'مقدمة في الاحتمالات'),
      t('Averages and charts', 'المتوسطات والتمثيلات البيانية'),
    ],
    science: [
      t('The scientific method', 'الطريقة العلمية'),
      t('Cells and organisms', 'الخلايا والكائنات الحية'),
      t('Particles and states of matter', 'الجسيمات وحالات المادة'),
      t('Elements, compounds and mixtures', 'العناصر والمركّبات والمخاليط'),
      t('Forces and motion', 'القوى والحركة'),
      t('Energy', 'الطاقة'),
      t("The Earth's structure", 'تركيب الأرض'),
      t('Ecosystems', 'الأنظمة البيئية'),
    ],
    physics: [
      t('Measurement and SI units', 'القياس ووحدات النظام الدولي'),
      t('Speed, distance and time', 'السرعة والمسافة والزمن'),
      t('Forces and their effects', 'القوى وآثارها'),
      t('Mass, weight and gravity', 'الكتلة والوزن والجاذبية'),
      t('Energy forms and conservation', 'أشكال الطاقة وحفظها'),
      t('Heat and temperature', 'الحرارة ودرجة الحرارة'),
      t('Light: reflection and shadows', 'الضوء: الانعكاس والظلال'),
      t('Sound waves', 'الموجات الصوتية'),
      t('Simple electric circuits', 'الدوائر الكهربائية البسيطة'),
    ],
    chemistry: [
      t('Lab equipment and working safely', 'أدوات المختبر والعمل الآمن'),
      t('Particle theory of matter', 'النظرية الجسيمية للمادة'),
      t('Elements and their symbols', 'العناصر ورموزها'),
      t('Introduction to atoms', 'مقدمة في الذرّة'),
      t('Separating mixtures (filtering, evaporation, distillation)', 'فصل المخاليط (الترشيح، التبخير، التقطير)'),
      t('Solutions and solubility', 'المحاليل والذوبانية'),
      t('Physical and chemical changes', 'التغيرات الفيزيائية والكيميائية'),
      t('Acids, alkalis and indicators', 'الأحماض والقلويات والكواشف'),
      t('Metals and non-metals', 'الفلزات واللافلزات'),
    ],
    biology: [
      t('Characteristics of living things', 'خصائص الكائنات الحية'),
      t('Plant and animal cells', 'الخلية النباتية والخلية الحيوانية'),
      t('Using a microscope', 'استخدام المجهر'),
      t('Classification and keys', 'التصنيف والمفاتيح'),
      t('Nutrition and the digestive system', 'التغذية والجهاز الهضمي'),
      t('Introduction to photosynthesis', 'مقدمة في البناء الضوئي'),
      t('Food webs and ecosystems', 'الشبكات الغذائية والأنظمة البيئية'),
      t('Adaptation', 'التكيّف'),
      t('Microorganisms', 'الكائنات الدقيقة'),
    ],
    english: [
      t('Using tenses accurately', 'استخدام الأزمنة بدقة'),
      t('Conditionals', 'الجمل الشرطية'),
      t('The passive voice', 'المبني للمجهول'),
      t('Reported speech', 'الكلام المنقول'),
      t('Relative clauses', 'جمل الصلة'),
      t('Narrative writing', 'الكتابة السردية'),
      t('Descriptive writing', 'الكتابة الوصفية'),
      t('Reading for detail and inference', 'القراءة للتفاصيل والاستنتاج'),
      t('Word families', 'عائلات الكلمات'),
    ],
    arabic: [
      t('Words in the nominative case', 'المرفوعات'),
      t('Words in the accusative case', 'المنصوبات'),
      t('Words in the genitive case', 'المجرورات'),
      t('Parsing the five verbs', 'إعراب الأفعال الخمسة'),
      t('The passive verb', 'الفعل المبني للمجهول'),
      t('The vocative (nidaa)', 'أسلوب النداء'),
      t('Simile and metaphor', 'التشبيه والاستعارة'),
      t('Hamzat al-wasl and hamzat al-qat', 'همزة الوصل وهمزة القطع'),
      t('Writing an article', 'كتابة المقالة'),
    ],
    social: [
      t('Landforms and how they form', 'تضاريس الأرض وكيف تتكوّن'),
      t('Weather and climate', 'الطقس والمناخ'),
      t('Conserving natural resources', 'المحافظة على الموارد الطبيعية'),
      t('Ancient civilizations (Mesopotamia, Egypt, Greece, Rome)', 'الحضارات القديمة (الرافدين، مصر، اليونان، الرومان)'),
      t('The golden age of science (astronomy, medicine, algebra)', 'العصر الذهبي للعلوم (الفلك، الطب، الجبر)'),
      t('Rights and duties of citizens', 'حقوق المواطن وواجباته'),
      t('Production and trade', 'الإنتاج والتجارة'),
      t('Population and cities', 'السكان والمدن'),
    ],
  },
  8: {
    math: [
      t('Exponents and powers', 'الأسس والقوى'),
      t('Square roots', 'الجذور التربيعية'),
      t('Scientific notation', 'الصيغة العلمية'),
      t('Linear equations and inequalities', 'المعادلات والمتباينات الخطية'),
      t('Linear functions and slope', 'الدوال الخطية والميل'),
      t("Pythagoras' theorem", 'نظرية فيثاغورس'),
      t('Transformations (translation, reflection, rotation)', 'التحويلات الهندسية (الانسحاب، الانعكاس، الدوران)'),
      t('Circumference and area of a circle', 'محيط الدائرة ومساحتها'),
      t('Probability of events', 'احتمال الحوادث'),
      t('Scatter graphs', 'أشكال الانتشار'),
    ],
    science: [
      t('Atoms and the periodic table', 'الذرّات والجدول الدوري'),
      t('Chemical reactions', 'التفاعلات الكيميائية'),
      t('Forces and pressure', 'القوى والضغط'),
      t('Electricity and magnetism', 'الكهرباء والمغناطيسية'),
      t('Light and sound waves', 'موجات الضوء والصوت'),
      t('Human body systems', 'أجهزة جسم الإنسان'),
      t('Introduction to genetics', 'مقدمة في الوراثة'),
      t('Earth and space', 'الأرض والفضاء'),
    ],
    physics: [
      t('Distance-time graphs', 'تمثيل المسافة والزمن بيانيًّا'),
      t('Pressure in solids, liquids and gases', 'الضغط في المواد الصلبة والسائلة والغازية'),
      t('Turning forces (moments)', 'العزوم'),
      t('Work, energy and power', 'الشغل والطاقة والقدرة'),
      t('Heat transfer (conduction, convection, radiation)', 'انتقال الحرارة (التوصيل، الحمل، الإشعاع)'),
      t('Refraction and lenses', 'انكسار الضوء والعدسات'),
      t('Waves', 'الموجات'),
      t('Static electricity', 'الكهرباء الساكنة'),
      t('Current, voltage and resistance', 'التيار والجهد والمقاومة'),
    ],
    chemistry: [
      t('Atomic structure (protons, neutrons, electrons)', 'تركيب الذرّة (البروتونات، النيوترونات، الإلكترونات)'),
      t('The periodic table', 'الجدول الدوري'),
      t('Chemical formulas', 'الصيغ الكيميائية'),
      t('Chemical reactions and word equations', 'التفاعلات الكيميائية والمعادلات اللفظية'),
      t('Conservation of mass', 'حفظ الكتلة'),
      t('Acids, bases and neutralisation', 'الأحماض والقواعد والتعادل'),
      t('The reactivity series of metals', 'سلسلة النشاط الكيميائي للفلزات'),
      t('Burning (combustion)', 'الاحتراق'),
      t('Introduction to rates of reaction', 'مقدمة في سرعة التفاعل'),
    ],
    biology: [
      t('Specialised cells', 'الخلايا المتخصصة'),
      t('Tissues, organs and systems', 'الأنسجة والأعضاء والأجهزة'),
      t('Respiration', 'التنفس الخلوي'),
      t('The circulatory system', 'الجهاز الدوري'),
      t('The respiratory system', 'الجهاز التنفسي'),
      t('Photosynthesis', 'البناء الضوئي'),
      t('Inheritance and variation', 'الوراثة والتنوع'),
      t('Germs and the immune system', 'الجراثيم وجهاز المناعة'),
      t('Humans and the environment', 'الإنسان والبيئة'),
    ],
    english: [
      t('Perfect continuous tenses', 'الأزمنة التامة المستمرة'),
      t('Modal verbs for advice and possibility', 'الأفعال المساعدة للنصيحة والاحتمال'),
      t('Second and third conditionals', 'الجمل الشرطية الثانية والثالثة'),
      t('Argumentative writing', 'الكتابة الجدلية'),
      t('Formal and informal letters', 'الرسائل الرسمية وغير الرسمية'),
      t('Literary devices', 'الأساليب الأدبية'),
      t('Tone and point of view', 'النبرة ووجهة النظر'),
      t('Summary writing', 'كتابة الملخص'),
    ],
    arabic: [
      t('Active and passive participles', 'اسم الفاعل واسم المفعول'),
      t('Verbs that change the sentence (nawasikh)', 'النواسخ'),
      t('Followers: adjective, conjunction, emphasis, substitute', 'التوابع: النعت والعطف والتوكيد والبدل'),
      t('Conditional sentences', 'أسلوب الشرط'),
      t('Exclamation', 'أسلوب التعجب'),
      t('Poetry and prose texts', 'النصوص الأدبية: الشعر والنثر'),
      t('Metonymy (kinaya)', 'الكناية'),
      t('Writing a report', 'كتابة التقرير'),
    ],
    social: [
      t('Map skills: contour lines and scale', 'مهارات الخريطة: خطوط الكنتور ومقياس الرسم'),
      t('Population change', 'التغيّر السكاني'),
      t('Economic systems and trade', 'الأنظمة الاقتصادية والتجارة'),
      t('The Industrial Revolution', 'الثورة الصناعية'),
      t('The age of exploration', 'عصر الاستكشافات الجغرافية'),
      t('Environmental challenges (climate change, water shortage)', 'التحديات البيئية (تغيّر المناخ، شحّ المياه)'),
      t('Human rights', 'حقوق الإنسان'),
      t('International organisations', 'المنظمات الدولية'),
    ],
  },
  9: {
    math: [
      t('Factorising quadratic expressions', 'تحليل العبارات التربيعية'),
      t('Quadratic equations', 'المعادلات التربيعية'),
      t('Simultaneous linear equations', 'المعادلات الخطية الآنية'),
      t('Functions and their graphs', 'الدوال وتمثيلها البياني'),
      t('Similarity and congruence', 'التشابه والتطابق'),
      t('Introduction to trigonometry (sine, cosine, tangent)', 'مقدمة في حساب المثلثات (الجيب، جيب التمام، الظل)'),
      t('Volume of cylinders, cones and spheres', 'حجم الأسطوانة والمخروط والكرة'),
      t('Combined probability', 'الاحتمالات المركّبة'),
      t('Comparing data sets', 'مقارنة مجموعات البيانات'),
      t('Arithmetic sequences', 'المتتاليات الحسابية'),
    ],
    science: [
      t('Chemical bonding', 'الروابط الكيميائية'),
      t('Electricity at home', 'الكهرباء في المنزل'),
      t("Newton's laws", 'قوانين نيوتن'),
      t('The electromagnetic spectrum', 'الطيف الكهرومغناطيسي'),
      t('Cell division and genetics', 'انقسام الخلية والوراثة'),
      t('Sustainability', 'الاستدامة'),
      t('Energy resources', 'مصادر الطاقة'),
      t('The universe', 'الكون'),
    ],
    physics: [
      t("Newton's laws of motion", 'قوانين نيوتن للحركة'),
      t('Velocity and acceleration', 'السرعة المتجهة والتسارع'),
      t('Introduction to momentum', 'مقدمة في الزخم'),
      t('Density', 'الكثافة'),
      t("Ohm's law", 'قانون أوم'),
      t('Magnetism and electromagnetism', 'المغناطيسية والكهرومغناطيسية'),
      t('The electromagnetic spectrum', 'الطيف الكهرومغناطيسي'),
      t('Energy resources and efficiency', 'مصادر الطاقة والكفاءة'),
      t('Work, energy and power', 'الشغل والطاقة والقدرة'),
    ],
    chemistry: [
      t('Ionic and covalent bonding', 'الروابط الأيونية والتساهمية'),
      t('Balancing chemical equations', 'موازنة المعادلات الكيميائية'),
      t('Introduction to the mole', 'مقدمة في المول'),
      t('Acids, bases and salts', 'الأحماض والقواعد والأملاح'),
      t('Introduction to oxidation and reduction', 'مقدمة في الأكسدة والاختزال'),
      t('Introduction to electrolysis', 'مقدمة في التحليل الكهربائي'),
      t('Hydrocarbons', 'الهيدروكربونات'),
      t('Rates of reaction', 'سرعة التفاعل'),
      t('The atmosphere', 'الغلاف الجوي'),
    ],
    biology: [
      t('Cell division (mitosis)', 'انقسام الخلية (الانقسام المتساوي)'),
      t('DNA, genes and chromosomes', 'الحمض النووي والجينات والكروموسومات'),
      t('Simple genetic crosses', 'التهجين الوراثي البسيط'),
      t('Variation and adaptation', 'التنوع والتكيّف'),
      t('The nervous system and reflexes', 'الجهاز العصبي والأفعال المنعكسة'),
      t('Keeping the body balanced (homeostasis)', 'الاتزان الداخلي في الجسم'),
      t('Enzymes and digestion', 'الإنزيمات والهضم'),
      t('The carbon cycle', 'دورة الكربون'),
      t('Health and immunity', 'الصحة والمناعة'),
    ],
    english: [
      t('Complex sentences and clauses', 'الجمل المركّبة وأشباه الجمل'),
      t('Mixed conditionals', 'الجمل الشرطية المختلطة'),
      t('The passive in different tenses', 'المبني للمجهول في الأزمنة المختلفة'),
      t('Reported questions and commands', 'نقل الأسئلة والأوامر'),
      t('Discursive essays', 'المقال النقاشي'),
      t('Analysing poems and stories', 'تحليل القصائد والقصص'),
      t('Note-taking and research skills', 'مهارات تدوين الملاحظات والبحث'),
      t('Giving a presentation', 'تقديم عرض شفهي'),
      t('Collocations', 'المتلازمات اللفظية'),
    ],
    arabic: [
      t('Full parsing of a sentence', 'الإعراب الشامل للجملة'),
      t('Questions (istifham)', 'أسلوب الاستفهام'),
      t('Negation', 'أسلوب النفي'),
      t('Rules of numbers', 'أحكام العدد'),
      t('Verbal nouns (masdar)', 'المصادر'),
      t('Antithesis and paronomasia (tibaq and jinas)', 'الطباق والجناس'),
      t('Analysing a literary text', 'تحليل نص أدبي'),
      t('Writing an argumentative essay', 'كتابة المقال الحجاجي'),
    ],
    social: [
      t('Global climate and climate change', 'المناخ العالمي وتغيّر المناخ'),
      t('Economic development and globalisation', 'التنمية الاقتصادية والعولمة'),
      t('Natural resources and energy', 'الموارد الطبيعية والطاقة'),
      t('Inventions of the modern world', 'اختراعات العالم الحديث'),
      t('International cooperation', 'التعاون الدولي'),
      t('Urbanisation', 'التحضّر'),
      t('Sustainable development', 'التنمية المستدامة'),
      t('Map skills: reading thematic maps', 'مهارات الخريطة: قراءة الخرائط الموضوعية'),
    ],
  },
};

/** Any number turned into a whole grade from 1 to 9. */
export function clampGrade(grade: number): number {
  if (!Number.isFinite(grade)) return MIN_GRADE;
  return Math.min(MAX_GRADE, Math.max(MIN_GRADE, Math.round(grade)));
}

/** The age a child in this grade usually is (used when an older profile has no age). */
export function defaultAgeForGrade(grade: number): number {
  return clampGrade(grade) + 5;
}

/** The child's age if known and sensible, otherwise the usual age for the grade. */
export function effectiveAge(grade: number, age?: number | null): number {
  if (typeof age === 'number' && Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE) return age;
  return defaultAgeForGrade(grade);
}

/** Subjects offered in a grade. Physics, chemistry and biology only in grades 7-9. */
export function subjectsForGrade(grade: number): Subject[] {
  const g = clampGrade(grade);
  return ALL_SUBJECTS.filter((s) => g >= 7 || !MIDDLE_SCHOOL_SUBJECTS.includes(s));
}

/** Typical topics for a grade and subject ([] when the subject is not taught in that grade). */
export function topicsFor(grade: number, subject: Subject): CurriculumTopic[] {
  const g = clampGrade(grade);
  if (!subjectsForGrade(g).includes(subject)) return [];
  return (CURRICULUM[g]?.[subject] ?? []).map((x) => ({ ...x }));
}

/**
 * A short description of the child's expected level, for AI prompts: vocabulary, sentence
 * length, number range and how abstract the explanation may be. English (prompt language).
 */
export function levelGuide(grade: number, age?: number | null): string {
  const g = clampGrade(grade);
  const a = effectiveAge(g, age);
  let base: string;
  if (g <= 2) {
    base =
      'Very young learner. Use only very simple, everyday words; explain the one new school word in the simplest way. Sentences of about 6 to 8 words. ' +
      `Numbers: ${g === 1 ? 'up to 20 for sums, up to 100 for counting' : 'up to 100 for sums, up to 1000 for counting'}. ` +
      'One idea at a time, with things the child can see, touch or count. No abstract ideas, no symbols they have not learned.';
  } else if (g <= 4) {
    base =
      'Young primary learner. Everyday words; explain each new school word once in simple words. Sentences of about 10 to 12 words. ' +
      'Numbers: whole numbers into the thousands, times tables, simple fractions' + (g === 4 ? ' and simple decimals' : '') + '. ' +
      'Mostly concrete examples; simple "why" reasoning in one or two steps.';
  } else if (g <= 6) {
    base =
      'Upper primary learner. Clear school vocabulary; define each new term. Sentences of up to about 16 words. ' +
      'Numbers: large numbers, decimals, fractions, percentages' + (g === 6 ? ', negative numbers and letters for unknowns (simple algebra)' : '') + '. ' +
      'Abstract ideas are fine after a concrete example first; two or three step reasoning; simple cause and effect.';
  } else {
    base =
      'Middle-school learner. Use the proper subject words and define each one clearly. Sentences of up to about 20 words; short paragraphs are fine. ' +
      'Math: integers, fractions, ratio, algebra and equations, powers, geometry formulas' + (g === 9 ? ', quadratics and basic trigonometry' : '') + '. ' +
      'Abstract ideas and models (particles, cells, forces, energy) are fine, linked to a real-life example; multi-step reasoning. Friendly and encouraging, but never babyish.';
  }
  const usual = defaultAgeForGrade(g);
  const ageNote =
    a < usual - 1
      ? ' This child is younger than most children in this grade: use slightly simpler words and shorter sentences.'
      : a > usual + 1
        ? ' This child is older than most children in this grade: keep the grade content, but do not sound babyish.'
        : '';
  return `Grade ${g}, age ${a}. ${base}${ageNote}`;
}
