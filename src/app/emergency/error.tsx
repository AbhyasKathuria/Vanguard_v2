"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Siren, RefreshCw, Home, PhoneCall, HeartPulse } from "lucide-react";

export default function EmergencyRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[VANGUARD Emergency Route Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg animate-bounce">
            <Siren className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              Emergency Services Safe-Fallback
            </span>
            <h1 className="text-xl font-black">Emergency Module Recovery</h1>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          The emergency interface encountered a rendering disruption. Your life-safety lines are available below with single-tap direct connection.
        </p>

        {/* Immediate Helpline Dispatch */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
          <a
            href="tel:108"
            className="p-3 bg-red-600 hover:bg-red-500 rounded-xl font-black text-xs text-white flex flex-col items-center justify-center gap-1.5 transition-all text-center shadow-md"
          >
            <HeartPulse className="w-5 h-5 text-white" />
            <span>108 Ambulance</span>
            <span className="text-[10px] font-normal text-red-100">Medical Trauma</span>
          </a>
          <a
            href="tel:112"
            className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-black text-xs text-white flex flex-col items-center justify-center gap-1.5 transition-all text-center border border-neutral-700"
          >
            <PhoneCall className="w-5 h-5 text-red-400" />
            <span>112 All Emergency</span>
            <span className="text-[10px] font-normal text-neutral-400">National Dispatch</span>
          </a>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-white hover:bg-neutral-200 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Emergency Interface</span>
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {error && (
          <details className="text-[10px] text-neutral-500 font-mono bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 cursor-pointer">
            <summary className="font-semibold text-neutral-400">Error diagnostic details</summary>
            <div className="mt-2 text-red-400 break-all whitespace-pre-wrap">
              {error.message}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
