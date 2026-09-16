"use client";

import React, { useState } from "react";
import ThreatMatrixMap from "@/components/ThreatMatrixMap";
import RuralIssueHeatmap from "@/components/map/RuralIssueHeatmap";
import VillageHealthMatrix from "@/components/dashboard/VillageHealthMatrix";
import { Layers, Activity, ShieldCheck, MapPin } from "lucide-react";

export default function GeospatialCommandCenter() {
  const [activeTab, setActiveTab] = useState<"heatmap" | "health_matrix" | "vulnerability">("heatmap");

  return (
    <div className="space-y-6">
      {/* Top Selector Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1f1f1f] p-2 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "heatmap"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>MapTiler Thematic Clusters</span>
          </button>

          <button
            onClick={() => setActiveTab("health_matrix")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "health_matrix"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Village Health Matrix (RAG)</span>
          </button>

          <button
            onClick={() => setActiveTab("vulnerability")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "vulnerability"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Decay &amp; Threat Matrix</span>
          </button>
        </div>

        <div className="text-xs text-neutral-400 pr-3 hidden sm:block">
          District Operations Command • MapTiler Engine
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "heatmap" && <RuralIssueHeatmap />}
      {activeTab === "health_matrix" && <VillageHealthMatrix />}
      {activeTab === "vulnerability" && <ThreatMatrixMap />}
    </div>
  );
}
