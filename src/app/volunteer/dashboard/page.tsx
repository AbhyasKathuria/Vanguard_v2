"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import WeatherWidget from "@/components/WeatherWidget";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import { useLanguage } from "@/lib/i18n/context";
import { resilientFetch } from "@/lib/resilientFetch";
import {
  HeartHandshake,
  Clock,
  MapPin,
  CheckCircle2,
  Loader2,
  RefreshCw,
  HandMetal,
  Layers,
  Send,
  X,
  PlayCircle,
  AlertTriangle,
  Search,
  Check,
  ArrowRight,
  ExternalLink,
  Siren,
} from "lucide-react";
import SOSScreenPopup from "@/components/SOSScreenPopup";
import { useEmergencyAlerts } from "@/hooks/useEmergencyAlerts";

export default function VolunteerDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"assigned" | "unassigned">("assigned");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Real-time Audible SOS Emergency Broadcast
  const { currentAlert, dismissAlert, acceptAlert } = useEmergencyAlerts(userCoords);

  // Live Geolocation Tracking & Heartbeat
  useEffect(() => {
    if (typeof window !== "undefined" && "navigator" in window && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserCoords(coords);
          fetch("/api/emergency/heartbeat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...coords, isOnline: true }),
          }).catch(() => {});
        },
        (err) => console.warn("Geolocation warning:", err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Status update modal state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("in_progress");
  const [updateNote, setUpdateNote] = useState<string>("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Claiming state
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/requests?tab=${activeTab}`);
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Fetch volunteer requests error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [activeTab]);

  // 1-Click Fast Action: Claim / Accept Task
  const handleClaimRequest = async (requestId: string) => {
    try {
      setClaimingId(requestId);

      const { data, error } = await resilientFetch<any>(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ action: "claim" }),
        onOptimisticUpdate: () => {
          setRequests((prev) => prev.filter((r) => r.id !== requestId));
        },
      });

      if (error) {
        alert(error || "Failed to claim request.");
        fetchRequests();
        return;
      }

      setActiveTab("assigned");
      fetchRequests();
    } catch (err) {
      console.error("Claim error:", err);
      alert("Network error claiming request.");
      fetchRequests();
    } finally {
      setClaimingId(null);
    }
  };

  // 1-Click Fast Action: Direct status transition (e.g. Mark In Progress or Resolve)
  const handleDirectStatusChange = async (requestId: string, newStatus: string) => {
    try {
      setSubmittingStatus(true);

      const { data, error } = await resilientFetch<any>(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          message: newStatus === "resolved" ? "Task resolved on site by volunteer." : "Volunteer arrived on site; work in progress.",
        }),
        onOptimisticUpdate: () => {
          setRequests((prev) =>
            prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
          );
        },
      });

      if (error) {
        alert(error || "Failed to update status.");
        fetchRequests();
        return;
      }

      fetchRequests();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Modal Status Update
  const handleUpdateStatusWithNote = async () => {
    if (!updatingId) return;
    try {
      setSubmittingStatus(true);
      const { data, error } = await resilientFetch<any>(`/api/requests/${updatingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: targetStatus,
          message: updateNote,
        }),
      });

      if (error) {
        alert(error || "Failed to update status.");
        return;
      }

      setUpdatingId(null);
      setUpdateNote("");
      fetchRequests();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setSubmittingStatus(false);
    }
  };

  // KPI Calculations
  const inProgressCount = requests.filter((r) => r.status === "in_progress").length;
  const assignedCount = requests.filter((r) => r.status === "assigned").length;
  const resolvedCount = requests.filter((r) => r.status === "resolved" || r.status === "closed").length;

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    return (
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1-Click Multi-Lingual Dashboard Switcher */}
      <DashboardLanguageBanner />

      {/* Top Header Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60 font-mono">
              {t.volunteer.badge}
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{t.volunteer.pageTitle}</h1>
            <p className="text-xs text-neutral-400">{t.volunteer.pageDesc}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchRequests();
          }}
          disabled={refreshing}
          className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          title="Refresh assignments"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* Scannable Ragtime KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">My Assigned Queue</p>
            <h3 className="text-2xl font-black text-white mt-1 font-mono">{assignedCount}</h3>
          </div>
          <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-sky-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-sky-400/80 font-medium">In Progress</p>
            <h3 className="text-2xl font-black text-sky-400 mt-1 font-mono">{inProgressCount}</h3>
          </div>
          <div className="p-3 bg-sky-950/60 border border-sky-800/60 rounded-xl text-sky-400">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-emerald-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-400/80 font-medium">Completed / Resolved</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">{resolvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-amber-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium">Response Status</p>
            <h3 className="text-lg font-bold text-amber-400 mt-1 font-mono">Active & Ready</h3>
          </div>
          <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-400">
            <HandMetal className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "assigned"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Active Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "unassigned"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60"
            }`}
          >
            <HandMetal className="w-4 h-4" />
            <span>Available Community Pool (Claim)</span>
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tasks High-Contrast Scannable Queue Table */}
      {loading ? (
        <div className="bg-neutral-900 p-12 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center text-neutral-400 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
          <span className="text-xs font-medium font-mono">Loading volunteer dispatch queue...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-neutral-900 p-12 rounded-2xl border border-neutral-800 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-700">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">No tasks in this queue right now</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {activeTab === "assigned"
              ? "All your assigned incidents are resolved! Switch to the Available Pool to claim new requests."
              : "No unassigned community requests pending at this moment."}
          </p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3.5">Task / Issue</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Urgency</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5 text-right">1-Click Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white truncate max-w-xs">{req.description}</div>
                      <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                        Ticket: {req.id.slice(0, 10)}... • Citizen Contact: {req.citizen?.phone || req.contactNumber || "On File"}
                      </div>
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
                    <td className="px-4 py-3.5 text-neutral-400 truncate max-w-[140px]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                        <span className="truncate">{req.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {activeTab === "unassigned" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/citizen/request/${req.id}`}
                            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1 transition-all"
                            title="View Incident Timeline"
                          >
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Timeline</span>
                          </Link>

                          <button
                            onClick={() => handleClaimRequest(req.id)}
                            disabled={claimingId === req.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-all shadow flex items-center gap-1.5 cursor-pointer"
                          >
                            {claimingId === req.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <HandMetal className="w-3 h-3" />
                            )}
                            <span>Claim Task</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/citizen/request/${req.id}`}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs rounded-lg transition-all border border-neutral-700 flex items-center gap-1"
                            title="View Incident Timeline"
                          >
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Timeline</span>
                          </Link>

                          {req.status !== "in_progress" && req.status !== "resolved" && (
                            <button
                              onClick={() => handleDirectStatusChange(req.id, "in_progress")}
                              disabled={submittingStatus}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg transition-all flex items-center gap-1"
                              title="Mark In Progress"
                            >
                              <PlayCircle className="w-3 h-3" />
                              <span>Start</span>
                            </button>
                          )}

                          {req.status !== "resolved" && (
                            <button
                              onClick={() => handleDirectStatusChange(req.id, "resolved")}
                              disabled={submittingStatus}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-all flex items-center gap-1"
                              title="Mark Resolved"
                            >
                              <Check className="w-3 h-3" />
                              <span>Resolve</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setUpdatingId(req.id);
                              setTargetStatus(req.status === "in_progress" ? "resolved" : "in_progress");
                            }}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs rounded-lg transition-all border border-neutral-700"
                          >
                            Note
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Real-time SOS Audible Alert Screen Takeover */}
      <SOSScreenPopup
        alert={currentAlert}
        userCoords={userCoords}
        onDismiss={dismissAlert}
        onAccept={acceptAlert}
      />

      {/* Note & Status Update Modal */}
      {updatingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Append Field Note &amp; Status</h3>
              <button
                onClick={() => setUpdatingId(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Target Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="in_progress">In Progress (Active Work on Site)</option>
                  <option value="resolved">Resolved (Issue Fully Fixed)</option>
                  <option value="assigned">Assigned (Queued for Work)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Field Report / Resolution Note
                </label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows={3}
                  placeholder="e.g., Arrived with replacement fuse, road cleared..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingId(null)}
                  className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatusWithNote}
                  disabled={submittingStatus}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {submittingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Save Field Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
