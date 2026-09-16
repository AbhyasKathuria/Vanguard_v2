import React from "react";
import { RequestPriority } from "@/lib/types";

interface PriorityBadgeProps {
  priority: RequestPriority | string;
  className?: string;
}

export default function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const norm = priority.toLowerCase();

  switch (norm) {
    case "high":
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#404040] text-white border border-[#262626] ${className}`}
        >
          High Priority
        </span>
      );
    case "medium":
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-[#dcdcdc] text-[#404040] border border-[#a6a6a6] ${className}`}
        >
          Medium
        </span>
      );
    case "low":
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-[#f5f5f5] text-[#707070] border border-[#dcdcdc] ${className}`}
        >
          Low
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f5f5f5] text-[#404040] border border-[#dcdcdc] ${className}`}>
          {priority}
        </span>
      );
  }
}
