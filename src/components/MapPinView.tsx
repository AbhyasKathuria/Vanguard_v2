"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export interface MapPinLocation {
  latitude: number;
  longitude: number;
  label?: string;
  name?: string;
  role?: string;
}

interface MapPinViewProps {
  requestLocation: MapPinLocation;
  helperLocation?: MapPinLocation | null;
  radiusKm?: number;
  height?: string;
  className?: string;
}

export default function MapPinView({
  requestLocation,
  helperLocation,
  radiusKm = 15,
  height = "260px",
  className = "",
}: MapPinViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;
        // Import leaflet css
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const centerLat = requestLocation.latitude;
        const centerLon = requestLocation.longitude;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLon],
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
        }).addTo(map);

        // Custom Citizen Marker (Red)
        const citizenIcon = L.divIcon({
          className: "custom-map-pin",
          html: `<div style="background-color: #262626; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-size: 14px;">📍</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const reqMarker = L.marker([requestLocation.latitude, requestLocation.longitude], {
          icon: citizenIcon,
        }).addTo(map);
        reqMarker.bindPopup(`<b>Citizen Issue Location</b><br/>${requestLocation.label || "Service Request Site"}`);

        // Draw dispatch coverage radius circle
        if (radiusKm) {
          L.circle([requestLocation.latitude, requestLocation.longitude], {
            color: "#707070",
            fillColor: "#dcdcdc",
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: "4, 6",
            radius: radiusKm * 1000,
          }).addTo(map);
        }

        // Assigned Helper Marker (Dark/Green)
        if (helperLocation && helperLocation.latitude && helperLocation.longitude) {
          const helperIcon = L.divIcon({
            className: "custom-helper-pin",
            html: `<div style="background-color: #404040; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-size: 14px;">👷</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });

          const helperMarker = L.marker([helperLocation.latitude, helperLocation.longitude], {
            icon: helperIcon,
          }).addTo(map);

          helperMarker.bindPopup(
            `<b>Assigned Helper: ${helperLocation.name || "Personnel"}</b><br/>${helperLocation.role || "Worker"} (${helperLocation.label || "Station"})`
          );

          // Line connecting Request and Helper
          const latLngs = [
            [requestLocation.latitude, requestLocation.longitude],
            [helperLocation.latitude, helperLocation.longitude],
          ];
          L.polyline(latLngs as any, {
            color: "#404040",
            weight: 2.5,
            dashArray: "6, 8",
            opacity: 0.8,
          }).addTo(map);

          // Fit bounds to show both pins
          const bounds = L.latLngBounds(latLngs as any);
          map.fitBounds(bounds, { padding: [35, 35] });
        }

        mapInstanceRef.current = map;
        if (isMounted) setMapLoaded(true);
      } catch (err) {
        console.error("Leaflet init error:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [requestLocation, helperLocation, radiusKm]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#dcdcdc] bg-[#f5f5f5] ${className}`}>
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Top Map Header Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#dcdcdc] text-[11px] font-semibold text-[#404040] shadow-xs flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-[#707070]" />
        <span>
          {requestLocation.label || `${requestLocation.latitude.toFixed(3)}, ${requestLocation.longitude.toFixed(3)}`}
        </span>
        {radiusKm && (
          <span className="text-[10px] text-[#707070] pl-1 border-l border-[#dcdcdc]">
            {radiusKm} km radius
          </span>
        )}
      </div>

      {helperLocation && (
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-[#404040] text-white px-2.5 py-1 rounded-lg shadow-xs text-[11px] font-bold flex items-center gap-1.5 border border-[#262626]">
          <Navigation className="w-3 h-3 text-[#dcdcdc]" />
          <span>Helper Assigned: {helperLocation.name || "Verified Helper"}</span>
        </div>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 bg-[#f5f5f5] flex items-center justify-center text-xs text-[#707070] gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#404040]" />
          <span>Loading village GIS map...</span>
        </div>
      )}
    </div>
  );
}
