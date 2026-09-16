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
  Navigation,
  Loader2,
  AlertCircle,
  RefreshCw,
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
  const userMarkerRef = useRef<any>(null);

  const [threats, setThreats] = useState<VulnerabilityItem[]>(initialThreats);
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedThreat, setSelectedThreat] = useState<VulnerabilityItem | null>(null);

  // Time-to-decay simulator slider (days elapsed)
  const [simulatedDays, setSimulatedDays] = useState<number>(0);

  // Geolocation
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch live threats from API
  const fetchThreats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/threats");
      if (res.ok) {
        const data = await res.json();
        if (data.vulnerabilities) {
          setThreats(data.vulnerabilities);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch threat matrix data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (threats.length === 0) {
      fetchThreats();
    }
  }, []);

  // Current GPS location
  const handleGetCurrentLocation = () => {
    setLocationError(null);
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;

        if (mapInstanceRef.current) {
          const L = (await import("leaflet")).default;
          mapInstanceRef.current.setView([latitude, longitude], 15);

          if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
          }

          const pulseIcon = L.divIcon({
            className: "custom-threat-user-pulse",
            html: `
              <div style="position: relative; width: 26px; height: 26px;">
                <div style="position: absolute; inset: -10px; border-radius: 9999px; background: rgba(0, 113, 227, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="width: 26px; height: 26px; border-radius: 9999px; background: #0071E3; border: 3.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);"></div>
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([latitude, longitude], { icon: pulseIcon }).addTo(mapInstanceRef.current);
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; font-weight: bold; color: #111; padding: 3px;">
              📍 You Are Here • आपका वर्तमान स्थान<br/>
              <span style="font-size: 11px; font-weight: normal; color: #555;">
                GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
              </span>
            </div>
          `).openPopup();

          userMarkerRef.current = marker;
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please allow location access in browser settings.");
        } else {
          setLocationError("Could not detect GPS position. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

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

        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const defaultCenter = [24.5, 78.5];
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

        if (markersLayerRef.current && mapInstanceRef.current) {
          markersLayerRef.current.clearLayers();

          const bounds = L.latLngBounds([]);

          filteredThreats.forEach((th) => {
            if (!th.latitude || !th.longitude) return;

            const score = th.computedRiskIndex || th.threatScore;
            const markerColor =
              score >= 85 ? "#dc2626" : score >= 70 ? "#ea580c" : score >= 50 ? "#d97706" : "#16a34a";

            const circle = L.circle([th.latitude, th.longitude], {
              color: markerColor,
              fillColor: markerColor,
              fillOpacity: 0.35,
              radius: (score / 100) * 1200,
            });

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
      <div className="bg-[#1f1f1f] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-neutral-200 border border-white/15 inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            Civic Threat Matrix
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            Live Records Only
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Vulnerability &amp; Structural Hazard Matrix
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              Real-time spatial risk scoring combining base threat severity, population footfall density, and exponential time-to-decay deterioration rates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={locating}
              className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-black text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              ) : (
                <Navigation className="w-4 h-4 text-sky-600 fill-sky-600" />
              )}
              <span>{locating ? "Locating..." : "📍 My Location"}</span>
            </button>

            <Link
              href="/smart-complaint"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Pin Hazard</span>
            </Link>
          </div>
        </div>
      </div>

      {locationError && (
        <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{locationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-amber-300 hover:text-white font-bold text-xs cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter & Simulator Controls Bar */}
      <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 shadow-sm space-y-4 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Filter by District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-neutral-700 rounded-xl outline-none bg-neutral-950 text-white focus:border-sky-500"
            >
              <option value="all">All Districts</option>
              <option value="Rampur">Rampur District (UP)</option>
              <option value="Sitapur">Sitapur District (UP)</option>
              <option value="Mandya">Mandya District (KA)</option>
              <option value="Shivamogga">Shivamogga District (KA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Hazard Domain
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-neutral-700 rounded-xl outline-none bg-neutral-950 text-white focus:border-sky-500"
            >
              <option value="all">All Domains</option>
              <option value="Structural">Structural (Bridges, Walls)</option>
              <option value="Electrical">Electrical (Transformers, Grid)</option>
              <option value="Hydrological">Hydrological (Drainage, Leaks)</option>
              <option value="Environmental">Environmental (Erosion, Slopes)</option>
              <option value="Traffic">Traffic (Road Craters, Potholes)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Mitigation Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-neutral-700 rounded-xl outline-none bg-neutral-950 text-white focus:border-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Threat</option>
              <option value="inspecting">Under On-Site Inspection</option>
              <option value="mitigated">Mitigated / Secured</option>
            </select>
          </div>
        </div>

        {/* Time-to-Decay Interactive Simulator Slider */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Time-to-Decay Urgency Simulator (Days Left Unaddressed):
            </span>
            <span className="font-mono text-xs font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
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
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
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
        <div className="lg:col-span-7 bg-neutral-900 p-4 rounded-3xl border border-neutral-800 shadow-sm space-y-3 relative">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Live Hazard Map ({filteredThreats.length} Points)
            </span>
            <button
              type="button"
              onClick={fetchThreats}
              className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-[400px] rounded-2xl overflow-hidden border border-neutral-800 shadow-inner bg-neutral-950 relative"
          />

          {/* Clean Empty State */}
          {!loading && filteredThreats.length === 0 && (
            <div className="absolute inset-x-8 top-28 z-20 max-w-sm mx-auto p-5 rounded-2xl bg-black/90 border border-neutral-700 text-center shadow-2xl backdrop-blur-md space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-bold text-white">All Structures Normal</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                No active vulnerabilities or structural decay threats recorded in {selectedDistrict === "all" ? "the monitored areas" : `${selectedDistrict} District`}.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-400 px-2 pt-1 gap-2">
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
        <div className="lg:col-span-5 bg-neutral-900 p-5 rounded-3xl border border-neutral-800 shadow-sm space-y-4 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Prioritized Action Queue
              </span>
              <span className="text-[11px] font-bold text-rose-400">Live DB Records</span>
            </div>

            {filteredThreats.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-white">Zero Active Threats</p>
                <p>No critical civic infrastructure issues require immediate mitigation.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {filteredThreats.map((th) => {
                  const score = th.computedRiskIndex || th.threatScore;
                  const isSelected = selectedThreat?.id === th.id;

                  return (
                    <div
                      key={th.id}
                      onClick={() => {
                        setSelectedThreat(th);
                        if (th.latitude && th.longitude && mapInstanceRef.current) {
                          mapInstanceRef.current.panTo([th.latitude, th.longitude]);
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-neutral-800 border-sky-500 shadow-md"
                          : "bg-neutral-950 hover:bg-neutral-850 border-neutral-800 text-neutral-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-black text-white line-clamp-1">{th.title}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${getSeverityBadge(
                            score
                          )}`}
                        >
                          {score.toFixed(0)} / 100
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                        <MapPin className="w-3 h-3 text-neutral-500" />
                        <span className="truncate">
                          {th.location} ({th.district})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Dynamic Decay: exponential</span>
            <span className="font-bold text-white">VANGUARD AI Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
