"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageInfo } from "@/lib/i18n/languages";
import { Search, X, Globe, Check } from "lucide-react";

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageSelectorModal({
  isOpen,
  onClose,
}: LanguageSelectorModalProps) {
  const { locale, setLocale, availableLanguages } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"all" | "India" | "Global">("all");

  if (!isOpen) return null;

  const filteredLanguages = availableLanguages.filter((lang) => {
    const matchesRegion = regionFilter === "all" || lang.region === regionFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q);
    return matchesRegion && matchesSearch;
  });

  const handleSelectLanguage = (code: string) => {
    setLocale(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#dcdcdc] shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#262626] text-white">
              <Globe className="w-5 h-5 text-[#53bdeb]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#262626]">
                Select Display Language / भाषा चुनें
              </h2>
              <p className="text-xs text-[#707070]">
                Choose from all 22+ Indian languages &amp; major global languages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#707070] hover:bg-[#f5f5f5] hover:text-[#262626] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#a6a6a6] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language (e.g. Tamil, বাংলা, Telugu, Spanish, عربي)..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#dcdcdc] rounded-xl focus:border-[#262626] outline-none bg-[#f9f9f9] focus:bg-white text-[#262626]"
            autoFocus
          />
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1.5 pb-1 border-b border-[#f0f0f0] text-xs font-bold">
          <button
            onClick={() => setRegionFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              regionFilter === "all"
                ? "bg-[#262626] text-white"
                : "bg-white text-[#707070] hover:bg-[#f5f5f5]"
            }`}
          >
            All ({availableLanguages.length})
          </button>
          <button
            onClick={() => setRegionFilter("India")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              regionFilter === "India"
                ? "bg-[#262626] text-white"
                : "bg-white text-[#707070] hover:bg-[#f5f5f5]"
            }`}
          >
            🇮🇳 Indian Languages
          </button>
          <button
            onClick={() => setRegionFilter("Global")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              regionFilter === "Global"
                ? "bg-[#262626] text-white"
                : "bg-white text-[#707070] hover:bg-[#f5f5f5]"
            }`}
          >
            🌍 Global Languages
          </button>
        </div>

        {/* Language Grid */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
          {filteredLanguages.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-xs text-[#707070]">
              No matching languages found for &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#262626] text-white border-[#262626] shadow-xs"
                      : "bg-white hover:bg-[#fafafa] border-[#dcdcdc] text-[#262626] hover:border-[#a6a6a6]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{lang.flag}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {lang.nativeName}{" "}
                        <span
                          className={`text-[10px] font-normal ${
                            isSelected ? "text-gray-300" : "text-[#707070]"
                          }`}
                        >
                          ({lang.name})
                        </span>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-mono ${
                          isSelected ? "text-gray-400" : "text-[#a6a6a6]"
                        }`}
                      >
                        {lang.code} · {lang.region}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#25D366] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
