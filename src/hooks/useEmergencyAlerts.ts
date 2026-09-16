"use client";

import { useEffect, useRef, useState } from "react";
import { SOSAlert } from "@/components/SOSScreenPopup";

export function useEmergencyAlerts(userCoords?: { latitude: number; longitude: number } | null) {
  const [activeAlerts, setActiveAlerts] = useState<SOSAlert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<SOSAlert | null>(null);
  const acknowledgedRef = useRef<Set<string>>(new Set());

  // Request notification permission once
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const fetchActiveAlerts = async () => {
    try {
      const res = await fetch("/api/emergency/active-sos");
      if (!res.ok) return;
      const data = await res.json();
      const alerts: SOSAlert[] = data.alerts || [];

      setActiveAlerts(alerts);

      // Find first unacknowledged critical alert
      const unacknowledged = alerts.find(
        (a) => !acknowledgedRef.current.has(a.id)
      );

      if (unacknowledged && (!currentAlert || currentAlert.id !== unacknowledged.id)) {
        setCurrentAlert(unacknowledged);
      }
    } catch (err) {
      console.warn("Emergency alert fetch error:", err);
    }
  };

  useEffect(() => {
    fetchActiveAlerts();
    const interval = setInterval(fetchActiveAlerts, 8000);
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = () => {
    if (currentAlert) {
      acknowledgedRef.current.add(currentAlert.id);
    }
    setCurrentAlert(null);
  };

  const acceptAlert = async (alert: SOSAlert) => {
    acknowledgedRef.current.add(alert.id);
    try {
      await fetch(`/api/requests/${alert.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "claim",
          status: "in_progress",
          message: "Responder accepted SOS emergency broadcast. Routing turn-by-turn.",
        }),
      });
    } catch (e) {
      console.error("Accept alert API error:", e);
    }
    setCurrentAlert(null);
  };

  return {
    activeAlerts,
    currentAlert,
    dismissAlert,
    acceptAlert,
    refreshAlerts: fetchActiveAlerts,
  };
}
