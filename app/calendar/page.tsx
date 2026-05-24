"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Clock, Package, RotateCcw, Search, Filter } from "lucide-react";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");

  async function load() {
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true });

    setEvents(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const today = new Date().toISOString().slice(0, 10);

    return events.filter((e) => {
      const matchesSearch = [e.title, e.event_type, e.event_date, e.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);

      if (!matchesSearch) return false;
      if (filter === "today") return e.event_date === today;
      if (filter === "upcoming") return e.event_date >= today;
      return true;
    });
  }, [events, search, filter]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter((e) => e.event_date === today).length;
  }, [events]);

  const returnCount = useMemo(() => {
    return events.filter((e) => e.event_type === "return").length;
  }, [events]);

  return (
    <AppShell title="Takvim">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)] lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">
            MAUNA Takvim Merkezi
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] lg:text-5xl">
            Operasyon Takvimi
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Teslim, etkinlik ve iade günlerini tek ekrandan takip edin.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 lg:max-w-xl">
            <Hero label="Bugün" value={todayCount} />
            <Hero label="İade" value={returnCount} />
            <Hero label="Toplam" value={events.length} />
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Tümü" />
            <FilterButton active={filter === "today"} onClick={() => setFilter("today")} label="Bugün" />
            <FilterButton active={filter === "upcoming"} onClick={() => setFilter("upcoming")} label="Yaklaşan" />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-4">
            <Search size={18} className="text-[#b69463]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Teslim, iade, müşteri veya tarih ara"
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#9f9386]"
            />
          </div>

          <div className="mt-6 space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-12 text-center text-sm font-bold text-[#8a7f72]">
                Takvim kaydı bulunamadı.
              </div>
            ) : (
              filtered.map((event) => (
                <div key={event.id} className="rounded-[1.7rem] border border-[#eadfce] bg-white/70 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                        {event.event_type === "return" ? <RotateCcw size={20} /> : <Package size={20} />}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#211b16]">
                          {event.title || "Takvim Kaydı"}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-[#8a7f72]">
                          {event.description || "Açıklama yok"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Info icon={<CalendarDays size={16} />} value={event.event_date || "-"} />
                      <Info icon={<Clock size={16} />} value={event.event_time || "-"} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ icon, value }: any) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[#f7f0e7] px-4 py-3 text-sm font-black text-[#211b16]">
      <span className="text-[#b69463]">{icon}</span>
      {value}
    </div>
  );
}


function Hero({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function FilterButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${
        active ? "bg-[#211b16] text-white" : "border border-[#eadfce] bg-white/70 text-[#6d6256]"
      }`}
    >
      <Filter size={15} />
      {label}
    </button>
  );
}
