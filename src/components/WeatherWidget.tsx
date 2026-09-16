"use client";

import React, { useEffect, useState } from "react";
import { CloudRain, Sun, Wind, Droplets, AlertTriangle, CloudSun, Loader2 } from "lucide-react";
import { WeatherData } from "@/lib/integrations/weather";

interface WeatherWidgetProps {
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
}

export default function WeatherWidget({
  location = "Rampur",
  latitude,
  longitude,
  className = "",
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        let url = `/api/weather?location=${encodeURIComponent(location)}`;
        if (latitude && longitude) {
          url = `/api/weather?lat=${latitude}&lon=${longitude}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setWeather(data.weather);
        }
      } catch (err) {
        console.error("Failed to load weather widget:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, [location, latitude, longitude]);

  if (loading) {
    return (
      <div className={`p-3.5 bg-white rounded-2xl border border-[#dcdcdc] flex items-center gap-2 text-xs text-[#707070] ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-[#404040]" />
        <span>Loading live weather &amp; rural advisory for {location}...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={`p-4 bg-linear-to-r from-[#f5f5f5] to-[#ebebeb] rounded-2xl border border-[#dcdcdc] shadow-2xs space-y-2.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#404040] text-white shadow-2xs">
            {weather.isRaining ? (
              <CloudRain className="w-5 h-5 text-[#85e0ff]" />
            ) : weather.weatherCode === 0 ? (
              <Sun className="w-5 h-5 text-[#facc15]" />
            ) : (
              <CloudSun className="w-5 h-5 text-[#fef08a]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#262626]">
                {location} Local Weather
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/80 border border-[#dcdcdc] text-[#404040]">
                {weather.condition}
              </span>
            </div>
            <p className="text-xs font-black text-[#262626]">
              {weather.temperatureC}°C
              <span className="text-[11px] font-normal text-[#707070] ml-2">
                Wind: {weather.windSpeedKmH} km/h • Humidity: {weather.humidityPct || 60}%
              </span>
            </p>
          </div>
        </div>

        <div className="text-[10px] text-[#707070] font-medium bg-white/70 px-2.5 py-1 rounded-lg border border-[#dcdcdc]">
          📡 {weather.source}
        </div>
      </div>

      {weather.advisory && (
        <div className="p-2.5 rounded-xl bg-white border border-[#dcdcdc] text-xs flex items-start gap-2">
          {weather.isRaining ? (
            <AlertTriangle className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
          ) : (
            <Droplets className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold text-[#262626] mr-1">Field Advisory:</span>
            <span className="text-[#404040]">{weather.advisory}</span>
          </div>
        </div>
      )}
    </div>
  );
}
