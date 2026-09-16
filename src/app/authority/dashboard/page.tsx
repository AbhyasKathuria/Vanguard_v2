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

  const [activeMainTab, setActiveMainTab] = useState<"requests" | "personnel">("requests");
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role,
          verified: !currentVerified,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update verification status.");
        return;
      }

      fetchAuthorityData();
    } catch (err) {
      console.error("Verify toggle error:", err);
    } finally {
      setTogglingVerifyId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.description?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.assignedTo?.name?.toLowerCase().includes(q)
    );
  });

  const primaryLocation = requests[0]?.district || requests[0]?.location || "Rampur";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1-Click Multi-Lingual Dashboard Switcher */}
      <DashboardLanguageBanner />

      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-md border border-sky-800/60 font-mono">
              {t.authority.badge}
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{t.authority.pageTitle}</h1>
            <p className="text-xs text-neutral-400">{t.authority.pageDesc}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchAuthorityData();
          }}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
          {t.common.refresh}
        </button>
      </div>

      {/* Real-Time District Weather & Disaster Monitoring */}
      <WeatherWidget location={primaryLocation} />

      {/* Ragtime-Style Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block font-mono">
            Total Raised
          </span>
          <span className="text-2xl font-black text-white mt-1 block font-mono">{stats.total}</span>
        </div>

        <div className="bg-neutral-900 border border-amber-900/40 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider block font-mono">
            Open / Queued
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">{stats.open}</span>
        </div>

        <div className="bg-neutral-900 border border-blue-900/40 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] font-semibold text-blue-400/80 uppercase tracking-wider block font-mono">
            Assigned
          </span>
          <span className="text-2xl font-black text-blue-400 mt-1 block font-mono">{stats.assigned}</span>
        </div>

        <div className="bg-neutral-900 border border-purple-900/40 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] font-semibold text-purple-400/80 uppercase tracking-wider block font-mono">
            In Progress
          </span>
          <span className="text-2xl font-black text-purple-400 mt-1 block font-mono">{stats.inProgress}</span>
        </div>

        <div className="bg-neutral-900 border border-emerald-900/40 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider block font-mono">
            Resolved
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{stats.resolved}</span>
        </div>

        <div className="bg-neutral-900 border border-sky-900/40 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] font-semibold text-sky-400/80 uppercase tracking-wider block font-mono">
            Verified Staff
          </span>
          <span className="text-2xl font-black text-sky-400 mt-1 block font-mono">
            {stats.verifiedWorkers + stats.verifiedVolunteers}
          </span>
        </div>
      </div>

      {/* Main View Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveMainTab("requests")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "requests"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-950/50"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Shield className="w-4 h-4" />
          All Service Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveMainTab("personnel")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeMainTab === "personnel"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-950/50"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Manage Personnel Verification ({assignees.length})
        </button>
      </div>

      {/* VIEW 1: REQUESTS TABLE */}
      {activeMainTab === "requests" && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden space-y-4 p-5">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search description, citizen, location..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-neutral-800 rounded-lg outline-none focus:border-sky-500 w-56 sm:w-64 bg-neutral-950 text-neutral-200 placeholder-neutral-500"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-800 rounded-lg bg-neutral-950 outline-none focus:border-sky-500 text-neutral-300"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open (Unassigned)</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-800 rounded-lg bg-neutral-950 outline-none focus:border-sky-500 text-neutral-300"
              >
                <option value="all">All Categories</option>
                <option value="civic">Civic / Infra</option>
                <option value="health">Health</option>
                <option value="emergency">Emergency</option>
                <option value="farming">Farming</option>
                <option value="other">Other</option>
              </select>
            </div>

            <span className="text-xs text-neutral-400 font-mono">
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
              <span className="text-xs font-mono">Loading dispatch matrix...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs italic">
              No matching service requests found for selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Category &amp; Priority</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Location &amp; Citizen</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Handler</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <CategoryBadge category={req.category} showIcon={false} />
                          <PriorityBadge priority={req.priority} />
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <p className="line-clamp-2 text-white font-semibold leading-relaxed">
                          {req.description}
                        </p>
                        <span className="text-[10px] font-mono text-neutral-500 mt-0.5 block">
                          ID: {req.id.slice(0, 10)}... · {new Date(req.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-neutral-200">{req.location}</div>
                        <div className="text-[11px] text-neutral-400">
                          {req.user?.name} ({req.user?.phone})
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={req.status} />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {req.assignedTo ? (
                          <div className="flex items-center gap-1.5 text-neutral-200">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="font-semibold">{req.assignedTo.name}</span>
                            <span className="text-[10px] text-neutral-400">({req.assignedTo.role})</span>
                          </div>
                        ) : (
                          <span className="text-amber-400 font-semibold italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => {
                            setAssigningReq(req);
                            setSelectedAssigneeId(req.assignedToId || "");
                          }}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {req.assignedTo ? "Re-assign" : "Assign Handler"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PERSONNEL VERIFICATION TABLE */}
      {activeMainTab === "personnel" && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Registered Field Workers &amp; Volunteers</h3>
            <span className="text-xs text-neutral-400 font-mono">
              Total Assignees: {assignees.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">District / Area</th>
                  <th className="py-3 px-3">Verification Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {assignees.map((person) => {
                  const isVerified = person.workerProfile?.verified || person.volunteerProfile?.verified;
                  const isToggling = togglingVerifyId === person.id;

                  return (
                    <tr key={person.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">{person.name}</td>
                      <td className="py-3 px-3 uppercase text-[10px] font-mono text-neutral-400">
                        {person.role}
                      </td>
                      <td className="py-3 px-3 text-neutral-300 font-mono">{person.phone || "—"}</td>
                      <td className="py-3 px-3 text-neutral-400">{person.district || person.location || "Rampur"}</td>
                      <td className="py-3 px-3">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Pending Verification
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleVerification(person.id, person.role, isVerified)}
                          disabled={isToggling}
                          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                            isVerified
                              ? "bg-neutral-800 hover:bg-red-900/60 text-red-300 border border-neutral-700"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isVerified ? (
                            "Revoke"
                          ) : (
                            "Approve & Verify"
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
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
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
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
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
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
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
