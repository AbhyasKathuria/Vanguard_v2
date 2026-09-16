"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, PhoneCall, ShieldAlert, HeartPulse } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception details for telemetry
    console.error("[VANGUARD Global Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border-2 border-red-600/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              VANGUARD Emergency Safe-Mode
            </span>
            <h1 className="text-xl font-black text-white">Something went wrong</h1>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          A client-side exception occurred while rendering this view. Your emergency reporting channels and direct helplines remain active below.
        </p>

        {/* 1-Tap Emergency Helplines (Never a Dead-End) */}
        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4 space-y-3">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
            Direct Emergency Lines (1-Tap Call)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:112"
              className="py-2.5 px-3 bg-red-900/60 hover:bg-red-800 border border-red-700 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-300" />
              <span>112 Emergency</span>
            </a>
            <a
              href="tel:108"
              className="py-2.5 px-3 bg-rose-900/60 hover:bg-rose-800 border border-rose-700 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-300" />
              <span>108 Ambulance</span>
            </a>
            <a
              href="tel:100"
              className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>100 Police</span>
            </a>
            <a
              href="tel:1962"
              className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>1962 Animal SOS</span>
            </a>
          </div>
        </div>

        {/* Recovery Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-white hover:bg-neutral-200 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload &amp; Retry</span>
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {/* Technical Diagnostics (Collapsible) */}
        {error && (
          <details className="text-[11px] text-neutral-500 font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 cursor-pointer">
            <summary className="font-semibold text-neutral-400 hover:text-neutral-300">
              Technical Error Details {error.digest ? `(Digest: ${error.digest.slice(0, 8)})` : ""}
            </summary>
            <div className="mt-2 text-red-400/90 whitespace-pre-wrap break-all text-[10px] overflow-x-auto max-h-36">
              {error.message || "Unknown error"}
              {error.stack && `\n\n${error.stack}`}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
