"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import {
  Wheat,
  Shield,
  Wrench,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

interface RoleOption {
  id: string;
  role: "citizen" | "worker";
  citizenProfile: "general" | "farmer" | "women";
  icon: any;
  title: string;
  titleEn: string;
  subtitle: string;
  badge: string;
  features: string[];
  themeColor: string;
  borderColor: string;
  activeBg: string;
}

const ROLES: RoleOption[] = [
  {
    id: "farmer",
    role: "citizen",
    citizenProfile: "farmer",
    icon: Wheat,
    title: "किसान भाई (Farmer)",
    titleEn: "Agrarian & Cattle Care Hub",
    subtitle: "Fertilizer price caps, authorized sellers, live mandi rates, canal water schedule & crop health.",
    badge: "Agri Hub",
    features: [
      "Govt-Authorized Fertilizer Sellers Directory (Urea, DAP, NPK)",
      "Live APMC Mandi commodity price ticker",
      "Canal irrigation water schedule & tail-end alerts",
      "AI crop disease diagnostic scanner",
    ],
    themeColor: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-600",
    activeBg: "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-600",
  },
  {
    id: "citizen",
    role: "citizen",
    citizenProfile: "general",
    icon: Shield,
    title: "सामान्य नागरिक (Citizen)",
    titleEn: "Civic Governance & Services",
    subtitle: "File public grievances, track municipal repair timelines, check welfare schemes & blood banks.",
    badge: "Civic Hub",
    features: [
      "One-click multi-lingual grievance submission",
      "Live SLA escalation & department tracking",
      "Verified local blood bank & donation center directory",
      "Direct government welfare scheme eligibility checker",
    ],
    themeColor: "text-sky-700 dark:text-sky-400",
    borderColor: "border-sky-600",
    activeBg: "bg-sky-50/90 dark:bg-sky-950/40 border-sky-600",
  },
  {
    id: "worker",
    role: "worker",
    citizenProfile: "general",
    icon: Wrench,
    title: "कारीगर / कामगार (Worker)",
    titleEn: "Municipal Worker & Field Dispatch",
    subtitle: "View assigned civic repair tasks, update job progress with photo verification & claim wages.",
    badge: "Worker Board",
    features: [
      "Assigned job queue for sanitation, water & electrical works",
      "Job status updater with photo timestamp evidence",
      "Direct navigation coordinates to problem spots",
      "Immediate work completion confirmation",
    ],
    themeColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-600",
    activeBg: "bg-amber-50/90 dark:bg-amber-950/40 border-amber-600",
  },
  {
    id: "women",
    role: "citizen",
    citizenProfile: "women",
    icon: HeartHandshake,
    title: "महिला सहायता (Women Assistance)",
    titleEn: "SafeLine Dedicated Protection",
    subtitle: "Confidential SOS reporting, harassment redressal, female welfare schemes & zero-PII isolation.",
    badge: "SafeLine",
    features: [
      "Zero-PII confidential harassment reporting",
      "Direct dispatch to female protection officers",
      "Dedicated women & child development welfare assistance",
      "Discreet emergency quick-exit protection trigger",
    ],
    themeColor: "text-rose-700 dark:text-rose-400",
    borderColor: "border-rose-600",
    activeBg: "bg-rose-50/90 dark:bg-rose-950/40 border-rose-600",
  },
];

export default function RoleOnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>("farmer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmRole = async () => {
    setError("");
    const roleConfig = ROLES.find((r) => r.id === selectedRole);
    if (!roleConfig) return;

    try {
      setLoading(true);
      const res = await fetch("/api/user/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleConfig.role,
          citizenProfile: roleConfig.citizenProfile,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to set role profile.");
        return;
      }

      // Route directly to the role dashboard
      window.location.href = data.target || "/dashboard";
    } catch (err) {
      console.error("Role confirmation error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-between p-4 sm:p-8 font-sans">
      {/* Header */}
      <div className="max-w-3xl w-full text-center pt-4 pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-sky-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Step 4 of 4: Role Setup • अपनी भूमिका चुनें</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
          Choose How You Want to Use VANGUARD
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Select your primary role. VANGUARD will customize your home dashboard, emergency shortcuts, and local services for you.
        </p>
      </div>

      {/* Role Selection Grid - High Contrast, Large Tap Targets (min 48px) */}
      <div className="max-w-4xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
        {ROLES.map((item) => {
          const isSelected = selectedRole === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedRole(item.id)}
              className={`p-5 sm:p-6 rounded-3xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group shadow-xl ${
                isSelected
                  ? `${item.activeBg} scale-[1.02] shadow-2xl`
                  : "bg-neutral-900/90 hover:bg-neutral-850 border-neutral-800 text-neutral-200"
              }`}
            >
              <div>
                {/* Top row: Icon + Radio circle */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      isSelected
                        ? "bg-white text-black border-white shadow-md"
                        : "bg-neutral-800 border-neutral-700 text-neutral-300"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-neutral-300">
                      {item.badge}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-white text-black border-white"
                          : "border-neutral-600"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* Titles */}
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-neutral-400 mt-0.5">
                  {item.titleEn}
                </p>

                <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              {/* Bullet Highlights */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                {item.features.slice(0, 2).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirmation Row */}
      <div className="max-w-md w-full pt-6 pb-4 space-y-3 text-center">
        {error && (
          <div className="p-3 bg-red-900/40 border border-red-500 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirmRole}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm sm:text-base tracking-wide shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Setting up your dashboard...</span>
            </>
          ) : (
            <>
              <span>Enter VANGUARD Dashboard • आगे बढ़ें</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-[11px] text-neutral-400">
          You can change your role anytime from profile settings.
        </p>
      </div>
    </div>
  );
}
