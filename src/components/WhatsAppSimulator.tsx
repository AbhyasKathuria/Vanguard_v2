"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  X,
  Smartphone,
  CheckCheck,
  Loader2,
  Sparkles,
  RefreshCw,
  Globe,
} from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

export default function WhatsAppSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("919876543299");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_init",
      sender: "bot",
      text: "👋 *VANGUARD Multi-Lingual Rural Dispatch Bot*\n\nSend *HI* or greet in any language (*नमस्ते*, *ನಮಸ್ಕಾರ*, *வணக்கம்*, *Hola*, *Bonjour*) to raise a service request!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Global event listener to open simulator from dock or sidebar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("vanguard:open-whatsapp", handleOpen);
    return () => window.removeEventListener("vanguard:open-whatsapp", handleOpen);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/webhook/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: phone,
          text: text,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const botMsg: Message = {
          id: "b_" + Date.now(),
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("WhatsApp simulator error:", err);
      const errMsg: Message = {
        id: "b_err_" + Date.now(),
        sender: "bot",
        text: "⚠️ Connection error. Please verify the server is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const presetButtons = [
    { label: "🇬🇧 English (HI)", text: "HI" },
    { label: "🇮🇳 Hindi (नमस्ते)", text: "नमस्ते" },
    { label: "🇮🇳 Kannada (ನಮಸ್ಕಾರ)", text: "ನಮಸ್ಕಾರ" },
    { label: "🇮🇳 Tamil (வணக்கம்)", text: "வணக்கம்" },
    { label: "🇪🇸 Spanish (Hola)", text: "Hola" },
    { label: "2. Category (Civic)", text: "1" },
    { label: "3. Issue Description", text: "Electric wire snapped near primary school pond" },
    { label: "4. Location (Rampur)", text: "Rampur" },
    { label: "5. Worker Start Work", text: "START req_101" },
    { label: "6. Worker Done", text: "DONE req_101 Wire secured and tested safe" },
  ];

  return (
    <>
      {/* Simulator Modal Phone Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:pr-8 p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#EFEAE2] w-full sm:w-[380px] h-[90vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-[#dcdcdc] relative">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-white shadow-xs border border-white/20">
                  🛡️
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold tracking-tight">VANGUARD Dispatch Bot</h3>
                    <Sparkles className="w-3 h-3 text-[#25D366]" />
                  </div>
                  <p className="text-[10px] text-[#A6D5CD] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                    Multi-Lingual Business Account
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: "m_init",
                        sender: "bot",
                        text: "👋 *VANGUARD Rural Dispatch Bot*\n\nSend *HI* or greet in your language (*नमस्ते*, *ನಮಸ್ಕಾರ*, *வணக்கம்*, *Hola*) to begin!",
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      },
                    ])
                  }
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                  title="Reset Chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Phone Number Banner */}
            <div className="bg-[#128C7E]/15 px-3 py-1.5 text-[10px] text-[#075E54] border-b border-[#075E54]/10 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Simulating Sender: +{phone}
              </span>
              <button
                onClick={() => setPhone(phone === "919876543299" ? "919876543211" : "919876543299")}
                className="text-[9px] underline font-bold cursor-pointer"
              >
                {phone === "919876543299" ? "Switch to Worker Sunil" : "Switch to Citizen"}
              </button>
            </div>

            {/* Quick Presets Carousel */}
            <div className="bg-white/70 px-2 py-1.5 border-b border-[#dcdcdc] flex items-center gap-1 overflow-x-auto text-[10px] whitespace-nowrap scrollbar-none">
              <span className="text-[9px] font-bold text-[#707070] pl-1">Presets:</span>
              {presetButtons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(btn.text)}
                  disabled={loading}
                  className="px-2 py-0.5 rounded-full bg-[#E1F3FB] text-[#006699] border border-[#BDE5F8] hover:bg-[#BDE5F8] font-medium transition-colors cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"} animate-in fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                        isBot
                          ? "bg-white text-[#111B21] rounded-tl-xs border border-[#e0e0e0]"
                          : "bg-[#D9FDD3] text-[#111B21] rounded-tr-xs border border-[#c4f8bb]"
                      }`}
                    >
                      {m.text}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#667781]">
                        <span>{m.timestamp}</span>
                        {!isBot && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex items-center gap-1.5 text-xs text-[#667781] italic bg-white/80 px-3 py-1.5 rounded-full w-fit">
                  <Loader2 className="w-3 h-3 animate-spin text-[#075E54]" />
                  <span>VANGUARD bot is routing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-[#F0F2F5] p-2 flex items-center gap-2 border-t border-[#dcdcdc] shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message, greeting, or preset..."
                className="flex-1 px-3.5 py-2 text-xs bg-white rounded-full border border-[#dcdcdc] focus:outline-none focus:border-[#075E54] text-[#111B21]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="w-8 h-8 rounded-full bg-[#075E54] hover:bg-[#128C7E] text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
