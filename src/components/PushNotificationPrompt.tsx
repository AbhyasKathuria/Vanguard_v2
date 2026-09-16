"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, Check, ShieldAlert, X, Volume2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationPromptProps {
  role?: string;
  district?: string;
}

export default function PushNotificationPrompt({ role = "worker", district = "Rampur" }: PushNotificationPromptProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setPermission("unsupported");
        return;
      }
      setPermission(Notification.permission);
      if (Notification.permission === "granted") {
        setSubscribed(true);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        alert("Push notifications were not granted. You can re-enable them in browser settings.");
        return;
      }

      const vapidKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        "BOgTV8tZ8Q5s92awCch0VjfPZgTNi5ZNbtKDQplHwsa4pHdc8uSVpEVu6DE9-1-NO3R5cTiTdczKhgtd4XBoE2A";

      const convertedKey = urlBase64ToUint8Array(vapidKey);

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          role,
          district,
        }),
      });

      if (res.ok) {
        setSubscribed(true);
      }
    } catch (err) {
      console.error("Push subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (dismissed || permission === "unsupported" || (subscribed && permission === "granted")) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-800/60 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
          <BellRing className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">Enable Real-Time Emergency Push Alerts</h4>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60 font-mono">
              Sound &amp; Vibration
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-0.5 max-w-xl">
            Receive instant SOS dispatches, blood donor matchmaker alerts, and task assignments even when your browser or VANGUARD tab is closed.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          Later
        </button>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{loading ? "Registering..." : "Enable Push Alerts"}</span>
        </button>
      </div>
    </div>
  );
}
