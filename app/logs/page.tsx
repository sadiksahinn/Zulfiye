"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { Activity, CalendarDays, Clock, Filter, Search, UserRound } from "lucide-react";

type Log = {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  description: string | null;
  created_at: string;
  profiles?: { full_name: string | null; role: string };
};

const ACTION_COLOR: Record<string, { dot: string; bg: string; text: string }> = {
  "Kiralama oluşturdu":        { dot: "bg-blue-500",   bg: "bg-blue-50 border-blue-200",   text: "text-blue-700" },
  "Kiralama güncelledi":       { dot: "bg-blue-400",   bg: "bg-blue-50 border-blue-100",   text: "text-blue-600" },
  "Kiralama durumu değiştirdi":{ dot: "bg-blue-300",   bg: "bg-blue-50 border-blue-100",   text: "text-blue-500" },
  "Satış yaptı":               { dot: "bg-green-500",  bg: "bg-green-50 border-green-200", text: "text-green-700" },
  "Satış güncelledi":          { dot: "bg-green-400",  bg: "bg-green-50 border-green-100", text: "text-green-600" },
  "Müşteri ekledi":            { dot: "bg-purple-500", bg: "bg-purple-50 border-purple-200",text: "text-purple-700" },
  "Müşteri güncelledi":        { dot: "bg-purple-400", bg: "bg-purple-50 border-purple-100",text: "text-purple-600" },
  "Prova oluşturdu":           { dot: "bg-amber-500",  bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  "Prova güncelledi":          { dot: "bg-amber-400",  bg: "bg-amber-50 border-amber-100", text: "text-amber-600" },
  "Prova durumu değiştirdi":   { dot: "bg-amber-300",  bg: "bg-amber-50 border-amber-100", text: "text-amber-500" },
  "Ürün ekledi":               { dot: "bg-[#b69463]",  bg: "bg-[#f7f0e7] border-[#eadfce]",text: "text-[#b69463]" },
  "Ürün güncelledi":           { dot: "bg-[#c8a87a]",  bg: "bg-[#f7f0e7] border-[#eadfce]",text: "text-[#c8a87a]" },
  "Ürün durumu değiştirdi":    { dot: "bg-[#d4b98a]",  bg: "bg-[#f7f0e7] border-[#eadfce]",text: "text-[#d4b98a]" },
  "Gider ekledi":              { dot: "bg-red-500",    bg: "bg-red-50 border-red-200",     text: "text-red-700" },
  "Ödeme kaydetti":            { dot: "bg-teal-500",   bg: "bg-teal-50 border-teal-200",   text: "text-teal-700" },
};

function getColor(action: string) {
  return ACTION_COLOR[action] || { dot: "bg-gray-400", bg: "bg-gray-50 border-gray-200", text: "text-gray-600" };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

const inputCls = "w-full rounded-full border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";

export default function LogsPage() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && role !== "super_admin") {
      router.replace("/today");
    }
  }, [role, loading, router]);

  async function load() {
    setFetching(true);
    const { data } = await supabase
      .from("activity_logs")
      .select("*, profiles(full_name, role)")
      .order("created_at", { ascending: false })
      .limit(500);

    setLogs((data || []) as Log[]);

    const uniqueUsers = Array.from(
      new Map((data || [])
        .filter(l => l.profiles?.full_name)
        .map(l => [l.user_id, { id: l.user_id, full_name: l.profiles!.full_name! }])
      ).values()
    );
    setUsers(uniqueUsers);
    setFetching(false);
  }

  useEffect(() => {
    if (role === "super_admin") load();
  }, [role]);

  const uniqueActions = useMemo(() =>
    [...new Set(logs.map(l => l.action))].sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(l => {
      const matchSearch = !q || [
        l.profiles?.full_name, l.action, l.description, l.table_name
      ].filter(Boolean).join(" ").toLowerCase().includes(q);
      const matchUser   = filterUser   === "all" || l.user_id === filterUser;
      const matchAction = filterAction === "all" || l.action === filterAction;
      const matchDate   = !filterDate  || l.created_at.startsWith(filterDate);
      return matchSearch && matchUser && matchAction && matchDate;
    });
  }, [logs, search, filterUser, filterAction, filterDate]);

  // Günlere göre grupla
  const grouped = useMemo(() => {
    const map = new Map<string, Log[]>();
    filtered.forEach(l => {
      const day = l.created_at.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(l);
    });
    return Array.from(map.entries());
  }, [filtered]);

  if (loading || role !== "super_admin") return null;

  return (
    <AppShell title="Aktivite Günlüğü">
      <div className="space-y-5 pb-24 lg:pb-0">

        {/* Header */}
        <div className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">MAUNA Super Admin</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Aktivite Günlüğü</h1>
          <p className="mt-2 text-sm text-white/70">Kim ne zaman ne yaptı — tüm işlemler kayıt altında.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 lg:max-w-lg">
            {[["Toplam", logs.length], ["Bugün", logs.filter(l => l.created_at.startsWith(new Date().toISOString().slice(0,10))).length], ["Personel", users.length]].map(([l, v]) => (
              <div key={l as string} className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{l}</div>
                <div className="mt-1 text-2xl font-black text-white">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtreler */}
        <div className="premium-card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative md:col-span-2 xl:col-span-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b69463]" />
              <input className={inputCls + " pl-10"} placeholder="Ara: isim, işlem, detay..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <select className={inputCls} value={filterUser} onChange={e => setFilterUser(e.target.value)}>
              <option value="all">Tüm personel</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>

            <select className={inputCls} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
              <option value="all">Tüm işlemler</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <input className={inputCls} type="date" value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              placeholder="Tarih filtrele" />
          </div>

          {(search || filterUser !== "all" || filterAction !== "all" || filterDate) && (
            <button onClick={() => { setSearch(""); setFilterUser("all"); setFilterAction("all"); setFilterDate(""); }}
              className="mt-3 text-xs font-black text-[#b69463] underline">
              Filtreleri temizle
            </button>
          )}
        </div>

        {/* Log listesi */}
        {fetching ? (
          <div className="premium-card p-12 text-center text-sm font-bold text-[#9d8b74]">Yükleniyor...</div>
        ) : grouped.length === 0 ? (
          <div className="premium-card p-12 text-center text-sm font-bold text-[#9d8b74]">Kayıt bulunamadı.</div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([day, dayLogs]) => (
              <div key={day}>
                {/* Gün başlığı */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-[#211b16] px-4 py-2 text-sm font-black text-white">
                    <CalendarDays size={14} />
                    {formatDate(day)}
                  </div>
                  <span className="text-xs font-black text-[#9d8b74]">{dayLogs.length} işlem</span>
                </div>

                {/* O günün logları */}
                <div className="space-y-2">
                  {dayLogs.map(log => {
                    const cfg = getColor(log.action);
                    return (
                      <div key={log.id} className={`flex items-start gap-4 rounded-2xl border p-4 ${cfg.bg}`}>
                        {/* Renkli nokta */}
                        <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />

                        {/* İçerik */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${cfg.text} bg-white/60`}>
                              {log.action}
                            </span>
                            {log.description && (
                              <span className="text-sm font-black text-[#211b16]">{log.description}</span>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6d6256]">
                              <UserRound size={12} />
                              {log.profiles?.full_name || "Bilinmiyor"}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#9d8b74]">
                              <Clock size={12} />
                              {formatTime(log.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
