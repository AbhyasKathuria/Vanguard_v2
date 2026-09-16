import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../lib/i18n';

const LanguageContext = createContext();

export const languagesList = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
];

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('vanguard_language') || 'en';
  });

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('vanguard_language', langCode);
    i18n.changeLanguage(langCode);
  };

  useEffect(() => {
    // Set language on start
    i18n.changeLanguage(currentLang);
  }, [currentLang]);

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, languagesList }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export function changeLanguage(langCode) {
  i18n.changeLanguage(langCode)
  localStorage.setItem('vanguard_language', langCode)
}

