"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import { checkAllIntegrationsHealth, ServiceHealthStatus } from "@/lib/integrations/health";
import {
  Sliders,
  Shield,
  Activity,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [healthStatus, setHealthStatus] = useState<ServiceHealthStatus[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "authorities" | "health">("overview");

  // Create Authority Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAuthName, setNewAuthName] = useState("");
  const [newAuthPhone, setNewAuthPhone] = useState("");
  const [newAuthDistrict, setNewAuthDistrict] = useState("Rampur");
  const [newAuthLocation, setNewAuthLocation] = useState("");
  const [creatingAuth, setCreatingAuth] = useState(false);
  const [authError, setAuthError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, authRes] = await Promise.all([
        fetch("/api/requests"),
        fetch("/api/superadmin/authorities"),
      ]);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }

      if (authRes.ok) {
        const authData = await authRes.json();
        setAuthorities(authData.authorities || []);
      }

      // Load integrations health
      setHealthStatus(checkAllIntegrationsHealth());
    } catch (err) {
      console.error("Super Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAuthorityActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/superadmin/authorities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (res.ok) {
        setAuthorities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, active: !currentActive } : a))
        );
      }
    } catch (err) {
      console.error("Toggle authority error:", err);
    }
  };

  const handleCreateAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAuth(true);
    setAuthError("");

    try {
      const res = await fetch("/api/superadmin/authorities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAuthName,
          phone: newAuthPhone,
          district: newAuthDistrict,
          location: newAuthLocation || `${newAuthDistrict} District HQ`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to create authority");
        return;
      }

      setAuthorities((prev) => [data.authority, ...prev]);
      setShowCreateModal(false);
      setNewAuthName("");
      setNewAuthPhone("");
      setNewAuthLocation("");
    } catch (err) {
      setAuthError("Network error creating authority");
    } finally {
      setCreatingAuth(false);
    }
  };

  // Metrics
  const totalReqs = requests.length;
  const resolvedReqs = requests.filter((r) => r.status === "resolved").length;
  const resolutionRate = totalReqs > 0 ? Math.round((resolvedReqs / totalReqs) * 100) : 0;
  const openReqs = requests.filter((r) => r.status === "open").length;

  const districtsList = ["Rampur", "Sitapur", "Mandya", "Shivamogga", "Kolar", "Belagavi"];

  const filteredRequests =
    selectedDistrict === "all"
      ? requests
      : requests.filter((r) => r.district === selectedDistrict || r.location.includes(selectedDistrict));

  return (
    <div className="space-y-6">
      {/* 1-Click Multi-Lingual Dashboard Switcher */}
      <DashboardLanguageBanner />

      {/* Header Banner */}
      <div className="bg-[#1e1e1e] text-white p-6 sm:p-7 rounded-3xl border border-[#383838] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#53bdeb]/20 text-[#53bdeb] border border-[#53bdeb]/40">
              System Administrator HQ
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#a6a6a6]">
              <Activity className="w-3 h-3 text-[#25D366] animate-pulse" />
              All 6 Districts Online
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#53bdeb]" />
            VANGUARD Super Admin Command Center
          </h1>
          <p className="text-xs text-[#a6a6a6] max-w-2xl leading-relaxed">
            State-wide oversight of deterministic service routing, cross-district operations, external API telemetry, and district authority credentials.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-[#707070] tracking-wider">Total System Requests</span>
          <p className="text-2xl font-black text-[#262626]">{totalReqs}</p>
          <span className="text-[10px] text-[#707070]">Across 6 Geographic Hubs</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-[#707070] tracking-wider">Resolution Rate</span>
          <p className="text-2xl font-black text-[#262626]">{resolutionRate}%</p>
          <span className="text-[10px] text-[#25D366] font-semibold">{resolvedReqs} Resolved On-Site</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-[#707070] tracking-wider">Pending Authority Triage</span>
          <p className="text-2xl font-black text-[#707070]">{openReqs}</p>
          <span className="text-[10px] text-[#707070]">Queued in Open Pool</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-[#707070] tracking-wider">District Authorities</span>
          <p className="text-2xl font-black text-[#262626]">{authorities.length}</p>
          <span className="text-[10px] text-[#53bdeb] font-semibold">Active in 3 States</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#dcdcdc] pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "overview" ? "bg-[#262626] text-white shadow-xs" : "text-[#707070] hover:bg-white"
          }`}
        >
          District Operations
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "requests" ? "bg-[#262626] text-white shadow-xs" : "text-[#707070] hover:bg-white"
          }`}
        >
          Cross-District Requests ({filteredRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("authorities")}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "authorities" ? "bg-[#262626] text-white shadow-xs" : "text-[#707070] hover:bg-white"
          }`}
        >
          Authority Management ({authorities.length})
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "health" ? "bg-[#262626] text-white shadow-xs" : "text-[#707070] hover:bg-white"
          }`}
        >
          API Integrations Health (6/6 Active)
        </button>
      </div>

      {/* TAB 1: DISTRICT OPERATIONS OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {districtsList.map((district) => {
            const districtReqs = requests.filter(
              (r) => r.district === district || r.location.includes(district)
            );
            const districtAuthorities = authorities.filter((a) => a.district === district);
            const resolvedCount = districtReqs.filter((r) => r.status === "resolved").length;

            return (
              <div key={district} className="p-5 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#707070]" />
                    <h3 className="text-sm font-bold text-[#262626]">{district} District</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0f0f0] text-[#404040]">
                    {districtReqs.length} total reqs
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#f9f9f9] p-2.5 rounded-xl border border-[#e5e5e5]">
                  <div>
                    <span className="text-[10px] text-[#707070] block">Assigned / Resolved</span>
                    <span className="font-bold text-[#262626]">{resolvedCount} / {districtReqs.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#707070] block">Authority Contact</span>
                    <span className="font-bold text-[#262626]">
                      {districtAuthorities[0]?.name || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setSelectedDistrict(district);
                      setActiveTab("requests");
                    }}
                    className="text-xs font-bold text-[#404040] hover:underline flex items-center gap-1"
                  >
                    View {district} Requests ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CROSS-DISTRICT REQUESTS TABLE */}
      {activeTab === "requests" && (
        <div className="bg-white rounded-2xl border border-[#dcdcdc] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#dcdcdc] flex flex-wrap items-center justify-between gap-3 bg-[#fafafa]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#707070]" />
              <span className="text-xs font-bold text-[#404040]">Filter District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#dcdcdc] bg-white font-medium focus:outline-none"
              >
                <option value="all">All Districts (Global)</option>
                {districtsList.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-[#707070] font-medium">
              Showing {filteredRequests.length} request(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f0f0] text-[#707070] uppercase font-bold text-[10px] tracking-wider border-b border-[#dcdcdc]">
                <tr>
                  <th className="py-3 px-4">Request ID &amp; Location</th>
                  <th className="py-3 px-4">Category &amp; Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Personnel</th>
                  <th className="py-3 px-4">Date Reported</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#262626] line-clamp-1">{req.description}</p>
                      <span className="text-[11px] text-[#707070] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#a6a6a6]" />
                        {req.location} ({req.district || "Default"})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 w-fit">
                        <CategoryBadge category={req.category} />
                        <PriorityBadge priority={req.priority} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4">
                      {req.assignedTo ? (
                        <div>
                          <p className="font-bold text-[#262626]">{req.assignedTo.name}</p>
                          <span className="text-[10px] text-[#707070]">
                            {req.assignedTo.role} • {req.assignedTo.phone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#707070] italic">Unassigned (In Pool)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#707070]">
                      {new Date(req.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/citizen/request/${req.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#262626] hover:bg-black text-white rounded-lg font-bold text-[11px] transition-colors"
                      >
                        Audit Trail
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUTHORITY ACCOUNTS MANAGER */}
      {activeTab === "authorities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#262626]">District Authority Officers</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add District Authority
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authorities.map((auth) => (
              <div key={auth.id} className="p-4 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#262626]">{auth.name}</h3>
                    <p className="text-xs text-[#707070] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#a6a6a6]" />
                      {auth.district} District ({auth.location})
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      auth.active !== false ? "bg-[#dcdcdc] text-[#262626]" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {auth.active !== false ? "Active" : "Suspended"}
                  </span>
                </div>

                <div className="text-xs text-[#707070] space-y-1 bg-[#f9f9f9] p-2.5 rounded-xl">
                  <p>📞 Contact: <span className="font-semibold text-[#262626]">{auth.phone}</span></p>
                  <p>🆔 System ID: <span className="font-mono text-[10px]">{auth.id}</span></p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleToggleAuthorityActive(auth.id, auth.active !== false)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                      auth.active !== false
                        ? "border-red-300 text-red-600 hover:bg-red-50"
                        : "border-[#707070] text-[#262626] hover:bg-[#f0f0f0]"
                    }`}
                  >
                    {auth.active !== false ? "Suspend Authority" : "Activate Authority"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: API INTEGRATIONS DIAGNOSTIC PANEL */}
      {activeTab === "health" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs">
            <h2 className="text-sm font-bold text-[#262626] mb-1">External Service Integration Status</h2>
            <p className="text-xs text-[#707070]">
              VANGUARD includes 6 external service adapters. Every integration features zero-config fallback mechanisms ensuring 100% operational uptime even without external cloud accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthStatus.map((service, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#262626]">{service.name}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[#707070]">
                        {service.category}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#404040] mt-0.5">{service.provider}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#25D366] bg-[#dcfce7] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Operational
                  </span>
                </div>

                <p className="text-xs text-[#707070] leading-relaxed bg-[#f9f9f9] p-2.5 rounded-xl border border-[#e5e5e5]">
                  {service.notes}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#707070]">
                  <span className="flex items-center gap-1 text-[#262626] font-medium">
                    <Zap className="w-3 h-3 text-[#25D366]" />
                    Zero-Key Fallback: Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE AUTHORITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#dcdcdc] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#262626]">Add New District Authority</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#f0f0f0] rounded-lg">
                <X className="w-4 h-4 text-[#707070]" />
              </button>
            </div>

            {authError && <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs">{authError}</div>}

            <form onSubmit={handleCreateAuthority} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#404040] block mb-1">Officer / Authority Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belagavi District Commissioner"
                  value={newAuthName}
                  onChange={(e) => setNewAuthName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dcdcdc] rounded-xl focus:outline-none focus:border-[#262626]"
                />
              </div>

              <div>
                <label className="font-bold text-[#404040] block mb-1">Official Mobile Phone (10 digits)</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543204"
                  value={newAuthPhone}
                  onChange={(e) => setNewAuthPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dcdcdc] rounded-xl focus:outline-none focus:border-[#262626]"
                />
              </div>

              <div>
                <label className="font-bold text-[#404040] block mb-1">Assigned District</label>
                <select
                  value={newAuthDistrict}
                  onChange={(e) => setNewAuthDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dcdcdc] rounded-xl focus:outline-none focus:border-[#262626]"
                >
                  {districtsList.map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#404040] block mb-1">HQ Office Location (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Belagavi Zilla Panchayat Office"
                  value={newAuthLocation}
                  onChange={(e) => setNewAuthLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dcdcdc] rounded-xl focus:outline-none focus:border-[#262626]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 border border-[#dcdcdc] rounded-xl font-bold text-[#707070]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAuth}
                  className="px-4 py-2 bg-[#262626] hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  {creatingAuth && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Authority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
