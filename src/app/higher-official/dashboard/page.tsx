"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import { useLanguage } from "@/lib/i18n/context";
import {
  HeartPulse,
  Droplet,
  Hospital,
  Activity,
  PhoneCall,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Sliders,
  Send,
  Loader2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function HigherOfficialMedicalDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"blood" | "triage" | "telemetry">("blood");
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [bloodMetrics, setBloodMetrics] = useState<any>({
    emergencyCount: 0,
    fulfilledCount: 0,
    totalUnitsNeeded: 0,
    totalOpenRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupFilter, setGroupFilter] = useState("all");

  // New Blood Request Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");
  const [units, setUnits] = useState<number>(2);
  const [hospitalName, setHospitalName] = useState("District Government Civil Hospital, Rampur");
  const [contactPhone, setContactPhone] = useState("");
  const [urgency, setUrgency] = useState<string>("emergency");
  const [submittingBlood, setSubmittingBlood] = useState(false);
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null);

  const fetchBloodData = async () => {
    try {
      const res = await fetch(`/api/modules/blood-bank?group=${groupFilter}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setBloodRequests(data.requests || []);
        setBloodMetrics(data.metrics || {});
      }
    } catch (err) {
      console.error("Blood bank fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBloodData();
  }, [groupFilter]);

  const handleCreateBloodRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !contactPhone) return;

    try {
      setSubmittingBlood(true);
      const res = await fetch("/api/modules/blood-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          bloodGroup,
          units,
          hospitalName,
          district: "Rampur",
          contactPhone,
          urgency,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastAlert(data.broadcastNotification);
        setShowCreateModal(false);
        setPatientName("");
        setContactPhone("");
        fetchBloodData();
      } else {
        alert(data.error || "Failed to create blood request.");
      }
    } catch (err) {
      console.error("Error creating blood request:", err);
    } finally {
      setSubmittingBlood(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/modules/blood-bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchBloodData();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Language switcher banner */}
      <DashboardLanguageBanner />

      {/* Header Banner */}
      <div className="bg-neutral-900 border border-red-900/40 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-1 rounded-md border border-red-800/60 font-mono flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              State Medical Command
            </span>
            <span className="text-[11px] text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded-full font-semibold">
              Dr. Arvind Swaminathan (Medical Superintendent)
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">
            Medical Emergency & Blood Bank Assistance Command
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time critical trauma triage, rapid blood donor volunteer matching, and hospital bed telemetry across Rampur & connected districts.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchBloodData();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            title="Refresh command telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-red-400" : ""}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Broadcast Blood Request</span>
          </button>
        </div>
      </div>

      {/* Broadcast Alert Banner if recently dispatched */}
      {broadcastAlert && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center justify-between text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{broadcastAlert}</span>
          </div>
          <button
            onClick={() => setBroadcastAlert(null)}
            className="text-neutral-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-red-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-red-400/80 font-medium">Critical Blood Alerts</p>
            <h3 className="text-2xl font-black text-red-400 mt-1 font-mono">{bloodMetrics.emergencyCount || 0}</h3>
          </div>
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-400">
            <Droplet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-amber-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium">Total Units Needed</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1 font-mono">{bloodMetrics.totalUnitsNeeded || 0}</h3>
          </div>
          <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-emerald-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-400/80 font-medium">Fulfilled Today</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">{bloodMetrics.fulfilledCount || 0}</h3>
          </div>
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-sky-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-sky-400/80 font-medium">ICU Beds Available</p>
            <h3 className="text-2xl font-black text-sky-400 mt-1 font-mono">14 / 22</h3>
          </div>
          <div className="p-3 bg-sky-950/60 border border-sky-800/60 rounded-xl text-sky-400">
            <Hospital className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab("blood")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "blood"
              ? "bg-red-600 text-white shadow-md shadow-red-950"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Droplet className="w-4 h-4" />
          Blood Bank Matchmaker
        </button>
        <button
          onClick={() => setActiveTab("triage")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "triage"
              ? "bg-red-600 text-white shadow-md shadow-red-950"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          Facility Bed & Trauma Telemetry
        </button>
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "telemetry"
              ? "bg-red-600 text-white shadow-md shadow-red-950"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          State Command HQ Relay
        </button>
      </div>

      {/* TAB 1: Blood Bank Matchmaker */}
      {activeTab === "blood" && (
        <div className="space-y-4">
          {/* Blood Group Filters */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-neutral-400 font-semibold mr-2">Filter Group:</span>
              {["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setGroupFilter(grp)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    groupFilter === grp
                      ? "bg-red-600 text-white"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  {grp === "all" ? "All Groups" : grp}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Requests Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-500" />
                Live Blood Bank Requisitions & Donor Relays
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                {bloodRequests.length} Total Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="p-3.5">Blood Group</th>
                    <th className="p-3.5">Patient / Case</th>
                    <th className="p-3.5">Units</th>
                    <th className="p-3.5">Hospital & District</th>
                    <th className="p-3.5">Urgency</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {bloodRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-red-950/80 border border-red-800/60 font-black text-red-400 text-sm font-mono shadow-xs">
                          {req.bloodGroup}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-white">{req.patientName}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">ID: {req.id.slice(0, 8)}</p>
                      </td>
                      <td className="p-3.5 font-bold font-mono text-neutral-200">
                        {req.units} Units
                      </td>
                      <td className="p-3.5">
                        <p className="text-neutral-200">{req.hospitalName}</p>
                        <p className="text-[10px] text-neutral-400">{req.location}, {req.district}</p>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.urgency === "emergency"
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            req.status === "fulfilled"
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                              : req.status === "matched"
                              ? "bg-sky-950/80 text-sky-400 border-sky-800/60"
                              : "bg-red-950/80 text-red-400 border-red-800/60 animate-pulse"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {req.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, "matched")}
                            className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Mark Matched
                          </button>
                        )}
                        {req.status !== "fulfilled" && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, "fulfilled")}
                            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Fulfilled
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bloodRequests.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500">
                        No active blood requests matching the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Facility Bed & Trauma Telemetry */}
      {activeTab === "triage" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: "District Civil Hospital, Rampur",
              type: "Tertiary Referral",
              bedsTotal: 250,
              bedsOcc: 212,
              icuTotal: 22,
              icuOcc: 18,
              oxygenStatus: "94% Normal (Liquid Tank)",
              ambulanceActive: 6,
            },
            {
              name: "Mandya District General Hospital",
              type: "District Hospital",
              bedsTotal: 180,
              bedsOcc: 140,
              icuTotal: 14,
              icuOcc: 9,
              oxygenStatus: "88% Normal",
              ambulanceActive: 4,
            },
            {
              name: "Shivamogga Trauma & Burn Unit",
              type: "Specialized Center",
              bedsTotal: 120,
              bedsOcc: 95,
              icuTotal: 16,
              icuOcc: 14,
              oxygenStatus: "99% High Capacity",
              ambulanceActive: 5,
            },
          ].map((fac, idx) => (
            <div key={idx} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/40">
                    {fac.type}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{fac.name}</h3>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Inpatient Beds:</span>
                  <span className="font-bold text-white font-mono">{fac.bedsOcc} / {fac.bedsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">ICU Ventilator Beds:</span>
                  <span className="font-bold text-red-400 font-mono">{fac.icuOcc} / {fac.icuTotal} ({fac.icuTotal - fac.icuOcc} Free)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Oxygen Buffer:</span>
                  <span className="font-bold text-emerald-400 font-mono">{fac.oxygenStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Active Ambulances:</span>
                  <span className="font-bold text-sky-400 font-mono">{fac.ambulanceActive} GPS Online</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: State Command HQ Relay */}
      {activeTab === "telemetry" && (
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                State Telemetry & System Administration
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                As a Higher Official, you hold full administrative access to state-wide telemetry, worker verification policies, and integration health checks.
              </p>
            </div>
            <Link
              href="/superadmin/dashboard"
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl border border-neutral-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Launch Full State HQ Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Broadcast Blood Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-500" />
                Broadcast Urgent Blood Requisition
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBloodRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Patient Name / Case ID</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Smt. Kamala Devi / Case #9102"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-neutral-200 focus:outline-none focus:border-red-500"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Units Needed</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Hospital / Clinic</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Emergency Contact Number</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Official hospital blood bank or doctor line"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBlood}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submittingBlood ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Dispatch Volunteer Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
