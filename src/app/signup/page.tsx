"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import { useLanguage } from "@/lib/i18n/context";
import { Shield } from "lucide-react";

export default function SignupPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      {/* 1-Click Multi-Lingual Switcher */}
      <DashboardLanguageBanner />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-[#262626] text-white mb-1 shadow-md">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-[#262626] tracking-tight">{t.common.signUp}</h1>
        <p className="text-xs text-[#707070]">
          Zero-password registration with instant 6-digit SMS or Email code.
        </p>
      </div>

      <AuthForm initialMode="signup" />

      <div className="text-center text-xs text-[#707070] pt-2">
        Already registered?{" "}
        <Link href="/login" className="text-[#262626] font-bold hover:underline">
          {t.common.signIn}
        </Link>
      </div>
    </div>
  );
}
