export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  region: "India" | "Global";
  flag: string;
  direction?: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  // Major Indian Languages
  { code: "en", name: "English", nativeName: "English", region: "India", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "India", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "India", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "India", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "India", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "India", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "India", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "India", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "India", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "India", flag: "🇮🇳" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", region: "India", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اُردُو", region: "India", flag: "🇮🇳", direction: "rtl" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", region: "India", flag: "🇮🇳" },

  // Major Global Foreign Languages
  { code: "es", name: "Spanish", nativeName: "Español", region: "Global", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", region: "Global", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "Global", flag: "🇩🇪" },
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "Global", flag: "🇸🇦", direction: "rtl" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "Global", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "Global", flag: "🇷🇺" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", region: "Global", flag: "🇰🇪" },
  { code: "zh", name: "Chinese", nativeName: "中文", region: "Global", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "Global", flag: "🇯🇵" },
];

export const DEFAULT_LANGUAGE = "en";

export function getLanguageInfo(code: string): LanguageInfo {
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code) || {
      code,
      name: code.toUpperCase(),
      nativeName: code.toUpperCase(),
      region: "Global",
      flag: "🌐",
    }
  );
}
