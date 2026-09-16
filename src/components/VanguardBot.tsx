"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Shield,
  HelpCircle,
  Heart,
  Sprout,
  Activity,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const FAQ_SUGGESTIONS = [
  "🌸 Menstrual cycle & cramp relief tips?",
  "🩺 First aid for fever and burns?",
  "🌾 Best crops for black and alluvial soil?",
  "⚡ How does VANGUARD auto-routing work?",
  "🛡️ How do I track my service request?",
];

export default function VanguardBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Namaste! I'm **VanguardBot** (🛡️🌸🌾), your friendly rural assistant!\n\nI can help you with:\n• 🌸 **Women's Menstrual & Reproductive Health**\n• 🩺 **First Aid & Basic Medical Guidance**\n• 🌾 **Farming, Soils, Climate & Crop Advisory**\n• ⚡ **Village Service Routing & Request Tracking**\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .concat(userMsg)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload }),
      });

      const text = await res.text();
      let replyText = "I'm here to support your health, farming, and community needs! 🛡️🌸🌾";

      if (text && text.trim()) {
        try {
          const data = JSON.parse(text);
          if (data && data.reply) {
            replyText = data.reply;
          }
        } catch (parseError) {
          console.warn("Could not parse JSON response from /api/chat:", parseError);
        }
      }

      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: "assistant",
          content: "Sorry, I ran into a small hiccup! Please try asking again. 🛡️✨",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Expanded Chat Drawer */}
      {isOpen ? (
        <div className="bg-white w-[350px] sm:w-[410px] h-[540px] rounded-2xl shadow-2xl border border-[#dcdcdc] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#404040] text-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-sm">
                  🌸
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#404040] absolute -bottom-0.5 -right-0.5 animate-pulse"></span>
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5 text-white">
                  VanguardBot
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/20 text-[#dcdcdc] uppercase tracking-wider">
                    Groq LLM
                  </span>
                </h3>
                <p className="text-[10px] text-[#dcdcdc]">Women&apos;s Health · First Aid · Farming · Dispatch</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#dcdcdc] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick FAQ Chips Bar */}
          <div className="bg-[#f5f5f5] p-2 border-b border-[#dcdcdc] overflow-x-auto whitespace-nowrap flex gap-1.5 text-[11px]">
            {FAQ_SUGGESTIONS.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleSend(faq)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#dcdcdc] text-[#404040] font-medium hover:border-[#707070] hover:bg-[#fafafa] shrink-0 transition-colors cursor-pointer text-[11px]"
              >
                {faq}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#fafafa]">
            {messages.map((m) => {
              const isBot = m.role === "assistant";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-[#404040] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-xs">
                      🌸
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-2xs whitespace-pre-wrap ${
                      isBot
                        ? "bg-white text-[#404040] border border-[#dcdcdc] rounded-tl-xs"
                        : "bg-[#404040] text-white rounded-tr-xs font-medium"
                    }`}
                  >
                    {m.content}
                  </div>

                  {!isBot && (
                    <div className="w-6 h-6 rounded-full bg-[#707070] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      👤
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#707070] p-2.5 bg-white rounded-xl border border-[#dcdcdc] w-fit shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#404040]" />
                <span className="italic text-[11px]">VanguardBot is thinking via Groq...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-[#dcdcdc] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about periods, first aid, crops, or routing..."
              className="flex-1 px-3 py-2 text-xs border border-[#dcdcdc] rounded-xl outline-none focus:border-[#404040] bg-[#f5f5f5] text-[#404040]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-[#404040] hover:bg-[#262626] text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Minimized Cute Floating Button */
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2.5 bg-[#404040] hover:bg-[#262626] text-white rounded-full shadow-lg border border-[#707070] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <span className="text-sm">🌸</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5"></span>
          </div>
          <span className="text-xs font-bold tracking-tight">VanguardBot</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-[#f5f5f5] font-semibold hidden sm:inline">
            AI Assistant
          </span>
        </button>
      )}
    </div>
  );
}
