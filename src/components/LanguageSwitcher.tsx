"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import LanguageSelectorModal from "@/components/LanguageSelectorModal";
import { Globe, ChevronDown, Check, Search } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale, currentLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Top quick languages in dropdown
  const topLanguages = availableLanguages.slice(0, 8);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors shadow-2xs cursor-pointer"
          title="Change Language / ಭಾಷೆಯನ್ನು ಬದಲಿಸಿ / भाषा बदलें / மொழியை மாற்றുക"
        >
          <span className="text-sm">{currentLanguage.flag}</span>
          <span>{currentLanguage.nativeName}</span>
          <ChevronDown
            className={`w-3 h-3 text-[#a6a6a6] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-[#dcdcdc] py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
            <div className="px-3 py-1 text-[10px] font-bold text-[#707070] uppercase tracking-wider border-b border-[#f0f0f0] mb-1 flex items-center justify-between">
              <span>Select Language</span>
              <span className="text-[9px] text-[#a6a6a6]">22+ Available</span>
            </div>

            <div className="max-h-56 overflow-y-auto">
              {topLanguages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLocale(l.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#f5f5f5] transition-colors cursor-pointer ${
                    locale === l.code
                      ? "font-bold text-[#262626] bg-[#fafafa]"
                      : "text-[#404040]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{l.flag}</span>
                    <span>{l.nativeName}</span>
                    <span className="text-[10px] text-[#707070]">({l.name})</span>
                  </span>
                  {locale === l.code && <Check className="w-3.5 h-3.5 text-[#262626]" />}
                </button>
              ))}
            </div>

            <div className="pt-1 mt-1 border-t border-[#f0f0f0] px-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full py-1.5 px-2 bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#262626] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#53bdeb]" />
                All Languages (22+)...
              </button>
            </div>
          </div>
        )}
      </div>

      <LanguageSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
