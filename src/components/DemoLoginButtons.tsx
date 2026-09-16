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
} from "lucide-react";

export default function DemoLoginButtons() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [loadingPhone, setLoadingPhone] = useState<string | null>(null);
  const [selectedHub, setSelectedHub] = useState<string>("all");

  const demoAccounts = [
    // Super Admin
    {
      role: "super_admin",
      district: "Global",
      title: t.nav.superAdminCenter,
      name: "Officer Rajeshwar Rao (State HQ)",
      phone: "9876543200",
      icon: Sliders,
      dashboardPath: "/superadmin/dashboard",
      accent: "text-[#53bdeb] font-extrabold",
      badge: "State HQ Telemetry & Governance",
      isSpecial: true,
    },
    // Authorities
    {
      role: "authority",
      district: "Rampur",
      title: `${t.authority.badge} (Rampur)`,
      name: "Officer Suresh Verma (UP)",
      phone: "9876543213",
      icon: ShieldCheck,
      dashboardPath: "/authority/dashboard",
      accent: "text-[#262626] font-bold",
      badge: "Rampur Command Center & Verification",
    },
    {
      role: "authority",
      district: "Mandya",
      title: `${t.authority.badge} (Mandya)`,
      name: "Officer Mallikarjun Patil (KA)",
      phone: "9876543224",
      icon: ShieldCheck,
      dashboardPath: "/authority/dashboard",
      accent: "text-[#262626] font-bold",
      badge: "Mandya Command Center & Verification",
    },
    // Workers
    {
      role: "worker",
      district: "Rampur",
      title: `${t.worker.badge} (Electrician)`,
      name: "Sunil Electrician (Verified)",
      phone: "9876543211",
      icon: UserCheck,
      dashboardPath: "/worker/dashboard",
      accent: "text-[#707070] font-semibold",
      badge: "Assigned Tasks & On-Site Updates",
    },
    {
      role: "worker",
      district: "Mandya",
      title: `${t.worker.badge} (Irrigation Mason)`,
      name: "Devraj Mason (Verified)",
      phone: "9876543216",
      icon: UserCheck,
      dashboardPath: "/worker/dashboard",
      accent: "text-[#707070] font-semibold",
      badge: "Farming & Canal Labor Dispatch",
    },
    // Volunteers
    {
      role: "volunteer",
      district: "Rampur",
      title: `${t.volunteer.badge} (Rural Care)`,
      name: "Pooja Volunteer (Verified)",
      phone: "9876543212",
      icon: HeartHandshake,
      dashboardPath: "/volunteer/dashboard",
      accent: "text-[#707070] font-semibold",
      badge: "Emergency Triage & Community Pool",
    },
    {
      role: "volunteer",
      district: "Shivamogga",
      title: `${t.volunteer.badge} (Red Cross)`,
      name: "Sowmya Red Cross (Verified)",
      phone: "9876543223",
      icon: HeartHandshake,
      dashboardPath: "/volunteer/dashboard",
      accent: "text-[#707070] font-semibold",
      badge: "Medical & Trauma Assistance Pool",
    },
    // Citizens
    {
      role: "citizen",
      district: "Rampur",
      title: `${t.citizen.portalBadge} (Rampur)`,
      name: "Ramesh Sharma (Farmer)",
      phone: "9876543210",
      icon: User,
      dashboardPath: "/citizen/dashboard",
      accent: "text-[#707070] font-semibold",
      badge: "Submit & Track Village Issues",
    },
    {
      role: "citizen",
      district: "Mandya",
      title: `${t.citizen.portalBadge} (Mandya)`,
      name: "Basavaraj Gowda (Sugarcane)",
      phone: "9876543230",
      icon: User,
      dashboardPath: "/citizen/dashboard",
      accent: "text-[#707070] font-semibold",
      badge: "Submit & Track Irrigation Issues",
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#25D366]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#262626]">
            {t.landing.demoLauncherTitle}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-[#707070] font-medium">{t.common.location}:</span>
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="px-2 py-0.5 rounded-lg border border-[#dcdcdc] bg-white text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">All Hubs (Global)</option>
            <option value="Rampur">Rampur Hub (UP)</option>
            <option value="Mandya">Mandya Hub (KA)</option>
            <option value="Shivamogga">Shivamogga Hub (KA)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredAccounts.map((acc) => {
          const Icon = acc.icon;
          const isLoading = loadingPhone === acc.phone;

          return (
            <button
              key={acc.phone}
              type="button"
              disabled={loadingPhone !== null}
              onClick={() => handleDemoLogin(acc.phone, acc.dashboardPath)}
              className={`flex items-center gap-3 p-3 text-left rounded-2xl border transition-all duration-150 ${
                acc.isSpecial
                  ? "bg-[#1f2937] text-white border-[#374151] hover:border-[#53bdeb] shadow-xs"
                  : "bg-white hover:bg-[#fafafa] border-[#dcdcdc] hover:border-[#a6a6a6] text-[#262626] shadow-2xs"
              } ${loadingPhone !== null ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"}`}
            >
              <div
                className={`p-2 rounded-xl border shrink-0 ${
                  acc.isSpecial
                    ? "bg-[#111827] text-[#53bdeb] border-[#374151]"
                    : "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc]"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-current" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold truncate text-current block">{acc.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
