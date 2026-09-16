/**
 * VANGUARD Universal Translation Gateway
 * Multi-lingual Translation Adapter for 22+ Indian Languages & 200+ Global Languages
 * Features in-memory caching and zero-key graceful degradation.
 */

// In-memory cache for translated strings
const translationCache = new Map<string, string>();

interface TranslationRequest {
  text: string;
  sourceLang?: string;
  targetLang: string;
}

interface TranslationResponse {
  translatedText: string;
  detectedSourceLang: string;
  targetLang: string;
  cached: boolean;
  provider: "dictionary_cache" | "google_translate" | "bhashini" | "zero_key_fallback";
}

// Common rural service terms in multiple languages for instant zero-key translation
const TRANSLATION_PATTERNS: Record<string, Record<string, string>> = {
  "broken wire": {
    hi: "टूटा हुआ बिजली का तार",
    kn: "ಮುರಿದ ವಿದ್ಯುತ್ ತಂತಿ",
    ta: "உடைந்த மின்சார கம்பி",
    te: "తెగిపడిన విద్యుత్ తీగ",
    bn: "ছেঁড়া বৈদ্যুতিক তার",
    mr: "तुटलेली विजेची तार",
    gu: "તૂટેલો વીજળીનો વાયર",
    ml: "പൊട്ടിയ വൈദ്യുതി ലൈൻ",
    pa: "ਟੁੱਟੀ ਬਿਜਲੀ ਦੀ ਤਾਰ",
    es: "cable eléctrico roto",
    fr: "câble électrique rompu",
    ar: "سلك كهربائي مقطوع",
    de: "beschädigtes Stromkabel",
  },
  "water pipe burst": {
    hi: "पानी की पाइपलाइन फूटी",
    kn: "ನೀರಿನ ಪೈಪ್ ಒಡೆದಿದೆ",
    ta: "குடிநீர் குழாய் உடைந்தது",
    te: "నీటి పైపు పగిలిపోయింది",
    bn: "পানির পাইপ ফেটে গেছে",
    mr: "पाण्याची पाईप फुटली",
    gu: "પાણીની પાઇપ તૂટી ગઈ",
    ml: "കുടിവെള്ള പൈപ്പ് പൊട്ടി",
    pa: "ਪਾਣੀ ਦੀ ਪਾਈਪ ਫਟ ਗਈ",
    es: "tubería de agua rota",
    fr: "rupture de canalisation d'eau",
    ar: "انفجار أنبوب مياه",
    de: "Wasserrohrbruch",
  },
  "emergency assistance required": {
    hi: "तत्काल आपातकालीन सहायता की आवश्यकता",
    kn: "ತುರ್ತು ನೆರವು ಅಗತ್ಯವಿದೆ",
    ta: "அவசர உதவி தேவைப்படுகிறது",
    te: "తక్షణ అత్యవసర సహాయం అవసరం",
    bn: "জরুরি সহায়তা প্রয়োজন",
    mr: "तातडीने आपत्कालीन मदत आवश्यक",
    gu: "તાત્કાલિક કટોકટી સહાયની જરૂર છે",
    ml: "അടിയന്തര സഹായം ആവശ്യമാണ്",
    pa: "ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ ਦੀ ਲੋੜ ਹੈ",
    es: "se requiere asistencia de emergencia",
    fr: "assistance d'urgence requise",
    ar: "مطلوب مساعدة طارئة فورية",
    de: "Sofortige Notfallhilfe erforderlich",
  },
};

/**
 * Detect language of a greeting or short phrase
 */
export function detectLanguageFromGreeting(input: string): string {
  const text = input.trim().toLowerCase();

  // Greetings in Indian Languages
  if (text.includes("வணக்கம்") || text.includes("vanakkam")) return "ta";
  if (text.includes("నమస్కారం") || text.includes("namaskaram") || text.includes("namaskara")) {
    if (text.includes("ನಮಸ್ಕಾರ")) return "kn";
    return "te";
  }
  if (text.includes("ನಮಸ್ಕಾರ") || text.includes("namaskara")) return "kn";
  if (text.includes("नमस्ते") || text.includes("namaste") || text.includes("pranam")) return "hi";
  if (text.includes("নমস্কার") || text.includes("nomoshkar")) return "bn";
  if (text.includes("नमस्कार") || text.includes("namaskar")) return "mr";
  if (text.includes("સત શ્રી અકાલ") || text.includes("sat sri akaal") || text.includes("ਸਤਿ")) return "pa";
  if (text.includes("নমস্কাৰ")) return "as";

  // Greetings in Global Foreign Languages
  if (text.includes("hola") || text.includes("buenos")) return "es";
  if (text.includes("bonjour") || text.includes("salut")) return "fr";
  if (text.includes("hallo") || text.includes("guten")) return "de";
  if (text.includes("مرحبا") || text.includes("سلام") || text.includes("marhaban")) return "ar";
  if (text.includes("olá") || text.includes("ola") || text.includes("bom dia")) return "pt";
  if (text.includes("привет") || text.includes("здравствуйте")) return "ru";
  if (text.includes("jambo") || text.includes("habari")) return "sw";
  if (text.includes("你好") || text.includes("ni hao")) return "zh";
  if (text.includes("こんにちは") || text.includes("konnichiwa")) return "ja";

  return "en";
}

/**
 * Universal text translation function
 */
export async function translateText({
  text,
  sourceLang = "auto",
  targetLang,
}: TranslationRequest): Promise<TranslationResponse> {
  if (!text || text.trim() === "" || targetLang === sourceLang) {
    return {
      translatedText: text,
      detectedSourceLang: sourceLang === "auto" ? "en" : sourceLang,
      targetLang,
      cached: false,
      provider: "zero_key_fallback",
    };
  }

  const cacheKey = `${sourceLang}:${targetLang}:${text.trim().toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    return {
      translatedText: translationCache.get(cacheKey)!,
      detectedSourceLang: sourceLang === "auto" ? "en" : sourceLang,
      targetLang,
      cached: true,
      provider: "dictionary_cache",
    };
  }

  // 1. Check known pattern dictionaries
  const lowerText = text.trim().toLowerCase();
  for (const [key, translations] of Object.entries(TRANSLATION_PATTERNS)) {
    if (lowerText.includes(key) && translations[targetLang]) {
      const result = text.toLowerCase().replace(key, translations[targetLang]);
      translationCache.set(cacheKey, result);
      return {
        translatedText: result,
        detectedSourceLang: "en",
        targetLang,
        cached: false,
        provider: "dictionary_cache",
      };
    }
  }

  // 2. Google Cloud Translation API (If API key configured in env)
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (apiKey) {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          source: sourceLang !== "auto" ? sourceLang : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data?.data?.translations?.[0]?.translatedText || text;
        const detected = data?.data?.translations?.[0]?.detectedSourceLanguage || sourceLang;
        translationCache.set(cacheKey, translated);
        return {
          translatedText: translated,
          detectedSourceLang: detected,
          targetLang,
          cached: false,
          provider: "google_translate",
        };
      }
    } catch (err) {
      console.warn("[Translator] Cloud translation failed, using fallback:", err);
    }
  }

  // 3. Zero-Key Fallback Mode
  // If target is English or already translated, returns original text or annotated preview
  translationCache.set(cacheKey, text);
  return {
    translatedText: text,
    detectedSourceLang: sourceLang === "auto" ? "en" : sourceLang,
    targetLang,
    cached: false,
    provider: "zero_key_fallback",
  };
}
