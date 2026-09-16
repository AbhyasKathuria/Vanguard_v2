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
  Building2,
  Users,
  Wrench,
  KeyRound,
} from "lucide-react";

type RoleCategory = "all" | "governance" | "citizens" | "field";

export default function DemoLoginButtons() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loadingPhone, setLoadingPhone] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<RoleCategory>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  const demoAccounts = [
    // 1. Governance & Command
    {
      category: "governance",
      role: "super_admin",
      district: "Global",
      roleLabel: "Super Admin",
      title: "State Command HQ",
      name: "Officer Rajeshwar Rao",
      phone: "9876543200",
      icon: Sliders,
      dashboardPath: "/superadmin/dashboard",
      iconBg: "bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      badgeText: "State HQ Governance",
      description: "Statewide telemetry, system health, and cross-district command.",
    },
    {
      category: "governance",
      role: "super_admin",
      district: "Rampur",
      roleLabel: "Medical Command",
      title: "District Medical Command",
      name: "Dr. Arvind Swaminathan",
      phone: "9876543270",
      icon: HeartHandshake,
      dashboardPath: "/higher-official/dashboard",
      iconBg: "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      badgeText: "Medical & Blood Bank",
      description: "Trauma triage, live blood bank requisition desk, and donor alerts.",
    },
    {
      category: "governance",
      role: "authority",
      district: "Rampur",
      roleLabel: "Local Authority",
      title: "Panchayat Bhavan (Rampur)",
      name: "Officer Suresh Verma",
      phone: "9876543213",
      icon: ShieldCheck,
      dashboardPath: "/authority/dashboard",
      iconBg: "bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      badgeText: "Rampur Command",
      description: "Incident dispatch, worker verification, and sanitation hotspots.",
    },
    {
      category: "governance",
      role: "authority",
      district: "Mandya",
      roleLabel: "Local Authority",
      title: "Taluk Office (Mandya)",
      name: "Officer Mallikarjun Patil",
      phone: "9876543224",
      icon: ShieldCheck,
      dashboardPath: "/authority/dashboard",
      iconBg: "bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      badgeText: "Mandya Command",
      description: "Taluk civic administration, grievance routing, and fund tracking.",
    },
    {
      category: "governance",
      role: "authority",
      district: "Rampur",
      roleLabel: "Ward Member",
      title: "Ward 4 Committee",
      name: "Rajesh Kumar",
      phone: "9876543280",
      icon: Building2,
      dashboardPath: "/authority/dashboard",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      badgeText: "Ward 4 Scoped",
      description: "Sub-authority panel for local ward issues and sanitation monitoring.",
    },

    // 2. Citizens & Welfare Hubs
    {
      category: "citizens",
      role: "citizen",
      district: "Rampur",
      roleLabel: "Women & SafeLine",
      title: "Women & Child Protection Hub",
      name: "Sunita Devi",
      phone: "9876543260",
      icon: ShieldAlert,
      dashboardPath: "/citizen/women",
      iconBg: "bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800",
      badgeText: "Encrypted SafeLine",
      description: "Private SL- tracking tokens, discreet exit, and protection officer relay.",
    },
    {
      category: "citizens",
      role: "citizen",
      district: "Mandya",
      roleLabel: "Farmer Hub",
      title: "Sugarcane Belt (Mandya)",
      name: "Basavaraj Gowda",
      phone: "9876543230",
      icon: User,
      dashboardPath: "/farmer",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      badgeText: "Farmer Hub",
      description: "Crop distress, MSP price advisory, and irrigation labor dispatch.",
    },
    {
      category: "citizens",
      role: "citizen",
      district: "Rampur",
      roleLabel: "General Citizen",
      title: "Rampur Ward 4",
      name: "Ramesh Sharma",
      phone: "9876543210",
      icon: User,
      dashboardPath: "/citizen/dashboard",
      iconBg: "bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-300 border-teal-200 dark:border-teal-800",
      badgeText: "Grievances & Schemes",
      description: "Complaint tracking, SLA breach escalation, and scam check engine.",
    },

    // 3. Field Personnel & Volunteers
    {
      category: "field",
      role: "worker",
      district: "Rampur",
      roleLabel: "Field Worker",
      title: "Skilled Trade (Electrician)",
      name: "Sunil Electrician",
      phone: "9876543211",
      icon: Wrench,
      dashboardPath: "/worker/dashboard",
      iconBg: "bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-800",
      badgeText: "Verified Worker",
      description: "On-site job dispatch, live GPS tasks, and completion audits.",
    },
    {
      category: "field",
      role: "volunteer",
      district: "Rampur",
      roleLabel: "Volunteer",
      title: "Community Aid & Blood Pool",
      name: "Pooja Volunteer",
      phone: "9876543212",
      icon: HeartHandshake,
      dashboardPath: "/volunteer/dashboard",
      iconBg: "bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      badgeText: "Verified Volunteer",
      description: "Disaster relief, community assistance, and blood donor matching.",
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

  // Filter accounts by active category and district
  const filteredAccounts = demoAccounts.filter((acc) => {
    const matchesCategory = activeCategory === "all" || acc.category === activeCategory;
    const matchesDistrict =
      selectedDistrict === "all" || acc.district === selectedDistrict || acc.district === "Global";
    return matchesCategory && matchesDistrict;
  });

  const categories = [
    { id: "all", label: "All Personas", count: demoAccounts.length },
    {
      id: "governance",
      label: "Command & Governance",
      count: demoAccounts.filter((a) => a.category === "governance").length,
    },
    {
      id: "citizens",
      label: "Citizens & Hubs",
      count: demoAccounts.filter((a) => a.category === "citizens").length,
    },
    {
      id: "field",
      label: "Field & Volunteers",
      count: demoAccounts.filter((a) => a.category === "field").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar: Category Tabs & District Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-3 sm:p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm">
        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as RoleCategory)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#0071E3] text-white shadow-sm"
                    : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs text-neutral-500 font-medium">District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Districts (Global)</option>
            <option value="Rampur">Rampur Hub (UP)</option>
            <option value="Mandya">Mandya Hub (KA)</option>
          </select>
        </div>
      </div>

      {/* Spacious 3-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredAccounts.map((acc) => {
          const Icon = acc.icon;
          const isLoading = loadingPhone === acc.phone;

          return (
            <div
              key={acc.phone}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 group"
            >
              <div className="space-y-3">
                {/* Header Row: Icon + Role Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={
                      "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs " +
                      acc.iconBg
                    }
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                      {acc.roleLabel}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {acc.district}
                    </span>
                  </div>
                </div>

                {/* Person Name & Role Scope */}
                <div>
                  <h4 className="text-base font-extrabold text-neutral-900 dark:text-white leading-tight">
                    {acc.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#0071E3] mt-0.5">
                    {acc.title}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed min-h-[36px]">
                  {acc.description}
                </p>

                {/* Credentials reminder badge */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                  <KeyRound className="w-3 h-3 text-neutral-400" />
                  <span>{acc.phone}</span>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <span>password123</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={loadingPhone !== null}
                onClick={() => handleDemoLogin(acc.phone, acc.dashboardPath)}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-[#0071E3] dark:bg-neutral-800 dark:hover:bg-[#0071E3] text-white text-xs font-bold flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 shadow-xs group-hover:bg-[#0071E3]"
              >
                <span>Launch {acc.roleLabel}</span>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

