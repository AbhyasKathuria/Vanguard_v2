"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import WeatherWidget from "@/components/WeatherWidget";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
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
} from "lucide-react";

export default function AuthorityDashboard() {
  const { t } = useLanguage();
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Multi-Lingual Dashboard Switcher */}
      <DashboardLanguageBanner />

      {/* Authority Command Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/60 font-mono">
              {t.authority.badge || "Local Authority"}
            </span>
            <span className="text-[11px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-0.5 rounded-full font-semibold">
              Officer Suresh Verma • Rampur District
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-2">
            Panchayat Command Center &amp; Civic Governance
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time incident dispatch, worker verification gate, sanitation hotspot detection, and development fund monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchAuthorityData();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Authority KPI Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Total Incident Load</p>
            <h3 className="text-2xl font-black text-white mt-1 font-mono">{stats.total}</h3>
          </div>
          <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-amber-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium">Open / Unassigned</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1 font-mono">{stats.open}</h3>
          </div>
          <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-emerald-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-400/80 font-medium">Verified Workers</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">{stats.verifiedWorkers}</h3>
          </div>
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-purple-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-purple-400/80 font-medium">Verified Volunteers</p>
            <h3 className="text-2xl font-black text-purple-400 mt-1 font-mono">{stats.verifiedVolunteers}</h3>
          </div>
          <div className="p-3 bg-purple-950/60 border border-purple-800/60 rounded-xl text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveMainTab("requests")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "requests"
              ? "bg-amber-500 text-black shadow-md shadow-amber-950"
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
              ? "bg-amber-500 text-black shadow-md shadow-amber-950"
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
              ? "bg-amber-500 text-black shadow-md shadow-amber-950"
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
              ? "bg-amber-500 text-black shadow-md shadow-amber-950"
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
              ? "bg-amber-500 text-black shadow-md shadow-amber-950"
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
              ? "bg-amber-500 text-black shadow-md shadow-amber-950"
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
              ? "bg-amber-500 text-black shadow-md shadow-amber-950"
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

          {/* Table */}
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
                  {requests.map((req) => (
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
      {activeMainTab === "assets" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                Public Physical Asset Watch &amp; Inspection Audit
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Track status of solar borewells, culverts, streetlights, and primary health clinics.
              </p>
            </div>
            <Link
              href="/inspect"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <span>Field Inspection Camera Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

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
                        {ast.category.replace("_", " ")}
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
                          {ast.condition.replace("_", " ")}
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
                      <span className="font-bold text-white font-mono">₹{f.allocatedAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Total Spent:</span>
                      <span className="font-bold text-amber-400 font-mono">₹{f.spentAmount.toLocaleString("en-IN")}</span>
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
                          className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-lg"
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
                  className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
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
    </div>
  );
}
