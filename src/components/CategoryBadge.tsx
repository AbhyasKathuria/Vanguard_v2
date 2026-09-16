import React from "react";
import { RequestCategory } from "@/lib/types";
import { HeartPulse, Wrench, Siren, Sprout, Layers } from "lucide-react";

interface CategoryBadgeProps {
  category: RequestCategory | string;
  className?: string;
  showIcon?: boolean;
}

export default function CategoryBadge({ category, className = "", showIcon = true }: CategoryBadgeProps) {
  const norm = category.toLowerCase();

  const getDetails = () => {
    switch (norm) {
      case "health":
        return {
          label: "Health",
          icon: HeartPulse,
          style: "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] font-semibold",
        };
      case "civic":
        return {
          label: "Civic / Infra",
          icon: Wrench,
          style: "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] font-semibold",
        };
      case "emergency":
        return {
          label: "Emergency",
          icon: Siren,
          style: "bg-[#404040] text-white border-[#262626] font-bold shadow-2xs",
        };
      case "farming":
        return {
          label: "Farming / Agri",
          icon: Sprout,
          style: "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] font-medium",
        };
      default:
        return {
          label: "Other",
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
