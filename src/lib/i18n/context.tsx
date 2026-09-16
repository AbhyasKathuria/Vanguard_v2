"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "./dictionaries/en";
import { hi } from "./dictionaries/hi";
import { kn } from "./dictionaries/kn";
import { ta } from "./dictionaries/ta";
import { te } from "./dictionaries/te";
import { bn } from "./dictionaries/bn";
import { mr } from "./dictionaries/mr";
import { gu } from "./dictionaries/gu";
import { ml } from "./dictionaries/ml";
import { pa } from "./dictionaries/pa";
import { es } from "./dictionaries/es";
import { fr } from "./dictionaries/fr";
import { ar } from "./dictionaries/ar";
import { de } from "./dictionaries/de";
import { SUPPORTED_LANGUAGES, LanguageInfo, getLanguageInfo } from "./languages";

export type LanguageLocale = string;

export const dictionaries: Record<string, typeof en> = {
  en,
  hi,
  kn,
  ta,
  te,
  bn,
  mr,
  gu,
  ml,
  pa,
  es,
  fr,
  ar,
  de,
};

interface LanguageContextType {
  locale: LanguageLocale;
  setLocale: (loc: LanguageLocale) => Promise<void>;
  t: typeof en;
  currentLanguage: LanguageInfo;
  availableLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: async () => {},
  t: en,
  currentLanguage: getLanguageInfo("en"),
  availableLanguages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: LanguageLocale;
}) {
  const [locale, setLocaleState] = useState<LanguageLocale>(initialLocale);

  useEffect(() => {
    // Check localStorage or cookie if available on client
    const saved = localStorage.getItem("vanguard_locale") as LanguageLocale;
    if (saved) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = async (newLocale: LanguageLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem("vanguard_locale", newLocale);
    document.cookie = `vanguard_locale=${newLocale}; path=/; max-age=31536000`;

    // Set document direction for RTL languages like Arabic & Urdu
    const info = getLanguageInfo(newLocale);
    if (typeof document !== "undefined") {
      document.documentElement.dir = info.direction || "ltr";
      document.documentElement.lang = newLocale;
    }

    // Also sync to User.language in database if user is logged in
    try {
      await fetch("/api/user/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: newLocale }),
      });
    } catch {
      // ignore guest sync error
    }
  };

  const t = dictionaries[locale] || dictionaries[locale.split("-")[0]] || en;
  const currentLanguage = getLanguageInfo(locale);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        currentLanguage,
        availableLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
