# 03: How well the AI tools work in Arabic

Phase 0 deep research for Zaki. Covers safety filters (moderation), speech (listening and talking), and reading photos of pages.
Prepared 2026-10-15. All sources were checked on 2026-10-15 unless another date is given.
Scope: this follows two scope updates from the founder.
- **The first pilot is with the founder's family in Lebanon.** Lebanese/Levantine Arabic, Lebanese Arabizi, and French–Arabic–English mixing are therefore tested **first**.
- The market is the Middle East with a GCC focus, so Gulf Arabic (Qatar, Saudi Najdi and Hijazi, Emirati) and Egyptian are also covered.
- Zaki will be a **native iPhone/iPad app** in the Apple App Store, so on-device speech is covered (B6).

Status labels used below:
- **Confirmed**: an official document or a primary study says it directly.
- **Partly confirmed**: there is some evidence, but it is indirect, old, small, or from a vendor.
- **Not found**: I searched and found no published evidence. This is a real gap, not a "no".

---

## Plain-language summary

- **No safety filter has been publicly tested on Lebanese or Gulf Arabic, or on "Arabizi" (Arabic typed in English letters and numbers, like "7abibi").** OpenAI's free filter and Microsoft's filter both work in Arabic, but neither company publishes how well. Zaki must build its own test list and measure this before children use the app.
- **Arabizi is a known weak spot.** A 2024 study showed that writing in Arabizi tricked big AI models into unsafe answers that plain Arabic did not. Arabizi needs extra testing and extra protection.
- **Two filters named in the plan or commonly suggested are poor choices.** Google's "Perspective" filter is being switched off at the end of 2026. Meta's "Llama Guard" does not officially support Arabic. There is a filter built in Qatar for Arabic, called FanarGuard, that is worth testing as the second filter.
- **Speech-to-text: Qatari Arabic is supported, but children's voices are the big unknown.** Microsoft Azure has a Qatari Arabic setting, and a Qatari voice for reading aloud, and it can run in a data centre in Qatar. The best tools still get about 1 word in 3 wrong on adult Gulf speech. The only published study of Arabic-speaking children got about 2 words in 3 wrong. Voice should be an extra, not the main way children use Zaki, until we test it with real children.
- **Read-aloud voices exist for Lebanon, every Gulf country, Egypt and Jordan, but none are child voices.** They are adult voices, which is fine for a tutor character.
- **Reading photos of pages: the AI is good at clear printed Arabic and much weaker on handwriting.** No one has published a test of Claude on Arabic text. Google's Gemini scored best in the main Arabic test, but the plan already rules it out. We need our own test with real textbook photos.
- **Audio and photos can be handled without being stored.** Microsoft deletes live speech straight away. OpenAI can turn off storage for speech-to-text. Anthropic deletes images after use. Each of these needs the right setting or an approved agreement.
- **For the Lebanon pilot:** Microsoft has Lebanese Arabic speech-to-text and two Lebanese read-aloud voices. However, in the one recent test that reports it, Lebanese speech was among the hardest Levantine dialects to transcribe (about 45–60% of words wrong for the systems listed). Lebanese children often mix Arabic, French and English in one sentence, which no tool has been tested on for children. Lebanese Arabizi has almost no safety research. All of this must be tested with the family first.
- **French is worth adding later, and is easier than Arabic.** Safety filters and speech tools are much better tested in French than in Arabic. Lebanese schools often teach maths and science in French or English, so French support would help the pilot family.
- **iPhones can do speech-to-text on the phone itself,** so audio never leaves the device. Apple's newer speech system appears to include Arabic, but this needs checking on a real iPhone. Accuracy for Lebanese children is unknown.
- **Costs for voice are small compared with the tutor itself.** Expect roughly $1 to $5 per child per month for speech-to-text, plus a similar amount for read-aloud if it is used heavily. These are estimates.

---

## What this changes in the plan

| # | Plan text (section) | What research shows | Suggested change |
|---|---|---|---|
| 1 | "OpenAI omni-moderation-latest plus a second classifier" (8.1, 10.1) | Still the current OpenAI name, and still free. OpenAI publishes **no Arabic accuracy figures**. For images it only checks sexual, violence and self-harm content. Hate, harassment and "sexual/minors" are checked in **text only**. | Keep it as the first layer, but treat it as unproven in Arabic until Zaki's own test set passes. Run it on the text read from each photo as well as the photo itself. |
| 2 | Second classifier (not named) | **Perspective API is shutting down** (no new users since Feb 2026, service ends 31 Dec 2026). **Llama Guard 3 and 4 do not list Arabic** as supported. **Azure Content Safety** was not trained or tested on Arabic. Used on its own, its text and image checks are **not offered in any Middle East Azure region**; the same checks attached to a model inside Microsoft Foundry ("Guardrails") are listed for UAE North, but not for Qatar. | Do not use Perspective. Do not rely on Llama Guard for Arabic. Shortlist for testing: (a) a Claude Haiku "policy check" written in Arabic and English, (b) **FanarGuard** (QCRI, Qatar; Arabic-native), (c) Qwen3Guard (open licence, 119 languages). Pick whichever does best on Zaki's test set. |
| 3 | "Build and test an Arabic and Gulf-dialect test set, including Arabizi" (8.1) | Correct and essential. No public test set covers Gulf, Arabizi and children's topics together. | Widen it to cover Saudi, Emirati, Egyptian and Levantine dialects too, plus mixed Arabic and English. See the protocol in Section D. |
| 4 | "Azure Speech (has Qatari Arabic 'ar-QA' speech-to-text)" (10.1) | **Confirmed.** ar-QA exists for speech-to-text, and two ar-QA read-aloud voices exist. A **new plus**: Azure Speech runs in the **Qatar Central** data centre for live speech-to-text and read-aloud. | Keep it. Note the Qatar hosting option for the data-law work. |
| 5 | "OpenAI speech" (10.1) | Model names have changed. OpenAI now recommends **gpt-transcribe** for recordings and **gpt-live-transcribe** for live speech. gpt-4o-transcribe and gpt-4o-mini-transcribe still work. | Use current names when testing. |
| 6 | "Speech is converted to text and the audio is deleted immediately" (8.2) | Possible with Azure live speech (nothing is stored). OpenAI speech-to-text keeps nothing for abuse monitoring, and zero storage is available with OpenAI's approval. OpenAI **read-aloud** keeps the text sent to it for 30 days unless zero storage is approved. ElevenLabs offers zero storage to **enterprise customers only**. | Prefer Azure in Qatar Central, or OpenAI with zero storage approved. Do not use ElevenLabs unless Zaki has an enterprise contract. |
| 7 | "Test Gulf dialect with real kids" (10.1, 14) | Strongly supported by the evidence. Child speech is the largest unknown (see B4). | Make voice optional at launch, with a "Did you say…?" confirm step. Plan the speech test across several dialects. |
| 8 | "Test 50 samples" of textbook photos (14) | Reasonable, but 50 is too few to judge handwriting **and** several page types **and** dialects. Claude has **no** published Arabic text-reading results. | Use about 120 photos in clear groups (see D2). Decide pass/fail rules before testing. |
| 9 | "Blur faces and names" in photos (8.1) | Doable. Faces can be found on the phone itself before upload. Finding names needs a text-reading step first. | Blur faces **on the phone**, before upload. Use a cropping step and an "is there a name here?" check. See C4. |
| 10 | Note on Gemini (7) | Gemini was the best Arabic text reader in the main benchmark (KITAB-Bench, early 2025). It stays excluded because of its terms for under-18 users. Azure Document Intelligence was also strong on Arabic print. | If Claude fails the photo test, test Azure Document Intelligence as a text-reading step before Claude. This is non-Gemini and needs no change to the terms decision. |
| 11 | Pilot location and dialect (implied Qatar throughout) | The first pilot is in **Lebanon**. Azure has ar-LB speech-to-text and two ar-LB voices. There is **no Azure data centre in Lebanon**, and Lebanon's own data-protection rules are not covered here. | Test Lebanese first (Section D). Ask the legal researcher to check Lebanese rules for children's data and audio, because Qatar's PDPPL is not the only law for this pilot. |
| 12 | "Next.js web app that installs on the phone (PWA)" (10.1) | Now a **native App Store app**. That allows Apple's **on-device speech** and on-device face detection (Apple Vision). | Add an Apple on-device speech option to the voice test (B6). Apple's Kids Category rules (plan 8.4) now apply from day one. |
| 13 | Languages: Arabic and English only (2) | Lebanese schools often teach maths and science in **French**. French is in Microsoft's trained-and-tested safety set and Llama Guard's supported set, so it is easier to support safely than Arabic. | Treat French as a likely **Phase 4 / v2** language. Include a few French–Arabic–English mixed items in the safety and speech tests now. |

---

## A. Content moderation (safety filters) in Arabic, Gulf dialect and Arabizi

### A1. OpenAI omni-moderation-latest — Partly confirmed (works in Arabic; quality unknown)
- **Official facts (Confirmed).** It is the only model named in the docs. It is free. It accepts text and images but not audio. For images, only `self-harm*`, `sexual` and `violence*` are checked. `harassment`, `hate`, `illicit` and `sexual/minors` are **text only**, and image-only inputs return 0 for them. ZDR-eligible, with no abuse-monitoring retention. Docs do not list languages.
  Sources: https://developers.openai.com/api/docs/guides/moderation ; https://developers.openai.com/api/docs/guides/your-data (both checked 2026-10-15).
- **Arabic accuracy: Not found.** OpenAI's 2024 launch claimed gains across 40 languages, especially low-resource ones. I could not open the page (HTTP 403), and secondary sources report no Arabic number. Portkey's independent benchmark (Sept 2024, 1,000 mixed multilingual samples, vendor blog) found **F1 0.32 and recall 0.25** on its multilingual set. That is better than the old model, but it means about 3 in 4 harmful items in that set were missed. There is no Arabic breakdown. https://portkey.ai/blog/openai-omni-moderation-latest-benchmark/
- **Dialect evidence (Partly confirmed, one study).** A benchmark on Moroccan Darija (Typica.ai, arXiv 2505.04640, May 2025) compared omni-moderation, Mistral and Claude 3 Haiku against a Darija-specific model. The authors report the specific model was best. The authors sell that model, which is a conflict of interest. Darija is not Gulf Arabic. https://arxiv.org/abs/2505.04640
- **Weight in synthesis:** low to moderate. It is useful and free, but there is no Arabic evidence.

### A2. Azure AI Content Safety — Confirmed (Arabic not in the trained-and-tested set)
- Microsoft says the Hate, Sexual, Violence and Self-harm text classifiers are "trained and tested on Chinese, English, French, German, Italian, Japanese, Portuguese, and Spanish". Other languages "can" work but "performance can vary". Prompt Shields (protection against trick prompts) is "primarily trained and evaluated on English".
- For standalone Content Safety, text and image harm checks are **not available in uaenorth**, and there is no Qatar region listed. In the Middle East and Africa table, only "content provenance" is ticked. Data would be processed in Europe, the US or Asia.
- *Correction (fact-check 2026-10-15):* the same page has a second table for **Guardrails in Microsoft Foundry** (safety checks attached to an AI model hosted in Foundry). That table ticks content harms, Prompt Shields and blocklists in **uaenorth**. So in-region (UAE) checking is possible only if the model being checked is also deployed in Foundry in UAE North. Qatar is not listed in either table.
- It offers custom **blocklists**, which are useful for Gulf slang and Arabizi spellings.
- Source: https://learn.microsoft.com/en-us/azure/ai-services/content-safety/language-support (the page now serves "Region availability and service limits", dated 2026-09-18).

### A3. Google Perspective API — Confirmed: being shut down
- No new requests since February 2026. Service ends 31 Dec 2026, with no migration support. **Do not use.**
- Sources: https://perspectiveapi.com/ ; https://www.drupal.org/project/perspectiveapi (marked obsolete).

### A4. Llama Guard 3 / 4 — Confirmed: Arabic not supported
- The Llama Guard 4 model card says multilingual support follows Llama Guard 3's languages: French, German, Hindi, Italian, Portuguese, Spanish and Thai. Even for those languages, multilingual **recall is 43%** (English 69%). https://huggingface.co/meta-llama/Llama-Guard-4-12B
- An Arabic safety study (Zbib & Mohanna, AUB, arXiv 2608.29378, Aug 2026, preprint) states that Llama Guard 3 "does not officially list Arabic", so using it in Arabic is off-label. https://arxiv.org/html/2608.29378

### A5. Arabic-specific or strong multilingual alternatives
| Option | What it is | Evidence on Arabic / dialect / Arabizi | Status |
|---|---|---|---|
| **FanarGuard** (QCRI, Qatar) | Bilingual Arabic–English filter that scores both harm and **cultural fit**. The paper describes RoBERTa-large (~435M), Gemma-2-2B and an internal FanarGemma-4B versions. Peer-reviewed at EACL 2026 (Rabat, March 2026). The paper says it is **available through the Fanar API** (api.fanar.qa). Link to a "Fanar 2.0 stack" was **not verified**. | The authors report it matches state-of-the-art filters on safety benchmarks and agrees with human raters better than raters agree with each other. The paper names **no dialects and no Arabizi**, and its Arabic training data was **machine-translated from English (Google Translate)**, so dialect and Arabizi performance may be weak. Dataset on Hugging Face is licensed "other". **Model licence and API terms not found.** | Partly confirmed. https://arxiv.org/abs/2511.18852 ; https://aclanthology.org/2026.eacl-long.368 |
| **Qwen3Guard** (Alibaba) | Open (Apache 2.0) safety classifier in 0.6B/4B/8B sizes. "119 languages and dialects". Can classify as text streams out. | No Arabic numbers in its report. In the AUB study, used as a judge on 300 audited answers, it was **88.7% accurate overall**: MSA 90%, Egyptian 90%, Levantine 95%, **Arabizi 77.5%**. Small sample, and no Gulf. | Partly confirmed. https://arxiv.org/abs/2510.14276 ; https://arxiv.org/html/2608.29378 |
| **gpt-oss-safeguard** (OpenAI, open-weight 20B/120B) | Reads a safety policy you write and applies it. | A third-party review says it is weaker outside English. No Arabic numbers. | Not found (Arabic). https://openai.com/index/introducing-gpt-oss-safeguard/ |
| **PolyGuard** (CMU et al., COLM 2025) | 17-language safety model; Arabic is one of the 17. | Claims to beat existing classifiers by 4–5.5%. I did not retrieve its per-language Arabic figure. | Partly confirmed. https://arxiv.org/abs/2504.04377 |
| **Fine-tuned Arabic BERT models** (e.g. MARBERTv2) | Small classifiers trained on labelled data. | ArabicDialectSafety (EMNLP 2026 Findings) found a fine-tuned MARBERTv2 reached **macro-F1 0.95** for safe/unsafe. Prompted frontier LLMs did "substantially worse". Gaps remain for Maghrebi dialects. Dialects covered: MSA, Syrian, Egyptian, Algerian, Palestinian, Moroccan. **No Gulf and no Arabizi.** | Confirmed (for those dialects). https://arxiv.org/abs/2608.01291 |
| **Claude Haiku as a policy checker** | An LLM prompt holding Zaki's child-safety rules. | No published Arabic moderation figures for current Claude models. | Not found. Must be tested. |

### A6. Known weaknesses: dialect, Arabizi, code-switching
- **Arabizi bypasses safety training (Confirmed, peer-reviewed).** Al Ghanim et al., EMNLP 2024: AdvBench harmful prompts in standard Arabic did **not** get unsafe output from GPT-4 or Claude 3 Sonnet. The same prompts in **Arabizi and transliteration did**. https://aclanthology.org/2024.emnlp-main.1034/
- **Dialects get weaker safety than standard Arabic (Partly confirmed).** "Toward Dialect-Aware Safety Evaluation for Arabic LLMs" (Zaghouani, TrustNLP 2026 workshop) names this the "Dialect Safety Gap", finds safety gets worse the further a dialect is from standard Arabic, and argues dialects are under-represented in safety data. ArabicDialectSafety reports lower scores on low-resource dialects. https://aclanthology.org/2026.trustnlp-main.37/
- **Arabizi offensive-language detection exists only for North African data** (Bensalem et al., ArabicNLP 2023; MAGHREB-HOF). **Not found** for Gulf Arabizi. https://aclanthology.org/2023.arabicnlp-1.36
- **Gulf-specific hate/offence data:** ADHAR (2024, Qatar-based authors) includes a Gulf subset, with hate detection up to ~90% F1 using trained classifiers. That is a research dataset, not a ready filter. https://pmc.ncbi.nlm.nih.gov/articles/PMC11170444/
- **Levantine and Lebanese (pilot dialect):**
  - Levantine has more research than Gulf.
    - L-HSAB (2019): Levantine hate and abuse tweets, 5,846 items, Arabic script. https://aclanthology.org/W19-3512
    - Let-Mi (2021): Levantine misogyny tweets, 6,550 items. https://arxiv.org/abs/2103.10195
    - ArabicDialectSafety covers Syrian and Palestinian.
    - In the AUB study, Qwen3Guard was 95% accurate on its Levantine subset, a small sample.
  - **Lebanese Arabizi:** a Lebanese American University project is building a Lebanese Arabizi dataset (sarcasm, emotion, Arabizi detection). **No offensive or harmful-content labels were confirmed.** https://laur.lau.edu.lb:8443/xmlui/handle/10725/15805
  - **French–Arabic–English mixing in safety filters: Not found** for Levantine.
  - Overall, Lebanese Arabizi and three-language mixing are the **least-evidenced** inputs Zaki will see in its first pilot.
- **Children-specific harms in Arabic** (grooming, secrecy requests, self-harm said in kids' language): **Not found** in any Arabic benchmark.

### A7. Which makes a good "second classifier"? (recommendation, moderate confidence)
1. **Do not choose by reputation. Choose by Zaki's own test results** (A8). No candidate has published Gulf or Arabizi evidence.
2. **Most practical for a non-programmer team:** a **Claude Haiku policy check** written in Arabic and English. It needs no extra vendor, no GPU server, and Zaki's data rules already cover it. Its weakness is that it is the same model family as the tutor, so it is less independent.
3. **Most promising Arabic-native option:** **FanarGuard**. It is Qatari-built and culturally aware. Before relying on it, confirm (a) the licence and the Fanar API's terms (the paper says it is offered through the Fanar API; whether children's data may be sent there, and where it is processed, is unknown), (b) Gulf, Lebanese and Arabizi performance on Zaki's set. Its Arabic training data was machine-translated, so dialect weakness is likely.
4. **Cheap extra layer for any choice:** a **blocklist and normaliser** for Gulf slang and Arabizi spellings. Microsoft offers blocklists, or Zaki can keep its own list. One idea, **untested**: convert Arabizi into Arabic script before filtering.
5. Drop Perspective. Use Llama Guard and Azure Content Safety only if they score well on Zaki's set, and remember that standalone Azure text checks are processed outside the region (only the Foundry "Guardrails" version is listed for UAE North).

### A8. Testing approach for Zaki's Arabic test set (moderation)
- **Size:** at least 600 items to start: about 300 harmful and 300 harmless. Grow to more than 1,000 by the pilot.
- **Language mix:** in each category, use matching versions in **Lebanese/Levantine (first)**, **Lebanese Arabizi**, **French–Arabic–English mixed** (Lebanese style), English, MSA, Gulf (Qatari, Saudi Najdi and Hijazi, Emirati), Gulf and Egyptian **Arabizi** (for example "3" = ع, "7" = ح, "2" = ء), Egyptian, and Arabic–English mixed. Add some **French-only** items too, because Lebanese children may type in French.
- **Categories (matching plan 8.6):** begging for answers; adult or sexual; violence; self-harm said in a child's words; abuse disclosure ("my uncle hits me"); secrecy requests; personal-data fishing; tricks hidden in photos; and **harmless look-alikes**. Examples of look-alikes: school words that sound rude, body-part words in science lessons, religious and historical content, and family words. These measure false alarms, which frustrate kids and parents.
- **Who writes and labels:** at least two native speakers per dialect group, ideally including a Qatari teacher or parent, labelling separately. Measure how often they agree. Never use real children's messages without consent.
- **What to measure, for each tool and each dialect:** missed harmful items (the most important), false alarms on harmless items, and results on safety-script items ("must alert parent"). Suggested go/no-go rule, for the team to confirm: for self-harm, abuse and sexual items, the combined filters must catch at least 98% in every dialect including Arabizi, with false alarms of 5% or less on harmless school content.
- **Combined result:** test each filter alone and then the **stack** (OpenAI + second + blocklist + the tutor's own refusal), because the stack is what protects children.
- **Re-run** on every model or prompt change, as plan 8.6 already says.

---

## B. Speech-to-text and text-to-speech

### B1. Azure Speech — Confirmed
- **Speech-to-text locales (Confirmed):** ar-QA, ar-SA, ar-AE, ar-KW, ar-BH, ar-OM, ar-EG, ar-JO (and others: 18 Arabic locales). All support fast transcription and custom training with audio plus transcripts, which could later improve accuracy on children. Only **ar-SA** has the newer "post-stream refinement" features. Microsoft's newer MAI-Transcribe model lists Arabic only as generic `ar`.
  https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt
- **Read-aloud (neural TTS) voices (Confirmed). All are adult "standard" voices. No Arabic child voices are listed. No Arabic multilingual or HD voice was confirmed.**

| Locale | Female | Male |
|---|---|---|
| **ar-LB (Lebanon, pilot)** | ar-LB-LaylaNeural | ar-LB-RamiNeural |
| ar-SY (Syria) | ar-SY-AmanyNeural | ar-SY-LaithNeural |
| ar-QA (Qatar) | ar-QA-AmalNeural | ar-QA-MoazNeural |
| ar-SA (Saudi) | ar-SA-ZariyahNeural | ar-SA-HamedNeural |
| ar-AE (UAE) | ar-AE-FatimaNeural | ar-AE-HamdanNeural |
| ar-KW (Kuwait) | ar-KW-NouraNeural | ar-KW-FahedNeural |
| ar-BH (Bahrain) | ar-BH-LailaNeural | ar-BH-AliNeural |
| ar-OM (Oman) | ar-OM-AyshaNeural | ar-OM-AbdullahNeural |
| ar-EG (Egypt) | ar-EG-SalmaNeural | ar-EG-ShakirNeural |
| ar-JO (Jordan) | ar-JO-SanaNeural | ar-JO-TaimNeural |
| (also IQ, LY, MA, TN, DZ, YE) | e.g. ar-IQ-RanaNeural | e.g. ar-IQ-BasselNeural |

- **ar-LB speech-to-text: Confirmed.** It appears in the same 18-locale list, with fast transcription and custom training. For French–Arabic–English mixing, Azure's "post-stream refinement" multilingual features list **only ar-SA** among Arabic locales. Mixed-language support for ar-LB was **Not found**. A French or English word inside Lebanese Arabic may be mis-transcribed.

  https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts
  Note: a "country" voice mostly changes accent and name pronunciation. Whether these voices speak true dialect or a light MSA was **not found** in documentation. Native speakers must listen and judge (D3).
- **Region (Confirmed, new):** **qatarcentral** supports live speech-to-text, batch transcription and neural read-aloud. It does **not** support fast transcription or custom-model training; training happens elsewhere and the model is copied over. https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions (page dated 2026-10-08)
- **Data retention (Confirmed):** "For real-time speech to text, audio input is processed only on the Azure's server memory, and no data is stored at rest." Microsoft also says it does not retain data for fast transcription. For batch transcription, results are stored where you choose and can be auto-deleted. Speaker separation is off by default and is discarded after use, so there are no voiceprints. https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/speech-service/speech-to-text/data-privacy-security
- **Prices (Confirmed via the Azure retail price API, Qatar Central, pay-as-you-go S1):** speech-to-text **$1.00 per audio hour**; batch $0.18/h; custom model $1.20/h. Neural read-aloud **$15 per 1M characters**. Free tier: 5 h of STT and 0.5M TTS characters per month. https://prices.azure.com/api/retail/prices (queried 2026-10-15)

### B2. OpenAI speech — Confirmed (names and prices), Partly confirmed (Arabic quality)
- **Current models (Confirmed):** `gpt-transcribe` (recommended for recordings; takes a `languages` list), `gpt-live-transcribe` (recommended for live audio), `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-4o-transcribe-diarize`, `whisper-1`. TTS: `gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`. https://developers.openai.com/api/docs/guides/speech-to-text
- **Prices (Confirmed):** gpt-transcribe ~$0.0045/min; gpt-4o-transcribe $0.006/min; gpt-4o-mini-transcribe $0.003/min; gpt-live-transcribe $0.017/min. gpt-4o-mini-tts $0.60 per 1M text tokens + $12 per 1M audio tokens; tts-1 $15 per 1M characters. Regional data-residency endpoints cost +10% for newer models. https://developers.openai.com/api/docs/pricing
- **Retention (Confirmed):** `/v1/audio/transcriptions` has **no** abuse-monitoring retention and is ZDR-eligible. `/v1/audio/speech` (TTS) and `/v1/realtime` keep data **30 days** unless ZDR is approved. ZDR needs OpenAI's prior approval. *Note (fact-check):* OpenAI describes `gpt-live-transcribe` as the "realtime path", so live transcription likely falls under the `/v1/realtime` 30-day rule, not the no-retention rule for recordings. Confirm before choosing live OpenAI transcription. https://developers.openai.com/api/docs/guides/your-data
- OpenAI voices are not dialect-specific. How well they speak Gulf Arabic was **Not found**.

### B3. Google and ElevenLabs
- **Google Cloud Chirp 3 (Partly confirmed):** lists **ar-QA** and other Arabic locales. Arabic may still be in **Preview**; the sources conflict. One benchmark note says Chirp 3 did worse on Saudi than on Egyptian Arabic. Separately, the plan's decision about Google's terms for under-18 users must be checked for Cloud Speech; that is outside this report. https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3
- **ElevenLabs (Confirmed for price and retention):** Scribe v2 speech-to-text costs $0.22/h ($0.39/h live). TTS costs $0.04–0.08 per 1K characters, which is several times Azure's price. **Zero Retention Mode is for enterprise customers only.** https://elevenlabs.io/pricing/api ; https://elevenlabs.io/docs/developers/resources/zero-retention-mode
- **Fanar (QCRI) speech:** Fanar has its own Arabic speech recogniser (Fanar-STT). It appears in the benchmark below. Commercial access and terms were **Not found**.

### B4. Published accuracy: Gulf and other dialects, and children
**Adult dialect speech: Almieyar benchmark** (arXiv 2609.35564, 28 Sep 2026, ~40 authors, preprint; young adult speakers aged ~20–30; 13.7 h total). WER = share of words wrong (lower is better).

| Dialect family (hours) | GPT-4o-transcribe | Whisper-large-v3 | Fanar-STT | Voxtral-Mini |
|---|---|---|---|---|
| Gulf (4.0 h) | 36.4% | 46.8% | 42.2% | 35.7% |
| Levantine (3.0 h) | 33.6% | 53.5% | 45.3% | 47.1% |
| Egyptian (0.7 h) | 49.7% | 56.8% | 48.4% | 59.9% |
| Iraqi (1.6 h) | 28.3% | 47.5% | 46.6% | 44.4% |
| Overall | 34.9% | 49.5% | 45.9% | 41.1% |

**Levantine by country (Table 4; GPT-4o not broken out):**

| Country | Voxtral | Fanar | Whisper-L | Seamless |
|---|---|---|---|---|
| **Lebanese** | 49% | 59% | 50% | 45% |
| Jordanian | 35% | 39% | 46% | 74% |
| Syrian | 38% | 44% | 54% | 64% |
| Palestinian | 53% | 49% | 58% | 77% |

Lebanese is one of the hardest Levantine dialects for most systems. The paper flags code-switching boundaries as a source of scoring ambiguity, but gives no Lebanese French/English detail. **Lebanese code-switching ASR benchmark: Not found.** The closest work is Tunisian (LinTO) and general Arabic–English–French models (Chowdhury et al., Interspeech 2021).

Gulf by country (not for GPT-4o): Qatari 35–42% for the better systems; Saudi 25–38%; Bahraini 41–61%; Omani 30–51%. **Emirati is not included.** **Azure, Google and ElevenLabs were not tested.** Status: Partly confirmed. It is one preprint, and the Egyptian sample is tiny. https://arxiv.org/html/2609.35564v1

**Code-switching (Arabic + English in one sentence):** the Perle AI benchmark (May 2026, run by a vendor) covers Egyptian–English and Saudi–English mixed with other language pairs. Average WER across all pairs: ElevenLabs Scribe v2 13.2%, gpt-4o-transcribe 38.6%, Azure 43.6%. There are no Arabic-only splits, so this is low-weight evidence. https://arxiv.org/abs/2605.19069

**Children: the biggest gap.**
- *Arabic Little STT* (Alkadri et al., arXiv 2510.23319, Oct 2025, preprint): 355 utterances from 288 **Levantine** children aged 6–13 in classrooms. The best Whisper model got **66% WER**, compared with under 20% on adult Arabic data. Commercial systems were not tested. Partly confirmed: one small study. https://arxiv.org/abs/2510.23319
- Abjad-Kids (arXiv 2603.20255) has recordings of children aged 3–12 saying letters, numbers and colours. It is a classification dataset, not a transcription test.
- **Gulf children's speech accuracy for any commercial tool: Not found.**

**What this means:** on adult Gulf speech, the best tools get about 1 word in 3 wrong. On young children, expect worse. The children's study suggests possibly 2 in 3, but it tested Whisper, not current commercial models. This **cannot** be judged from published research; Zaki must test it (D3). Free chat by voice is risky. Short, predictable answers (a number, a word, "yes or no") are much easier to recognise and to check.

### B5. Rough voice cost per child (estimate, not confirmed)
Assume a child speaks 10 minutes a day and Zaki reads aloud 10 minutes a day, on 25 days a month.
- Speech-to-text, 250 min/month: Azure ~$4.20; gpt-transcribe ~$1.10; gpt-4o-mini-transcribe ~$0.75.
- Read-aloud, assuming roughly 800 Arabic characters per spoken minute: ~200K characters, so Azure ~$3.00. This is unverified for Arabic speaking speed.
- So voice adds roughly **$2–7 per child per month**, on top of the plan's $5–20 AI estimate. Plan section 10.3 should add a line for this.

### B6. On-device speech on iPhone/iPad (native app) — Partly confirmed
- Apple's newer speech system (**SpeechAnalyzer / SpeechTranscriber**, iOS 26 and later) runs transcription **on the device**, using a language model that the system downloads once.
  - A developer blog (LoroNote, 23 Aug 2026) reports `SpeechTranscriber.supportedLocales` returning **42 locales across 22 languages, including Arabic**. It does **not** name which Arabic locales; ar-LB is unconfirmed.
  - Where SpeechTranscriber lacks a locale, Apple offers `DictationTranscriber` as a fallback (confirmed in Apple's SpeechTranscriber doc).
  - Apple's own documentation does **not** list the locales; it says to check `supportedLocales` at run time. On the iOS Simulator the list is empty, so a real device is needed.
  - Caution: an Apple Developer Forums thread (2025, iOS 26) reports Arabic failing with "transcription.ar asset not found after attempted download". https://developer.apple.com/forums/thread/797835
  - The older `SFSpeechRecognizer` also has an on-device mode, but Apple publishes no per-language on-device list.
  - Sources: https://developer.apple.com/videos/play/wwdc2025/277/ ; https://loronote.com/en/blog/apple-speechanalyzer-vs-whisper (I could not read Apple's own SpeechTranscriber doc page; it rendered empty).
- **Arabic, Lebanese or child accuracy for Apple's engine: Not found.** Published comparisons are English only.
- **Why it matters:** audio never leaves the phone, which is the strongest privacy option for children's voices. There is also no per-minute cost.
- **Action:** in Phase 1, a developer prints `SpeechTranscriber.supportedLocales` on a real iOS 26 device and checks for `ar-LB`, `ar-SA` and `ar-AE`. If Arabic is present, add Apple on-device as a candidate in the D3 speech test.
- **Read-aloud on device:** Apple's built-in voices (AVSpeechSynthesizer) include Arabic. The quality and dialect of the voices were **not checked**.
- **Faces on device:** in a native app, Apple's Vision framework face detection can replace MediaPipe for blurring before upload (C4). This is a standard Apple feature, but I did not test it on worksheets.

---

## C. Reading photos of textbook pages and handwriting

### C1. Benchmarks
- **KITAB-Bench** (Heakl et al., MBZUAI, ACL 2025 Findings; 8,809 samples, 9 domains; models from early 2025). On text recognition (CER = share of characters wrong):
  - Gemini-2.0-Flash CER 0.13
  - AIN-7B 0.20
  - Qaari 1.80 (corrected; it made more errors than there were characters)
  - GPT-4o 0.31
  - GPT-4o-mini 0.43
  - Azure OCR 0.52
  - Tesseract 0.54

  On the **KHATT** dataset (modern handwriting): Gemini 0.19, GPT-4o 0.45, Azure OCR 0.83. The authors name "numeral recognition", word stretching and complex fonts as common errors. The best model reached only ~65% on full page-to-text conversion. **Claude was not tested.** Confirmed. https://arxiv.org/abs/2502.14949 (tables read from the ACL PDF)
- **Baseer / Misraj-DocOCR** (Sept 2025, 400 images; authors built a competing model): Gemini-2.5-pro CER 0.31, **Azure Document Intelligence CER 0.27**, GPT-5 0.62. Claude not tested. https://arxiv.org/html/2509.18174v1
- **QCRI cross-dataset study** (Farazi et al., arXiv 2608.22366, Aug 2026, preprint): open models only. On KHATT handwriting the best CER was ~41%. Correction methods **hurt on realistic student handwriting**. Accents and diacritics strongly affect scores. https://arxiv.org/html/2608.22366v1
- **Claude on Arabic text images: Not found.** No peer-reviewed or credible independent result exists. A vendor page (Inksight, Oct 2026) lists Arabic handwriting in its test but shows no Arabic results, and the company sells competing tools. Excluded. Claude's own docs warn about mistakes on low-quality, rotated or very small images (under 200 px). Newer Claude models (4.7 and later) accept higher resolution: 2576 px on the long edge. https://platform.claude.com/docs/en/build-with-claude/vision
- **Children's Arabic handwriting:** datasets exist only for **single letters**. Hijja: Riyadh, ages 7–12, 47,434 characters, CNN ~88% compared with 97% on adult writing. Also Dhad (2024). **No test of modern AI on children's handwritten words or sums was found.**
- **Maths notation, right-to-left text mixed with numbers, and Eastern Arabic digits (٠١٢٣):** ArabicNumBench (Feb 2026) tests number *reading* across 71 models, with accuracy from 14% to 99%. That is not equations. **Arabic maths-notation OCR: Not found.** Qatari and GCC primary maths books use Arabic symbols, Eastern digits in some countries, and right-to-left sums. This must be tested directly. https://arxiv.org/html/2602.18776v1

### C2. Confidence
- Clear printed Arabic: modern AI reads it well. **Moderate confidence** that Claude will too, but this is unverified.
- Children's handwriting, maths layout, and photos taken by parents on phones: **Low confidence**. There is no direct evidence.

### C3. Design implications (suggestions)
- Always show the child or parent "Here is what I read". Let them tap to fix it before a lesson pack is built. This also catches misread numbers.
- Teach from **printed** pages first. Treat reading children's handwriting as a later feature.
- Use the existing "real code" maths checker on the *read* numbers, not just the answers.
- If Claude fails D2, test **Azure Document Intelligence** (strong on Arabic print in Baseer) as the first reading step, then send the text to Claude.

### C4. Detecting and blurring faces and names before AI processing
- **Faces, on the device (recommended):** Google's MediaPipe Face Detector runs inside the web app on the phone (`@mediapipe/tasks-vision`), so the photo is blurred before it leaves the device. Confirmed that it runs in the browser. Its accuracy on textbook illustrations and partial faces is untested; cartoons may be blurred by mistake, which is harmless. https://developers.google.com/edge/mediapipe/solutions/vision/face_detector/web_js
- **Names and other personal details:** names are text, so they can only be found after the page is read. Options: (a) Azure AI Language PII detection, which supports **Arabic text** (Confirmed: https://learn.microsoft.com/en-us/azure/ai-services/language-service/personally-identifiable-information/language-support), (b) ask Claude to replace names in the text it read with placeholders. **Arabic name-detection accuracy: Not found.** Note that Azure *conversation* PII is English, French, German and Spanish only.
- **Simplest strong step:** a cropping screen with the tip "Crop out your name and school", plus checking the top-of-page area where names usually go. Claude also refuses to identify people in images (Anthropic's usage policy). Images sent to Claude are not stored beyond the request.
- **Not found:** any published evaluation of name-blurring on Arabic worksheets.

---

## D. Phase 1 test protocol (small, concrete, multi-dialect; Lebanon first)

General rules: fake or consented data only; no real child data reaches any AI until legal clearance (plan Section 9). Write down pass/fail rules **before** testing. Two native-speaker reviewers score separately.

**Order of testing:**
1. **Lebanese/Levantine first:** Lebanese Arabic, Lebanese Arabizi, and French–Arabic–English mixed sentences. This is the pilot family.
2. Then Gulf: Qatari, Saudi, Emirati.
3. Then Egyptian and MSA.

The pilot can start once the Lebanese results pass, but launching in each new country needs that country's dialect to pass too. At least one Lebanese native speaker reviewer is needed. A Lebanese parent or teacher is ideal for Arabizi spellings, for example "kifak", "2albi", "3am", "ma ba3ref".

### D1. Moderation test (weeks 1–3; no children needed)
- **Round 1 (Lebanon pilot gate):** about 300 items:
  - 100 Lebanese Arabic (Arabic script)
  - 100 Lebanese Arabizi
  - 60 French–Arabic–English mixed
  - 40 English/French
  - about half harmful and half harmless look-alikes
  - written and labelled by at least two Lebanese reviewers
- **Round 2 (before GCC launch):** about 300 more items covering Gulf, Gulf Arabizi, Egyptian and MSA.
- Candidates: OpenAI omni-moderation; Claude Haiku policy check; FanarGuard (if the licence allows); Qwen3Guard (optional, needs hosting); Azure Content Safety (optional).
- Report missed harmful items and false alarms **per dialect and per category**. Choose the second classifier from the results.

### D2. Photo-reading test (~120 photos; replaces "50 samples")
| Group | Count | Notes |
|---|---|---|
| Printed Arabic textbook pages, grades 1–6: **Lebanese curriculum first** (CRDP books and the pilot family's actual school books), then Qatar MoEHE, Saudi and UAE books | 40 | Include diacritics, coloured boxes, two-column layouts |
| **French-language maths/science pages** (Lebanese schools) | 10 | Only to judge whether French support is worth adding later |
| Printed English textbook pages | 15 | |
| Maths pages: Arabic sums, Eastern digits, fractions, right-to-left working | 25 | Check every number exactly |
| Children's handwriting (homework, from consenting families or staff writing like a child) | 25 | Mark as a separate result |
| "Bad phone photos": tilted, shadowed, blurry, partial | 15 | Real-world condition |

- **Measure:** character-level accuracy on Arabic text; **exact match on every number and maths symbol**; whether the right question was found; whether Zaki says "I can't read this" instead of guessing.
- **Suggested pass rule (team to confirm):** printed pages ≥ 97% characters correct and **100% of numbers correct** after the confirm step; handwriting reported separately.
- **Compare:** Claude (current Sonnet and Haiku) against Azure Document Intelligence as a reading step.
- Also test face blur (MediaPipe) and name masking on 20 photos with fake names written in Arabic and English.

### D3. Speech test (later, with consenting families, after legal clearance)
- **Stage 1 (Lebanon pilot):** the founder's own children and, if possible, 5–10 more Lebanese children aged 6–12, with written parental consent and Lebanese legal check. Parent present. Recordings are kept only for scoring, then deleted on a stated date.
- **Stage 2 (before GCC launch):** about 30 children across Qatari/Gulf (≥ 12), Saudi (≥ 4), Emirati (≥ 4), Egyptian (≥ 5) and other Levantine (≥ 5).
- **Each child records:**
  - 10 short answers (numbers, single words, yes/no)
  - 5 reading-aloud sentences from their textbook
  - 3 free questions ("How do I…?")
  - **3 mixed sentences in the child's natural style** (for Lebanese children: Arabic with French and/or English words, e.g. maths terms in French)
- **Systems:**
  - Azure (matching locale: **ar-LB first**, then ar-QA, ar-SA, ar-AE, ar-EG, ar-JO)
  - OpenAI gpt-transcribe and gpt-4o-mini-transcribe, which accept several languages at once and so may handle mixing better
  - **Apple on-device SpeechTranscriber**, if Arabic is available on the test iPhone (B6)
  - optionally ElevenLabs Scribe (only if retention terms work)
- **Measure:** word error rate per age band and dialect; **"meaning kept"** (would Zaki answer correctly?); exact accuracy on short answers.
- **Read-aloud voices:** parents and teachers rate the voices plus an OpenAI voice and an Apple on-device voice for clarity, friendliness and "sounds like us", on a 1–5 scale. Lebanon: **ar-LB** and ar-SY voices. GCC: ar-QA, ar-SA, ar-AE. Also ar-EG and ar-JO.
- **Decision rule (suggested):** voice input ships only if short-answer accuracy is ≥ 95% after a "Did you say…?" step in the 6–8 age band. Otherwise voice is read-aloud only, and children type or tap.

### D4. What published research cannot tell us (must be tested)
0. Everything about **Lebanese Arabizi** and **French–Arabic–English mixing**, for safety filters, speech recognition and the tutor's understanding. This is the pilot's main input, and almost no research exists.
1. How any filter handles **Gulf** Arabic and **Gulf Arabizi**, and children's ways of saying harmful things.
2. How any commercial speech tool handles **GCC children's** voices. Only one small Levantine Whisper study exists.
3. Whether the "country" read-aloud voices sound like local dialect to Qatari and GCC children.
4. How Claude reads Arabic text, Qatari textbook layouts, Arabic maths notation and children's handwriting.
5. False-alarm rates on harmless school content (religion, science, history) in Arabic.
6. How well name-masking works on Arabic worksheets.

---

## E. Should Zaki add French later? (Lebanon question)
- **Why it matters:** many Lebanese schools teach maths and science in French (others in English). Children will photograph French pages and use French maths words. *Background knowledge, not verified in this research: confirm with the pilot family's school.*
- **Tool support is better in French than in Arabic (Confirmed):**
  - Azure Content Safety's harm classifiers are trained and tested on French.
  - Llama Guard 3/4 list French as supported.
  - Azure has many French speech locales and voices.
  - Benchmarks generally test French far more than Arabic dialects.
- **Recommendation:** do **not** build French for the first pilot, because Arabic and English are enough to learn from. But:
  - (a) design the app so a third language can be added without rework
  - (b) include French items in the safety test now, so French typed by a Lebanese child is not a blind spot
  - (c) decide after the pilot, based on how often the family's homework is in French.

---

## Search boundaries
- **Searched:** web search (standard and extended), official docs (Microsoft Learn, OpenAI developer docs, Anthropic docs, ElevenLabs, Google Cloud, Hugging Face model cards), arXiv, ACL Anthology, PMC, and the Azure retail price API.
- **Dates:** mainly 2024 to Oct 2026; older work only where it is foundational (Arabizi offence detection 2023; Hijja).
- **Languages:** English-language sources only. Arabic-language publications were not searched, which is a gap.
- **Excluded:** vendor marketing without numbers; vendor benchmarks are kept but flagged.
- **Lebanon-specific searches:** Lebanese/Levantine moderation, Lebanese Arabizi, Lebanese code-switching speech, ar-LB voices, Apple on-device Arabic. Lebanese data-protection law was **not** covered; it belongs to the legal research.
- **Not done:** no tools were signed up for or run. No numbers here come from Zaki's own testing.
- **Could not open:** OpenAI's 2024 moderation launch post (HTTP 403), and full per-language tables for PolyGuard, Qwen3Guard and FanarGuard.

---

## Fact-check (2026-10-15)

Independent re-check of the claims decisions rest on. Each source was reopened; contradicting evidence was searched for. Corrections have already been made in the text above.

**Verified (official source or the paper itself says it)**
- OpenAI `omni-moderation-latest`: the only model on the moderation guide; free; text + images, no audio. Image-capable: self-harm (3 sub-categories), sexual, violence, violence/graphic. Text only: harassment, hate, illicit (and sub-categories), sexual/minors. `/v1/moderations` has no retention and is ZDR-eligible.
- Azure AI Content Safety: harm classifiers "trained and tested on Chinese, English, French, German, Italian, Japanese, Portuguese, and Spanish"; Prompt Shields "primarily trained and evaluated on English" (page dated 2026-09-18). Standalone text/image checks not in uaenorth; no Qatar region.
- Perspective API: no new requests after Feb 2026; service ends 31 Dec 2026 (perspectiveapi.com).
- Llama Guard 4 card: multilingual = Llama Guard 3 languages (French, German, Hindi, Italian, Portuguese, Spanish, Thai); recall 69% English, 43% multilingual. AUB paper (arXiv 2608.29378, 29 Aug 2026) states Llama Guard 3 "does not officially list Arabic".
- EMNLP 2024 Arabizi study exists (Al Ghanim et al., pages 18584–18600). Standard Arabic AdvBench prompts did not jailbreak GPT-4 / Claude 3 Sonnet; transliteration and Arabizi did.
- Qwen3Guard: Apache-2.0, 0.6B/4B/8B, "119 languages and dialects", separate Stream variant.
- AUB study figures: Qwen3Guard as judge, n = 300, 88.7% overall; MSA 90%, Egyptian 90%, **Levantine 95%, Arabizi 77.5%**; no Gulf. Per-group sample sizes are **not reported**, so the 95% and 77.5% rest on small, unknown subgroups.
- ArabicDialectSafety (arXiv 2608.01291): MARBERTv2 macro-F1 0.95; dialect list as stated; listed as EMNLP 2026 Findings.
- Azure Speech: 18 Arabic STT locales including **ar-LB** and **ar-QA**; only ar-SA has post-stream refinement. Voices ar-LB-LaylaNeural / ar-LB-RamiNeural and ar-QA-AmalNeural / MoazNeural exist; all Arabic voices are Standard; no Arabic HD, multilingual or child voices.
- Azure qatarcentral: real-time STT, batch STT and neural TTS yes; fast transcription and custom-speech training no (page dated 2026-10-08).
- Azure prices (retail price API, qatarcentral, queried today): STT $1.00/h, batch $0.18/h, custom STT $1.20/h, neural TTS $15 per 1M characters.
- OpenAI speech: `gpt-transcribe` (recommended for recordings; `languages` list) and `gpt-live-transcribe` (recommended realtime path) exist. Prices: $0.0045/min and $0.017/min; gpt-4o-transcribe ~$0.006/min; gpt-4o-mini-transcribe ~$0.003/min; tts-1 $15/1M chars; gpt-4o-mini-tts $0.60 text in + $12 audio out per 1M tokens; +10% for data-residency endpoints. Retention: transcriptions none; speech and realtime 30 days; ZDR needs prior approval.
- Almieyar (arXiv 2609.35564, 28 Sep 2026, 40 authors, speakers mostly 20–30, 13.7 h): all family and country WERs in B4 match, including Lebanese 45–59%. Azure, Google, ElevenLabs not tested.
- Arabic Little STT (arXiv 2510.23319): 355 utterances, 288 Levantine children aged 6–13, best Whisper-large-v3 WER 0.66 vs < 0.20 on adult data; Whisper only.
- KITAB-Bench Table 6: Gemini-2.0-Flash CER 0.13, GPT-4o 0.31, GPT-4o-mini 0.43, AIN-7B 0.20, Azure 0.52, Tesseract 0.54; KHATT: Gemini 0.19, GPT-4o 0.45, Azure 0.83.
- Portkey benchmark: 27 Sep 2024, 1,000 multilingual samples, F1 0.322, recall 0.254, no Arabic split.

**Corrected**
- KITAB-Bench: "QARI 0.20" → **Qaari CER 1.80** (0.20 belongs to AIN-7B).
- Azure Content Safety region: "not offered in any Middle East region" → true for **standalone** Content Safety only; **Foundry Guardrails** list content harms and Prompt Shields in **UAE North**. Qatar still absent.
- FanarGuard: sizes now stated from the paper (RoBERTa-large ~435M, Gemma-2-2B, FanarGemma-4B); added that it is offered **through the Fanar API** and that its **Arabic training data was machine-translated from English**. "Part of Fanar 2.0 stack" → not verified.
- TrustNLP 2026 paper: real title is "Toward Dialect-Aware Safety Evaluation for Arabic Large Language Models" (Zaghouani); "Dialect Safety Gap" is the concept it introduces.
- OpenAI retention: added that `gpt-live-transcribe` is the realtime path, so the 30-day realtime rule probably applies to live transcription.

**Could not verify / weak sources (flag for the founder)**
- **Apple SpeechTranscriber Arabic support:** Apple's documentation does not list locales. The only source that says Arabic is included is a developer blog (LoroNote, Aug 2026, not official). An Apple forum thread reports Arabic model downloads failing on iOS 26. Treat as unknown until tested on a real iPhone.
- FanarGuard model licence and Fanar API terms (including children's data and processing location): not found.
- Whether KITAB-Bench is ACL 2025 main or Findings: arXiv says "ACL 2025"; not resolved. The numbers are unaffected.
- Rests only on preprints (not peer-reviewed): Almieyar, Arabic Little STT, AUB Qwen3Guard figures, QCRI OCR study, Baseer. Rests on vendor sources: Portkey benchmark, Perle AI code-switching benchmark, Typica.ai Darija benchmark.
- Not re-checked in this pass (lower priority): Google Chirp 3 Arabic status, ElevenLabs prices and zero-retention terms, PolyGuard, gpt-oss-safeguard, Baseer figures, Azure PII language list, Claude vision resolution details.

