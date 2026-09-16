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
} from "lucide-react";

export default function CitizenDashboard() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

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

  // Filter requests
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1-Click Multi-Lingual Dashboard Switcher */}
      <DashboardLanguageBanner />

      {/* Top Header Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-md border border-sky-800/60 font-mono">
            {t.citizen.portalBadge}
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">{t.citizen.pageTitle}</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{t.citizen.pageDesc}</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchMyRequests();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            title="Refresh requests"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
          </button>

          <Link
            href="/citizen/new-request"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {t.nav.raiseRequest}
          </Link>
        </div>
      </div>

      {/* Scannable Ragtime-Style KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Total Grievances</p>
            <h3 className="text-2xl font-black text-white mt-1 font-mono">{totalCount}</h3>
          </div>
          <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-amber-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium">Pending Review</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1 font-mono">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-400">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-sky-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-sky-400/80 font-medium">Assigned / In Progress</p>
            <h3 className="text-2xl font-black text-sky-400 mt-1 font-mono">{assignedCount + inProgressCount}</h3>
          </div>
          <div className="p-3 bg-sky-950/60 border border-sky-800/60 rounded-xl text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-emerald-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-400/80 font-medium">Resolved</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">{resolvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Real-Time Agricultural & Civic Weather Widget */}
      <WeatherWidget location={primaryLocation} />

      {/* Table / Cards Filter & Search Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {["all", "pending", "assigned", "in_progress", "resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60"
              }`}
            >
              {status.replace("_", " ")}
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
              placeholder="Search reports..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                viewMode === "table" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                viewMode === "cards" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Requests Display */}
      {loading ? (
        <div className="bg-neutral-900 p-12 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center text-neutral-400 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-sky-400" />
          <span className="text-xs font-medium font-mono">Synchronizing telemetry & grievances...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-neutral-900 p-12 rounded-2xl border border-neutral-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-700">
            <PlusCircle className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No grievances matching your criteria</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              File a new report with photos, audio, or text to immediately dispatch local response teams.
            </p>
          </div>
          <Link
            href="/citizen/new-request"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            Raise Incident Report
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : viewMode === "table" ? (
        /* High-Contrast Scannable Ragtime Table */
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3.5">Ticket / Subject</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Assigned Dispatch</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredRequests.map((req) => {
                  const dateObj = new Date(req.createdAt);
                  const formattedDate = dateObj.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <tr key={req.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white truncate max-w-xs">{req.description}</div>
                        <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          ID: {req.id.slice(0, 10)}... • {formattedDate}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <CategoryBadge category={req.category} />
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="px-4 py-3.5">
                        {req.assignedTo ? (
                          <div className="text-neutral-200 font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span>{req.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 italic text-[11px]">Queued for dispatch</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400 truncate max-w-[140px]">
                        {req.location}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/citizen/request/${req.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-sky-600 hover:text-white text-neutral-300 font-medium transition-all"
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
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const dateObj = new Date(req.createdAt);
            const formattedDate = dateObj.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={req.id}
                className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 shadow-lg hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CategoryBadge category={req.category} />
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {req.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {formattedDate}
                    </span>
                  </div>

                  {req.assignedTo ? (
                    <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Assigned to:</span>
                      <span className="font-bold text-sky-400">
                        {req.assignedTo.name} ({req.assignedTo.role})
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-1.5 text-xs text-neutral-400">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span>Queued for Local Authority assignment</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-end">
                  <Link
                    href={`/citizen/request/${req.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 group"
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
  );
}
