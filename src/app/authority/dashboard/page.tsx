"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import WeatherWidget from "@/components/WeatherWidget";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import { useLanguage } from "@/lib/i18n/context";
import {
  Shield,
  ShieldCheck,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Users,
  Search,
  X,
  Send,
  Eye,
  AlertTriangle,
  UserCheck,
  UserX,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  Trash2,
  Package,
  Wrench,
  DollarSign,
  AlertCircle,
  Check,
  MapPin,
  ClipboardCheck,
  Building2,
  LayoutGrid,
  List,
  ChevronRight,
} from "lucide-react";
import SOSScreenPopup from "@/components/SOSScreenPopup";
import { useEmergencyAlerts } from "@/hooks/useEmergencyAlerts";

export default function AuthorityDashboard() {
  const { t } = useLanguage();
  const { currentAlert, dismissAlert, acceptAlert } = useEmergencyAlerts();
  const [stats, setStats] = useState<any>({
    total: 0,
    open: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    verifiedWorkers: 0,
    verifiedVolunteers: 0,
  });

  const [activeMainTab, setActiveMainTab] = useState<
    "requests" | "personnel" | "hotspots" | "pds" | "assets" | "funds" | "ward"
  >("requests");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [requests, setRequests] = useState<any[]>([]);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Manual Assignment Modal
  const [assigningReq, setAssigningReq] = useState<any | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Verification Toggle State
  const [togglingVerifyId, setTogglingVerifyId] = useState<string | null>(null);

  // Phase 2 Assets State
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetViewMode, setAssetViewMode] = useState<"cards" | "table">("cards");

  // Phase 2 Funds State
  const [funds, setFunds] = useState<any[]>([]);
  const [fundSummary, setFundSummary] = useState<any>({});
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [flaggingFundId, setFlaggingFundId] = useState<string | null>(null);
  const [discrepancyText, setDiscrepancyText] = useState("");

  // Clean Community Hotspot Dispatch State
  const [dispatchedHotspots, setDispatchedHotspots] = useState<Record<string, boolean>>({});

  const fetchAuthorityData = async () => {
    try {
      const [statsRes, reqsRes, assigneesRes] = await Promise.all([
        fetch("/api/authority/stats"),
        fetch(`/api/requests?status=${statusFilter}&category=${categoryFilter}`),
        fetch("/api/authority/assignees"),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (reqsRes.ok) {
        const d = await reqsRes.json();
        setRequests(d.requests || []);
      }
      if (assigneesRes.ok) {
        const d = await assigneesRes.json();
        setAssignees(d.assignees || []);
      }
    } catch (err) {
      console.error("Authority data fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoadingAssets(true);
      const res = await fetch("/api/modules/assets");
      const d = await res.json();
      if (res.ok) setAssets(d.assets || []);
    } catch (err) {
      console.error("Assets fetch error:", err);
    } finally {
      setLoadingAssets(false);
    }
  };

  const fetchFunds = async () => {
    try {
      setLoadingFunds(true);
      const res = await fetch("/api/modules/funds");
      const d = await res.json();
      if (res.ok) {
        setFunds(d.funds || []);
        setFundSummary(d.summary || {});
      }
    } catch (err) {
      console.error("Funds fetch error:", err);
    } finally {
      setLoadingFunds(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAuthorityData();
  }, [statusFilter, categoryFilter]);

  // Live-Refresh Polling (every 6 seconds for real-time queue awareness)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAuthorityData();
      if (activeMainTab === "funds") fetchFunds();
      if (activeMainTab === "assets") fetchAssets();
    }, 6000);

    return () => clearInterval(interval);
  }, [statusFilter, categoryFilter, activeMainTab]);

  const handleManualAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningReq || !selectedAssigneeId) return;

    try {
      setSubmittingAssign(true);
      const res = await fetch(`/api/requests/${assigningReq.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigneeId: selectedAssigneeId,
          note: assignmentNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to assign request");
        return;
      }

      setAssigningReq(null);
      setSelectedAssigneeId("");
      setAssignmentNote("");
      fetchAuthorityData();
    } catch (err) {
      console.error("Assign error:", err);
      alert("Network error during assignment.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleToggleVerification = async (userId: string, role: string, currentVerified: boolean) => {
    try {
      setTogglingVerifyId(userId);
      const res = await fetch("/api/authority/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role,
          verified: !currentVerified,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed to update verification status");
        return;
      }

      fetchAuthorityData();
    } catch (err) {
      console.error("Toggle verification error:", err);
    } finally {
      setTogglingVerifyId(null);
    }
  };

  const handleFlagFund = async (fundId: string) => {
    if (!discrepancyText.trim()) return;
    try {
      const res = await fetch("/api/modules/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: fundId,
          flagDiscrepancy: true,
          discrepancyNote: discrepancyText,
        }),
      });
      if (res.ok) {
        setFlaggingFundId(null);
        setDiscrepancyText("");
        fetchFunds();
      }
    } catch (err) {
      console.error("Fund flag error:", err);
    }
  };

  const handleDispatchCleanCrew = (hotspotId: string) => {
    setDispatchedHotspots((prev) => ({ ...prev, [hotspotId]: true }));
  };

  // Helper to map assets to photos
  const getAssetImage = (ast: any) => {
    const cat = (ast.category || "").toLowerCase();
    const name = (ast.name || "").toLowerCase();
    if (cat.includes("water") || name.includes("borewell") || name.includes("tank")) return "/images/assets/borewell.jpg";
    if (cat.includes("light") || name.includes("light") || name.includes("lamp") || name.includes("pole")) return "/images/assets/streetlight.jpg";
    if (cat.includes("health") || name.includes("clinic") || name.includes("hospital") || name.includes("medical")) return "/images/assets/clinic.jpg";
    if (cat.includes("educat") || name.includes("school")) return "/images/assets/school.jpg";
    if (cat.includes("sanitat") || name.includes("drain") || name.includes("waste")) return "/images/assets/drainage.jpg";
    return "/images/assets/rationshop.jpg";
  };

  // Sanitation Hotspot Clusters Mock / Calculation (Module 3.9)
  const sanitationHotspots = [
    {
      id: "HOTSPOT-01",
      name: "Rampur Market Drainage Blockage & Overflow",
      location: "Main Vegetable Mandi, Ward 4",
      proximityMeters: "180m cluster",
      complaintsCount: 4,
      severity: "High Hazard",
      lastReported: "32 mins ago",
      assignedTo: "Sanitation Rapid Unit #2",
    },
    {
      id: "HOTSPOT-02",
      name: "Uncollected Solid Waste Dump near Primary School",
      location: "East Culvert Junction, Ward 2",
      proximityMeters: "240m cluster",
      complaintsCount: 3,
      severity: "Moderate",
      lastReported: "2 hours ago",
      assignedTo: null,
    },
    {
      id: "HOTSPOT-03",
      name: "Stagnant Water & Dengue Vector Hazard",
      location: "Panchayat Bhavan Pond Environs",
      proximityMeters: "120m cluster",
      complaintsCount: 5,
      severity: "Critical",
      lastReported: "15 mins ago",
      assignedTo: "Vector Control Team",
    },
  ];

  // PDS Fair Price Shop metrics (Module 3.3)
  const pdsShops = [
    {
      code: "FPS-1042",
      dealerName: "Mahesh Chandra",
      location: "Rampur Central Ward 4",
      quotaMetric: "92% Allocated (184 / 200 Quintals Wheat)",
      stockStatus: "Adequate",
      biometricStatus: "Online (Iris + POS Active)",
      openGrievances: 1,
    },
    {
      code: "FPS-1043",
      dealerName: "Smt. Shanti Devi",
      location: "Rampur North Sector 2",
      quotaMetric: "78% Allocated (156 / 200 Quintals Wheat)",
      stockStatus: "Needs Restock",
      biometricStatus: "Online",
      openGrievances: 0,
    },
    {
      code: "FPS-2081",
      dealerName: "Shivanna Gowda",
      location: "Mandya Taluk Center",
      quotaMetric: "98% Allocated (490 / 500 Quintals Rice)",
      stockStatus: "Adequate",
      biometricStatus: "Online",
      openGrievances: 2,
    },
  ];

  const filteredRequests = requests.filter((req) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (req.description && req.description.toLowerCase().includes(q)) ||
      (req.id && req.id.toLowerCase().includes(q)) ||
      (req.location && req.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Multi-Lingual Dashboard Switcher */}
      <DashboardLanguageBanner />

      {/* Real-time Emergency Push Alerts Registration */}
      <PushNotificationPrompt role="authority" district="Rampur" />

      {/* SAMPLE 2: Photographic Hero Band */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950">
        <Image
          src="/images/heroes/authority-hero.jpg"
          alt="Panchayat & Civic Command"
          fill
          priority
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/60 font-mono">
                {t.authority?.badge || "Local Authority"}
              </span>
              <span className="text-[11px] text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 px-2.5 py-0.5 rounded-full font-semibold">
                Officer Suresh Verma • Rampur District
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Panchayat Command Center &amp; Civic Governance
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Real-time incident dispatch, worker verification gate, sanitation hotspot detection, and development fund monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-semibold shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Queue (6s)</span>
            </div>

            <button
              onClick={() => {
                setRefreshing(true);
                fetchAuthorityData();
              }}
              disabled={refreshing}
              className="p-3 rounded-2xl border border-neutral-700 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 transition-colors shadow-lg cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SAMPLE 1: Stat Callout Grid (Circular Badges + Oversized Numbers + Short Labels) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Incident Load */}
        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl shadow-lg flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shadow-inner mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black font-mono tracking-tight text-white">{stats.total}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mt-1">Total Incident Load</span>
        </div>

        {/* Open / Unassigned */}
        <div className="bg-neutral-900/90 border border-amber-900/40 p-5 rounded-2xl shadow-lg flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-inner mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black font-mono tracking-tight text-amber-400">{stats.open}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 mt-1">Open / Unassigned</span>
        </div>

        {/* Verified Workers */}
        <div className="bg-neutral-900/90 border border-emerald-900/40 p-5 rounded-2xl shadow-lg flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-inner mb-3">
            <UserCheck className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black font-mono tracking-tight text-emerald-400">{stats.verifiedWorkers}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/80 mt-1">Verified Workers</span>
        </div>

        {/* Verified Volunteers */}
        <div className="bg-neutral-900/90 border border-purple-900/40 p-5 rounded-2xl shadow-lg flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-purple-950/70 border border-purple-800/60 flex items-center justify-center text-purple-400 shadow-inner mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black font-mono tracking-tight text-purple-400">{stats.verifiedVolunteers}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400/80 mt-1">Verified Volunteers</span>
        </div>
      </div>

      {/* SAMPLE 2: Dark Contrasting 4-Tile Module Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PDS Fair Price Shop */}
        <button
          onClick={() => setActiveMainTab("pds")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group relative flex flex-col justify-between ${
            activeMainTab === "pds"
              ? "bg-neutral-900 border-sky-500 shadow-lg shadow-sky-950/40 ring-1 ring-sky-500/50"
              : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/70"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded">
              3 Shops Live
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">PDS Fair Price Shop</h3>
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">Grain quotas & biometric POS device uptime</p>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-bold text-sky-400">
            <span>Inspect Inventory</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Clean Community Hotspots */}
        <button
          onClick={() => setActiveMainTab("hotspots")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group relative flex flex-col justify-between ${
            activeMainTab === "hotspots"
              ? "bg-neutral-900 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50"
              : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/70"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
              300m Clusters
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Clean Community</h3>
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">3 active sanitation clusters aggregated</p>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-bold text-emerald-400">
            <span>Dispatch Crew</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Public Asset Watch */}
        <button
          onClick={() => {
            setActiveMainTab("assets");
            fetchAssets();
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group relative flex flex-col justify-between ${
            activeMainTab === "assets"
              ? "bg-neutral-900 border-blue-500 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/50"
              : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/70"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded">
              Photo Audit
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Public Asset Watch</h3>
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">Borewells, streetlights, clinics, schools</p>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-bold text-blue-400">
            <span>Inspect Assets</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Development Funds */}
        <button
          onClick={() => {
            setActiveMainTab("funds");
            fetchFunds();
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group relative flex flex-col justify-between ${
            activeMainTab === "funds"
              ? "bg-neutral-900 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50"
              : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/70"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">
              Gram Panchayat
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Development Funds</h3>
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">Spending vs physical progress auditing</p>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-bold text-amber-400">
            <span>Audit Funds</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveMainTab("requests")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "requests"
              ? "bg-amber-500 text-black shadow-md shadow-amber-950 font-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          Incident Queue &amp; Dispatch ({stats.open} Open)
        </button>

        <button
          onClick={() => setActiveMainTab("personnel")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "personnel"
              ? "bg-amber-500 text-black shadow-md shadow-amber-950 font-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Personnel Verification Gate
        </button>

        <button
          onClick={() => setActiveMainTab("hotspots")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "hotspots"
              ? "bg-amber-500 text-black shadow-md shadow-amber-950 font-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Trash2 className="w-4 h-4 text-emerald-400" />
          Clean Community Hotspots (300m)
        </button>

        <button
          onClick={() => setActiveMainTab("pds")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "pds"
              ? "bg-amber-500 text-black shadow-md shadow-amber-950 font-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Package className="w-4 h-4 text-sky-400" />
          PDS Ration Stock
        </button>

        <button
          onClick={() => {
            setActiveMainTab("assets");
            fetchAssets();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "assets"
              ? "bg-amber-500 text-black shadow-md shadow-amber-950 font-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Wrench className="w-4 h-4 text-blue-400" />
          Public Asset Watch
        </button>

        <button
          onClick={() => {
            setActiveMainTab("funds");
            fetchFunds();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "funds"
              ? "bg-amber-500 text-black shadow-md shadow-amber-950 font-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Development Fund Tracker
        </button>

        <button
          onClick={() => setActiveMainTab("ward")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "ward"
              ? "bg-amber-500 text-black shadow-md shadow-amber-950 font-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-400" />
          Ward Member Sub-Panel
        </button>
      </div>

      {/* ================= TAB 1: INCIDENT QUEUE & DISPATCH ================= */}
      {activeMainTab === "requests" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {["all", "open", "assigned", "in_progress", "resolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === status
                      ? "bg-amber-500 text-black shadow-sm font-bold"
                      : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by description or ID..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Incident Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="px-4 py-3.5">Ticket / Subject</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Assigned To</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white truncate max-w-xs">{req.description}</div>
                        <div className="text-[10px] font-mono text-neutral-500 mt-0.5">ID: {req.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <CategoryBadge category={req.category} />
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        {req.assignedTo ? (
                          <span className="font-semibold text-white">{req.assignedTo.name}</span>
                        ) : (
                          <span className="text-amber-400 font-semibold italic text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400 truncate max-w-[140px]">
                        {req.location}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setAssigningReq(req)}
                          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Manual Dispatch
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-neutral-500 text-xs">
                        No incident tickets found matching the filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PERSONNEL VERIFICATION ================= */}
      {activeMainTab === "personnel" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Field Personnel Verification &amp; Security Gate
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Unverified personnel are excluded from the automated deterministic GIS routing engine.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-[10px] uppercase font-mono tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3.5">Name / Phone</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">District / Station</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {assignees.map((a) => {
                  const isVerified = a.workerProfile?.verified ?? a.volunteerProfile?.verified ?? true;
                  return (
                    <tr key={a.id} className="hover:bg-neutral-800/40">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{a.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{a.phone}</div>
                      </td>
                      <td className="px-4 py-3.5 capitalize font-medium text-neutral-300">
                        {a.role}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-300">
                        {a.district || "Rampur"}
                      </td>
                      <td className="px-4 py-3.5">
                        {isVerified ? (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified Active
                          </span>
                        ) : (
                          <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Gated / Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          disabled={togglingVerifyId === a.id}
                          onClick={() => handleToggleVerification(a.id, a.role, isVerified)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            isVerified
                              ? "bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-800/60"
                              : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60"
                          }`}
                        >
                          {togglingVerifyId === a.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isVerified ? (
                            "Revoke Verification"
                          ) : (
                            "Verify & Authorize"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CLEAN COMMUNITY HOTSPOTS (Module 3.9) ================= */}
      {activeMainTab === "hotspots" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-emerald-400" />
                Clean Community Proximity Clusters (300m Radius)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Sanitation and waste complaints filed within a 300-meter radius are automatically aggregated into prioritized sanitation hotspots.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sanitationHotspots.map((hs) => {
              const isDispatched = dispatchedHotspots[hs.id];
              return (
                <div
                  key={hs.id}
                  className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {hs.id} • {hs.proximityMeters}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          hs.severity === "Critical"
                            ? "bg-red-950 text-red-400 border border-red-800"
                            : hs.severity === "High Hazard"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : "bg-sky-950 text-sky-400 border border-sky-800"
                        }`}
                      >
                        {hs.severity}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{hs.name}</h3>
                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {hs.location}
                    </p>

                    <div className="p-2.5 bg-neutral-950 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Aggregated Reports:</span>
                        <span className="font-bold text-white">{hs.complaintsCount} Citizen Photos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Assigned Team:</span>
                        <span className="font-bold text-sky-400">{hs.assignedTo || "None (Awaiting Team)"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex justify-end">
                    {isDispatched ? (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Clean-up Crew Dispatched
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDispatchCleanCrew(hs.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        Dispatch Sanitation Crew
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: PDS / RATION MONITORING (Module 3.3) ================= */}
      {activeMainTab === "pds" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-400" />
                Fair Price Shop (FPS) Grain Stock &amp; Distribution Watch
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Monitors monthly grain quotas, biometric POS device uptime, and grievance rates for subsidized ration delivery.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pdsShops.map((fps, fIdx) => (
              <div key={fIdx} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    {fps.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      fps.stockStatus === "Adequate"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}
                  >
                    {fps.stockStatus}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{fps.dealerName}</h4>
                  <p className="text-xs text-neutral-400">{fps.location}</p>
                </div>

                <div className="p-2.5 bg-neutral-950 rounded-xl space-y-1 text-xs">
                  <p className="text-neutral-300 font-semibold">{fps.quotaMetric}</p>
                  <p className="text-emerald-400 text-[11px]">{fps.biometricStatus}</p>
                  <p className="text-amber-400 text-[11px]">
                    {fps.openGrievances > 0 ? `${fps.openGrievances} Pending Weighing Grievances` : "Zero Grievances"}
                  </p>
                </div>

                <button className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded-xl border border-neutral-700 transition-colors cursor-pointer">
                  Log Surprise FPS Inspection
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: PUBLIC ASSET WATCH (Module 3.5) ================= */}
      {/* SAMPLE 2: Photo-Icon Overlay Cards */}
      {activeMainTab === "assets" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                Public Physical Asset Watch &amp; Inspection Audit
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Visual health status of borewells, streetlights, primary clinics, schools, and sanitation culverts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-neutral-950 p-1 rounded-xl border border-neutral-800 flex items-center gap-1">
                <button
                  onClick={() => setAssetViewMode("cards")}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    assetViewMode === "cards" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title="Card view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAssetViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    assetViewMode === "table" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/inspect"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-colors"
              >
                <span>Field Camera Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {loadingAssets ? (
            <div className="p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-xs">Loading civic infrastructure assets...</span>
            </div>
          ) : assetViewMode === "cards" ? (
            /* SAMPLE 2: Photo-Icon Overlay Card Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {assets.map((ast) => {
                const isGood = ast.condition === "good";
                const isRepair = ast.condition === "needs_repair";
                return (
                  <div
                    key={ast.id}
                    className="group relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 hover:border-neutral-700 transition-all shadow-xl flex flex-col justify-between"
                  >
                    {/* Photographic Cover with Overlays */}
                    <div className="relative h-44 w-full overflow-hidden bg-neutral-950">
                      <Image
                        src={getAssetImage(ast)}
                        alt={ast.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/60" />

                      {/* Top-Left Category & Code Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                          {ast.id}
                        </span>
                      </div>

                      {/* Top-Right Dual-Encoded Condition Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 border shadow-md ${
                            isGood
                              ? "bg-emerald-950/90 text-emerald-300 border-emerald-700/80"
                              : isRepair
                              ? "bg-amber-950/90 text-amber-300 border-amber-700/80"
                              : "bg-red-950/90 text-red-300 border-red-700/80"
                          }`}
                        >
                          {isGood ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>✓ Good</span>
                            </>
                          ) : isRepair ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>⚠ Needs Repair</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-red-400" />
                              <span>✕ Critical</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Bottom Image Overlay Title */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-sm font-bold text-white drop-shadow-sm line-clamp-1">{ast.name}</h3>
                        <span className="text-[10px] font-medium text-neutral-300 uppercase tracking-wider">
                          {ast.category ? ast.category.replace("_", " ") : "Infrastructure"}
                        </span>
                      </div>
                    </div>

                    {/* Card Body & Location */}
                    <div className="p-4 space-y-3">
                      <div className="text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span className="truncate">{ast.department || "Panchayat Engineering"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span className="truncate">{ast.location}, {ast.district}</span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-400">
                          Lat: {ast.latitude?.toFixed?.(2) || "28.61"}
                        </span>
                        <Link
                          href="/inspect"
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Verify Condition</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              {assets.length === 0 && (
                <div className="col-span-3 p-8 text-center text-neutral-500 text-xs">
                  No public assets recorded. Click field camera mode to inspect.
                </div>
              )}
            </div>
          ) : (
            /* Table View Mode Fallback */
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-3.5">Asset Code / Name</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Department</th>
                      <th className="px-4 py-3.5">Condition</th>
                      <th className="px-4 py-3.5">Location</th>
                      <th className="px-4 py-3.5 text-right">QR / Direct Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {assets.map((ast) => (
                      <tr key={ast.id} className="hover:bg-neutral-800/40">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{ast.name}</div>
                          <div className="font-mono text-[10px] text-sky-400">{ast.id}</div>
                        </td>
                        <td className="px-4 py-3.5 capitalize text-neutral-300">
                          {ast.category ? ast.category.replace("_", " ") : "-"}
                        </td>
                        <td className="px-4 py-3.5 text-neutral-300">
                          {ast.department}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ast.condition === "good"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : ast.condition === "needs_repair"
                                ? "bg-amber-950 text-amber-400 border border-amber-800"
                                : "bg-red-950 text-red-400 border border-red-800"
                            }`}
                          >
                            {ast.condition ? ast.condition.replace("_", " ") : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-400">
                          {ast.location}, {ast.district}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href="/inspect"
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold"
                          >
                            Verify Condition
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: DEVELOPMENT FUNDS (Module 3.8) ================= */}
      {activeMainTab === "funds" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Village Development Fund &amp; Expenditure Transparency
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Comparing allocated grant budgets against verified physical completion rates. Flag discrepancies if spending exceeds progress.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {funds.map((f) => (
              <div
                key={f.id}
                className={`bg-neutral-900 border rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-3 ${
                  f.isDiscrepancyFlagged ? "border-red-800/80 bg-red-950/10" : "border-neutral-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {f.projectCode}
                    </span>
                    {f.isDiscrepancyFlagged && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Discrepancy Flagged
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2">{f.projectName}</h3>
                  <p className="text-xs text-neutral-400">{f.department} • {f.district}</p>

                  <div className="mt-3 p-2.5 bg-neutral-950 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Allocated Budget:</span>
                      <span className="font-bold text-white font-mono">₹{f.allocatedAmount?.toLocaleString?.("en-IN") || f.allocatedAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Total Spent:</span>
                      <span className="font-bold text-amber-400 font-mono">₹{f.spentAmount?.toLocaleString?.("en-IN") || f.spentAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Physical Progress:</span>
                      <span className="font-bold text-sky-400 font-mono">{f.completionPercent}% Complete</span>
                    </div>
                  </div>

                  {f.isDiscrepancyFlagged && f.discrepancyNote && (
                    <div className="mt-2 p-2 bg-red-950/40 rounded-lg border border-red-900/50 text-[11px] text-red-300">
                      <strong>Audit Note:</strong> {f.discrepancyNote}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-800 flex justify-end">
                  {flaggingFundId === f.id ? (
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        value={discrepancyText}
                        onChange={(e) => setDiscrepancyText(e.target.value)}
                        placeholder="Enter reason (e.g. 70% budget spent but only 40% physical road built)"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setFlaggingFundId(null)}
                          className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleFlagFund(f.id)}
                          className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                        >
                          Submit Flag
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFlaggingFundId(f.id)}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg border border-neutral-700 cursor-pointer"
                    >
                      Audit / Flag Discrepancy
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 7: WARD MEMBER SUB-PANEL (Module 3.14) ================= */}
      {activeMainTab === "ward" && (
        <div className="bg-neutral-900 border border-indigo-950/60 p-6 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800/60 font-mono">
                  Ward 4 Local Oversight
                </span>
                <span className="text-[11px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                  Rajesh Kumar (Ward Member)
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-2">
                Ward Member Scoped Action Center (Non-PII Privacy Enforced)
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Ward members can track tickets strictly within their geographic jurisdiction without exposing citizen personal contact numbers or names.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-indigo-400 uppercase">Ward 4 Active Complaints</span>
              <p className="text-2xl font-black text-white mt-1 font-mono">3 Issues</p>
              <p className="text-[11px] text-neutral-400 mt-1">Drainage, Streetlight pole #14, Ration quota</p>
            </div>
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Resolved This Month</span>
              <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">8 Issues</p>
              <p className="text-[11px] text-neutral-400 mt-1">Average resolution time: 28 hours</p>
            </div>
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Sanitation Hotspot In Ward</span>
              <p className="text-2xl font-black text-amber-400 mt-1 font-mono">1 Active</p>
              <p className="text-[11px] text-neutral-400 mt-1">Vegetable Mandi drainage cluster</p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assignment Modal */}
      {assigningReq && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Manual Field Dispatch</h3>
              <button
                onClick={() => setAssigningReq(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 line-clamp-2">
              Dispatching: <span className="text-white font-medium">{assigningReq.description}</span>
            </p>

            <form onSubmit={handleManualAssign} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Select Field Worker or Volunteer
                </label>
                <select
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">-- Choose verified personnel --</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role}) - {a.district || "Rampur"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Dispatch Instructions (Optional)
                </label>
                <textarea
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  rows={2}
                  placeholder="Special instructions or required equipment..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningReq(null)}
                  className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign || !selectedAssigneeId}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {submittingAssign ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Dispatch Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-Time Critical SOS Screen Alert for Authority */}
      <SOSScreenPopup alert={currentAlert} onDismiss={dismissAlert} onAccept={acceptAlert} />
    </div>
  );
}
