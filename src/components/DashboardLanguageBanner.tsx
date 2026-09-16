"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import LanguageSelectorModal from "@/components/LanguageSelectorModal";
import { Globe, ChevronDown, Sparkles } from "lucide-react";

export default function DashboardLanguageBanner() {
  const { currentLanguage, setLocale } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick select top languages
  const quickLanguages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "bn", label: "বাংলা" },
    { code: "mr", label: "मराठी" },
    { code: "es", label: "Español" },
  ];

  return (
    <>
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#f0f0f0] text-[#262626]">
            <Globe className="w-4 h-4 text-[#53bdeb]" />
          </span>
          <div>
            <span className="text-xs font-bold text-[#262626] flex items-center gap-1">
              Language / भाषा: <span className="text-[#53bdeb]">{currentLanguage.nativeName}</span> ({currentLanguage.name}) {currentLanguage.flag}
            </span>
            <p className="text-[11px] text-[#707070]">
              Translate the entire site and dashboards into your preferred Indian or global language.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {quickLanguages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                currentLanguage.code === l.code
                  ? "bg-[#262626] text-white border-[#262626]"
                  : "bg-white text-[#545454] border-[#dcdcdc] hover:bg-[#f5f5f5]"
              }`}
            >
              {l.label}
            </button>
          ))}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#262626] rounded-lg text-xs font-bold flex items-center gap-1 border border-[#dcdcdc] transition-colors cursor-pointer"
          >
            More (22+)...
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <LanguageSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
