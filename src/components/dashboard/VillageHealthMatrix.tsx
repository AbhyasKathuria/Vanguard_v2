"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Zap,
  Truck,
  GraduationCap,
  HeartPulse,
  Trash2,
  Wheat,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";

export interface CivicPillarStatus {
  name: string;
  icon: string;
  score: number; // 0 - 100
  status: "healthy" | "degraded" | "critical";
  openIssues: number;
  lastBreakdownNote?: string;
}

export interface VillageHealthScore {
  id: string;
  village: string;
  panchayat: string;
  block: string;
  district: string;
  overallScore: number;
  status: "healthy" | "degraded" | "critical";
  activeBreakdowns: number;
  lastInspectionDate: string;
  pillars: Record<string, CivicPillarStatus>;
}

const DEFAULT_VILLAGES: VillageHealthScore[] = [
  {
    id: "v_dhamora",
    village: "Dhamora",
    panchayat: "Dhamora GP",
    block: "Milak",
    district: "Rampur",
    overallScore: 68,
    status: "degraded",
    activeBreakdowns: 2,
    lastInspectionDate: "2026-09-12",
    pillars: {
      water: {
        name: "Drinking Water",
        icon: "💧",
        score: 42,
        status: "critical",
        openIssues: 3,
        lastBreakdownNote: "Primary borewell pump coil burnout",
      },
      electricity: {
        name: "Electricity Grid",
        icon: "⚡",
        score: 85,
        status: "healthy",
        openIssues: 0,
      },
      roads: {
        name: "Roads & Culverts",
        icon: "🛣️",
        score: 72,
        status: "degraded",
        openIssues: 1,
        lastBreakdownNote: "Monsoon erosion near culvert",
      },
      school: {
        name: "School & Anganwadi",
        icon: "🏫",
        score: 90,
        status: "healthy",
        openIssues: 0,
      },
      health: {
        name: "PHC / Health Post",
        icon: "🏥",
        score: 65,
        status: "degraded",
        openIssues: 1,
        lastBreakdownNote: "Shortage of test strips",
      },
      sanitation: {
        name: "Sanitation & Drains",
        icon: "🧹",
        score: 80,
        status: "healthy",
        openIssues: 0,
      },
      agriculture: {
        name: "Irrigation Canal",
        icon: "🌾",
        score: 88,
        status: "healthy",
        openIssues: 0,
      },
    },
  },
  {
    id: "v_saifni",
    village: "Saifni",
    panchayat: "Saifni GP",
    block: "Shahabad",
    district: "Rampur",
    overallScore: 48,
    status: "critical",
    activeBreakdowns: 3,
    lastInspectionDate: "2026-09-14",
    pillars: {
      water: {
        name: "Drinking Water",
        icon: "💧",
        score: 75,
        status: "degraded",
        openIssues: 1,
      },
      electricity: {
        name: "Electricity Grid",
        icon: "⚡",
        score: 25,
        status: "critical",
        openIssues: 2,
        lastBreakdownNote: "11kV Wire snapped on grazing field",
      },
      roads: {
        name: "Roads & Culverts",
        icon: "🛣️",
        score: 60,
        status: "degraded",
        openIssues: 1,
      },
      school: {
        name: "School & Anganwadi",
        icon: "🏫",
        score: 82,
        status: "healthy",
        openIssues: 0,
      },
      health: {
        name: "PHC / Health Post",
        icon: "🏥",
        score: 70,
        status: "degraded",
        openIssues: 1,
      },
      sanitation: {
        name: "Sanitation & Drains",
        icon: "🧹",
        score: 55,
        status: "degraded",
        openIssues: 1,
      },
      agriculture: {
        name: "Irrigation Canal",
        icon: "🌾",
        score: 90,
        status: "healthy",
        openIssues: 0,
      },
    },
  },
  {
    id: "v_maholi",
    village: "Maholi",
    panchayat: "Maholi Dehat GP",
    block: "Maholi",
    district: "Sitapur",
    overallScore: 78,
    status: "degraded",
    activeBreakdowns: 1,
    lastInspectionDate: "2026-09-10",
    pillars: {
      water: {
        name: "Drinking Water",
        icon: "💧",
        score: 88,
        status: "healthy",
        openIssues: 0,
      },
      electricity: {
        name: "Electricity Grid",
        icon: "⚡",
        score: 80,
        status: "healthy",
        openIssues: 0,
      },
      roads: {
        name: "Roads & Culverts",
        icon: "🛣️",
        score: 85,
        status: "healthy",
        openIssues: 0,
      },
      school: {
        name: "School & Anganwadi",
        icon: "🏫",
        score: 92,
        status: "healthy",
        openIssues: 0,
      },
      health: {
        name: "PHC / Health Post",
        icon: "🏥",
        score: 45,
        status: "critical",
        openIssues: 2,
        lastBreakdownNote: "Antivenom stock exhausted",
      },
      sanitation: {
        name: "Sanitation & Drains",
        icon: "🧹",
        score: 74,
        status: "degraded",
        openIssues: 1,
      },
      agriculture: {
        name: "Irrigation Canal",
        icon: "🌾",
        score: 82,
        status: "healthy",
        openIssues: 0,
      },
    },
  },
  {
    id: "v_besagarahalli",
    village: "Besagarahalli",
    panchayat: "Besagarahalli GP",
    block: "Maddur",
    district: "Mandya",
    overallScore: 84,
    status: "healthy",
    activeBreakdowns: 0,
    lastInspectionDate: "2026-09-15",
    pillars: {
      water: { name: "Drinking Water", icon: "💧", score: 90, status: "healthy", openIssues: 0 },
      electricity: { name: "Electricity Grid", icon: "⚡", score: 85, status: "healthy", openIssues: 0 },
      roads: { name: "Roads & Culverts", icon: "🛣️", score: 78, status: "degraded", openIssues: 1 },
      school: { name: "School & Anganwadi", icon: "🏫", score: 94, status: "healthy", openIssues: 0 },
      health: { name: "PHC / Health Post", icon: "🏥", score: 86, status: "healthy", openIssues: 0 },
      sanitation: { name: "Sanitation & Drains", icon: "🧹", score: 85, status: "healthy", openIssues: 0 },
      agriculture: { name: "Irrigation Canal", icon: "🌾", score: 92, status: "healthy", openIssues: 0 },
    },
  },
];

export default function VillageHealthMatrix() {
  const [villages, setVillages] = useState<VillageHealthScore[]>(DEFAULT_VILLAGES);
  const [selectedVillage, setSelectedVillage] = useState<VillageHealthScore>(DEFAULT_VILLAGES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic recalculation if complaints exist
  const fetchLiveScores = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        const complaints = data.complaints || [];

        // Count complaints per village and category
        const updated = DEFAULT_VILLAGES.map((v) => {
          const villageComplaints = complaints.filter(
            (c: any) =>
              c.village?.toLowerCase() === v.village.toLowerCase() ||
              c.district?.toLowerCase() === v.district.toLowerCase()
          );

          if (villageComplaints.length === 0) return v;

          let breakdownCount = 0;
          const newPillars = { ...v.pillars };

          Object.keys(newPillars).forEach((catKey) => {
            const catMatches = villageComplaints.filter((c: any) =>
              c.category.toLowerCase().includes(catKey)
            );
            if (catMatches.length > 0) {
              const penalty = Math.min(catMatches.length * 20, 60);
              const score = Math.max(100 - penalty, 20);
              const status: "healthy" | "degraded" | "critical" =
                score >= 80 ? "healthy" : score >= 50 ? "degraded" : "critical";

              if (status === "critical") breakdownCount++;

              newPillars[catKey] = {
                ...newPillars[catKey],
                score,
                status,
                openIssues: catMatches.length,
                lastBreakdownNote: catMatches[0].title,
              };
            }
          });

          const pillarValues = Object.values(newPillars);
          const avgScore = Math.round(
            pillarValues.reduce((sum, p) => sum + p.score, 0) / pillarValues.length
          );
          const status: "healthy" | "degraded" | "critical" =
            avgScore >= 80 ? "healthy" : avgScore >= 50 ? "degraded" : "critical";

          return {
            ...v,
            overallScore: avgScore,
            status,
            activeBreakdowns: breakdownCount,
            pillars: newPillars,
          };
        });

        setVillages(updated);
        setSelectedVillage(updated[0]);
      }
    } catch (err) {
      console.warn("Could not fetch complaints for score matrix:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveScores();
  }, []);

  const filteredVillages = villages.filter((v) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        v.village.toLowerCase().includes(q) ||
        v.panchayat.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedStatusFilter !== "all" && v.status !== selectedStatusFilter) {
      return false;
    }
    return true;
  });

  const getRAGBadge = (status: "healthy" | "degraded" | "critical") => {
    switch (status) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </span>
        );
      case "degraded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Degraded
          </span>
        );
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Critical Breakdown
          </span>
        );
    }
  };

  return (
    <div className="bg-[#171717] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4 sm:p-6 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              Village Civic Health Matrix (RAG Scorecard)
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Real-time multi-pillar health indicators evaluated across Gram Panchayats
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLiveScores}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
            <span>Recalculate</span>
          </button>
          <Link
            href="/inspect"
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Conduct Audit</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search village, GP, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#262626] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedStatusFilter === "all" ? "bg-white text-black" : "bg-white/5 text-neutral-300"
            }`}
          >
            All ({villages.length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter("critical")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedStatusFilter === "critical"
                ? "bg-red-600 text-white"
                : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            🔴 Critical ({villages.filter((v) => v.status === "critical").length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter("degraded")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedStatusFilter === "degraded"
                ? "bg-amber-600 text-white"
                : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            🟡 Degraded ({villages.filter((v) => v.status === "degraded").length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter("healthy")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedStatusFilter === "healthy"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            🟢 Healthy ({villages.filter((v) => v.status === "healthy").length})
          </button>
        </div>
      </div>

      {/* Main Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Village Scorecard Table */}
        <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-white/10 bg-[#1f1f1f]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#262626] text-neutral-400 uppercase tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="p-3">Gram Panchayat / Village</th>
                <th className="p-3 text-center">Health Index</th>
                <th className="p-3 text-center">RAG Status</th>
                <th className="p-3 text-center">Active Breakdowns</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVillages.map((v) => {
                const isSelected = selectedVillage.id === v.id;
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVillage(v)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-sky-500/10 border-l-4 border-sky-500"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-bold text-white">{v.village}</div>
                      <div className="text-[11px] text-neutral-400">
                        {v.panchayat} • {v.district}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div
                        className={`font-black text-sm ${
                          v.overallScore >= 80
                            ? "text-emerald-400"
                            : v.overallScore >= 50
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {v.overallScore}%
                      </div>
                    </td>
                    <td className="p-3 text-center">{getRAGBadge(v.status)}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-bold ${
                          v.activeBreakdowns > 0 ? "text-red-400" : "text-neutral-400"
                        }`}
                      >
                        {v.activeBreakdowns} Alert{v.activeBreakdowns !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-neutral-400 hover:text-white p-1">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right 1 Col: Selected Village Deep-Dive Pillar Breakdown */}
        {selectedVillage && (
          <div className="bg-[#1f1f1f] rounded-xl border border-white/10 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-black text-base text-white">{selectedVillage.village}</h3>
                  <p className="text-xs text-neutral-400">
                    {selectedVillage.panchayat} ({selectedVillage.block} Block)
                  </p>
                </div>
                {getRAGBadge(selectedVillage.status)}
              </div>

              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 mb-3 flex items-center justify-between text-xs">
                <div>
                  <div className="text-neutral-400">Overall Score:</div>
                  <div className="text-xl font-black text-white">
                    {selectedVillage.overallScore} / 100
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-400">Last Audited:</div>
                  <div className="font-mono text-neutral-300">
                    {selectedVillage.lastInspectionDate}
                  </div>
                </div>
              </div>

              {/* Pillars list */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Pillar Health Breakdown
                </div>
                {Object.entries(selectedVillage.pillars).map(([key, pillar]) => (
                  <div
                    key={key}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      pillar.status === "critical"
                        ? "bg-red-500/10 border-red-500/30"
                        : pillar.status === "degraded"
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-white/5 border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{pillar.icon}</span>
                      <div>
                        <div className="font-bold text-white">{pillar.name}</div>
                        {pillar.lastBreakdownNote && (
                          <div className="text-[10px] text-red-300 truncate max-w-[150px]">
                            ⚠️ {pillar.lastBreakdownNote}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-black ${
                          pillar.score >= 80
                            ? "text-emerald-400"
                            : pillar.score >= 50
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {pillar.score}%
                      </span>
                      {pillar.openIssues > 0 && (
                        <div className="text-[10px] text-red-400 font-bold">
                          {pillar.openIssues} issue{pillar.openIssues > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              <Link
                href={`/inspect?village=${encodeURIComponent(selectedVillage.village)}&district=${encodeURIComponent(selectedVillage.district)}`}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Audit Village</span>
              </Link>
              <Link
                href="/threat-matrix"
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span>Heatmap</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
