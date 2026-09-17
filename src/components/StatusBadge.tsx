"use client";

import React from "react";
import { RequestStatus } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";

interface StatusBadgeProps {
  status: RequestStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { t } = useLanguage();
  const norm = (status || "").toLowerCase();

  switch (norm) {
    case "open":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f5f5] text-[#404040] border border-[#dcdcdc] shadow-2xs ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#707070] mr-1.5 animate-pulse"></span>
          {t.common.open || "Open"}
        </span>
      );
    case "assigned":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dcdcdc] text-[#262626] border border-[#a6a6a6] shadow-2xs ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#404040] mr-1.5"></span>
          {t.common.assigned || "Assigned"}
        </span>
      );
    case "in_progress":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#707070] text-white border border-[#404040] shadow-2xs ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse"></span>
          {t.common.inProgress || "In Progress"}
        </span>
      );
    case "resolved":
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#404040] text-white border border-[#262626] shadow-2xs ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#a6a6a6] mr-1.5"></span>
          {t.common.resolved || "Resolved"}
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f5f5] text-[#404040] border border-[#dcdcdc] ${className}`}
        >
          {status}
        </span>
      );
  }
}
