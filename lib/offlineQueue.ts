import { supabase } from "@/lib/supabase";

const QUEUE_KEY = "zulfiye_offline_queue";

export type QueueItem = {
  id: string;
  table: string;
  operation: "insert" | "update";
  payload: Record<string, any>;
  whereId?: string; // update için
  timestamp: number;
  label: string; // kullanıcıya göstermek için
};

export function getQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToQueue(item: Omit<QueueItem, "id" | "timestamp">) {
  const queue = getQueue();
  queue.push({ ...item, id: crypto.randomUUID(), timestamp: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event("offline-queue-change"));
}

function removeFromQueue(id: string) {
  const queue = getQueue().filter((x) => x.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event("offline-queue-change"));
}

export async function processQueue(): Promise<number> {
  const queue = getQueue();
  if (queue.length === 0) return 0;

  let successCount = 0;

  for (const item of queue) {
    try {
      let error;
      if (item.operation === "insert") {
        ({ error } = await supabase.from(item.table).insert(item.payload));
      } else if (item.operation === "update" && item.whereId) {
        ({ error } = await supabase.from(item.table).update(item.payload).eq("id", item.whereId));
      }
      if (!error) {
        removeFromQueue(item.id);
        successCount++;
      }
    } catch {
      // bu item şimdilik geçilsin
    }
  }

  return successCount;
}

// insert dene — başarısız olursa kuyruğa ekle
export async function safeInsert(
  table: string,
  payload: Record<string, any>,
  label: string
): Promise<{ ok: boolean; offline: boolean }> {
  if (!navigator.onLine) {
    addToQueue({ table, operation: "insert", payload, label });
    return { ok: true, offline: true };
  }
  const { error } = await supabase.from(table).insert(payload);
  if (error) {
    // network hatası ise kuyruğa al
    if (!navigator.onLine || error.message?.includes("fetch")) {
      addToQueue({ table, operation: "insert", payload, label });
      return { ok: true, offline: true };
    }
    return { ok: false, offline: false };
  }
  return { ok: true, offline: false };
}
