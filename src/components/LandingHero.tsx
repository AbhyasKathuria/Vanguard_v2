"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight, AlertTriangle, LayoutDashboard, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface LandingHeroProps {
  appName?: string;
  tagline?: string;
}

export default function LandingHero({
  appName,
  tagline,
}: LandingHeroProps) {
  const { t } = useLanguage();

  const displayAppName = appName || t.common.appName;
  const displayTagline = tagline || t.landing.heroTagline;

  return (
    <section className="relative overflow-hidden py-10 sm:py-16 text-center">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#53bdeb]/10 via-white/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Official VANGUARD Emblem */}
        <div className="flex justify-center mb-1">
          <img
            src="/logo-emblem.png"
            alt="VANGUARD Emblem"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md hover:scale-105 transition-transform"
          />
        </div>

        {/* Bold Tagline & Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#262626] tracking-tight leading-tight">
            {displayAppName}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#545454] tracking-tight max-w-xl mx-auto">
            {displayTagline}
          </p>
        </div>

        {/* High-Impact Dual CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            href="/smart-complaint"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-[#262626] hover:bg-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{t.landing.reportEmergencyBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-extrabold text-[#262626] bg-white hover:bg-[#f5f5f5] border border-[#dcdcdc] shadow-xs hover:border-[#404040] transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-[#707070]" />
            <span>{t.landing.accessDashboardBtn}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
