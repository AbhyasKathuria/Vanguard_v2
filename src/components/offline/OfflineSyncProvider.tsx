"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, CloudUpload } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface QueuedItem {
  id: string;
  url: string;
  method: string;
  payload: any;
  timestamp: number;
  type: "complaint" | "emergency" | "inspection";
}

interface OfflineContextType {
  isOnline: boolean;
  queuedCount: number;
  queueOfflineAction: (url: string, method: string, payload: any, type?: QueuedItem["type"]) => void;
  syncNow: () => Promise<void>;
  isSyncing: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  queuedCount: 0,
  queueOfflineAction: () => {},
  syncNow: async () => {},
  isSyncing: false,
});

export const useOfflineSync = () => useContext(OfflineContext);

const STORAGE_KEY = "vanguard_offline_queue_v1";

export default function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Load initial queue
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setQueue(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Error reading offline queue:", e);
      }
    }
  }, []);

  // Save queue helper
  const saveQueue = (items: QueuedItem[]) => {
    setQueue(items);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn("Error saving offline queue:", e);
      }
    }
  };

  // Enqueue action
  const queueOfflineAction = (
    url: string,
    method: string,
    payload: any,
    type: QueuedItem["type"] = "complaint"
  ) => {
    const newItem: QueuedItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      url,
      method,
      payload,
      timestamp: Date.now(),
      type,
    };
    const updated = [...queue, newItem];
    saveQueue(updated);
  };

  // Sync queued items when back online
  const syncNow = async () => {
    if (queue.length === 0 || isSyncing) return;
    setIsSyncing(true);
    let successCount = 0;
    const remaining: QueuedItem[] = [];

    for (const item of queue) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.payload),
        });
        if (res.ok) {
          successCount++;
        } else {
          remaining.push(item);
        }
      } catch (err) {
        remaining.push(item);
      }
    }

    saveQueue(remaining);
    setIsSyncing(false);

    if (successCount > 0) {
      setSyncToast(`Successfully synchronized ${successCount} offline request(s)!`);
      setTimeout(() => setSyncToast(null), 5000);
    }
  };

  // Network event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queue]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        queuedCount: queue.length,
        queueOfflineAction,
        syncNow,
        isSyncing,
      }}
    >
      {children}

      {/* Floating Offline / Online Status Bar */}
      <div className="fixed top-20 right-4 z-50 flex flex-col items-end gap-2">
        {syncToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xl border border-emerald-400 flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncToast}</span>
          </div>
        )}

        {!isOnline ? (
          <div className="bg-amber-600 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-2xl border border-amber-400 flex items-center gap-2 animate-pulse">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{t?.offline?.offlineMode || "Offline Mode"} ({queue.length} {t?.offline?.queuedForSync || "queued for sync"})</span>
          </div>
        ) : queue.length > 0 ? (
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-xl border border-sky-400 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <CloudUpload className={`w-4 h-4 shrink-0 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{t?.offline?.syncPending || "Sync Pending Records"} ({queue.length})</span>
          </button>
        ) : null}
      </div>
    </OfflineContext.Provider>
  );
}
