"use client";

import { useEffect, useState } from "react";
import { getQueue, processQueue } from "@/lib/offlineQueue";
import { CloudOff, RefreshCw, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  function refreshCount() {
    setQueueCount(getQueue().length);
  }

  useEffect(() => {
    setIsOnline(navigator.onLine);
    refreshCount();

    const onOnline = () => {
      setIsOnline(true);
      // İnternet gelince otomatik sync
      autoSync();
    };
    const onOffline = () => setIsOnline(false);
    const onQueueChange = () => refreshCount();

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("offline-queue-change", onQueueChange);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("offline-queue-change", onQueueChange);
    };
  }, []);

  async function autoSync() {
    const q = getQueue();
    if (q.length === 0) return;
    setSyncing(true);
    const count = await processQueue();
    setSyncing(false);
    refreshCount();
    if (count > 0) {
      setSyncedCount(count);
      setTimeout(() => setSyncedCount(null), 4000);
    }
  }

  async function manualSync() {
    setSyncing(true);
    const count = await processQueue();
    setSyncing(false);
    refreshCount();
    if (count > 0) {
      setSyncedCount(count);
      setTimeout(() => setSyncedCount(null), 4000);
    }
  }

  // Her şey yolunda — gösterme
  if (isOnline && queueCount === 0 && syncedCount === null) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:bottom-6 lg:left-auto lg:right-6 lg:w-auto">
      {/* Offline uyarısı */}
      {!isOnline && (
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-xl">
          <CloudOff size={18} className="shrink-0 text-amber-400" />
          <div>
            <div className="text-sm font-black">İnternet bağlantısı yok</div>
            <div className="text-xs text-gray-400">Girişler kaydedilip sonra yüklenecek</div>
          </div>
        </div>
      )}

      {/* Bekleyen kayıtlar */}
      {isOnline && queueCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-500 px-4 py-3 text-white shadow-xl">
          <RefreshCw size={18} className={`shrink-0 ${syncing ? "animate-spin" : ""}`} />
          <div className="flex-1">
            <div className="text-sm font-black">{queueCount} kayıt yükleniyor</div>
            <div className="text-xs text-amber-100">İnternet bağlandı, senkronize ediliyor</div>
          </div>
          {!syncing && (
            <button onClick={manualSync}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-black hover:bg-white/30 transition">
              Şimdi Yükle
            </button>
          )}
        </div>
      )}

      {/* Sync başarılı */}
      {syncedCount !== null && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-4 py-3 text-white shadow-xl">
          <Wifi size={18} className="shrink-0" />
          <div className="text-sm font-black">{syncedCount} kayıt başarıyla yüklendi ✓</div>
        </div>
      )}
    </div>
  );
}
