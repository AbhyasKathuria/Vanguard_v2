"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Layers,
  Compass,
  Clock,
  Loader2,
  Route as RouteIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { RouteOption } from "@/lib/types";

export interface MapCoordinate {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapMarkerItem {
  id?: string;
  lat: number;
  lng: number;
  title: string;
  category?: string;
  severity?: "Critical" | "High" | "Moderate" | "Low" | string;
  subtitle?: string;
}

interface MapViewProps {
  origin?: MapCoordinate;
  destination?: MapCoordinate;
  markers?: MapMarkerItem[];
  height?: string;
  mapTilerKey?: string;
  showRoutingControls?: boolean;
  className?: string;
  onMarkerSelect?: (marker: MapMarkerItem) => void;
}

type TileType = "osm" | "maptiler_streets" | "maptiler_hybrid";

export default function MapView({
  origin = { lat: 28.8154, lng: 79.025, label: "Rampur Central Hub" },
  destination = { lat: 28.825, lng: 79.035, label: "Incident Site (Kosi River)" },
  markers = [],
  height = "420px",
  mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || "",
  showRoutingControls = true,
  className = "",
  onMarkerSelect,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const routeLayersRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);

  const [activeTile, setActiveTile] = useState<TileType>("osm");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // 1. Fetch OSRM Turn-by-Turn Route
  const fetchOsrmRoutes = async () => {
    if (!origin || !destination) return;
    try {
      setLoadingRoute(true);
      setRouteError(null);

      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?alternatives=3&overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("OSRM routing service unavailable");

      const data = await res.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error("No navigable path found between coordinates");
      }

      const colors = ["#2563eb", "#7c3aed", "#0d9488"];
      const parsedRoutes: RouteOption[] = data.routes.map((r: any, idx: number) => {
        // OSRM returns coordinates as [lng, lat] GeoJSON; Leaflet requires [lat, lng]
        const coords: [number, number][] = r.geometry.coordinates.map((c: [number, number]) => [
          c[1],
          c[0],
        ]);
        return {
          id: `route_${idx}`,
          name: idx === 0 ? "Fastest Corridor" : `Alternate Route ${idx + 1}`,
          distanceKm: Math.round((r.distance / 1000) * 10) / 10,
          durationMinutes: Math.round(r.duration / 60),
          summary: r.legs?.[0]?.summary || `Via Local Highway (${Math.round((r.distance / 1000) * 10) / 10} km)`,
          coordinates: coords,
          color: colors[idx % colors.length],
        };
      });

      setRoutes(parsedRoutes);
      setSelectedRouteIdx(0);
    } catch (err: any) {
      console.warn("OSRM route calculation notice:", err.message);
      setRouteError("OSRM driving route unavailable. Fallback to direct trajectory.");

      // Direct fallback line
      setRoutes([
        {
          id: "route_fallback",
          name: "Direct Trajectory",
          distanceKm: 2.5,
          durationMinutes: 6,
          summary: "Direct transit line",
          coordinates: [
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ],
          color: "#2563eb",
        },
      ]);
    } finally {
      setLoadingRoute(false);
    }
  };

  useEffect(() => {
    fetchOsrmRoutes();
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  // 2. Client-only Leaflet Initialization
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import("leaflet")).default;

        // Ensure Leaflet CSS
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const centerLat = origin?.lat || 28.8154;
          const centerLng = origin?.lng || 79.025;

          const map = L.map(mapContainerRef.current, {
            center: [centerLat, centerLng],
            zoom: 13,
            zoomControl: false,
          });

          L.control.zoom({ position: "bottomright" }).addTo(map);

          // Tile Layer setup
          const tileUrl = getTileUrl(activeTile, mapTilerKey);
          tileLayerRef.current = L.tileLayer(tileUrl, {
            attribution: activeTile === "osm" ? '&copy; OpenStreetMap' : '&copy; MapTiler &copy; OpenStreetMap',
            maxZoom: 19,
          }).addTo(map);

          routeLayersRef.current = L.layerGroup().addTo(map);
          markerGroupRef.current = L.layerGroup().addTo(map);

          mapInstanceRef.current = map;
        }

        // Update markers
        if (markerGroupRef.current && mapInstanceRef.current) {
          markerGroupRef.current.clearLayers();

          // Origin Marker (Blue)
          if (origin) {
            const originMarker = L.circleMarker([origin.lat, origin.lng], {
              radius: 8,
              fillColor: "#2563eb",
              color: "#ffffff",
              weight: 2.5,
              fillOpacity: 1,
            }).bindPopup(`<b>Dispatch Origin:</b><br/>${origin.label || "Hub"}`);
            originMarker.addTo(markerGroupRef.current);
          }

          // Destination Marker (Red)
          if (destination) {
            const destMarker = L.circleMarker([destination.lat, destination.lng], {
              radius: 9,
              fillColor: "#dc2626",
              color: "#ffffff",
              weight: 3,
              fillOpacity: 1,
            }).bindPopup(`<b>Target Incident:</b><br/>${destination.label || "Emergency Site"}`);
            destMarker.addTo(markerGroupRef.current);
          }

          // Extra incident/threat markers
          markers.forEach((m) => {
            const color =
              m.severity === "Critical"
                ? "#dc2626"
                : m.severity === "High"
                ? "#ea580c"
                : m.severity === "Moderate"
                ? "#d97706"
                : "#16a34a";

            const marker = L.circleMarker([m.lat, m.lng], {
              radius: 7,
              fillColor: color,
              color: "#ffffff",
              weight: 2,
              fillOpacity: 0.9,
            }).bindPopup(`<b>${m.title}</b><br/><span style="color:${color};font-weight:bold;">${m.severity || "Active"}</span><br/>${m.subtitle || ""}`);

            if (onMarkerSelect) {
              marker.on("click", () => onMarkerSelect(m));
            }
            marker.addTo(markerGroupRef.current);
          });
        }

        // Draw Route Polylines
        if (routeLayersRef.current && mapInstanceRef.current) {
          routeLayersRef.current.clearLayers();

          const bounds = L.latLngBounds([]);
          if (origin) bounds.extend([origin.lat, origin.lng]);
          if (destination) bounds.extend([destination.lat, destination.lng]);

          routes.forEach((r, idx) => {
            const isSelected = idx === selectedRouteIdx;
            const polyline = L.polyline(r.coordinates, {
              color: r.color,
              weight: isSelected ? 5 : 3.5,
              opacity: isSelected ? 0.95 : 0.45,
              dashArray: isSelected ? undefined : "6, 8",
            });

            polyline.on("click", () => setSelectedRouteIdx(idx));
            polyline.bindTooltip(`${r.name}: ${r.durationMinutes} min (${r.distanceKm} km)`, {
              sticky: true,
            });

            polyline.addTo(routeLayersRef.current);
            r.coordinates.forEach((pt) => bounds.extend(pt));
          });

          if (bounds.isValid() && mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
          }
        }
      } catch (err) {
        console.warn("Leaflet MapView init notice:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, [origin.lat, origin.lng, destination.lat, destination.lng, routes, selectedRouteIdx, activeTile, markers.length]);

  // Tile URL Helper
  const getTileUrl = (type: TileType, key: string) => {
    if (type === "maptiler_streets" && key) {
      return `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`;
    }
    if (type === "maptiler_hybrid" && key) {
      return `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${key}`;
    }
    return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  };

  // Switch Tile Layer
  const handleTileChange = (newTile: TileType) => {
    setActiveTile(newTile);
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      import("leaflet").then(({ default: L }) => {
        tileLayerRef.current = L.tileLayer(getTileUrl(newTile, mapTilerKey), {
          attribution: newTile === "osm" ? '&copy; OpenStreetMap' : '&copy; MapTiler',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
      });
    }
  };

  const googleTransitUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=transit`;

  return (
    <div className={`bg-white rounded-3xl border border-[#dcdcdc] shadow-xs overflow-hidden ${className}`}>
      {/* Map Header & Controls */}
      <div className="p-4 border-b border-[#dcdcdc] flex flex-wrap items-center justify-between gap-3 bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#262626] text-white">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#262626] block">
              OSRM Driving Navigation &amp; Geospatial Engine
            </span>
            <span className="text-[10px] text-[#707070]">
              {routes[selectedRouteIdx]
                ? `${routes[selectedRouteIdx].name} • ${routes[selectedRouteIdx].distanceKm} km (${routes[selectedRouteIdx].durationMinutes} mins)`
                : "Calculating optimal route..."}
            </span>
          </div>
        </div>

        {/* Dynamic Tile Layer Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleTileChange("osm")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              activeTile === "osm"
                ? "bg-[#262626] text-white border-black"
                : "bg-white text-[#707070] border-[#dcdcdc] hover:bg-[#f5f5f5]"
            }`}
          >
            OSM Streets
          </button>
          <button
            type="button"
            onClick={() => handleTileChange("maptiler_streets")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              activeTile === "maptiler_streets"
                ? "bg-[#262626] text-white border-black"
                : "bg-white text-[#707070] border-[#dcdcdc] hover:bg-[#f5f5f5]"
            }`}
          >
            MapTiler Vector
          </button>
          <button
            type="button"
            onClick={() => handleTileChange("maptiler_hybrid")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              activeTile === "maptiler_hybrid"
                ? "bg-[#262626] text-white border-black"
                : "bg-white text-[#707070] border-[#dcdcdc] hover:bg-[#f5f5f5]"
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Map Container Viewport */}
      <div className="relative">
        <div ref={mapContainerRef} style={{ height }} className="w-full bg-[#eaeaea]" />

        {/* Floating Google Transit CTA Button */}
        <div className="absolute top-3 left-3 z-[400]">
          <a
            href={googleTransitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white/95 hover:bg-white text-[#262626] text-xs font-bold rounded-xl shadow-md border border-[#dcdcdc] flex items-center gap-1.5 backdrop-blur-xs transition-transform active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Open in Google Transit</span>
            <ExternalLink className="w-3 h-3 text-[#707070]" />
          </a>
        </div>

        {loadingRoute && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-2xs flex items-center justify-center z-[500]">
            <div className="bg-[#262626] text-white px-4 py-2 rounded-2xl flex items-center gap-2 text-xs shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin text-[#53bdeb]" />
              <span>Calculating OSRM routes...</span>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Routes Switcher Bar */}
      {showRoutingControls && routes.length > 0 && (
        <div className="p-3 bg-[#f5f5f5] border-t border-[#dcdcdc] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#707070] uppercase">Alternative Corridors:</span>
            <div className="flex items-center gap-1.5">
              {routes.map((r, idx) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRouteIdx(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedRouteIdx === idx
                      ? "bg-[#262626] text-white border-black shadow-xs"
                      : "bg-white text-[#545454] border-[#dcdcdc] hover:bg-[#eaeaea]"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  <span>{r.name}</span>
                  <span className="text-[10px] opacity-75">({r.durationMinutes}m)</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={fetchOsrmRoutes}
            className="p-1.5 rounded-lg text-[#707070] hover:text-[#262626] hover:bg-white transition-colors cursor-pointer"
            title="Recalculate Route"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
