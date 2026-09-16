"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import {
  UserCheck,
  ShieldCheck,
  HeartHandshake,
  User,
  Sliders,
  Loader2,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function DemoLoginButtons() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [loadingPhone, setLoadingPhone] = useState<string | null>(null);
  const [selectedHub, setSelectedHub] = useState<string>("all");

  const demoAccounts = [
    // Super Admin & Higher Medical Official
    {
      role: "super_admin",
      district: "Global",
      roleLabel: "Super Admin",
      title: t.nav.superAdminCenter || "State Command HQ",
      name: "Officer Rajeshwar Rao",
      phone: "9876543200",
      icon: Sliders,
      dashboardPath: "/superadmin/dashboard",
      iconBg: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60",
      badge: "State HQ Telemetry & Governance",
    },
    {
      role: "super_admin",
      district: "Rampur",
      roleLabel: "Medical Official",
      title: "Higher Official (Medical Command)",
      name: "Dr. Arvind Swaminathan",
      phone: "9876543270",
      icon: HeartHandshake,
      dashboardPath: "/higher-official/dashboard",
      iconBg: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
      badge: "Trauma Triage & Blood Bank Relay",
    },
    // Authorities & Ward Members
    {
      role: "authority",
      district: "Rampur",
      roleLabel: "Ward Member",
      title: "Ward Member (Ward 4)",
      name: "Rajesh Kumar",
      phone: "9876543280",
      icon: ShieldCheck,
      dashboardPath: "/authority/dashboard",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
      badge: "Ward 4 Civic Oversight & Hotspots",
    },
    {
      role: "authority",
      district: "Rampur",
      roleLabel: "Local Authority",
      title: (t.authority.badge || "Authority") + " (Rampur)",
      name: "Officer Suresh Verma",
      phone: "9876543213",
      icon: ShieldCheck,
      dashboardPath: "/authority/dashboard",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
      badge: "Rampur Command & Verification",
    },
    {
      role: "authority",
      district: "Mandya",
      roleLabel: "Local Authority",
      title: (t.authority.badge || "Authority") + " (Mandya)",
      name: "Officer Mallikarjun Patil",
      phone: "9876543224",
      icon: ShieldCheck,
      dashboardPath: "/authority/dashboard",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
      badge: "Mandya Command & Verification",
    },
    // Citizens
    {
      role: "citizen",
      district: "Rampur",
      roleLabel: "Women Hub",
      title: "Women & Child Hub (SafeLine)",
      name: "Sunita Devi",
      phone: "9876543260",
      icon: ShieldAlert,
      dashboardPath: "/citizen/women",
      iconBg: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
      badge: "Women SHG & SafeLine Relay",
    },
    {
      role: "citizen",
      district: "Rampur",
      roleLabel: "Citizen (Farmer)",
      title: (t.citizen.portalBadge || "Citizen") + " (Rampur)",
      name: "Ramesh Sharma",
      phone: "9876543210",
      icon: User,
      dashboardPath: "/citizen/dashboard",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
      badge: "Citizen Grievances & Schemes",
    },
    {
      role: "citizen",
      district: "Mandya",
      roleLabel: "Citizen (Sugarcane)",
      title: (t.citizen.portalBadge || "Citizen") + " (Mandya)",
      name: "Basavaraj Gowda",
      phone: "9876543230",
      icon: User,
      dashboardPath: "/citizen/dashboard",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
      badge: "Canal & Irrigation Dispatch",
    },
    // Workers
    {
      role: "worker",
      district: "Rampur",
      roleLabel: "Field Worker",
      title: (t.worker.badge || "Worker") + " (Electrician)",
      name: "Sunil Electrician",
      phone: "9876543211",
      icon: UserCheck,
      dashboardPath: "/worker/dashboard",
      iconBg: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
      badge: "Verified Skilled Grid Dispatch",
    },
    // Volunteers
    {
      role: "volunteer",
      district: "Rampur",
      roleLabel: "Volunteer",
      title: (t.volunteer.badge || "Volunteer") + " (Rural Care)",
      name: "Pooja Volunteer",
      phone: "9876543212",
      icon: HeartHandshake,
      dashboardPath: "/volunteer/dashboard",
      iconBg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60",
      badge: "Community Aid & Blood Pool",
    },
  ];

  const handleDemoLogin = async (phone: string, dashboardPath: string) => {
    try {
      setLoadingPhone(phone);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: "password123" }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to log in as demo user");
        return;
      }

      window.location.href = dashboardPath;
    } catch (err) {
      console.error("Demo login error:", err);
      alert("Error logging into demo account.");
    } finally {
      setLoadingPhone(null);
    }
  };

  const filteredAccounts =
    selectedHub === "all"
      ? demoAccounts
      : demoAccounts.filter((a) => a.district === selectedHub || a.district === "Global");

  return (
    <div className="space-y-4">
      {/* Header filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              {t.landing.demoLauncherTitle || "1-Click Interactive Role Launcher"}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              No password typing needed • Instant login as pre-seeded personnel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-neutral-500 font-medium">{t.common.location}:</span>
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Districts (Global)</option>
            <option value="Rampur">Rampur Hub (UP)</option>
            <option value="Mandya">Mandya Hub (KA)</option>
          </select>
        </div>
      </div>

      {/* Elevated Floating Cards Grid (Sample 3 Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAccounts.map((acc) => {
          const Icon = acc.icon;
          const isLoading = loadingPhone === acc.phone;

          return (
            <div
              key={acc.phone}
              className="bg-white dark:bg-neutral-900/90 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-3 group hover:-translate-y-0.5 backdrop-blur-xs"
            >
              <div className="flex items-start gap-3">
                {/* Standardized Circular Icon Badge (Sample 1/3) */}
                <div
                  className={"w-10 h-10 rounded-full border flex items-center justify-center shrink-0 shadow-xs " + acc.iconBg}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {acc.roleLabel}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {acc.district}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                    {acc.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {acc.badge}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={loadingPhone !== null}
                onClick={() => handleDemoLogin(acc.phone, acc.dashboardPath)}
                className="w-full py-2 px-3 rounded-xl bg-neutral-100 hover:bg-[#0071E3] hover:text-white dark:bg-neutral-800 dark:hover:bg-[#0071E3] text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 group-hover:bg-[#0071E3] group-hover:text-white"
              >
                <span>Login as {acc.roleLabel}</span>
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
