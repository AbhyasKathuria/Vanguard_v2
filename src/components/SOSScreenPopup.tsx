"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Siren,
  Volume2,
  VolumeX,
  Phone,
  MapPin,
  AlertTriangle,
  ArrowRight,
  X,
  CheckCircle2,
  Navigation,
  Loader2,
  HeartPulse,
} from "lucide-react";

export interface SOSAlert {
  id: string;
  type: string;
  title: string;
  category: string;
  urgency: string;
  description: string;
  location: string;
  district?: string;
  latitude?: number | null;
  longitude?: number | null;
  citizenName: string;
  citizenPhone: string;
  riskScore?: number;
  createdAt: string | Date;
  distanceKm?: number;
}

interface SOSScreenPopupProps {
  alert: SOSAlert | null;
  userCoords?: { latitude: number; longitude: number } | null;
  onDismiss: () => void;
  onAccept: (alert: SOSAlert) => void;
}

export default function SOSScreenPopup({
  alert,
  userCoords,
  onDismiss,
  onAccept,
}: SOSScreenPopupProps) {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<any>(null);

  // Sound Synthesizer via Web Audio API (Dual frequency 880Hz / 440Hz ambulance warble)
  useEffect(() => {
    if (!alert || isMuted) {
      stopAlarm();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;

      // Alternate tone between 880Hz and 440Hz every 350ms
      let high = false;
      intervalRef.current = setInterval(() => {
        if (!oscillatorRef.current || !audioCtxRef.current) return;
        const now = audioCtxRef.current.currentTime;
        osc.frequency.setTargetAtTime(high ? 880 : 440, now, 0.05);
        high = !high;
      }, 350);
    } catch (e) {
      console.warn("Web Audio autoplay prevented by browser policy:", e);
    }

    // Trigger Browser Push Notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`🚨 VANGUARD CRITICAL SOS: ${alert.category}`, {
        body: `${alert.description} at ${alert.location}`,
        icon: "/favicon.ico",
      });
    }

    return () => {
      stopAlarm();
    };
  }, [alert, isMuted]);

  const stopAlarm = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch {}
      oscillatorRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  if (!alert) return null;

  // Calculate distance if both points exist
  let displayDistance = alert.distanceKm;
  if (
    !displayDistance &&
    userCoords &&
    alert.latitude &&
    alert.longitude
  ) {
    const R = 6371; // km
    const dLat = ((alert.latitude - userCoords.latitude) * Math.PI) / 180;
    const dLon = ((alert.longitude - userCoords.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userCoords.latitude * Math.PI) / 180) *
        Math.cos((alert.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    displayDistance = Math.round(R * c * 10) / 10;
  }

  const handleAccept = async () => {
    setAccepting(true);
    stopAlarm();
    try {
      await onAccept(alert);
      router.push(`/citizen/request/${alert.id}`);
    } catch (err) {
      console.error("Accept SOS error:", err);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-950 border-2 border-red-600 rounded-3xl shadow-2xl overflow-hidden animate-pulse-border">
        {/* Urgent Header Banner */}
        <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center font-black animate-bounce shadow-md">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-100 block">
                VANGUARD EMERGENCY RESPONSE NETWORK
              </span>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                HIGH-PRIORITY SOS DISPATCH BROADCAST
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMuted(!isMuted);
                if (!isMuted) stopAlarm();
              }}
              className="p-2 rounded-xl bg-red-700 hover:bg-red-800 text-white transition-colors cursor-pointer"
              title={isMuted ? "Unmute Alarm" : "Silence Alarm"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
            </button>
            <button
              type="button"
              onClick={() => {
                stopAlarm();
                onDismiss();
              }}
              className="p-2 rounded-xl bg-red-700 hover:bg-red-800 text-white transition-colors cursor-pointer"
              title="Close Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-white">
          {/* Emergency Title & Tag */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 bg-red-950/80 text-red-400 border border-red-800 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5" />
              {alert.category} • {alert.urgency.toUpperCase()}
            </span>

            {displayDistance !== undefined && (
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {displayDistance} km away
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white leading-snug">{alert.title}</h3>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed bg-neutral-900/90 p-3.5 rounded-xl border border-neutral-800">
              {alert.description}
            </p>
          </div>

          {/* Incident Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-neutral-900 rounded-2xl border border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-400 text-[11px] block font-medium">Exact Incident Location</span>
              <p className="text-white font-bold flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{alert.location}</span>
              </p>
            </div>

            <div>
              <span className="text-neutral-400 text-[11px] block font-medium">Citizen / Patient Contact</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white font-bold">{alert.citizenName}</span>
                {alert.citizenPhone && alert.citizenPhone !== "On File" && (
                  <a
                    href={`tel:${alert.citizenPhone}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-mono text-[11px] rounded-md border border-neutral-700"
                  >
                    <Phone className="w-3 h-3" />
                    {alert.citizenPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                stopAlarm();
                onDismiss();
              }}
              className="w-full sm:w-1/3 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl border border-neutral-800 transition-colors cursor-pointer text-center"
            >
              Decline / Snooze
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              className="w-full sm:w-2/3 py-3 px-5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Claiming &amp; Routing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept &amp; Route Instantly</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
