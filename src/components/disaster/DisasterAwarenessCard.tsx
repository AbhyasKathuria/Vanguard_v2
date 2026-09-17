"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CloudRain,
  AlertTriangle,
  Wind,
  Thermometer,
  ShieldCheck,
  Flame,
  Droplets,
  RefreshCw,
  Info,
  ChevronRight,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Siren,
  Volume2,
  VolumeX,
  Megaphone,
} from "lucide-react";
import { WeatherData, DisasterAlert } from "@/lib/integrations/weather";
import { useLanguage } from "@/lib/i18n/context";

interface DisasterAwarenessCardProps {
  location?: string;
  className?: string;
  showShelterLink?: boolean;
}

export default function DisasterAwarenessCard({
  location = "Rampur",
  className = "",
  showShelterLink = true,
}: DisasterAwarenessCardProps) {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const sirenTimerRef = useRef<any>(null);

  const stopDisasterSiren = () => {
    if (sirenTimerRef.current) {
      clearInterval(sirenTimerRef.current);
      sirenTimerRef.current = null;
    }
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch(e) {}
      oscillatorRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch(e) {}
      audioCtxRef.current = null;
    }
    setSirenPlaying(false);
    setAudioBlocked(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
  };

  const speakDisasterWarning = (alertItem: DisasterAlert) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && !isSirenMuted) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const speech = new SpeechSynthesisUtterance(
          `Severe weather alert in ${location}! ${alertItem.title}. ${alertItem.actionableGuidance}`
        );
        speech.rate = 0.95;
        speech.pitch = 1.0;
        window.speechSynthesis.speak(speech);
      } catch (e) {
        console.warn("Disaster speech warning error:", e);
      }
    }
  };

  const playDisasterSiren = (alertItem?: DisasterAlert) => {
    if (isSirenMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch(e) {}
      }
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Disaster Civil Defense Siren: Smooth ascending & descending pitch cycle (440Hz -> 760Hz -> 440Hz)
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.start();
      oscillatorRef.current = osc;
      setSirenPlaying(true);

      let ascending = true;
      const sweep = () => {
        if (!oscillatorRef.current || !audioCtxRef.current) return;
        const t = audioCtxRef.current.currentTime;
        if (ascending) {
          oscillatorRef.current.frequency.exponentialRampToValueAtTime(760, t + 1.2);
        } else {
          oscillatorRef.current.frequency.exponentialRampToValueAtTime(440, t + 1.2);
        }
        ascending = !ascending;
      };
      sweep();
      sirenTimerRef.current = setInterval(sweep, 1200);

      // Handle mobile browser autoplay restriction
      if (ctx.state === "suspended") {
        setAudioBlocked(true);
        const unlock = () => {
          if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume().then(() => {
              setAudioBlocked(false);
              if (alertItem) speakDisasterWarning(alertItem);
            }).catch(() => {});
          }
          window.removeEventListener("click", unlock);
          window.removeEventListener("touchstart", unlock);
        };
        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true });
      } else {
        setAudioBlocked(false);
        if (alertItem) speakDisasterWarning(alertItem);
      }
    } catch (err) {
      console.warn("Disaster siren failed to initialize:", err);
    }
  };

  useEffect(() => {
    return () => {
      stopDisasterSiren();
    };
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      const data = await res.json();
      if (res.ok && data.weather) {
        setWeather(data.weather);
      }
    } catch (err) {
      console.warn("Disaster card weather fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  const severeAlert = weather?.disasterAlerts?.find((a) => a.severity === "Severe");

  useEffect(() => {
    if (severeAlert && !isSirenMuted) {
      playDisasterSiren(severeAlert);
    } else if (!severeAlert && sirenPlaying) {
      stopDisasterSiren();
    }
  }, [severeAlert, isSirenMuted]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Severe":
        return "bg-red-600 text-white border-red-700 animate-pulse";
      case "Warning":
        return "bg-amber-500 text-black border-amber-600 font-black";
      case "Advisory":
      default:
        return "bg-sky-700 text-white border-sky-800";
    }
  };

  return (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 text-white ${className}`}>
      {/* Severe Disaster Siren Alert Banner */}
      {severeAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950 via-rose-950 to-neutral-950 border-2 border-red-600 shadow-2xl shadow-red-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/50">
              <Siren className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-red-700 px-2 py-0.5 rounded border border-red-500 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Civil Defense Siren Active
                </span>
                <span className="text-[11px] text-red-300 font-bold font-mono">
                  {location} Sector
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white font-black mt-1">
                {severeAlert.title} — {severeAlert.metric}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {audioBlocked && (
              <button
                type="button"
                onClick={() => {
                  if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
                    audioCtxRef.current.resume().then(() => {
                      setAudioBlocked(false);
                      speakDisasterWarning(severeAlert);
                    });
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg animate-bounce"
              >
                <Volume2 className="w-4 h-4" />
                <span>Tap to Unmute Siren</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (sirenPlaying) {
                  stopDisasterSiren();
                  setIsSirenMuted(true);
                } else {
                  setIsSirenMuted(false);
                  playDisasterSiren(severeAlert);
                  speakDisasterWarning(severeAlert);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                sirenPlaying
                  ? "bg-red-700 hover:bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700"
              }`}
            >
              {sirenPlaying ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-200" />
                  <span>Silence Siren</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-yellow-400" />
                  <span>Sound Siren</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header Band */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 font-mono">
                Early Warning Matrix
              </span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                <MapPin className="w-3 h-3 text-neutral-500" />
                {location} Sector
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
              Weather &amp; Disaster Risk Awareness
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchWeather();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Refresh Live Forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Atmospheric Telemetry Grid */}
      {weather && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <Thermometer className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-400 block font-medium">Temperature</span>
              <span className="font-bold text-white font-mono text-sm">
                {weather.temperatureC}°C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-400 block font-medium">24h Rain Accum.</span>
              <span className="font-bold text-white font-mono text-sm">
                {weather.precipitation24hMm ?? 0} mm
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-400 block font-medium">Peak Wind</span>
              <span className="font-bold text-white font-mono text-sm">
                {weather.maxWind24hKmH ?? weather.windSpeedKmH} km/h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <CloudRain className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-400 block font-medium">Outlook</span>
              <span className="font-bold text-neutral-200 text-xs truncate max-w-[90px] block">
                {weather.condition}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Disaster Alerts Container */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-neutral-950 rounded-2xl border border-neutral-800 text-neutral-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Analyzing local Doppler &amp; Open-Meteo precipitation models...</span>
          </div>
        ) : weather && weather.disasterAlerts && weather.disasterAlerts.length > 0 ? (
          weather.disasterAlerts.map((alert: DisasterAlert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border-2 space-y-3 shadow-lg ${
                alert.severity === "Severe"
                  ? "bg-red-950/60 border-red-600/90 text-white"
                  : "bg-amber-950/50 border-amber-500/80 text-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border font-mono ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity} Alert
                  </span>
                  <span className="text-[10px] font-mono text-neutral-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.validHours}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {alert.metric}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black tracking-tight">{alert.title}</h3>
                <p className="text-xs text-neutral-200 mt-1 leading-relaxed">{alert.description}</p>
              </div>

              {/* Actionable Guidance (Plain Language Instructions) */}
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-white/10 space-y-1 text-xs">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Immediate Rural Safety Directive:
                </span>
                <p className="text-neutral-200 leading-relaxed font-medium">
                  {alert.actionableGuidance}
                </p>
              </div>
            </div>
          ))
        ) : (
          /* Clean, Calm "All Clear" State */
          <div className="p-6 text-center rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                All Clear • कोई सक्रिय मौसम चेतावनी नहीं
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
                No flood risks, convective storm surges, or extreme temperature alerts detected for {location}. Agricultural operations, sowing, and civic fieldwork may proceed normally.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Evacuation Shelters Link */}
      {showShelterLink && (
        <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>District Civil Protection Protocol (NDRF / SDRF Alignment)</span>
          </span>
          <a
            href="tel:1077"
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>District Disaster Helpline: 1077 (Toll-Free)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
