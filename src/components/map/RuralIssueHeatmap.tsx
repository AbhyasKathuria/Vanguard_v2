"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  AlertTriangle,
  Zap,
  Droplets,
  Activity,
  Layers,
  Filter,
  CheckCircle2,
  Navigation,
  Loader2,
  Siren,
  Maximize2,
  Minimize2,
  Compass,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface HeatmapIncident {
  id: string;
  title: string;
  category: string;
  priority?: string;
  urgency: string;
  riskScore: number;
  location: string;
  village?: string | null;
  panchayat?: string | null;
  block?: string | null;
  district: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string | Date;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; label: string; icon: string }> = {
  water: { bg: "#0284c7", border: "#38bdf8", label: "Drinking Water", icon: "💧" },
  electricity: { bg: "#eab308", border: "#fde047", label: "Electricity Grid", icon: "⚡" },
  health: { bg: "#dc2626", border: "#f87171", label: "Health / Medical", icon: "🏥" },
  roads: { bg: "#ea580c", border: "#fb923c", label: "Roads & Bridges", icon: "🛣️" },
  agriculture: { bg: "#16a34a", border: "#4ade80", label: "Agriculture / Cattle", icon: "🌾" },
  other: { bg: "#8b5cf6", border: "#c4b5fd", label: "Civic / Sanitation", icon: "🏛️" },
};

function getCategoryTheme(category: string) {
  const c = (category || "").toLowerCase();
  if (c.includes("water") || c.includes("paani") || c.includes("pipe")) return CATEGORY_COLORS.water;
  if (c.includes("electr") || c.includes("bijli") || c.includes("wire") || c.includes("power"))
    return CATEGORY_COLORS.electricity;
  if (c.includes("health") || c.includes("medic") || c.includes("swasthya") || c.includes("ambulance"))
    return CATEGORY_COLORS.health;
  if (c.includes("road") || c.includes("sadak") || c.includes("bridge") || c.includes("pothole"))
    return CATEGORY_COLORS.roads;
  if (c.includes("agri") || c.includes("crop") || c.includes("cattle") || c.includes("kisan") || c.includes("farmer"))
    return CATEGORY_COLORS.agriculture;
  return CATEGORY_COLORS.other;
}

export default function RuralIssueHeatmap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [incidents, setIncidents] = useState<HeatmapIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<HeatmapIncident | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // GPS Current Location State
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch strictly live incidents from API (ZERO seed/demo fallback)
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        const items: HeatmapIncident[] = (data.complaints || [])
          .filter((c: any) => c.latitude && c.longitude)
          .map((c: any) => ({
            id: c.id,
            title: c.title,
            category: c.category || "General",
            priority: c.priority || "Normal",
            urgency: c.urgency || "Moderate",
            riskScore: c.riskScore || 50,
            location: c.location,
            village: c.village,
            panchayat: c.panchayat,
            block: c.block,
            district: c.district || "Rampur",
            latitude: parseFloat(c.latitude),
            longitude: parseFloat(c.longitude),
            status: c.status || "submitted",
            createdAt: c.createdAt,
          }));

        setIncidents(items);
      } else {
        setIncidents([]);
      }
    } catch (err) {
      console.warn("Could not load live complaints:", err);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // GPS Current Location Action
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

          // Pulsing user indicator
          const pulseIcon = L.divIcon({
            className: "custom-user-gps-pulse",
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
          setLocationError("Location permission denied. Please enable GPS / location permissions in your browser to pinpoint your village.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("GPS signal unavailable. Please ensure location services are enabled on your device.");
        } else {
          setLocationError("Could not retrieve current location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (selectedDistrict !== "all" && inc.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (selectedCategory !== "all") {
      const theme = getCategoryTheme(inc.category);
      if (theme !== CATEGORY_COLORS[selectedCategory]) return false;
    }
    return true;
  });

  // Initialize and update MapTiler / Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isCancelled = false;

    async function initMap() {
      try {
        const L = (await import("leaflet")).default;

        // Leaflet CSS check
        if (!document.getElementById("leaflet-heatmap-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-heatmap-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (isCancelled || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [24.5, 78.5],
            zoom: 6,
            zoomControl: false,
          });

          L.control.zoom({ position: "topright" }).addTo(map);

          // MapTiler key
          const maptilerUrl =
            "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=FFz6XYIUl8sR73ixvbvM";

          const tileLayer = L.tileLayer(maptilerUrl, {
            attribution:
              '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            maxZoom: 19,
          });

          tileLayer.on("tileerror", () => {
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              maxZoom: 19,
            }).addTo(map);
          });

          tileLayer.addTo(map);

          mapInstanceRef.current = map;
          markersLayerRef.current = L.layerGroup().addTo(map);
        }

        // Draw markers
        if (markersLayerRef.current && mapInstanceRef.current) {
          markersLayerRef.current.clearLayers();
          const bounds = L.latLngBounds([]);

          filteredIncidents.forEach((inc) => {
            if (!inc.latitude || !inc.longitude) return;

            const theme = getCategoryTheme(inc.category);
            const isHighRisk = (inc.riskScore || 50) >= 80;

            const circle = L.circleMarker([inc.latitude, inc.longitude], {
              radius: isHighRisk ? 12 : 9,
              color: theme.border,
              fillColor: theme.bg,
              fillOpacity: 0.85,
              weight: 3,
            });

            if (isHighRisk) {
              const pulse = L.circle([inc.latitude, inc.longitude], {
                radius: 400,
                color: theme.bg,
                fillColor: theme.bg,
                fillOpacity: 0.15,
                weight: 1,
              });
              pulse.addTo(markersLayerRef.current);
            }

            circle.on("click", () => {
              setSelectedIncident(inc);
              mapInstanceRef.current?.panTo([inc.latitude, inc.longitude]);
            });

            circle.addTo(markersLayerRef.current);
            bounds.extend([inc.latitude, inc.longitude]);
          });

          if (bounds.isValid() && filteredIncidents.length > 0) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
          }
        }
      } catch (err) {
        console.error("Leaflet initialization error:", err);
      }
    }

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [filteredIncidents]);

  // 1-Click Proximity Auto-Dispatch
  const handleAutoDispatch = async (incident: HeatmapIncident) => {
    try {
      setDispatchingId(incident.id);
      setDispatchSuccess(null);

      const res = await fetch("/api/emergency/auto-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId: incident.id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchSuccess(
          `Dispatched to ${data.assignedTo?.name || "Responder"} (${data.assignedTo?.distanceKm} km away)`
        );
      } else {
        alert(data.error || "Auto-dispatch could not match available responders in range.");
      }
    } catch (err) {
      console.error("Dispatch error:", err);
      alert("Network error triggering auto-dispatch.");
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div
      className={`relative bg-[#171717] rounded-3xl border border-white/10 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "w-full"
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-[#262626] border-b border-white/10 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Rural Issue &amp; Emergency Map
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                Live Data Only
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Live spatial records from citizen filings • Zero mock/demo records
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dedicated High-Contrast "Current Location" Button */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={locating}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-black font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60"
            title="Center map on my current GPS location"
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
            )}
            <span>{locating ? "Locating..." : "📍 My Location • मेरा स्थान"}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#171717] border border-white/20 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Districts</option>
            <option value="Rampur">Rampur District</option>
            <option value="Sitapur">Sitapur District</option>
            <option value="Mandya">Mandya District</option>
            <option value="Shivamogga">Shivamogga District</option>
          </select>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Location Error Alert Banner */}
      {locationError && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{locationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-amber-300 hover:text-white font-bold text-xs cursor-pointer ml-4"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* Thematic Category Filter Bar */}
      <div className="bg-[#1f1f1f] border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Categories:
        </span>
        <button
          onClick={() => setSelectedCategory("all")}
          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
            selectedCategory === "all"
              ? "bg-white text-black shadow-xs"
              : "bg-white/5 text-neutral-300 hover:bg-white/10"
          }`}
        >
          All ({incidents.length})
        </button>
        {Object.entries(CATEGORY_COLORS).map(([key, theme]) => {
          const count = incidents.filter((i) => getCategoryTheme(i.category) === theme).length;
          const isActive = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                isActive
                  ? "text-white shadow-xs"
                  : "text-neutral-300 hover:bg-white/10 border-transparent"
              }`}
              style={{
                backgroundColor: isActive ? theme.bg : "rgba(255,255,255,0.04)",
                borderColor: isActive ? theme.border : "transparent",
              }}
            >
              <span>{theme.icon}</span>
              <span>{theme.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[520px] bg-neutral-900">
        <div ref={mapContainerRef} className="w-full h-full" />

        {loading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10 text-white gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            <span className="text-xs font-bold">Synchronizing live incidents from database...</span>
          </div>
        )}

        {/* Clean Empty State: Zero Incidents in Sector */}
        {!loading && filteredIncidents.length === 0 && (
          <div className="absolute inset-x-4 top-6 z-20 max-w-md mx-auto p-5 rounded-3xl bg-black/90 border border-neutral-700 text-center shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-white">
                All Clear — No Active Incidents Reported
              </h4>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                There are no open emergency incidents or critical complaints recorded in {selectedDistrict === "all" ? "any district" : `${selectedDistrict} District`}. Live citizen reports will appear here automatically.
              </p>
            </div>
            <div className="pt-1">
              <Link
                href="/citizen/new-request"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-md transition-all"
              >
                <span>Report an Issue or Emergency</span>
              </Link>
            </div>
          </div>
        )}

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-xs text-neutral-200 shadow-xl max-w-xs hidden sm:block">
          <div className="font-bold text-white mb-1.5 flex items-center justify-between">
            <span>Incident Categories</span>
            <span className="text-[10px] text-neutral-400">MapTiler Engine</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#0284c7] inline-block" />
              <span>Drinking Water</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#eab308] inline-block" />
              <span>Electricity Grid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#dc2626] inline-block" />
              <span>Health / Medical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ea580c] inline-block" />
              <span>Roads & Bridges</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="w-3 h-3 rounded-full bg-[#16a34a] inline-block" />
              <span>Agriculture / Canal Triage</span>
            </div>
          </div>
        </div>

        {/* Selected Incident Drawer / Modal */}
        {selectedIncident && (
          <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 bg-black/95 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl text-white animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCategoryTheme(selectedIncident.category).icon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                    {selectedIncident.category}
                  </span>
                  <span
                    className={`ml-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      selectedIncident.urgency === "Critical"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {selectedIncident.urgency}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-neutral-400 hover:text-white text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-black text-white leading-snug mb-1">
              {selectedIncident.title}
            </h4>

            <div className="space-y-1 text-xs text-neutral-300 mb-3">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">
                  {selectedIncident.location} ({selectedIncident.district})
                </span>
              </div>
              {selectedIncident.village && (
                <div className="text-[11px] text-neutral-400 pl-5">
                  Village: {selectedIncident.village} • GP: {selectedIncident.panchayat || "N/A"}
                </div>
              )}
            </div>

            {/* Auto-Dispatch Action */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {dispatchSuccess ? (
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{dispatchSuccess}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAutoDispatch(selectedIncident)}
                  disabled={dispatchingId === selectedIncident.id}
                  className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {dispatchingId === selectedIncident.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Routing Nearest Responder...</span>
                    </>
                  ) : (
                    <>
                      <Siren className="w-4 h-4" />
                      <span>1-Click Auto-Dispatch Responder</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
