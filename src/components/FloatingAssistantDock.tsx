'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Compass, MessageSquare, Bot } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export default function FloatingAssistantDock() {
  const pathname = usePathname();
  const { locale, t } = useLanguage();

  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/onboarding')
  ) {
    return null;
  }

  const langFlags: Record<string, string> = {
    en: '🇬🇧',
    hi: '🇮🇳',
    kn: '🇮🇳',
    ta: '🇮🇳',
    te: '🇮🇳',
    bn: '🇮🇳',
    mr: '🇮🇳',
    gu: '🇮🇳',
    pa: '🇮🇳',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    ar: '🇸🇦',
  };

  const openGuide = () => {
    window.dispatchEvent(new CustomEvent('vanguard:open-guide'));
  };

  const openWhatsApp = () => {
    window.dispatchEvent(new CustomEvent('vanguard:open-whatsapp'));
  };

  const openRegionalAI = () => {
    window.dispatchEvent(new CustomEvent('vanguard:open-regional-ai'));
  };

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 print:hidden pointer-events-auto">
      {/* 1. Guide by AI Co-Pilot Button */}
      <button
        type="button"
        onClick={openGuide}
        className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-[#262626] hover:bg-black text-white rounded-full shadow-lg border border-[#404040] hover:scale-105 transition-all cursor-pointer group"
        title="Interactive Step-by-Step AI Guide"
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#53bdeb] text-[#111] flex items-center justify-center font-black text-xs shadow-xs shrink-0">
          <Compass className="w-3.5 h-3.5 animate-spin duration-3000" />
        </div>
        <span className="text-xs font-bold tracking-tight hidden sm:inline">{t.dock.guideByAi}</span>
        <span className="px-1.5 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-[#53bdeb] hidden sm:inline">
          {t.dock.coPilot}
        </span>
      </button>

      {/* 2. WhatsApp Simulator Demo Button */}
      <button
        type="button"
        onClick={openWhatsApp}
        className="bg-[#25D366] hover:bg-[#1EBE5D] text-white p-2 sm:px-3.5 sm:py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-all cursor-pointer border-2 border-white/80 shrink-0"
        title="Open WhatsApp Dispatch Simulator"
      >
        <MessageSquare className="w-4 h-4 shrink-0" />
        <span className="text-xs font-bold hidden sm:inline">{t.dock.whatsAppDemo}</span>
      </button>

      {/* 3. Regional AI Copilot Button */}
      <button
        type="button"
        onClick={openRegionalAI}
        className="group relative flex items-center gap-2 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white p-2 sm:px-4 sm:py-2.5 rounded-full shadow-2xl shadow-sky-950/60 transition-all duration-300 hover:scale-105 cursor-pointer border border-white/20 backdrop-blur-md shrink-0"
        title="Open Regional Multi-Lingual AI Copilot"
      >
        <div className="relative shrink-0">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
        </div>
        <span className="hidden sm:inline text-xs font-semibold tracking-wide pr-0.5">
          {t.dock.regionalAiCopilot}
        </span>
        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
          {langFlags[locale] || '🌐'}
        </span>
      </button>
    </div>
  );
}
