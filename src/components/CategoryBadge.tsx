"use client";

import React from "react";
import { RequestCategory } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";
import { HeartPulse, Wrench, Siren, Sprout, Layers } from "lucide-react";

interface CategoryBadgeProps {
  category: RequestCategory | string;
  className?: string;
  showIcon?: boolean;
}

export default function CategoryBadge({ category, className = "", showIcon = true }: CategoryBadgeProps) {
  const { t } = useLanguage();
  const norm = (category || "").toLowerCase();

  const getDetails = () => {
    switch (norm) {
      case "health":
        return {
          label: t.common.categories?.health || "Health",
          icon: HeartPulse,
          style: "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] font-semibold",
        };
      case "civic":
        return {
          label: t.common.categories?.civic || "Civic / Infra",
          icon: Wrench,
          style: "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] font-semibold",
        };
      case "emergency":
        return {
          label: t.common.categories?.emergency || "Emergency",
          icon: Siren,
          style: "bg-[#404040] text-white border-[#262626] font-bold shadow-2xs",
        };
      case "farming":
        return {
          label: t.common.categories?.farming || "Farming / Agri",
          icon: Sprout,
          style: "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] font-medium",
        };
      default:
        return {
          label: t.common.categories?.other || "Other",
          icon: Layers,
          style: "bg-[#f5f5f5] text-[#707070] border-[#dcdcdc]",
        };
    }
  };

  const { label, icon: Icon, style } = getDetails();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${style} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {label}
    </span>
  );
}
