"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, List, Package, RotateCcw, ShoppingBag, UserRound } from "lucide-react";

const EVENT_CFG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  delivery: { label: "Teslim",   dot: "bg-blue-500",   bg: "bg-blue-50 border-blue-200",    text: "text-blue-700" },
  return:   { label: "İade",     dot: "bg-red-500",    bg: "bg-red-50 border-red-200",      text: "text-red-700" },
  rental:   { label: "Etkinlik", dot: "bg-amber-500",  bg: "bg-amber-50 border-amber-200",  text: "text-amber-700" },
  fitting:  { label: "Prova",    dot: "bg-purple-500", bg: "bg-purple-50 border-purple-200",text: "text-purple-700" },
  sale:     { label: "Satış",    dot: "bg-green-500",  bg: "bg-green-50 border-green-200",  text: "text-green-700" },
};

const DAYS   = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [view, setView] = useState<"month" | "list">("month");
  const [search, setSearch] = useState("");
  const [listFilter, setListFilter] = useState<"all"|"today"|"upcoming"|string>("upcoming");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("calendar_events")
      .select("*, customers(full_name,phone)")
      .order("event_date", { ascending: true });
    setEvents(data || []);
  }

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().slice(0, 10);

  // Aylık grid verileri
  const calendarDays = useMemo(() => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    // Pazartesi=0 ... Pazar=6
    const startDow = (first.getDay() + 6) % 7;
    const days: (string | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    events.forEach(e => {
      if (!map[e.event_date]) map[e.event_date] = [];
      map[e.event_date].push(e);
    });
    return map;
  }, [events]);

  // Liste filtresi
  const listEvents = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter(e => {
      const matchSearch = !q || [e.title, e.event_type, e.event_date, e.customers?.full_name]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (listFilter === "today")    return e.event_date === today;
      if (listFilter === "upcoming") return e.event_date >= today;
      if (EVENT_CFG[listFilter])     return e.event_type === listFilter;
      return true;
    });
  }, [events, search, listFilter, today]);

  const todayCount    = events.filter(e => e.event_date === today).length;
  const upcomingCount = events.filter(e => e.event_date > today).length;
  const returnCount   = events.filter(e => e.event_type === "return" && e.event_date >= today).length;

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] || []) : [];

  return (
    <AppShell title="Takvim">
      <div className="space-y-5 pb-24 lg:pb-0">

        {/* Header */}
        <div className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">ZÜLFİYE CANBOLAT Takvim</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Operasyon Takvimi</h1>
          <div className="mt-5 grid grid-cols-3 gap-3 lg:max-w-lg">
            {[["Bugün", todayCount], ["Yaklaşan", upcomingCount], ["İade", returnCount]].map(([l, v]) => (
              <div key={l as string} className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{l}</div>
                <div className="mt-2 text-xl font-black text-white">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Görünüm seçici */}
        <div className="flex gap-2">
          <button onClick={() => setView("month")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition ${view === "month" ? "bg-[#211b16] text-white" : "border border-[#eadfce] bg-white/70 text-[#6d6256]"}`}>
            <CalendarDays size={16} /> Aylık
          </button>
          <button onClick={() => setView("list")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition ${view === "list" ? "bg-[#211b16] text-white" : "border border-[#eadfce] bg-white/70 text-[#6d6256]"}`}>
            <List size={16} /> Liste
          </button>
        </div>

        {/* AYLIK GÖRÜNÜM */}
        {view === "month" && (
          <div className="premium-card overflow-hidden p-0">
            {/* Ay navigasyonu */}
            <div className="flex items-center justify-between border-b border-[#eadfce] px-5 py-4">
              <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#eadfce] bg-white/70 text-[#6d6256] hover:bg-white">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-lg font-black text-[#211b16]">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#eadfce] bg-white/70 text-[#6d6256] hover:bg-white">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Gün başlıkları */}
            <div className="grid grid-cols-7 border-b border-[#eadfce] bg-[#f7f0e7]">
              {DAYS.map(d => (
                <div key={d} className="py-2.5 text-center text-[10px] font-black uppercase tracking-[0.15em] text-[#9d8b74]">{d}</div>
              ))}
            </div>

            {/* Günler */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-[#f0e8de] bg-[#faf6f1]" />;
                const dayEvents = eventsByDay[day] || [];
                const isToday   = day === today;
                const isPast    = day < today;
                const isSelected = day === selectedDay;
                return (
                  <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`min-h-[80px] border-b border-r border-[#f0e8de] p-2 text-left transition hover:bg-[#f7f0e7] ${isSelected ? "bg-[#b69463]/10 ring-2 ring-inset ring-[#b69463]" : ""} ${isPast ? "opacity-60" : ""}`}>
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-black ${
                      isToday ? "bg-[#b69463] text-white" : "text-[#211b16]"
                    }`}>{Number(day.slice(8))}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map(e => {
                        const cfg = EVENT_CFG[e.event_type] || EVENT_CFG.delivery;
                        return (
                          <div key={e.id} className={`truncate rounded px-1.5 py-0.5 text-[10px] font-black ${cfg.text} bg-white/60`}>
                            <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`}/>
                            {e.customers?.full_name || e.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] font-black text-[#9d8b74]">+{dayEvents.length-3} daha</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Seçili gün detayı */}
            {selectedDay && selectedEvents.length > 0 && (
              <div className="border-t border-[#eadfce] p-5">
                <h3 className="mb-3 font-black text-[#211b16]">{formatDate(selectedDay)} — {selectedEvents.length} etkinlik</h3>
                <div className="space-y-2">
                  {selectedEvents.map(e => {
                    const cfg = EVENT_CFG[e.event_type] || EVENT_CFG.delivery;
                    return (
                      <div key={e.id} className={`flex items-start gap-3 rounded-2xl border p-3 ${cfg.bg}`}>
                        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`}/>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-black ${cfg.text}`}>{cfg.label}</span>
                            <span className="text-sm font-black text-[#211b16]">{e.title}</span>
                          </div>
                          {e.customers?.full_name && <div className="text-xs text-[#6d6256]"><UserRound size={11} className="mr-1 inline"/>{e.customers.full_name}</div>}
                        </div>
                        {e.event_time && (
                          <div className="flex shrink-0 items-center gap-1 text-xs font-black text-[#9d8b74]">
                            <Clock size={12}/>{e.event_time.slice(0,5)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LİSTE GÖRÜNÜMÜ */}
        {view === "list" && (
          <div className="premium-card p-5">
            {/* Filtreler */}
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { key: "upcoming", label: "Yaklaşan" },
                { key: "today",    label: "Bugün" },
                { key: "all",      label: "Tümü" },
                ...Object.entries(EVENT_CFG).map(([k,v]) => ({ key: k, label: v.label })),
              ].map(f => (
                <button key={f.key} onClick={() => setListFilter(f.key)}
                  className={`rounded-2xl px-3 py-1.5 text-xs font-black transition ${listFilter === f.key ? "bg-[#211b16] text-white" : "border border-[#eadfce] bg-white/70 text-[#6d6256]"}`}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-full border border-[#eadfce] bg-white/70 px-4 py-3">
              <CalendarDays size={16} className="text-[#b69463]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Müşteri, etkinlik, tarih ara..."
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#9f9386]" />
            </div>

            {listEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] py-12 text-center text-sm font-bold text-[#8a7f72]">Etkinlik bulunamadı.</div>
            ) : (
              <div className="space-y-2">
                {listEvents.map(event => {
                  const cfg = EVENT_CFG[event.event_type] || EVENT_CFG.delivery;
                  const isPast = event.event_date < today;
                  return (
                    <div key={event.id} className={`flex flex-col gap-3 rounded-[1.5rem] border p-4 lg:flex-row lg:items-center lg:justify-between ${cfg.bg} ${isPast ? "opacity-60" : ""}`}>
                      <div className="flex gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/60 ${cfg.text}`}>
                          {event.event_type === "return" ? <RotateCcw size={16}/> :
                           event.event_type === "fitting" ? <UserRound size={16}/> :
                           event.event_type === "sale" ? <ShoppingBag size={16}/> : <Package size={16}/>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black ${cfg.text}`}>{cfg.label}</span>
                            {isPast && <span className="text-[10px] font-black text-[#9d8b74]">Geçmiş</span>}
                          </div>
                          <div className="font-black text-[#211b16]">{event.title}</div>
                          {event.customers?.full_name && (
                            <div className="text-xs text-[#6d6256]"><UserRound size={11} className="mr-1 inline"/>{event.customers.full_name} {event.customers.phone && `· ${event.customers.phone}`}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-2xl bg-white/70 px-3 py-2 text-sm font-black text-[#211b16]">
                          <CalendarDays size={14} className={cfg.text}/>{formatDate(event.event_date)}
                        </div>
                        {event.event_time && (
                          <div className="flex items-center gap-1.5 rounded-2xl bg-white/70 px-3 py-2 text-sm font-black text-[#211b16]">
                            <Clock size={14} className={cfg.text}/>{event.event_time.slice(0,5)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Renk legend */}
        <div className="flex flex-wrap gap-3 px-1">
          {Object.entries(EVENT_CFG).map(([,cfg]) => (
            <div key={cfg.label} className="flex items-center gap-1.5 text-xs font-bold text-[#9d8b74]">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`}/>
              {cfg.label}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
