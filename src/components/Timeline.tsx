"use client";

import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";

export interface TimelineUpdate {
  id: string;
  message: string;
  status: string;
  timestamp: string | Date;
  user?: {
    id?: string;
    name: string;
    role: string;
  };
}

interface TimelineProps {
  updates: TimelineUpdate[];
  createdAt?: string | Date;
  currentStatus?: string;
  assignedTo?: {
    id?: string;
    name: string;
    role: string;
    workerProfile?: { profession?: string };
    volunteerProfile?: { organization?: string };
  } | null;
  viewerRole?: string;
  onStatusChange?: (newStatus: string, note?: string) => Promise<void>;
}

export default function Timeline({
  updates = [],
  createdAt,
  currentStatus = "open",
  assignedTo,
  viewerRole,
  onStatusChange,
}: TimelineProps) {
  const [updating, setUpdating] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [targetActionStatus, setTargetActionStatus] = useState<string>("");

  // Determine stage progression index (0: Logged, 1: Assigned, 2: In-Progress, 3: Resolved)
  const normStatus = (currentStatus || "open").toLowerCase();
  let activeStageIdx = 0;
  if (normStatus === "resolved") activeStageIdx = 3;
  else if (normStatus === "in_progress") activeStageIdx = 2;
  else if (normStatus === "assigned" || assignedTo) activeStageIdx = 1;

  const STAGES = [
    {
      id: "open",
      title: "1. Incident Logged",
      desc: "Ticket registered & prioritized",
      color: "amber",
    },
    {
      id: "assigned",
      title: "2. Responder Assigned",
      desc: assignedTo?.name ? `Dispatched to ${assignedTo.name}` : "Matching nearest responder",
      color: "indigo",
    },
    {
      id: "in_progress",
      title: "3. In-Progress On-Site",
      desc: "Field intervention active",
      color: "sky",
    },
    {
      id: "resolved",
      title: "4. Resolved & Verified",
      desc: "Hazard mitigated & closed",
      color: "emerald",
    },
  ];

  // Synthesize events if empty
  const safeCreatedAt = createdAt ? new Date(createdAt) : new Date();
  const effectiveUpdates: TimelineUpdate[] =
    updates && updates.length > 0
      ? updates
      : [
          {
            id: "init_auto_event",
            status: "open",
            message: "Incident logged in VANGUARD Rural Routing Engine. Ticket prioritized for verified dispatch.",
            timestamp: safeCreatedAt,
            user: { name: "System Dispatcher", role: "authority" },
          },
        ];

  const getStatusNode = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "resolved":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case "in_progress":
        return (
          <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-sky-500 text-sky-600 flex items-center justify-center shadow-xs relative">
            <PlayCircle className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-500 animate-ping" />
          </div>
        );
      case "assigned":
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-500 text-indigo-600 flex items-center justify-center shadow-xs">
            <UserCheck className="w-4 h-4" />
          </div>
        );
      case "open":
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-600 flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
        );
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const r = role.toLowerCase();
    switch (r) {
      case "authority":
      case "higher_authority":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#262626] text-white">
            Authority
          </span>
        );
      case "worker":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold">
            Worker
          </span>
        );
      case "volunteer":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
            Volunteer
          </span>
        );
      case "citizen":
      default:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-300">
            Citizen
          </span>
        );
    }
  };

  const formatRelativeTime = (timestamp: string | Date) => {
    const d = new Date(timestamp);
    const dateObj = isNaN(d.getTime()) ? new Date() : d;
    const diffMs = Date.now() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleQuickAction = async (status: string) => {
    if (!onStatusChange) return;
    setUpdating(true);
    try {
      await onStatusChange(status, customNote.trim() || undefined);
      setShowNoteInput(false);
      setCustomNote("");
    } catch (err) {
      console.error("Timeline status change error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const canPerformFieldAction =
    onStatusChange &&
    (viewerRole === "volunteer" ||
      viewerRole === "worker" ||
      viewerRole === "authority" ||
      viewerRole === "higher_authority" ||
      viewerRole === "super_admin" ||
      viewerRole === "admin");

  return (
    <div className="space-y-6">
      {/* 4-Stage Lifecycle Stepper Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#707070] mb-4 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          4-Stage Incident Lifecycle Progression
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
          {STAGES.map((stage, idx) => {
            const isCompleted = activeStageIdx > idx;
            const isCurrent = activeStageIdx === idx;

            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-white border-[#262626] shadow-md ring-2 ring-[#262626]/20"
                    : isCompleted
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                    : "bg-[#f9f9f9] border-[#e5e5e5] text-[#a6a6a6]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-[#262626] text-white animate-pulse"
                        : "bg-[#dcdcdc] text-[#707070]"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </span>

                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#262626] text-white">
                      Active Stage
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Completed
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs text-[#262626]">{stage.title}</div>
                <div className="text-[11px] text-[#707070] mt-0.5 line-clamp-1">{stage.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Quick Action Toolbar for Field Responders & Authorities */}
      {canPerformFieldAction && (
        <div className="bg-[#f5f5f5] p-4 rounded-2xl border border-[#dcdcdc] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-[#262626] block">Responder Quick-Action Toolbar</span>
            <span className="text-[#707070]">Transition the lifecycle status directly on this timeline.</span>
          </div>

          <div className="flex items-center gap-2">
            {normStatus !== "in_progress" && normStatus !== "resolved" && (
              <button
                type="button"
                onClick={() => {
                  setTargetActionStatus("in_progress");
                  setShowNoteInput(true);
                }}
                disabled={updating}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Start On-Site Work</span>
              </button>
            )}

            {normStatus !== "resolved" && (
              <button
                type="button"
                onClick={() => {
                  setTargetActionStatus("resolved");
                  setShowNoteInput(true);
                }}
                disabled={updating}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Optional Note Modal/Drawer */}
      {showNoteInput && (
        <div className="p-4 bg-white rounded-2xl border-2 border-[#262626] shadow-lg space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#262626]">
              Append Note for {targetActionStatus.toUpperCase()} Status
            </span>
            <button
              type="button"
              onClick={() => setShowNoteInput(false)}
              className="text-xs text-[#707070] hover:text-[#262626] font-bold"
            >
              Cancel
            </button>
          </div>

          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Arrived on site with replacement valve, power isolated..."
            className="w-full px-3.5 py-2 text-xs border border-[#dcdcdc] rounded-xl focus:border-[#262626] outline-none"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => handleQuickAction(targetActionStatus)}
              disabled={updating}
              className="px-4 py-2 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Confirm &amp; Publish Update</span>
            </button>
          </div>
        </div>
      )}

      {/* Chronological Event History Feed */}
      <div className="relative pl-8 space-y-5 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#dcdcdc]">
        {effectiveUpdates.map((upd, idx) => {
          const d = new Date(upd.timestamp);
          const dateObj = isNaN(d.getTime()) ? new Date() : d;
          const formattedDate = dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const formattedTime = dateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const relativeTime = formatRelativeTime(dateObj);

          return (
            <div key={upd.id || idx} className="relative group animate-in fade-in">
              {/* Node Icon */}
              <div className="absolute -left-8 top-1.5 z-10">{getStatusNode(upd.status)}</div>

              {/* Event Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-xs hover:border-[#a6a6a6] transition-all space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={upd.status} />
                    {upd.user && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#262626]">{upd.user.name}</span>
                        {getRoleBadge(upd.user.role)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#707070] font-mono">
                    <Calendar className="w-3 h-3 text-[#a6a6a6]" />
                    <span>
                      {formattedDate}, {formattedTime}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[#f0f0f0] text-[10px] text-[#262626] font-bold">
                      {relativeTime}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#404040] leading-relaxed font-normal">{upd.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
