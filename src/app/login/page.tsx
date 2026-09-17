"use client";

import React from "react";
import Image from "next/image";
import AuthForm from "@/components/AuthForm";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import DemoLoginButtons from "@/components/DemoLoginButtons";
import { useLanguage } from "@/lib/i18n/context";
import { Shield, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1-Click Multi-Lingual Switcher */}
      <DashboardLanguageBanner />

      {/* Sample 3: Photographic Hero Header Band */}
      <div className="relative h-52 sm:h-60 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-end p-6 sm:p-8">
        <Image
          src="/images/heroes/login-hero.jpg"
          alt="VANGUARD Rural Platform"
          fill
          priority
          className="object-cover"
        />
        {/* Deep gradient overlay for high contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold mb-2 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>VANGUARD Civic Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Multi-District Rural Governance Platform
          </h1>
          <p className="text-xs sm:text-sm text-neutral-200 mt-1 max-w-xl">
            Deterministic GIS routing, multimodal grievance reporting, and decentralized community dispatch.
          </p>
        </div>
      </div>

      {/* Floating Section overlapping bottom edge (Sample 3) */}
      <div className="-mt-8 relative z-20 space-y-8 px-2 sm:px-4">
        {/* Main Authentication Card - 100% Passwordless Phone OTP */}
        <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 backdrop-blur-md space-y-4">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white tracking-tight">
              {t.common.signIn}
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Passwordless phone verification via instant SMS OTP
            </p>
          </div>

          <AuthForm initialMode="login" />
        </div>

        {/* Section Divider with Badge */}
        <div className="flex items-center gap-4 max-w-5xl mx-auto pt-6">
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-4 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant 1-Click Role Launcher</span>
          </div>
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* 1-Click Fast Demo Login Profiles (Full Width max-w-5xl) */}
        <div className="max-w-5xl mx-auto">
          <DemoLoginButtons />
        </div>
      </div>
    </div>
  );
}
