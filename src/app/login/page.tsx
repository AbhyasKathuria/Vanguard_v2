"use client";

import React, { useState } from "react";
import Image from "next/image";
import AuthForm from "@/components/AuthForm";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import DemoLoginButtons from "@/components/DemoLoginButtons";
import { useLanguage } from "@/lib/i18n/context";
import { Shield, Lock, ArrowRight, Loader2, AlertCircle, Sparkles, MapPin } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const [showPasswordMode, setShowPasswordMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Please enter both phone number and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Check your phone or password.");
        return;
      }

      const role = data.user?.role;
      let dest = "/citizen/dashboard";
      if (role === "super_admin" || role === "admin") dest = "/superadmin/dashboard";
      else if (role === "worker") dest = "/worker/dashboard";
      else if (role === "volunteer") dest = "/volunteer/dashboard";
      else if (role === "authority" || role === "higher_authority") dest = "/authority/dashboard";

      window.location.href = dest;
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Main Authentication Card */}
        <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white tracking-tight">
                {t.common.signIn}
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Passwordless phone OTP or account credentials
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordMode(!showPasswordMode)}
              className="text-xs text-[#0071E3] font-bold hover:underline cursor-pointer"
            >
              {showPasswordMode ? "Use OTP →" : "Use Password →"}
            </button>
          </div>

          {!showPasswordMode ? (
            <AuthForm initialMode="login" />
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-[#0071E3] outline-none text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-[#0071E3] outline-none text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0071E3] hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* 1-Click Fast Demo Login Profiles */}
        <div className="pt-2">
          <DemoLoginButtons />
        </div>
      </div>
    </div>
  );
}
