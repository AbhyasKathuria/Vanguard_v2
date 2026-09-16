"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  PhoneCall,
  Siren,
  HeartPulse,
  Droplets,
  Zap,
  Wheat,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import AssistedVoiceReporter from "@/components/voice/AssistedVoiceReporter";
import { useLanguage } from "@/lib/i18n/context";

export default function SimpleModePage() {
  const { t } = useLanguage();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [spokenMessage, setSpokenMessage] = useState<string | null>(null);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-6 max-w-4xl mx-auto font-sans">
      {/* Top Bar with Back and Read Aloud */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ (Home)</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              speakText(
                "नमस्ते! यह वैनगार्ड सरल सेवा पोर्टल है। अपनी समस्या बोलकर दर्ज करने के लिए माइक बटन दबाएं, या नीचे दी गई सेवाओं पर टैप करें।"
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold"
          >
            <Volume2 className="w-4 h-4" />
            <span>सुनें (Listen)</span>
          </button>
          <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {t.nav.simpleMode}
          </span>
        </div>
      </div>

      {/* Main Hero Speak Button */}
      <div className="mb-8">
        <button
          onClick={() => {
            setShowVoiceModal(true);
            speakText("अपनी समस्या बोलकर बताएं। चार आसान चरणों में आपकी शिकायत दर्ज हो जाएगी।");
          }}
          className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white p-6 sm:p-8 rounded-3xl border-2 border-white/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left transition-all transform active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-sky-200 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI वॉयस सहायक
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                बोलकर शिकायत दर्ज करें
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 mt-1">
                Tap here to speak in Hindi or regional language
              </p>
            </div>
          </div>
          <div className="px-5 py-2.5 rounded-xl bg-white text-black font-black text-sm shadow-md shrink-0">
            शुरू करें →
          </div>
        </button>
      </div>

      {/* Direct High-Touch Service Grid */}
      <div className="mb-8">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-3">
          त्वरित सेवा चयन (Quick Assistance)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Emergency SOS */}
          <Link
            href="/emergency/triage"
            className="p-5 rounded-2xl bg-[#1c1c1c] border-2 border-red-500/40 hover:border-red-500 text-white flex items-center gap-4 transition-all shadow-lg shadow-red-950/20"
          >
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-base text-red-400">🚨 आपातकालीन सहायता (SOS)</div>
              <div className="text-xs text-neutral-400">गंभीर दुर्घटना, आग, या पुलिस सहायता</div>
            </div>
          </Link>

          {/* Hospital & Ambulance */}
          <a
            href="tel:108"
            className="p-5 rounded-2xl bg-[#1c1c1c] border-2 border-rose-500/40 hover:border-rose-500 text-white flex items-center gap-4 transition-all shadow-lg shadow-rose-950/20"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-base text-rose-400">🏥 108 एम्बुलेंस कॉल</div>
              <div className="text-xs text-neutral-400">मुफ़्त सरकारी एम्बुलेंस तुरंत बुलाएं</div>
            </div>
          </a>

          {/* Drinking Water */}
          <Link
            href="/citizen/new-request?category=health"
            className="p-5 rounded-2xl bg-[#1c1c1c] border-2 border-sky-500/40 hover:border-sky-500 text-white flex items-center gap-4 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-base text-sky-400">💧 पीने का पानी / हैंडपंप</div>
              <div className="text-xs text-neutral-400">पाइप लीकेज, बोरवेल खराबी, दूषित पानी</div>
            </div>
          </Link>

          {/* Electricity */}
          <Link
            href="/citizen/new-request?category=civic"
            className="p-5 rounded-2xl bg-[#1c1c1c] border-2 border-yellow-500/40 hover:border-yellow-500 text-white flex items-center gap-4 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-600 flex items-center justify-center text-white shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-base text-yellow-400">⚡ बिजली गुल / तार टूटा</div>
              <div className="text-xs text-neutral-400">ट्रांसफार्मर फुंका, तार गिरा, पोल झुका</div>
            </div>
          </Link>

          {/* Farmer Hub */}
          <Link
            href="/farmer"
            className="p-5 rounded-2xl bg-[#1c1c1c] border-2 border-emerald-500/40 hover:border-emerald-500 text-white flex items-center gap-4 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-base text-emerald-400">🌾 किसान व पशु सहायता</div>
              <div className="text-xs text-neutral-400">गाय-भैंस बीमार, फसल रोग, मंडी भाव, बीमा</div>
            </div>
          </Link>

          {/* School & Schemes */}
          <Link
            href="/schemes"
            className="p-5 rounded-2xl bg-[#1c1c1c] border-2 border-purple-500/40 hover:border-purple-500 text-white flex items-center gap-4 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-base text-purple-400">📋 सरकारी योजनाएं जांचें</div>
              <div className="text-xs text-neutral-400">किसान सम्मान निधि, आवास, आयुष्मान कार्ड</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Emergency Helpline Buttons (Direct Dial) */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-5 border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5" />
          सीधा कॉल करें (Direct Emergency Helplines)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <a
            href="tel:112"
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-colors"
          >
            <div className="text-base font-black text-red-400">112</div>
            <div className="text-[11px] text-neutral-400">सभी आपातकाल</div>
          </a>
          <a
            href="tel:108"
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-colors"
          >
            <div className="text-base font-black text-rose-400">108</div>
            <div className="text-[11px] text-neutral-400">एम्बुलेंस</div>
          </a>
          <a
            href="tel:1962"
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-colors"
          >
            <div className="text-base font-black text-amber-400">1962</div>
            <div className="text-[11px] text-neutral-400">पशु चिकित्सा</div>
          </a>
          <a
            href="tel:1077"
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-colors"
          >
            <div className="text-base font-black text-sky-400">1077</div>
            <div className="text-[11px] text-neutral-400">आपदा राहत</div>
          </a>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
          <div className="w-full max-w-2xl">
            <AssistedVoiceReporter
              onSuccess={(id) => {
                setSpokenMessage(`Grievance submitted with ticket ID: ${id}`);
              }}
              onCancel={() => setShowVoiceModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
