"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Phone,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export interface ResourceItemStock {
  name: string;
  statusOrPrice: string;
  badgeType?: "success" | "warning" | "danger" | "neutral";
}

export interface VerifiedResourceCardProps {
  title: string;
  subTitle: string;
  verificationBadge: string;
  distanceKm: number;
  location: string;
  district: string;
  phone: string;
  items: ResourceItemStock[];
  itemSectionTitle: string;
  onReportClick?: () => void;
  reportLabel?: string;
}

export default function VerifiedResourceCard({
  title,
  subTitle,
  verificationBadge,
  distanceKm,
  location,
  district,
  phone,
  items,
  itemSectionTitle,
  onReportClick,
  reportLabel = "Report Discrepancy",
}: VerifiedResourceCardProps) {
  const getBadgeClass = (type?: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
      case "warning":
        return "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
      case "danger":
        return "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700";
    }
  };

  const mapQuery = encodeURIComponent(`${title}, ${location}, ${district}`);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border-2 border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-xl transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{verificationBadge}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold">
            <Navigation className="w-3 h-3 text-sky-600" />
            <span>~{distanceKm} km away</span>
          </span>
        </div>

        {/* Center Title & Info */}
        <h3 className="text-base sm:text-lg font-black text-neutral-950 dark:text-white tracking-tight leading-snug">
          {title}
        </h3>
        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mt-0.5">
          {subTitle}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 mt-2 font-medium">
          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="truncate">{location} ({district})</span>
        </div>

        {/* Item Stock / Pricing Grid */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
            {itemSectionTitle}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${getBadgeClass(
                  item.badgeType
                )}`}
              >
                <span className="font-bold truncate">{item.name}</span>
                <span className="font-black text-xs sm:text-sm mt-0.5">{item.statusOrPrice}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons - Min 48px Height, High Contrast */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-2">
        <a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          className="w-full sm:flex-1 h-12 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Phone className="w-4 h-4" />
          <span>Call: {phone}</span>
        </a>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto h-12 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-neutral-300 dark:border-neutral-700"
        >
          <Navigation className="w-4 h-4 text-sky-600" />
          <span>Directions</span>
        </a>

        {onReportClick && (
          <button
            type="button"
            onClick={onReportClick}
            className="w-full sm:w-auto h-12 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all"
            title="Report overcharging or black marketing"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{reportLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
