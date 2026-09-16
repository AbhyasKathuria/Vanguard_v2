"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Shield,
  Volume2,
  VolumeX,
  Globe,
  Sparkles,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🌐", greeting: "Hello! I am VANGUARD Regional AI Copilot. How can I assist you with civic actions or emergency guidance today?" },
  { code: "hi", label: "हिंदी (Hindi)", flag: "🇮🇳", greeting: "नमस्ते! मैं VANGUARD क्षेत्रीय AI सहायक हूँ। आज मैं नागरिक सुरक्षा या आपातकालीन सेवा में आपकी क्या मदद कर सकता हूँ?" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳", greeting: "ನಮಸ್ಕಾರ! ನಾನು VANGUARD ಪ್ರಾದೇಶಿಕ AI ಸಹಾಯಕ. ತುರ್ತು ಸೇವೆ ಅಥವಾ ದೂರು ಸಲ್ಲಿಕೆಯಲ್ಲಿ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?" },
  { code: "ta", label: "தமிழ் (Tamil)", flag: "🇮🇳", greeting: "வணக்கம்! நான் VANGUARD பிராந்திய AI உதவியாளர். அவசர உதவி அல்லது பொது புகார்களுக்கு நான் எவ்வாறு உதவ முடியும்?" },
  { code: "te", label: "తెలుగు (Telugu)", flag: "🇮🇳", greeting: "నమస్కారం! నేను VANGUARD ప్రాంతీయ AI సహాయకుడిని. అత్యవసర సేవలు లేదా సహాయం కోసం నేను మీకు ఎలా సహాయపడగలను?" },
  { code: "bn", label: "বাংলা (Bengali)", flag: "🇮🇳", greeting: "নমস্কার! আমি VANGUARD আঞ্চলিক AI সহকারী। জরুরি পরিষেবা বা নাগরিক সমস্যার সমাধানে আমি কীভাবে সাহায্য করতে পারি?" },
  { code: "mr", label: "मराठी (Marathi)", flag: "🇮🇳", greeting: "नमस्कार! मी VANGUARD प्रादेशिक AI सहाय्यक आहे. आपत्कालीन मदत किंवा नागरी तक्रारी निवारणात मी तुम्हाला कशी मदत करू शकतो?" },
];

const SUGGESTED_QUERIES: Record<string, string[]> = {
  en: [
    "🚨 How do I request an immediate ambulance?",
    "📸 How does AI Vision complaint auto-draft work?",
    "🌾 What are the flood safety precautions?",
    "⚡ Report dangerous dangling electric wires",
  ],
  hi: [
    "🚨 तुरंत एम्बुलेंस कैसे बुलाएं?",
    "📸 फोटो से शिकायत कैसे दर्ज करें?",
    "🌾 बाढ़ और बारिश में सुरक्षा के उपाय?",
    "⚡ टूटे बिजली के तार की शिकायत",
  ],
  kn: [
    "🚨 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ವಿನಂತಿಸುವುದು ಹೇಗೆ?",
    "📸 ಫೋಟೋ ಮೂಲಕ ದೂರು ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?",
  ],
  ta: [
    "🚨 அவசர ஆம்புலன்ஸ் கோருவது எப்படி?",
    "📸 புகைப்படத்துடன் புகார் பதிவு செய்வது எப்படி?",
  ],
  te: [
    "🚨 అత్యవసర అంబులెన్స్ కోసం ఎలా అడగాలి?",
    "📸 ఫోటో ద్వారా ఫిర్యాదు చేయడం ఎలా?",
  ],
  bn: [
    "🚨 জরুরি অ্যাম্বুলেন্স ডাকব কীভাবে?",
    "📸 ছবি তুলে অভিযোগ জানানোর উপায় কী?",
  ],
  mr: [
    "🚨 तातडीने रुग्णवाहिका कशी बोलवायची?",
    "📸 फोटो काढून तक्रार कशी नोंदवायची?",
  ],
};

export default function RegionalAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("en");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLocale) || SUPPORTED_LANGUAGES[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: activeLang.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Global event listener to open Regional AI Copilot from dock or sidebar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("vanguard:open-regional-ai", handleOpen);
    return () => window.removeEventListener("vanguard:open-regional-ai", handleOpen);
  }, []);

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    setCurrentLocale(newLocale);
    const newLang = SUPPORTED_LANGUAGES.find((l) => l.code === newLocale) || SUPPORTED_LANGUAGES[0];
    setMessages((prev) => [
      ...prev,
      {
        id: `lang_change_${Date.now()}`,
        role: "assistant",
        content: newLang.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      // map language code if available
      const langMap: Record<string, string> = {
        hi: "hi-IN",
        kn: "kn-IN",
        ta: "ta-IN",
        te: "te-IN",
        bn: "bn-IN",
        mr: "mr-IN",
        en: "en-IN",
      };
      utterance.lang = langMap[currentLocale] || "en-US";
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  // Send message
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "welcome" && !m.id.startsWith("lang_change_"))
        .concat(userMsg)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          locale: currentLocale,
        }),
      });

      const data = await res.json();
      const replyContent =
        data.reply ||
        (currentLocale === "hi"
          ? "मैं आपकी सहायता के लिए तैयार हूँ।"
          : "I am ready to assist you with emergency response.");

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(replyContent);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Network error. Please verify your connection or retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // STT Voice Input
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const langMap: Record<string, string> = {
        hi: "hi-IN",
        kn: "kn-IN",
        ta: "ta-IN",
        te: "te-IN",
        bn: "bn-IN",
        mr: "mr-IN",
        en: "en-IN",
      };
      recognition.lang = langMap[currentLocale] || "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("STT initiation error:", e);
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 print:hidden animate-in fade-in">
      {/* Expanded Floating Popover Card */}
      <div
        className={`flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
          isExpanded
            ? "w-[92vw] sm:w-[540px] h-[82vh] max-h-[720px]"
            : "w-[92vw] sm:w-[380px] h-[520px]"
        }`}
      >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">VANGUARD AI Copilot</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-neutral-400">7 Regional Indian Languages</p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors ${
                  ttsEnabled ? "text-sky-400" : "text-neutral-500"
                }`}
                title="Toggle Voice Output"
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                title={isExpanded ? "Minimize size" : "Expand size"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                title="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language Selector Bar */}
          <div className="px-3 py-2 bg-neutral-950/70 border-b border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0 mr-1" />
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-2 py-0.5 rounded-md shrink-0 font-medium transition-all ${
                  currentLocale === lang.code
                    ? "bg-sky-600 text-white font-semibold shadow-sm"
                    : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {lang.label.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 scrollbar-thin bg-neutral-950/40">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                >
                  <div className="flex items-center gap-1 text-[9px] text-neutral-500 mb-0.5 font-mono">
                    <span>{isAssistant ? "VANGUARD AI" : "YOU"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isAssistant
                        ? "bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-tl-sm"
                        : "bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-sm shadow-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span className="text-[11px] font-mono animate-pulse">Generating guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          {SUGGESTED_QUERIES[currentLocale] && (
            <div className="px-3 py-1.5 bg-neutral-950/80 border-t border-neutral-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {SUGGESTED_QUERIES[currentLocale].map((query, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(query)}
                  disabled={loading}
                  className="shrink-0 px-2 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/60 text-[10px] text-neutral-300 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          )}

          {/* Message Input & Microphone */}
          <div className="p-2.5 bg-neutral-900 border-t border-neutral-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl border transition-colors ${
                  isListening
                    ? "bg-red-600 text-white border-red-500 animate-pulse"
                    : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                }`}
                title="Speak to Assistant"
              >
                {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
                placeholder={
                  currentLocale === "hi"
                    ? "संदेश लिखें या पूछें..."
                    : currentLocale === "kn"
                    ? "ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ..."
                    : "Ask anything about emergency or complaints..."
                }
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
              />

              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
