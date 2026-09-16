"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import WeatherWidget from "@/components/WeatherWidget";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import { useLanguage } from "@/lib/i18n/context";
import { ScamCheckResult } from "@/lib/types";
import {
  PlusCircle,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Layers,
  Search,
  Filter,
  Eye,
  Camera,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Sparkles,
  PhoneCall,
  Send,
  ExternalLink,
  ChevronRight,
  Flame,
  Wheat,
  Check,
  User,
  HeartHandshake,
} from "lucide-react";

export default function CitizenDashboard() {
  const { t } = useLanguage();
  const [activeMainTab, setActiveMainTab] = useState<"grievances" | "scam" | "schemes" | "documents" | "disaster">("grievances");

  // Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [escalatedIds, setEscalatedIds] = useState<Record<string, boolean>>({});

  // Scam Checker state
  const [scamInput, setScamInput] = useState("");
  const [checkingScam, setCheckingScam] = useState(false);
  const [scamResult, setScamResult] = useState<ScamCheckResult | null>(null);

  // Scheme Evaluator state
  const [schemeAge, setSchemeAge] = useState<number>(35);
  const [schemeIncome, setSchemeIncome] = useState<number>(120000);
  const [schemeLand, setSchemeLand] = useState<number>(1.5);
  const [schemeGender, setSchemeGender] = useState<string>("any");
  const [schemeOccupation, setSchemeOccupation] = useState<string>("farmer");
  const [evaluatingSchemes, setEvaluatingSchemes] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState<any[]>([]);
  const [potentialSchemes, setPotentialSchemes] = useState<any[]>([]);
  const [schemesLoaded, setSchemesLoaded] = useState(false);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to fetch citizen requests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleEscalateSLA = (id: string) => {
    setEscalatedIds((prev) => ({ ...prev, [id]: true }));
  };

  const handleScamCheck = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToCheck = customText || scamInput;
    if (!textToCheck.trim()) return;

    try {
      setCheckingScam(true);
      const res = await fetch("/api/modules/scam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToCheck }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScamResult(data.result);
      } else {
        alert(data.error || "Failed to scan text.");
      }
    } catch (err) {
      console.error("Scam check error:", err);
    } finally {
      setCheckingScam(false);
    }
  };

  const handleEvaluateSchemes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setEvaluatingSchemes(true);
      const res = await fetch("/api/modules/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(schemeAge),
          annualIncome: Number(schemeIncome),
          landHoldingAcres: Number(schemeLand),
          gender: schemeGender,
          occupation: schemeOccupation,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEligibleSchemes(data.eligibleSchemes || []);
        setPotentialSchemes(data.potentialSchemes || []);
        setSchemesLoaded(true);
      }
    } catch (err) {
      console.error("Scheme evaluation error:", err);
    } finally {
      setEvaluatingSchemes(false);
    }
  };

  // Compute KPI metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === "open" || r.status === "pending" || r.status === "queued"
  ).length;
  const assignedCount = requests.filter((r) => r.status === "assigned").length;
  const inProgressCount = requests.filter((r) => r.status === "in_progress").length;
  const resolvedCount = requests.filter(
    (r) => r.status === "resolved" || r.status === "closed"
  ).length;

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      searchQuery === "" ||
      req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (req.status === "open" || req.status === "pending" || req.status === "queued")) ||
      (statusFilter === "assigned" && req.status === "assigned") ||
      (statusFilter === "in_progress" && req.status === "in_progress") ||
      (statusFilter === "resolved" && (req.status === "resolved" || req.status === "closed"));

    return matchesSearch && matchesStatus;
  });

  const primaryLocation = requests[0]?.district || requests[0]?.location || "Rampur";

  // SLA Calculation Helper
  const getSlaInfo = (req: any) => {
    const isEmergency = req.category === "emergency" || req.category === "health" || req.priority === "high";
    const targetHours = isEmergency ? 4 : req.category === "civic" ? 48 : 24;
    const elapsedHours = Math.max(1, Math.floor((Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60)));
    const isBreached = (req.status !== "resolved" && req.status !== "closed") && elapsedHours > targetHours;
    return { targetHours, elapsedHours, isBreached };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1-Click Multi-Lingual Switcher */}
      <DashboardLanguageBanner />

      {/* Sample 2: Compact Photographic Hero Header Band */}
      <div className="relative h-44 sm:h-52 rounded-3xl overflow-hidden shadow-xl border border-white/10 flex items-end p-6 sm:p-7">
        <Image
          src="/images/heroes/citizen-hero.jpg"
          alt="Citizen Community Hub"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between w-full gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-800/60 font-mono">
                {t.citizen.portalBadge || "Citizen Portal"}
              </span>
              <span className="text-[10px] text-neutral-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                Rampur &amp; Connected Mandi Hubs
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t.citizen.pageTitle || "Citizen Grievances & Civic Hub"}
            </h1>
            <p className="text-xs text-neutral-300 mt-0.5 line-clamp-1">
              {t.citizen.pageDesc || "Track submitted village issues, check scheme eligibility, and verify scam messages."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchMyRequests();
              }}
              disabled={refreshing}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white transition-colors cursor-pointer"
              title="Refresh requests"
            >
              <RefreshCw className={"w-4 h-4 " + (refreshing ? "animate-spin text-sky-400" : "")} />
            </button>

            <Link
              href="/citizen/new-request"
              className="px-3.5 py-2 bg-[#0071E3] hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.raiseRequest || "File Grievance"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sample 2: Minimal Icon-Grid Row (Quick Tools) */}
      <div className="bg-white dark:bg-neutral-900/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-sm backdrop-blur-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Tool 1: Grievances & SLA */}
          <button
            onClick={() => setActiveMainTab("grievances")}
            className={"flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer group " + (
              activeMainTab === "grievances"
                ? "bg-sky-50 dark:bg-sky-950/60 text-[#0071E3] dark:text-sky-400 font-bold"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight">My Grievances</span>
          </button>

          {/* Tool 2: Scam Scanner */}
          <button
            onClick={() => setActiveMainTab("scam")}
            className={"flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer group " + (
              activeMainTab === "scam"
                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight">Scam Check</span>
          </button>

          {/* Tool 3: Scheme Finder */}
          <button
            onClick={() => {
              setActiveMainTab("schemes");
              if (!schemesLoaded) handleEvaluateSchemes();
            }}
            className={"flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer group " + (
              activeMainTab === "schemes"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight">Govt Schemes</span>
          </button>

          {/* Tool 4: Document Help */}
          <button
            onClick={() => setActiveMainTab("documents")}
            className={"flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer group " + (
              activeMainTab === "documents"
                ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight">Doc Help</span>
          </button>

          {/* Tool 5: Disaster Shelters */}
          <button
            onClick={() => setActiveMainTab("disaster")}
            className={"flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer group " + (
              activeMainTab === "disaster"
                ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight">Disaster Desk</span>
          </button>

          {/* Tool 6: Women SafeLine (Direct Hub Link) */}
          <Link
            href="/citizen/women"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight">SafeLine Hub</span>
          </Link>

          {/* Tool 7: Farmer Hub (Direct Hub Link) */}
          <Link
            href="/farmer"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              <Wheat className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight">Farmer Hub</span>
          </Link>
        </div>
      </div>

      {/* Sample 1: Stat-Callout Grid (Icon in circle + short label + oversized bold number) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Total Reports</p>
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono mt-0.5">
              {totalCount}
            </h3>
          </div>
        </div>

        {/* Stat 2: Pending */}
        <div className="bg-white dark:bg-neutral-900 border border-amber-200/80 dark:border-amber-900/40 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 shadow-2xs">
            <Hourglass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400">Pending Review</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              {pendingCount}
            </h3>
          </div>
        </div>

        {/* Stat 3: In Progress */}
        <div className="bg-white dark:bg-neutral-900 border border-sky-200/80 dark:border-sky-900/40 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0071E3] dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-[#0071E3] dark:text-sky-400">Under Dispatch</p>
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono mt-0.5">
              {assignedCount + inProgressCount}
            </h3>
          </div>
        </div>

        {/* Stat 4: Resolved */}
        <div className="bg-white dark:bg-neutral-900 border border-emerald-200/80 dark:border-emerald-900/40 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">Resolved Met SLA</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {resolvedCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Real-Time Agricultural & Civic Weather Widget */}
      <WeatherWidget location={primaryLocation} />

      {/* ================= TAB 1: GRIEVANCES & SLA DELAY TRACKER ================= */}
      {activeMainTab === "grievances" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {["all", "pending", "assigned", "in_progress", "resolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={"px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer " + (
                    statusFilter === status
                      ? "bg-[#0071E3] text-white shadow-xs"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900"
                  )}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search complaints..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 p-0.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={"px-2.5 py-1 text-xs rounded-lg font-bold transition-colors " + (
                    viewMode === "table" ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs" : "text-neutral-500"
                  )}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={"px-2.5 py-1 text-xs rounded-lg font-bold transition-colors " + (
                    viewMode === "cards" ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs" : "text-neutral-500"
                  )}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-neutral-900 p-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-neutral-400 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-[#0071E3]" />
              <span className="text-xs font-mono">Synchronizing telemetry &amp; grievances...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 p-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0071E3] flex items-center justify-center mx-auto border border-sky-100 dark:border-sky-800/40">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">No grievances matching your criteria</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
                  File a new report with photos, audio, or text to immediately dispatch local response teams.
                </p>
              </div>
              <Link
                href="/citizen/new-request"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Raise Incident Report
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : viewMode === "table" ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-4 py-3.5">Ticket / Subject</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Priority</th>
                      <th className="px-4 py-3.5">SLA Countdown</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Location</th>
                      <th className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-sans">
                    {filteredRequests.map((req) => {
                      const { targetHours, elapsedHours, isBreached } = getSlaInfo(req);
                      const isEscalated = escalatedIds[req.id];

                      return (
                        <tr key={req.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-neutral-900 dark:text-white truncate max-w-xs">{req.description}</div>
                            <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                              ID: {req.id.slice(0, 10)}...
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <CategoryBadge category={req.category} />
                          </td>
                          <td className="px-4 py-3.5">
                            <PriorityBadge priority={req.priority} />
                          </td>
                          <td className="px-4 py-3.5">
                            {req.status === "resolved" ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Met SLA ({elapsedHours}h)
                              </span>
                            ) : isBreached ? (
                              <span className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Breached (+{elapsedHours - targetHours}h)
                              </span>
                            ) : (
                              <span className="text-neutral-500 font-mono text-[11px]">
                                {elapsedHours}h / {targetHours}h max
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-4 py-3.5 text-neutral-500 truncate max-w-[140px]">
                            {req.location}
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            {isBreached && !isEscalated && (
                              <button
                                onClick={() => handleEscalateSLA(req.id)}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 text-[11px] font-bold transition-all cursor-pointer border border-red-200 dark:border-red-800"
                              >
                                Escalate
                              </button>
                            )}
                            {isEscalated && (
                              <span className="text-amber-600 dark:text-amber-400 text-[10px] font-bold">Escalated &#10003;</span>
                            )}
                            <Link
                              href={"/citizen/request/" + req.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-[#0071E3] hover:text-white dark:bg-neutral-800 dark:hover:bg-[#0071E3] text-neutral-700 dark:text-neutral-300 font-medium transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Track</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => {
                const { targetHours, elapsedHours, isBreached } = getSlaInfo(req);
                const isEscalated = escalatedIds[req.id];

                return (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CategoryBadge category={req.category} />
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={req.priority} />
                          <StatusBadge status={req.status} />
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1 leading-relaxed">
                        {req.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-neutral-500">SLA Status:</span>
                          {isBreached ? (
                            <span className="text-red-600 dark:text-red-400 font-bold">Breached ({elapsedHours}h / {targetHours}h max)</span>
                          ) : (
                            <span className="text-neutral-700 dark:text-neutral-300 font-medium">{elapsedHours}h of {targetHours}h SLA</span>
                          )}
                        </div>

                        {isBreached && !isEscalated && (
                          <button
                            onClick={() => handleEscalateSLA(req.id)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            1-Click Escalation
                          </button>
                        )}
                        {isEscalated && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">Priority Escalated &#10003;</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end">
                      <Link
                        href={"/citizen/request/" + req.id}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0071E3] hover:underline group"
                      >
                        View Status History &amp; Timeline
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: SCAM & FRAUD VERIFIER ================= */}
      {activeMainTab === "scam" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Module 3.1 Protection
              </span>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Rural Scam &amp; Phishing Verification Engine
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Paste suspicious SMS messages, WhatsApp notices, lottery claims, or disconnection threats.
              </p>
            </div>
          </div>

          {/* Quick Preset Samples */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block mb-2">
              Quick Test Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                "Dear customer, your electricity power cut tonight at 9:30 PM due to unpaid bill. Call officer immediately at 9811234567 or pay ₹499.",
                "Congratulations! Your PM-KISAN 17th installment of ₹60,000 has been approved. Scan QR code to receive in bank account.",
                "Rampur Gram Panchayat Notice: Quarterly drinking water tax receipt generated. Pay via official portal up.gov.in.",
              ].map((sample, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => {
                    setScamInput(sample);
                    handleScamCheck(undefined, sample);
                  }}
                  className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 text-left max-w-md truncate cursor-pointer transition-colors"
                >
                  &ldquo;{sample.slice(0, 48)}...&rdquo;
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => handleScamCheck(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Paste Suspicious Text, SMS, or Message Link:
              </label>
              <textarea
                rows={3}
                value={scamInput}
                onChange={(e) => setScamInput(e.target.value)}
                placeholder="e.g. Your electricity connection will be cut tonight at 9 PM. Call 9876543210 or scan QR code to avoid disruption."
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={checkingScam || !scamInput.trim()}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {checkingScam ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              <span>Verify Suspicious Message</span>
            </button>
          </form>

          {/* Scam Result Card */}
          {scamResult && (
            <div className="p-5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <span
                    className={"px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border " + (
                      scamResult.riskLevel === "High Risk"
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-300 dark:border-red-800"
                        : scamResult.riskLevel === "Suspicious"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                        : scamResult.riskLevel === "Needs Verification"
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border-sky-300 dark:border-sky-800"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                    )}
                  >
                    {scamResult.riskLevel}
                  </span>
                  <span className="text-xs text-neutral-500">
                    Calculated Risk Score: <strong className="text-neutral-900 dark:text-white font-mono">{scamResult.riskScore} / 100</strong>
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed border border-neutral-200/60 dark:border-neutral-800">
                {scamResult.hedgedSummary}
              </div>

              {scamResult.matchedIndicators.length > 0 && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1.5">
                    Matched Threat Indicators:
                  </h4>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                    {scamResult.matchedIndicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1.5">
                  Safety Recommendations:
                </h4>
                <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1 list-disc list-inside">
                  {scamResult.safetyRecommendations.map((rec, rIdx) => (
                    <li key={rIdx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-neutral-500">Suspect a financial loss?</span>
                <a
                  href="tel:1930"
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call National Cyber Helpline (1930)</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: GOVT SCHEMES ELIGIBILITY ENGINE ================= */}
      {activeMainTab === "schemes" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Module 3.2 Welfare Engine
                </span>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Personalized Scheme Eligibility Calculator
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Enter your household parameters below to cross-check central and state subsidies.
                </p>
              </div>
            </div>

            <form onSubmit={handleEvaluateSchemes} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1">Age</label>
                <input
                  type="number"
                  value={schemeAge}
                  onChange={(e) => setSchemeAge(Number(e.target.value))}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  step="10000"
                  value={schemeIncome}
                  onChange={(e) => setSchemeIncome(Number(e.target.value))}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1">Landholding (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={schemeLand}
                  onChange={(e) => setSchemeLand(Number(e.target.value))}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1">Gender</label>
                <select
                  value={schemeGender}
                  onChange={(e) => setSchemeGender(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200"
                >
                  <option value="any">Any / All</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={evaluatingSchemes}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {evaluatingSchemes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Evaluate</span>
                </button>
              </div>
            </form>
          </div>

          {/* Results Display */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Eligible Programs ({eligibleSchemes.length} Matched)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleSchemes.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-neutral-900 border border-emerald-200/80 dark:border-emerald-900/40 p-5 rounded-2xl flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                      {item.scheme.department}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-2">{item.scheme.name}</h4>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1.5 line-clamp-2">{item.scheme.benefits}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Criteria Matched &#10003;</span>
                    <a
                      href={item.scheme.applicationUrl || "https://www.india.gov.in"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-neutral-100 hover:bg-[#0071E3] hover:text-white dark:bg-neutral-800 dark:hover:bg-[#0071E3] text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <span>Apply Online</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DOCUMENT HELP & CHECKLISTS ================= */}
      {activeMainTab === "documents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              docName: "Income Certificate (Aay Praman Patra)",
              authority: "Tehsildar / Revenue Department",
              timeDays: "7-10 Working Days",
              fee: "₹20 (CSC fee)",
              checklist: [
                "Salary slip or Gram Pradhan declaration",
                "Aadhaar card copy",
                "Self-declaration affidavit of annual income",
                "Recent passport size photo",
              ],
            },
            {
              docName: "Caste Certificate (Jati Praman Patra)",
              authority: "Sub-Divisional Magistrate (SDM)",
              timeDays: "15 Working Days",
              fee: "₹20 (Nominal)",
              checklist: [
                "Proof of ancestry or 1950 residency record",
                "Aadhaar card of applicant and father",
                "Ration card copy",
                "School leaving certificate (TC) showing caste",
              ],
            },
            {
              docName: "Ration Card (NFSA Subsidy Card)",
              authority: "District Food & Civil Supplies",
              timeDays: "21 Working Days",
              fee: "Free",
              checklist: [
                "Aadhaar card of all family members",
                "LPG gas connection booklet number",
                "Electricity bill or voter ID for address proof",
                "Bank passbook of female head of family",
              ],
            },
            {
              docName: "Disability Certificate (UDID)",
              authority: "Chief Medical Officer (CMO)",
              timeDays: "Medical Board Session (Thursdays)",
              fee: "Free",
              checklist: [
                "Clinical hospital diagnosis record",
                "Aadhaar card",
                "Two full-length posture photographs",
                "Medical assessment form signed by PHC doctor",
              ],
            },
            {
              docName: "Agricultural Land Mutation (Khatauni)",
              authority: "Tehsil Registrar & Lekhpal",
              timeDays: "30-45 Days",
              fee: "Nominal stamp duty",
              checklist: [
                "Registered sale deed or inheritance certificate",
                "Updated Khatauni extract (RoR)",
                "No-objection certificate (NOC) from co-sharers",
                "Lekhpal site verification panchnama",
              ],
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                  {item.authority}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-2">{item.docName}</h3>
                <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1.5">
                  <span>&#9201; {item.timeDays}</span>
                  <span>&bull;</span>
                  <span>&#128176; {item.fee}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Mandatory Checklist:
                  </p>
                  <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1 list-disc list-inside">
                    {item.checklist.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <span className="text-xs text-[#0071E3] font-semibold cursor-pointer hover:underline">
                  Download Form Checklist PDF &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 5: DISASTER & EVACUATION SHELTERS ================= */}
      {activeMainTab === "disaster" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Module 3.10 Civil Protection
                </span>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Designated Evacuation Shelters &amp; Emergency Hubs
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Report immediately to the nearest designated civil protection facility in extreme emergencies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {[
                {
                  shelter: "Rampur Government Inter College",
                  type: "Primary Cyclone & Flood Shelter",
                  capacity: "600 Persons",
                  facilities: "Backup Generator, Water Purifier, First Aid",
                  contact: "9876543213 (Officer Suresh Verma)",
                },
                {
                  shelter: "Mandya Community Hall (Samudaya Bhavan)",
                  type: "Agrarian Drought & Storm Center",
                  capacity: "450 Persons",
                  facilities: "Cattle Fodder Stock, Solar Lighting",
                  contact: "9876543224 (Officer Patil)",
                },
                {
                  shelter: "Sitapur District Red Cross Relief Depot",
                  type: "Medical Emergency Shelter",
                  capacity: "300 Inpatients",
                  facilities: "Oxygen Cylinders, Emergency OR",
                  contact: "112 / 108",
                },
              ].map((sh, sIdx) => (
                <div key={sIdx} className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded border border-red-200 dark:border-red-800/40">
                    {sh.type}
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-1">{sh.shelter}</h4>
                  <p className="text-[11px] text-neutral-500">Capacity: {sh.capacity}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{sh.facilities}</p>
                  <p className="text-[11px] text-[#0071E3] font-mono">Contact: {sh.contact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
