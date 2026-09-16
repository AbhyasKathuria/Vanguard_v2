"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/languages";
import {
  Shield,
  ArrowRight,
  Globe,
  Check,
  Search,
} from "lucide-react";

interface GreetingItem {
  text: string;
  lang: string;
  native: string;
  code: string;
  flag: string;
}

const GREETINGS: GreetingItem[] = [
  { text: "Hello", lang: "English", native: "English", code: "en", flag: "🇬🇧" },
  { text: "नमस्ते", lang: "Hindi", native: "हिन्दी", code: "hi", flag: "🇮🇳" },
  { text: "ನಮಸ್ಕಾರ", lang: "Kannada", native: "ಕನ್ನಡ", code: "kn", flag: "🇮🇳" },
  { text: "வணக்கம்", lang: "Tamil", native: "தமிழ்", code: "ta", flag: "🇮🇳" },
  { text: "నమస్కారం", lang: "Telugu", native: "తెలుగు", code: "te", flag: "🇮🇳" },
  { text: "নমস্কার", lang: "Bengali", native: "বাংলা", code: "bn", flag: "🇮🇳" },
  { text: "नमस्कार", lang: "Marathi", native: "मराठी", code: "mr", flag: "🇮🇳" },
  { text: "નમસ્તે", lang: "Gujarati", native: "ગુજરાતી", code: "gu", flag: "🇮🇳" },
  { text: "നമസ്കാരം", lang: "Malayalam", native: "മലയാളം", code: "ml", flag: "🇮🇳" },
  { text: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", lang: "Punjabi", native: "ਪੰਜਾਬੀ", code: "pa", flag: "🇮🇳" },
  { text: "ନମସ୍କାର", lang: "Odia", native: "ଓଡ଼ିଆ", code: "or", flag: "🇮🇳" },
  { text: "سلام", lang: "Urdu", native: "اُردُو", code: "ur", flag: "🇮🇳" },
  { text: "নমস্কাৰ", lang: "Assamese", native: "অসমীয়া", code: "as", flag: "🇮🇳" },
  { text: "Bonjour", lang: "French", native: "Français", code: "fr", flag: "🇫🇷" },
  { text: "Hola", lang: "Spanish", native: "Español", code: "es", flag: "🇪🇸" },
  { text: "Hallo", lang: "German", native: "Deutsch", code: "de", flag: "🇩🇪" },
  { text: "Ciao", lang: "Italian", native: "Italiano", code: "it", flag: "🇮🇹" },
  { text: "Olá", lang: "Portuguese", native: "Português", code: "pt", flag: "🇵🇹" },
  { text: "Привет", lang: "Russian", native: "Русский", code: "ru", flag: "🇷🇺" },
  { text: "مرحبا", lang: "Arabic", native: "العربية", code: "ar", flag: "🇸🇦" },
  { text: "你好", lang: "Chinese", native: "中文", code: "zh", flag: "🇨🇳" },
  { text: "こんにちは", lang: "Japanese", native: "日本語", code: "ja", flag: "🇯🇵" },
];

export default function RootLandingPage() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const [, startTransition] = useTransition();

  // Mode: "hello" (screen 1) | "choose-language" (screen 2)
  const [stage, setStage] = useState<"hello" | "choose-language">("hello");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"all" | "India" | "Global">("all");
  const [selectedLang, setSelectedLang] = useState(locale || "en");

  // Cycling greeting like iPhone startup:
  // Starts fast (rapid ~70ms cycle through all languages), then settles into smooth cadence
  useEffect(() => {
    if (stage !== "hello") return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 70);

    return () => clearInterval(interval);
  }, [stage]);

  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    setLocale(code);
  };

  const handleProceedToAuth = () => {
    startTransition(() => {
      router.push("/login");
    });
  };

  const currentGreeting = GREETINGS[currentIndex];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesRegion = regionFilter === "all" || lang.region === regionFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q);
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* ================= STAGE 1: IPHONE "HELLO" SCREEN ================= */}
      {stage === "hello" && (
        <div
          onClick={() => setStage("choose-language")}
          className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-12 cursor-pointer animate-in fade-in duration-700"
        >
          {/* Logo & Name Only */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl shadow-sky-500/20 group">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-sky-400" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-tr from-sky-500/20 via-transparent to-amber-500/20 rounded-3xl blur-xl -z-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-white uppercase">
                VANGUARD
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-mono tracking-widest uppercase">
                Rural Service Routing &amp; Civic Governance
              </p>
            </div>
          </div>

          {/* Cycling "Hello" / "नमस्ते" Greeting */}
          <div className="space-y-3 min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center">
            <div className="text-6xl sm:text-7xl md:text-8xl font-light tracking-tight text-white transition-all duration-100 ease-out">
              {currentGreeting.text}
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-400 font-mono">
              <span>{currentGreeting.flag}</span>
              <span>{currentGreeting.native}</span>
              <span className="text-neutral-600">•</span>
              <span>{currentGreeting.lang}</span>
            </div>
          </div>

          {/* Apple-style Call to Action */}
          <div className="pt-6 space-y-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStage("choose-language");
              }}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-bold tracking-wide shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 mx-auto cursor-pointer"
            >
              <span>Press to Start • भाषा चुनें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-neutral-500 font-medium">
              Click anywhere on screen to choose your language
            </p>
          </div>
        </div>
      )}

      {/* ================= STAGE 2: APPLE LANGUAGE SELECTOR SCREEN ================= */}
      {stage === "choose-language" && (
        <div className="flex-1 w-full max-w-3xl flex flex-col justify-center space-y-6 py-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-sky-400 mb-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Language Setup • भाषा चयन</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Choose Your Language
            </h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Select your preferred language. All voice calls, portal dashboards, and civic guidance will automatically adapt.
            </p>
          </div>

          {/* Search & Region Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-900/80 p-2 rounded-2xl border border-neutral-800">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 22 languages (e.g. Hindi, Kannada, தமிழ்)..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Region Filter Tabs */}
            <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-center">
              {(["all", "India", "Global"] as const).map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setRegionFilter(reg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    regionFilter === reg
                      ? "bg-white text-black shadow-xs"
                      : "bg-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {reg === "all" ? "All (22)" : reg === "India" ? "🇮🇳 Indian (13)" : "🌐 Global (9)"}
                </button>
              ))}
            </div>
          </div>

          {/* Language Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedLang === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer relative group ${
                    isSelected
                      ? "bg-[#0071E3] border-[#0071E3] text-white shadow-lg shadow-sky-500/20 scale-[1.02]"
                      : "bg-neutral-900 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700 text-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xl">{lang.flag}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-white text-[#0071E3] border-white"
                          : "border-neutral-700 group-hover:border-neutral-500"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-extrabold tracking-tight truncate">
                      {lang.nativeName}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isSelected ? "text-white/80" : "text-neutral-400"
                      }`}
                    >
                      {lang.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Row: Proceed to Login / Signup */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setStage("hello")}
              className="text-xs text-neutral-500 hover:text-neutral-300 font-bold cursor-pointer"
            >
              ← Back to Greeting
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleProceedToAuth}
                className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <span>Continue to Sign In • आगे बढ़ें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MINIMALIST FOOTER ================= */}
      <footer className="w-full text-center py-2 text-[11px] text-neutral-600 font-mono tracking-wider">
        VANGUARD SECURE CIVIC GATEWAY • ZERO-RETENTION MUNICIPAL ARCHITECTURE
      </footer>
    </div>
  );
}
