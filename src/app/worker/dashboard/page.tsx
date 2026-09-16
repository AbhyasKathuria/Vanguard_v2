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
  Wrench,
  Clock,
  MapPin,
  Phone,
  PlayCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
  X,
  ImageIcon,
  Siren,
} from "lucide-react";
import SOSScreenPopup from "@/components/SOSScreenPopup";
import { useEmergencyAlerts } from "@/hooks/useEmergencyAlerts";

export default function WorkerDashboard() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
        (err) => console.warn("Worker geolocation warning:", err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Status update modal state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("in_progress");
  const [updateNote, setUpdateNote] = useState<string>("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchAssignedRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Fetch worker requests error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedRequests();
  }, []);

  const handleUpdateStatus = async (requestId: string, newStatus: string, defaultMessage?: string) => {
    try {
      setSubmittingStatus(true);
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          message: updateNote || defaultMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update status");
        return;
      }

      setUpdatingId(null);
      setUpdateNote("");
      fetchAssignedRequests();
    } catch (err) {
      console.error("Status update error:", err);
      alert("Network error updating request.");
    } finally {
      setSubmittingStatus(false);
    }
  };

  const openStatusModal = (req: any, status: string) => {
    setUpdatingId(req.id);
    setTargetStatus(status);
    setUpdateNote(
      status === "in_progress"
        ? "Worker arrived on site with required tools and materials."
        : "Field task completed successfully and tested on site."
    );
  };

  const primaryLocation = requests[0]?.district || requests[0]?.location || "Rampur";

  return (
    <div className="space-y-6">
      {/* 1-Click Multi-Lingual Dashboard Switcher */}
      <DashboardLanguageBanner />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#404040] bg-[#f5f5f5] px-2.5 py-1 rounded-md border border-[#dcdcdc]">
            {t.worker.badge}
          </span>
          <h1 className="text-2xl font-extrabold text-[#404040] mt-2">{t.worker.pageTitle}</h1>
          <p className="text-xs text-[#707070] mt-0.5">{t.worker.pageDesc}</p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchAssignedRequests();
          }}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#dcdcdc] hover:bg-[#f5f5f5] text-[#404040] text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {t.common.refresh}
        </button>
      </div>

      {/* Real-Time Agricultural & Weather Advisory for Worker Safety */}
      <WeatherWidget location={primaryLocation} />

      {/* Requests List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#dcdcdc] flex flex-col items-center justify-center text-[#707070] gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#404040]" />
          <span className="text-xs font-medium">Loading assigned tasks...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#dcdcdc] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f5] text-[#404040] flex items-center justify-center mx-auto border border-[#dcdcdc]">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#404040]">{t.worker.noTasksTitle}</h3>
          <p className="text-xs text-[#707070] max-w-sm mx-auto">
            {t.worker.noTasksDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => {
            const dateObj = new Date(req.createdAt);
            const formattedDate = dateObj.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#a6a6a6] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CategoryBadge category={req.category} />
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-[#404040] leading-snug">{req.description}</p>

                  {/* Photo Attachment if present */}
                  {req.attachmentUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-[#dcdcdc] max-h-36 bg-[#f5f5f5]">
                      <img src={req.attachmentUrl} alt="Site attachment" className="w-full h-36 object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                        <ImageIcon className="w-3 h-3" /> Citizen Attachment
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#f5f5f5] rounded-xl text-xs border border-[#dcdcdc]">
                    <div>
                      <span className="text-[#707070] font-medium block">Citizen</span>
                      <span className="font-bold text-[#404040]">{req.user?.name}</span>
                    </div>
                    <div>
                      <span className="text-[#707070] font-medium block">Contact</span>
                      <a
                        href={`tel:${req.user?.phone}`}
                        className="font-bold text-[#404040] flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3 text-[#707070]" />
                        {req.user?.phone}
                      </a>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-[#dcdcdc] flex items-center gap-1 text-[#707070]">
                      <MapPin className="w-3 h-3 text-[#a6a6a6]" />
                      <span>{req.location}</span>
                      <span className="mx-1">·</span>
                      <Clock className="w-3 h-3 text-[#a6a6a6]" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 border-t border-[#f5f5f5] flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/citizen/request/${req.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#262626] text-xs font-bold rounded-lg border border-[#dcdcdc] transition-all"
                  >
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>View Timeline</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {req.status === "assigned" && (
                      <button
                        onClick={() => openStatusModal(req, "in_progress")}
                        className="px-3 py-1.5 bg-[#707070] hover:bg-[#545454] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Start Work
                      </button>
                    )}

                    {req.status === "in_progress" && (
                      <button
                        onClick={() => openStatusModal(req, "resolved")}
                        className="px-3 py-1.5 bg-[#404040] hover:bg-[#262626] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Complete
                      </button>
                    )}

                    {req.status === "resolved" && (
                      <span className="text-xs font-bold text-[#404040] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#707070]" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Update Modal */}
      {updatingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#dcdcdc] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#404040]">
                Update Status to {targetStatus === "in_progress" ? "IN PROGRESS" : "RESOLVED"}
              </h3>
              <button
                onClick={() => setUpdatingId(null)}
                className="p-1 rounded-lg text-[#707070] hover:text-[#404040]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#707070]">
              Provide a brief note explaining the progress or resolution. This will be added to the citizen&apos;s live tracking timeline.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#404040] mb-1">Status Note</label>
              <textarea
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs border border-[#dcdcdc] rounded-xl focus:border-[#404040] outline-none bg-[#f5f5f5] focus:bg-white text-[#404040]"
                placeholder="Enter update details..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUpdatingId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#707070] hover:bg-[#f5f5f5] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingStatus}
                onClick={() => handleUpdateStatus(updatingId, targetStatus)}
                className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 bg-[#404040] hover:bg-[#262626]"
              >
                {submittingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Confirm &amp; Update
              </button>
            </div>
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
    </div>
  );
}
