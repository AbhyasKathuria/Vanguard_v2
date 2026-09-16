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
  UserPlus,
  LogIn,
  Sparkles,
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

  // Mode: "welcome" (Step 1) | "language" (Step 2)
  const [stage, setStage] = useState<"welcome" | "language">("welcome");
  const [targetAuthMode, setTargetAuthMode] = useState<"/login" | "/signup">("/login");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"all" | "India" | "Global">("all");
  const [selectedLang, setSelectedLang] = useState(locale || "en");

  // Multilingual cycling ticker
  useEffect(() => {
    if (stage !== "welcome") return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 120);

    return () => clearInterval(interval);
  }, [stage]);

  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    setLocale(code);
  };

  const handleStartWithAuth = (mode: "/login" | "/signup") => {
    setTargetAuthMode(mode);
    setStage("language");
  };

  const handleProceedToAuth = () => {
    startTransition(() => {
      router.push(targetAuthMode);
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between p-5 sm:p-10 select-none font-sans">
      {/* ================= STEP A: WELCOME SCREEN ================= */}
      {stage === "welcome" && (
        <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500 my-auto">
          {/* Logo & Name */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center shadow-2xl shadow-sky-500/20">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-sky-400" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-tr from-sky-500/20 via-transparent to-amber-500/20 rounded-3xl blur-xl -z-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black tracking-[0.2em] text-white uppercase">
                VANGUARD
              </h1>
              <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
                Rural Service Routing &amp; Governance
              </p>
            </div>
          </div>

          {/* Multilingual Cycling Greeting Hero */}
          <div className="space-y-2 min-h-[110px] flex flex-col items-center justify-center">
            <div className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-white transition-all duration-100 ease-out">
              {currentGreeting.text}
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-medium text-neutral-300 font-mono">
              <span>{currentGreeting.flag}</span>
              <span>{currentGreeting.native}</span>
              <span className="text-neutral-500">•</span>
              <span>{currentGreeting.lang}</span>
            </div>
          </div>

          {/* Plain-Language Explanation (No Jargon, High Readability) */}
          <div className="max-w-xl mx-auto space-y-2 px-4 py-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
            <p className="text-sm sm:text-base font-medium text-neutral-200 leading-relaxed">
              One platform to connect rural communities with the support, services and authorities they need.
            </p>
            <p className="text-xs text-neutral-400">
              ग्रामीण समुदायों को आवश्यक सरकारी सहायता, सेवा और अधिकारियों से सीधे जोड़ने वाला साझा मंच।
            </p>
          </div>

          {/* Mandatory Action Buttons - Large, High-Contrast Tap Targets (min 52px) */}
          <div className="w-full max-w-md space-y-3 pt-2">
            <button
              type="button"
              onClick={() => handleStartWithAuth("/signup")}
              className="w-full h-14 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm sm:text-base tracking-wide shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-black stroke-[2.5]" />
              <span>Sign Up • नया खाता बनाएं</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              type="button"
              onClick={() => handleStartWithAuth("/login")}
              className="w-full h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-700 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-sky-400 stroke-[2.5]" />
              <span>Sign In • पहले से खाता है? लॉगिन करें</span>
            </button>

            <button
              type="button"
              onClick={() => setStage("language")}
              className="text-xs text-neutral-400 hover:text-white font-semibold pt-2 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>Choose Language • भाषा बदलें ({SUPPORTED_LANGUAGES.length} Languages)</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP B: LANGUAGE SELECTION ================= */}
      {stage === "language" && (
        <div className="flex-1 w-full max-w-3xl flex flex-col justify-center space-y-5 py-4 animate-in fade-in slide-in-from-bottom-6 duration-300 my-auto">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-sky-400 mb-1">
              <Globe className="w-4 h-4" />
              <span>Step 2 of 4: Choose Language • भाषा चयन</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Select Your Preferred Language
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              Your entire experience, voice calls, and dashboards will stay in this language.
            </p>
          </div>

          {/* Search & Region Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-900 p-2.5 rounded-2xl border border-neutral-800">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages (e.g. Hindi, Kannada, தமிழ்)..."
                className="w-full pl-10 pr-4 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Region Filter Tabs */}
            <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-center">
              {(["all", "India", "Global"] as const).map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setRegionFilter(reg)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    regionFilter === reg
                      ? "bg-white text-black shadow-md"
                      : "bg-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {reg === "all" ? "All (22)" : reg === "India" ? "🇮🇳 Indian (13)" : "🌐 Global (9)"}
                </button>
              ))}
            </div>
          </div>

          {/* Language Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedLang === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all duration-150 cursor-pointer relative group ${
                    isSelected
                      ? "bg-sky-600 border-white text-white shadow-xl scale-[1.02]"
                      : "bg-neutral-900 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700 text-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{lang.flag}</span>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-white text-sky-600 border-white"
                          : "border-neutral-600 group-hover:border-neutral-400"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <div className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                      {lang.nativeName}
                    </div>
                    <div
                      className={`text-xs truncate ${
                        isSelected ? "text-white/90 font-medium" : "text-neutral-400"
                      }`}
                    >
                      {lang.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setStage("welcome")}
              className="text-xs sm:text-sm text-neutral-400 hover:text-white font-bold cursor-pointer"
            >
              ← Back to Welcome
            </button>

            <button
              type="button"
              onClick={handleProceedToAuth}
              className="w-full sm:w-auto px-8 h-12 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <span>Continue to {targetAuthMode === "/signup" ? "Sign Up" : "Sign In"} • आगे बढ़ें</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-2 text-[11px] text-neutral-500 font-mono tracking-wider">
        VANGUARD SECURE CIVIC GATEWAY • MANDATORY CITIZEN VERIFICATION
      </footer>
    </div>
  );
}
