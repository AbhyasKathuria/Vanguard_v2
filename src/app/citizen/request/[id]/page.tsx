"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import Timeline from "@/components/Timeline";
import MapView from "@/components/MapView";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import { useLanguage } from "@/lib/i18n/context";
import {
  ArrowLeft,
  MapPin,
  Clock,
  UserCheck,
  Loader2,
  RefreshCw,
  Phone,
  Briefcase,
  Building,
  ShieldAlert,
} from "lucide-react";

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;
  const { t } = useLanguage();

  const [request, setRequest] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {}
  };

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load request.");
        return;
      }
      setRequest(data.request);
    } catch (err) {
      console.error("Fetch request error:", err);
      setError("Network error loading request.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (newStatus: string, note?: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, message: note }),
      });
      if (res.ok) {
        fetchRequest();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchRequest();
  }, [requestId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex flex-col items-center justify-center text-[#707070] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#404040]" />
        <p className="text-xs font-medium">{t.common.loading}</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-[#f5f5f5] text-[#404040] rounded-2xl border border-[#707070] text-xs">
          {error || "Request not found"}
        </div>
        <Link
          href="/citizen/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#404040] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.nav.myRequests}
        </Link>
      </div>
    );
  }

  const createdDate = new Date(request.createdAt).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const assignedUser = request.assignedTo;
  const assignedProfession = assignedUser?.workerProfile?.profession;
  const assignedOrg = assignedUser?.volunteerProfile?.organization;
  const isAssigned = !!assignedUser;

  const viewerRole = currentUser?.role;
  let backHref = "/citizen/dashboard";
  let backLabel = t.nav.myRequests;

  if (viewerRole === "volunteer") {
    backHref = "/volunteer/dashboard";
    backLabel = "Back to Volunteer Dashboard";
  } else if (viewerRole === "worker") {
    backHref = "/worker/dashboard";
    backLabel = "Back to Worker Dashboard";
  } else if (viewerRole === "authority" || viewerRole === "higher_authority") {
    backHref = "/authority/dashboard";
    backLabel = "Back to Authority Dashboard";
  } else if (viewerRole === "super_admin" || viewerRole === "admin") {
    backHref = "/superadmin/dashboard";
    backLabel = "Back to SuperAdmin Dashboard";
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* 1-Click Multi-Lingual Switcher */}
      <DashboardLanguageBanner />

      {/* Back button & Refresh */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#707070] hover:text-[#404040] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </Link>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchRequest();
          }}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#404040] bg-white border border-[#dcdcdc] rounded-lg hover:bg-[#f5f5f5] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {t.common.refresh}
        </button>
      </div>

      {/* Main Request Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#dcdcdc] shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={request.category} />
            <PriorityBadge priority={request.priority} />
          </div>
          <StatusBadge status={request.status} className="text-sm px-3 py-1" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#404040] leading-snug">{request.description}</h1>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#f5f5f5] rounded-xl border border-[#dcdcdc] text-xs">
          <div>
            <span className="text-[#707070] font-medium block">{t.common.location}</span>
            <span className="font-bold text-[#404040] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#a6a6a6]" />
              {request.location}
            </span>
          </div>

          <div>
            <span className="text-[#707070] font-medium block">Reported At</span>
            <span className="font-bold text-[#404040] flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-[#a6a6a6]" />
              {createdDate}
            </span>
          </div>
        </div>

        {/* Assigned Helper Trust Card */}
        {isAssigned ? (
          <div className="p-4 rounded-xl bg-[#f5f5f5] border border-[#a6a6a6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#404040] text-white shrink-0 mt-0.5 shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#404040]">
                    {t.citizen.trackingTitle}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#dcdcdc] text-[#262626]">
                    {assignedUser.role}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#404040]">{assignedUser.name}</h3>
                <p className="text-xs text-[#707070] flex items-center gap-1.5">
                  {assignedProfession && (
                    <span className="flex items-center gap-1 font-medium">
                      <Briefcase className="w-3 h-3 text-[#a6a6a6]" />
                      {assignedProfession}
                    </span>
                  )}
                  {assignedOrg && (
                    <span className="flex items-center gap-1 font-medium">
                      <Building className="w-3 h-3 text-[#a6a6a6]" />
                      {assignedOrg}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {assignedUser.phone && (
              <a
                href={`tel:${assignedUser.phone}`}
                className="px-3.5 py-2 bg-[#404040] hover:bg-[#262626] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors self-stretch sm:self-auto justify-center cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                {t.common.callHelper} {assignedUser.phone}
              </a>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#f5f5f5] border border-[#dcdcdc] flex items-start gap-3 text-xs text-[#404040]">
            <ShieldAlert className="w-5 h-5 text-[#707070] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#404040]">{t.citizen.awaitingAssignmentTitle}</p>
              <p className="text-[#707070] mt-0.5 leading-relaxed">
                {t.citizen.awaitingAssignmentDesc}
              </p>
            </div>
          </div>
        )}

        {/* GIS Map & Dispatch Routing View */}
        {request.latitude && request.longitude && (
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#707070] mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#a6a6a6]" />
              Geographic Service Location &amp; Dispatch Routing
            </h3>
            <MapView
              destination={{
                lat: request.latitude,
                lng: request.longitude,
                label: request.location || "Incident Site",
              }}
              origin={
                assignedUser && (assignedUser.workerProfile?.latitude || assignedUser.volunteerProfile?.latitude)
                  ? {
                      lat: assignedUser.workerProfile?.latitude || assignedUser.volunteerProfile?.latitude,
                      lng: assignedUser.workerProfile?.longitude || assignedUser.volunteerProfile?.longitude,
                      label: assignedUser.name || "Assigned Responder",
                    }
                  : { lat: 28.8154, lng: 79.025, label: "Rampur Central Hub" }
              }
              height="380px"
              showRoutingControls={true}
            />
          </div>
        )}
      </div>

      {/* Audit History Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#a6a6a6]" />
            {t.citizen.timelineHeader}
          </h2>
          <span className="text-xs text-[#a6a6a6]">{request.updates?.length || 0} event(s) recorded</span>
        </div>

        <Timeline
          updates={request.updates || []}
          createdAt={request.createdAt}
          currentStatus={request.status}
          assignedTo={request.assignedTo}
          viewerRole={viewerRole}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
