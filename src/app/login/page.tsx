"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import { useLanguage } from "@/lib/i18n/context";
import { Shield, Lock, ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";

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
      let target = "/citizen/dashboard";
      if (role === "super_admin" || role === "admin") target = "/superadmin/dashboard";
      else if (role === "worker") target = "/worker/dashboard";
      else if (role === "volunteer") target = "/volunteer/dashboard";
      else if (role === "authority" || role === "higher_authority") target = "/authority/dashboard";

      window.location.href = target;
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      {/* 1-Click Multi-Lingual Switcher */}
      <DashboardLanguageBanner />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-[#262626] text-white mb-1 shadow-md">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-[#262626] tracking-tight">{t.common.signIn}</h1>
        <p className="text-xs text-[#707070]">
          Instant Passwordless Access for Citizens, Volunteers &amp; Workers.
        </p>
      </div>

      {!showPasswordMode ? (
        <>
          <AuthForm initialMode="login" />
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPasswordMode(true)}
              className="text-xs text-[#707070] hover:text-[#262626] underline font-medium cursor-pointer"
            >
              Sign in with password instead
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#dcdcdc] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#262626]">Password Authentication</h3>
            <button
              type="button"
              onClick={() => setShowPasswordMode(false)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
            >
              Use Passwordless OTP &rarr;
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#404040] mb-1.5">
                Mobile Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 text-xs border border-[#dcdcdc] rounded-xl focus:border-[#404040] outline-none text-[#404040]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#404040] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs border border-[#dcdcdc] rounded-xl focus:border-[#404040] outline-none text-[#404040]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
