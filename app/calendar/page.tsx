"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Clock, Package, RotateCcw, ShoppingBag, UserRound } from "lucide-react";

const EVENT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  delivery: { label: "Teslim",   color: "text-blue-600",  bg: "bg-blue-50 border-blue-200",   icon: <Package size={18} /> },
  return:   { label: "İade",     color: "text-red-600",   bg: "bg-red-50 border-red-200",     icon: <RotateCcw size={18} /> },
  rental:   { label: "Etkinlik", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: <CalendarDays size={18} /> },
  fitting:  { label: "Prova",    color: "text-purple-600",bg: "bg-purple-50 border-purple-200",icon: <UserRound size={18} /> },
  sale:     { label: "Satış",    color: "text-green-600", bg: "bg-green-50 border-green-200", icon: <ShoppingBag size={18} /> },
};

function formatDate(d: string) {
  if (!d) return "-";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | string>("all");

  async function load() {
    const { data } = await supabase
      .from("calendar_events")
      .select("*, customers(full_name, phone)")
      .order("event_date", { ascending: true });
    setEvents(data || []);
  }

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter(e => {
      const customerName = e.customers?.full_name || "";
      const matchSearch = [e.title, e.event_type, e.event_date, e.description, customerName]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (filter === "today") return e.event_date === today;
      if (filter === "upcoming") return e.event_date >= today;
      if (filter in EVENT_CONFIG) return e.event_type === filter;
      return true;
    });
  }, [events, search, filter, today]);

  const todayCount   = events.filter(e => e.event_date === today).length;
  const returnCount  = events.filter(e => e.event_type === "return" && e.event_date >= today).length;
  const fittingCount = events.filter(e => e.event_type === "fitting" && e.event_date >= today).length;

  return (
    <AppShell title="Takvim">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">

        {/* Header */}
        <div className="relative overflow-hidden rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Takvim Merkezi</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] lg:text-5xl">Operasyon Takvimi</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">Teslim, etkinlik, prova ve iade günlerini takip edin.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 lg:max-w-xl">
            {[["Bugün", todayCount], ["İade (yaklaşan)", returnCount], ["Prova (yaklaşan)", fittingCount]].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</div>
                <div className="mt-2 text-xl font-black text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-5 lg:p-7">
          {/* Filtreler */}
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { key: "all",      label: "Tümü" },
              { key: "today",    label: "Bugün" },
              { key: "upcoming", label: "Yaklaşan" },
              ...Object.entries(EVENT_CONFIG).map(([k, v]) => ({ key: k, label: v.label })),
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`rounded-2xl px-4 py-2 text-xs font-black transition ${
                  filter === f.key ? "bg-[#211b16] text-white" : "border border-[#eadfce] bg-white/70 text-[#6d6256]"
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Arama */}
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-3">
            <CalendarDays size={18} className="text-[#b69463]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Müşteri, etkinlik, tarih ara..."
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#9f9386]" />
          </div>

          {/* Liste */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] py-12 text-center text-sm font-bold text-[#8a7f72]">
                Takvim kaydı bulunamadı.
              </div>
            ) : filtered.map(event => {
              const cfg = EVENT_CONFIG[event.event_type] || { label: event.event_type, color: "text-[#b69463]", bg: "bg-[#f7f0e7] border-[#eadfce]", icon: <CalendarDays size={18} /> };
              const isPast = event.event_date < today;
              return (
                <div key={event.id} className={`rounded-[1.5rem] border p-4 lg:p-5 ${cfg.bg} ${isPast ? "opacity-60" : ""}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/60 ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${cfg.color} bg-white/60`}>{cfg.label}</span>
                          {isPast && <span className="rounded-lg bg-white/60 px-2 py-0.5 text-[10px] font-black text-[#9d8b74]">Geçmiş</span>}
                        </div>
                        <h3 className="mt-1 font-black text-[#211b16]">{event.title || "Takvim Kaydı"}</h3>
                        {event.customers?.full_name && (
                          <p className="mt-0.5 text-sm text-[#6d6256]">
                            <UserRound size={12} className="mr-1 inline" />{event.customers.full_name}
                            {event.customers.phone && ` · ${event.customers.phone}`}
                          </p>
                        )}
                        {event.description && (
                          <p className="mt-1 text-xs text-[#9d8b74]">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-sm font-black text-[#211b16]">
                        <CalendarDays size={15} className={cfg.color} />
                        {formatDate(event.event_date)}
                      </div>
                      {event.event_time && (
                        <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-sm font-black text-[#211b16]">
                          <Clock size={15} className={cfg.color} />
                          {event.event_time.slice(0, 5)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
