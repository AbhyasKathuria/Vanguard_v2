"use client";

import React from "react";
import Link from "next/link";
import DemoLoginButtons from "@/components/DemoLoginButtons";
import GuidedTour from "@/components/GuidedTour";
import VanguardLogo from "@/components/VanguardLogo";
import LandingHero from "@/components/LandingHero";
import { useLanguage } from "@/lib/i18n/context";
import {
  Shield,
  ArrowRight,
  User,
  UserCheck,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Route,
  History,
  Sliders,
  Layers,
  HelpCircle,
  Sparkles,
  Radio,
  HeartPulse,
  Activity,
  Camera,
} from "lucide-react";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      {/* Minimalist Landing Hero with Branding & Dual CTAs */}
      <LandingHero />

      {/* Scripted 2-Minute Evaluator Guided Tour */}
      <GuidedTour />

      {/* Next-Gen AI Multimodal Emergency & Civic Operations Hub */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#262626] text-[#53bdeb] text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#53bdeb]" />
            {t.landing.aiOpsBadge}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#262626]">
            {t.landing.aiOpsTitle}
          </h2>
          <p className="text-xs text-[#707070] max-w-xl mx-auto">
            {t.landing.aiOpsDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Vision Auto-Draft */}
          <Link
            href="/smart-complaint"
            className="p-5 rounded-2xl bg-white border border-[#dcdcdc] shadow-xs hover:border-[#262626] hover:shadow-sm transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#262626] text-[#53bdeb] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#262626] group-hover:text-black">
                {t.landing.cardVisionTitle}
              </h3>
              <p className="text-xs text-[#707070] leading-relaxed">
                {t.landing.cardVisionDesc}
              </p>
            </div>
            <span className="text-xs font-bold text-[#262626] flex items-center gap-1 group-hover:underline">
              {t.landing.cardVisionAction} &rarr;
            </span>
          </Link>

          {/* Card 2: AI Voice Dispatch */}
          <Link
            href="/dispatch/simulator"
            className="p-5 rounded-2xl bg-white border border-[#dcdcdc] shadow-xs hover:border-[#262626] hover:shadow-sm transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#262626] text-[#25D366] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#262626] group-hover:text-black">
                {t.landing.cardVoiceTitle}
              </h3>
              <p className="text-xs text-[#707070] leading-relaxed">
                {t.landing.cardVoiceDesc}
              </p>
            </div>
            <span className="text-xs font-bold text-[#262626] flex items-center gap-1 group-hover:underline">
              {t.landing.cardVoiceAction} &rarr;
            </span>
          </Link>

          {/* Card 3: Dual Emergency Triage */}
          <Link
            href="/emergency/triage"
            className="p-5 rounded-2xl bg-white border border-[#dcdcdc] shadow-xs hover:border-[#262626] hover:shadow-sm transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#262626] text-red-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#262626] group-hover:text-black">
                {t.landing.cardTriageTitle}
              </h3>
              <p className="text-xs text-[#707070] leading-relaxed">
                {t.landing.cardTriageDesc}
              </p>
            </div>
            <span className="text-xs font-bold text-[#262626] flex items-center gap-1 group-hover:underline">
              {t.landing.cardTriageAction} &rarr;
            </span>
          </Link>

          {/* Card 4: Threat Matrix */}
          <Link
            href="/threat-matrix"
            className="p-5 rounded-2xl bg-white border border-[#dcdcdc] shadow-xs hover:border-[#262626] hover:shadow-sm transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#262626] text-amber-300 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#262626] group-hover:text-black">
                {t.landing.cardThreatTitle}
              </h3>
              <p className="text-xs text-[#707070] leading-relaxed">
                {t.landing.cardThreatDesc}
              </p>
            </div>
            <span className="text-xs font-bold text-[#262626] flex items-center gap-1 group-hover:underline">
              {t.landing.cardThreatAction} &rarr;
            </span>
          </Link>
        </div>
      </div>

      {/* 1-Click Instant Demo Box */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#dcdcdc] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#262626] text-white p-2 rounded-xl shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#262626]">{t.landing.demoLauncherTitle}</h2>
            <p className="text-xs text-[#707070]">{t.landing.demoLauncherDesc}</p>
          </div>
        </div>

        <DemoLoginButtons />
      </div>

      {/* 5 User Roles Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#707070] text-center">
          {t.landing.rolesTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-2xs space-y-2 hover:border-[#a6a6a6] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#f5f5f5] text-[#404040] border border-[#dcdcdc]">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#262626]">1. {t.citizen.portalBadge}</h3>
            </div>
            <p className="text-xs text-[#707070] leading-relaxed">
              {t.citizen.newRequestDesc}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-2xs space-y-2 hover:border-[#a6a6a6] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#f5f5f5] text-[#404040] border border-[#dcdcdc]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#262626]">2. {t.worker.badge}</h3>
            </div>
            <p className="text-xs text-[#707070] leading-relaxed">
              {t.worker.pageDesc}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-2xs space-y-2 hover:border-[#a6a6a6] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#f5f5f5] text-[#404040] border border-[#dcdcdc]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#262626]">3. {t.volunteer.badge}</h3>
            </div>
            <p className="text-xs text-[#707070] leading-relaxed">
              {t.volunteer.pageDesc}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-2xs space-y-2 hover:border-[#a6a6a6] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#f5f5f5] text-[#404040] border border-[#dcdcdc]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#262626]">4. {t.authority.badge}</h3>
            </div>
            <p className="text-xs text-[#707070] leading-relaxed">
              {t.authority.pageDesc}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-2xs space-y-2 hover:border-[#a6a6a6] transition-colors sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#111827] text-[#53bdeb] border border-[#374151]">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#262626]">5. {t.nav.superAdminCenter}</h3>
            </div>
            <p className="text-xs text-[#707070] leading-relaxed">
              {t.authority.tabAllRequests} &amp; {t.authority.tabPersonnel}
            </p>
          </div>
        </div>
      </div>

      {/* Core Engineering Principles */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#dcdcdc] shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#262626] font-bold text-sm">
            <Route className="w-4 h-4 text-[#707070]" />
            {t.landing.feature1Title}
          </div>
          <p className="text-xs text-[#707070]">
            {t.landing.feature1Desc}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#262626] font-bold text-sm">
            <History className="w-4 h-4 text-[#707070]" />
            {t.landing.feature2Title}
          </div>
          <p className="text-xs text-[#707070]">
            {t.landing.feature2Desc}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#262626] font-bold text-sm">
            <Shield className="w-4 h-4 text-[#707070]" />
            {t.landing.feature3Title}
          </div>
          <p className="text-xs text-[#707070]">
            {t.landing.feature3Desc}
          </p>
        </div>
      </div>
    </div>
  );
}
