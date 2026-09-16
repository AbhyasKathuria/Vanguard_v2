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

// Fallback seed incidents if API is empty
const SEED_INCIDENTS: HeatmapIncident[] = [
  {
    id: "cm_w1",
    title: "Primary Borewell Pump Coil Burnout",
    category: "Water",
    urgency: "Critical",
    riskScore: 92,
    location: "Ward 3, Dhamora",
    village: "Dhamora",
    panchayat: "Dhamora GP",
    block: "Milak",
    district: "Rampur",
    latitude: 28.8154,
    longitude: 79.025,
    status: "submitted",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cm_e1",
    title: "11kV High Tension Wire Snapped on Grazing Field",
    category: "Electricity",
    urgency: "Critical",
    riskScore: 98,
    location: "Canal Bank, Saifni",
    village: "Saifni",
    panchayat: "Saifni GP",
    block: "Shahabad",
    district: "Rampur",
    latitude: 28.5667,
    longitude: 79.0167,
    status: "in_investigation",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cm_h1",
    title: "PHC Antivenom Stock Exhausted (Snakebite Risk)",
    category: "Health",
    urgency: "Critical",
    riskScore: 89,
    location: "Main Market, Maholi",
    village: "Maholi",
    panchayat: "Maholi Dehat GP",
    block: "Maholi",
    district: "Sitapur",
    latitude: 27.5656,
    longitude: 80.6829,
    status: "submitted",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cm_r1",
    title: "Bridge Culvert Parapet Collapsed into River",
    category: "Roads",
    urgency: "High",
    riskScore: 78,
    location: "Maddur Link Bridge, Besagarahalli",
    village: "Besagarahalli",
    panchayat: "Besagarahalli GP",
    block: "Maddur",
    district: "Mandya",
    latitude: 12.5234,
    longitude: 76.8973,
    status: "submitted",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cm_a1",
    title: "Canal Sluice Gate Jammed — Waterlogging Paddy Fields",
    category: "Agriculture",
    urgency: "High",
    riskScore: 84,
    location: "North Distributary, Holehonnur",
    village: "Holehonnur",
    panchayat: "Holehonnur GP",
    block: "Bhadravati",
    district: "Shivamogga",
    latitude: 13.9299,
    longitude: 75.5681,
    status: "in_investigation",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cm_w2",
    title: "Ruptured Drinking Water Pipeline — Water Contamination",
    category: "Water",
    urgency: "High",
    riskScore: 75,
    location: "Sector 4, Rampur City",
    village: "Civil Lines",
    district: "Rampur",
    latitude: 28.821,
    longitude: 79.031,
    status: "submitted",
    createdAt: new Date().toISOString(),
  },
];

export default function RuralIssueHeatmap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [incidents, setIncidents] = useState<HeatmapIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<HeatmapIncident | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Fetch incidents
  useEffect(() => {
    async function loadData() {
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

          if (items.length > 0) {
            setIncidents(items);
          } else {
            setIncidents(SEED_INCIDENTS);
          }
        } else {
          setIncidents(SEED_INCIDENTS);
        }
      } catch (err) {
        console.warn("Using fallback seed incidents:", err);
        setIncidents(SEED_INCIDENTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

          // MapTiler key: FFz6XYIUl8sR73ixvbvM
          const maptilerUrl =
            "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=FFz6XYIUl8sR73ixvbvM";

          const tileLayer = L.tileLayer(maptilerUrl, {
            attribution:
              '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            maxZoom: 19,
          });

          tileLayer.on("tileerror", () => {
            // Fallback to OSM if key rate-limits
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

            // Circle marker with thematic color
            const circle = L.circleMarker([inc.latitude, inc.longitude], {
              radius: isHighRisk ? 12 : 9,
              color: theme.border,
              fillColor: theme.bg,
              fillOpacity: 0.85,
              weight: 3,
            });

            // Outer pulsing ring for critical/emergency
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
        body: JSON.stringify({
          incidentId: incident.id,
          latitude: incident.latitude,
          longitude: incident.longitude,
          type: "complaint",
        }),
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
      className={`relative bg-[#171717] rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "w-full"
      }`}
    >
      {/* Header bar */}
      <div className="bg-[#262626] border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Rural Thematic Issue Heatmap
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                MapTiler High-Res
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Thematic clustering by civil infrastructure & emergency domains
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* District filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#171717] border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Districts</option>
            <option value="Rampur">Rampur</option>
            <option value="Sitapur">Sitapur</option>
            <option value="Mandya">Mandya</option>
            <option value="Shivamogga">Shivamogga</option>
          </select>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Thematic Category Filter Bar */}
      <div className="bg-[#1f1f1f] border-b border-white/10 px-4 py-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Categories:
        </span>
        <button
          onClick={() => setSelectedCategory("all")}
          className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${
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
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 transition-colors border ${
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

      {/* Map canvas */}
      <div className="relative w-full h-[520px] bg-neutral-900">
        <div ref={mapContainerRef} className="w-full h-full" />

        {loading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10 text-white gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            <span className="text-xs font-bold">Rendering MapTiler clusters...</span>
          </div>
        )}

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-black/85 backdrop-blur-md border border-white/10 rounded-xl p-3 text-xs text-neutral-200 shadow-xl max-w-xs hidden sm:block">
          <div className="font-bold text-white mb-1.5 flex items-center justify-between">
            <span>Thematic Legend</span>
            <span className="text-[10px] text-neutral-400">MapTiler Leaflet</span>
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
              <span>Health / PHC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ea580c] inline-block" />
              <span>Roads & Bridges</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="w-3 h-3 rounded-full bg-[#16a34a] inline-block" />
              <span>Agriculture / Cattle Triage</span>
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
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {selectedIncident.urgency}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <h4 className="font-bold text-sm text-white leading-snug mb-2">{selectedIncident.title}</h4>

            <div className="space-y-1.5 text-xs text-neutral-300 mb-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Location:</span>
                <span className="font-semibold text-white truncate max-w-[180px]">
                  {selectedIncident.village ? `${selectedIncident.village}, ` : ""}
                  {selectedIncident.district}
                </span>
              </div>
              {selectedIncident.panchayat && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Panchayat / Block:</span>
                  <span className="font-mono text-neutral-300">
                    {selectedIncident.panchayat} / {selectedIncident.block}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Risk Score:</span>
                <span
                  className={`font-black ${
                    selectedIncident.riskScore >= 80 ? "text-red-400" : "text-amber-400"
                  }`}
                >
                  {selectedIncident.riskScore} / 100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">GPS Coordinates:</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {selectedIncident.latitude?.toFixed(4)}, {selectedIncident.longitude?.toFixed(4)}
                </span>
              </div>
            </div>

            {dispatchSuccess && (
              <div className="mb-3 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dispatchSuccess}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAutoDispatch(selectedIncident)}
                disabled={dispatchingId === selectedIncident.id}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-red-600/30"
              >
                {dispatchingId === selectedIncident.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Siren className="w-3.5 h-3.5" />
                )}
                <span>Auto-Dispatch</span>
              </button>

              <Link
                href={`/citizen/request/${selectedIncident.id}`}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center transition-colors"
              >
                View Incident
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
