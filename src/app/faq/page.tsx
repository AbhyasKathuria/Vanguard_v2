"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  Search,
  MessageSquare,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  ExternalLink,
} from "lucide-react";

interface FAQItem {
  question: string;
  category: "routing" | "verification" | "offline" | "weather" | "roles";
  answer: string;
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const faqs: FAQItem[] = [
    {
      question: "What is deterministic routing and why does VANGUARD use it?",
      category: "routing",
      answer:
        "Deterministic routing means that identical inputs (Category, Location, and Status) will always produce the exact same priority mapping and assignment result. Unlike opaque black-box LLMs or non-deterministic ML models, VANGUARD's 100% rule-based core guarantees that emergency and health requests are never misclassified or delayed due to model hallucinations or server downtime.",
    },
    {
      question: "How does VANGUARD calculate distance to find the nearest worker?",
      category: "routing",
      answer:
        "VANGUARD computes real geometric distance using the Haversine formula across latitude and longitude coordinates. When a citizen submits a request, the engine identifies all available, verified workers or volunteers, computes their distance in kilometers, verifies they are within the category's dispatch radius (e.g. 15 km for Civic, 30 km for Emergency), and automatically assigns the nearest candidate.",
    },
    {
      question: "What is the Hard Verification Gate for workers and volunteers?",
      category: "verification",
      answer:
        "To protect rural citizens from fraudulent or unqualified actors, the routing engine enforces a hard check: only users with 'verified: true' and 'availability: true' can be matched. Unverified candidates are completely skipped, and the request is queued in the Local Authority command center for official triage.",
    },
    {
      question: "How can a villager raise a request without internet or a smartphone?",
      category: "offline",
      answer:
        "VANGUARD provides three low-bandwidth channels: (1) An automated WhatsApp bot where citizens text simple numbers (1-5) and plain text descriptions, (2) Proxy creation where local NGO volunteers or Gram Panchayat workers raise requests on behalf of elderly or non-smartphone citizens, and (3) SMS / IVR integration via Twilio and MSG91.",
    },
    {
      question: "How does the Local Authority handle unassigned requests?",
      category: "roles",
      answer:
        "If no verified worker is within the dispatch radius, the request status remains 'OPEN'. Local Authority officers have a dedicated command dashboard where they can manually assign verified personnel across neighboring villages or dispatch municipal taskforces.",
    },
    {
      question: "How does live weather data affect worker safety during storms?",
      category: "weather",
      answer:
        "VANGUARD integrates open-access Open-Meteo telemetry directly into worker and authority dashboards. If heavy rain or thunderstorm codes (WMO 80-95) are detected in a village, an automated field advisory is highlighted alerting electricians to halt high-wire repairs and prompting canal maintenance crews to inspect waterlogging.",
    },
    {
      question: "What permissions does a Super Admin have compared to a Local Authority?",
      category: "roles",
      answer:
        "A Local Authority manages triage and worker verification within their designated district (e.g., Rampur or Mandya). A Super Admin possesses state-wide oversight: viewing aggregated metrics across all 6 districts, monitoring the health of all 6 external API adapters, and provisioning or suspending District Authority accounts.",
    },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory = activeCategory === "all" || f.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="bg-[#1e1e1e] text-white p-7 sm:p-9 rounded-3xl border border-[#383838] shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#53bdeb]/20 text-[#53bdeb] border border-[#53bdeb]/40">
            Knowledge Base
          </span>
          <span className="text-[11px] text-[#a6a6a6]">Frequently Asked Questions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-[#53bdeb]" />
          VANGUARD Platform Architecture FAQ
        </h1>
        <p className="text-xs text-[#a6a6a6] max-w-2xl leading-relaxed">
          Learn how deterministic service routing, immutable audit timelines, multi-lingual dispatch, and zero-config external fallbacks work under the hood.
        </p>

        {/* Search Bar */}
        <div className="pt-2 relative max-w-md">
          <Search className="w-4 h-4 text-[#a6a6a6] absolute left-3.5 top-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g., 'routing', 'verification', 'offline')..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-[#a6a6a6] focus:outline-none focus:bg-white/15 focus:border-[#53bdeb]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeCategory === "all" ? "bg-[#262626] text-white shadow-xs" : "bg-white text-[#707070] border border-[#dcdcdc]"
          }`}
        >
          All Topics
        </button>
        <button
          onClick={() => setActiveCategory("routing")}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeCategory === "routing" ? "bg-[#262626] text-white shadow-xs" : "bg-white text-[#707070] border border-[#dcdcdc]"
          }`}
        >
          Routing Engine
        </button>
        <button
          onClick={() => setActiveCategory("verification")}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeCategory === "verification" ? "bg-[#262626] text-white shadow-xs" : "bg-white text-[#707070] border border-[#dcdcdc]"
          }`}
        >
          Trust &amp; Verification
        </button>
        <button
          onClick={() => setActiveCategory("offline")}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeCategory === "offline" ? "bg-[#262626] text-white shadow-xs" : "bg-white text-[#707070] border border-[#dcdcdc]"
          }`}
        >
          WhatsApp &amp; Offline
        </button>
        <button
          onClick={() => setActiveCategory("weather")}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeCategory === "weather" ? "bg-[#262626] text-white shadow-xs" : "bg-white text-[#707070] border border-[#dcdcdc]"
          }`}
        >
          Weather Telemetry
        </button>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-[#dcdcdc] text-center text-xs text-[#707070]">
            No questions matched your search query. Try typing &quot;routing&quot; or &quot;verification&quot;.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#dcdcdc] shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-[#fafafa] transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold text-[#262626] leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#707070] shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-[#262626]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#545454] leading-relaxed border-t border-[#f0f0f0] pt-3 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Helper Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#262626]">Need to test the bot live?</h3>
          <p className="text-xs text-[#707070] mt-0.5">
            You can launch the WhatsApp Bot Simulator in the bottom right corner or ask the floating VanguardBot assistant.
          </p>
        </div>
        <Link
          href="/citizen/new-request"
          className="px-4 py-2 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition-colors"
        >
          Submit Test Request ➔
        </Link>
      </div>
    </div>
  );
}
