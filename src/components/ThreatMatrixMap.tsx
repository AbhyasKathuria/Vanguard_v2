"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  AlertTriangle,
  Flame,
  Zap,
  Activity,
  Droplets,
  Layers,
  Filter,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { VulnerabilityItem } from "@/lib/types";
import { calculateVulnerabilityIndex } from "@/lib/ai/threatEngine";

interface ThreatMatrixMapProps {
  initialThreats?: VulnerabilityItem[];
}

export default function ThreatMatrixMap({ initialThreats = [] }: ThreatMatrixMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [threats, setThreats] = useState<VulnerabilityItem[]>(initialThreats);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedThreat, setSelectedThreat] = useState<VulnerabilityItem | null>(null);

  // Time-to-decay simulator slider (days elapsed)
  const [simulatedDays, setSimulatedDays] = useState<number>(0);

  // Fetch live threats from API if not pre-provided
  const fetchThreats = async () => {
    try {
      const res = await fetch("/api/threats");
      if (res.ok) {
        const data = await res.json();
        if (data.vulnerabilities) {
          setThreats(data.vulnerabilities);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch threat matrix data:", err);
    }
  };

  useEffect(() => {
    if (threats.length === 0) {
      fetchThreats();
    }
  }, []);

  // Filtered threats list with live dynamic decay recalculation
  const filteredThreats = threats
    .filter((t) => {
      if (selectedDistrict !== "all" && t.district !== selectedDistrict) return false;
      if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
      if (selectedStatus !== "all" && t.status !== selectedStatus) return false;
      return true;
    })
    .map((t) => {
      const dynamicIndex = calculateVulnerabilityIndex(
        t.threatScore,
        t.populationDensity,
        simulatedDays > 0 ? simulatedDays : 2,
        t.decayFactor
      );
      return {
        ...t,
        computedRiskIndex: dynamicIndex,
      };
    })
    .sort((a, b) => (b.computedRiskIndex || 0) - (a.computedRiskIndex || 0));

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      try {
        const L = (await import("leaflet")).default;

        // Ensure leaflet css is present
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const defaultCenter = [24.5, 78.5]; // Central North India view
          const map = L.map(mapContainerRef.current, {
            center: defaultCenter as [number, number],
            zoom: 6,
            zoomControl: false,
          });

          L.control.zoom({ position: "topright" }).addTo(map);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            maxZoom: 18,
          }).addTo(map);

          mapInstanceRef.current = map;
          markersLayerRef.current = L.layerGroup().addTo(map);
        }

        // Re-draw markers when filteredThreats changes
        if (markersLayerRef.current && mapInstanceRef.current) {
          markersLayerRef.current.clearLayers();

          const bounds = L.latLngBounds([]);

          filteredThreats.forEach((th) => {
            if (!th.latitude || !th.longitude) return;

            const score = th.computedRiskIndex || th.threatScore;
            const markerColor =
              score >= 85 ? "#dc2626" : score >= 70 ? "#ea580c" : score >= 50 ? "#d97706" : "#16a34a";

            // Pulsing circle marker
            const circle = L.circle([th.latitude, th.longitude], {
              color: markerColor,
              fillColor: markerColor,
              fillOpacity: 0.35,
              radius: (score / 100) * 1200,
            });

            // Dot center
            const centerDot = L.circleMarker([th.latitude, th.longitude], {
              radius: 7,
              color: "#ffffff",
              weight: 2,
              fillColor: markerColor,
              fillOpacity: 1,
            });

            circle.bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
                <b style="color: #111;">${th.title}</b><br/>
                <span style="color: ${markerColor}; font-weight: bold;">Risk Index: ${score}/100</span><br/>
                <span style="color: #666;">${th.location} (${th.district})</span><br/>
                <span style="color: #444; font-size: 11px;">Population Impact: ~${th.affectedEstimate} civilians</span>
              </div>
            `);

            circle.on("click", () => {
              setSelectedThreat(th);
            });
            centerDot.on("click", () => {
              setSelectedThreat(th);
            });

            circle.addTo(markersLayerRef.current);
            centerDot.addTo(markersLayerRef.current);

            bounds.extend([th.latitude, th.longitude]);
          });

          if (filteredThreats.length > 0 && bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
          }
        }
      } catch (e) {
        console.warn("Leaflet threat map load error:", e);
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [filteredThreats.length, selectedDistrict]);

  const getSeverityBadge = (score: number) => {
    if (score >= 85) return "bg-red-600 text-white border-red-700";
    if (score >= 70) return "bg-orange-500 text-white border-orange-600";
    if (score >= 50) return "bg-amber-500 text-white border-amber-600";
    return "bg-emerald-600 text-white border-emerald-700";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-[#262626] text-white p-6 sm:p-8 rounded-3xl border border-[#404040] shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-wider text-[#dcdcdc] border border-white/15 inline-flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#53bdeb]" />
            Civic Threat Matrix
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
            Geographic Risk Heatmap + Time-to-Decay
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Vulnerability &amp; Structural Hazard Matrix
            </h1>
            <p className="text-xs sm:text-sm text-[#a6a6a6] mt-1 max-w-2xl leading-relaxed">
              Real-time spatial risk scoring combining base threat severity, population footfall density, and exponential time-to-decay deterioration rates.
            </p>
          </div>
          <Link
            href="/smart-complaint"
            className="px-4 py-2.5 bg-white hover:bg-[#dcdcdc] text-[#262626] text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pin New Hazard via Vision</span>
          </Link>
        </div>
      </div>

      {/* Filter & Simulator Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* District Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#707070] mb-1">
              Filter by District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#dcdcdc] rounded-xl outline-none bg-[#f5f5f5] text-[#404040]"
            >
              <option value="all">All Districts</option>
              <option value="Rampur">Rampur District (UP)</option>
              <option value="Sitapur">Sitapur District (UP)</option>
              <option value="Mandya">Mandya District (KA)</option>
              <option value="Shivamogga">Shivamogga District (KA)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#707070] mb-1">
              Hazard Domain
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#dcdcdc] rounded-xl outline-none bg-[#f5f5f5] text-[#404040]"
            >
              <option value="all">All Domains</option>
              <option value="Structural">Structural (Bridges, Walls)</option>
              <option value="Electrical">Electrical (Transformers, Grid)</option>
              <option value="Hydrological">Hydrological (Drainage, Leaks)</option>
              <option value="Environmental">Environmental (Erosion, Slopes)</option>
              <option value="Traffic">Traffic (Road Craters, Potholes)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#707070] mb-1">
              Mitigation Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#dcdcdc] rounded-xl outline-none bg-[#f5f5f5] text-[#404040]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Threat</option>
              <option value="inspecting">Under On-Site Inspection</option>
              <option value="mitigated">Mitigated / Secured</option>
            </select>
          </div>
        </div>

        {/* Time-to-Decay Interactive Simulator Slider */}
        <div className="p-3.5 rounded-xl bg-[#f9f9f9] border border-[#dcdcdc] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#262626] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Time-to-Decay Urgency Simulator (Days Left Unaddressed):
            </span>
            <span className="font-mono text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              +{simulatedDays} Days Delay
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={simulatedDays}
            onChange={(e) => setSimulatedDays(Number(e.target.value))}
            className="w-full accent-[#262626] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#707070] font-mono">
            <span>Day 0 (Initial Report)</span>
            <span>Day 15 (+25% Urgency)</span>
            <span>Day 30 (+60% Critical Deterioration)</span>
            <span>Day 60 (Structural Collapse Risk)</span>
          </div>
        </div>
      </div>

      {/* Map & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Map View */}
        <div className="lg:col-span-7 bg-white p-4 rounded-3xl border border-[#dcdcdc] shadow-xs space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707070] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Geographic Hazard Heatmap ({filteredThreats.length} Points)
            </span>
            <span className="text-[11px] text-[#a6a6a6]">OpenStreetMap Live Cluster</span>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-[400px] rounded-2xl overflow-hidden border border-[#dcdcdc] shadow-inner bg-[#eaeaea]"
          />

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#707070] px-2 pt-1 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical (&gt;85)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High (70-84)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate (50-69)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Low (&lt;50)
            </span>
          </div>
        </div>

        {/* Right Hazard Queue Cards */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-[#dcdcdc] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#dcdcdc] pb-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#707070]">
                Prioritized Action Queue
              </span>
              <span className="text-[11px] font-bold text-red-600">Ranked by Threat Index</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredThreats.map((th) => {
                const isSelected = selectedThreat?.id === th.id;
                const score = th.computedRiskIndex || th.threatScore;
                return (
                  <div
                    key={th.id}
                    onClick={() => setSelectedThreat(th)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#262626] text-white border-black shadow-xs"
                        : "bg-[#f9f9f9] hover:bg-[#eaeaea] border-[#dcdcdc]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        isSelected ? "bg-white/20 text-white border-white/30" : "bg-white text-[#404040] border-[#dcdcdc]"
                      }`}>
                        {th.category}
                      </span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${getSeverityBadge(score)}`}>
                        {score}/100
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-[#262626]"}`}>
                      {th.title}
                    </h4>
                    <p className={`text-[11px] mt-1 ${isSelected ? "text-[#dcdcdc]" : "text-[#707070]"}`}>
                      📍 {th.location} ({th.district})
                    </p>

                    <div className="flex items-center justify-between text-[10px] opacity-75 mt-2 pt-1 border-t border-current/10">
                      <span>👥 ~{th.affectedEstimate} civilians affected</span>
                      <span className="capitalize">{th.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Threat Detailed Mitigation Drawer */}
          {selectedThreat && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Proposed Mitigation Plan
                </span>
                <span className="text-[10px] font-mono text-amber-800">
                  Decay Rate: {selectedThreat.decayFactor}x/mo
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                {selectedThreat.mitigationPlan || "Engineering survey and perimeter barricade deployment required."}
              </p>
              <button
                type="button"
                onClick={() => alert(`Mobilizing engineering inspection squad for: ${selectedThreat.title}`)}
                className="w-full py-1.5 px-3 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Deploy Civil Mitigation Squad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
