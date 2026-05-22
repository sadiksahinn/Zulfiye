"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type CalendarEvent = {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  color: string | null;
  description: string | null;
  sms_status: string | null;
};

const typeLabels: Record<string, string> = {
  rental: "Kiralama",
  delivery: "Teslim",
  return: "İade",
  alteration: "Tadilat",
  cleaning: "Temizleme",
  payment: "Ödeme",
  sale: "Satış",
  fitting: "Prova",
};

const typeColors: Record<string, string> = {
  rental: "bg-[#b69463] text-white",
  delivery: "bg-[#1f1b16] text-white",
  return: "bg-emerald-600 text-white",
  alteration: "bg-purple-600 text-white",
  cleaning: "bg-sky-600 text-white",
  payment: "bg-red-600 text-white",
  sale: "bg-zinc-900 text-white",
  fitting: "bg-orange-400 text-white",
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const monthName = today.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  async function loadEvents() {
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true });

    setEvents((data || []) as CalendarEvent[]);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const result: { date: string; day: number | null }[] = [];

    for (let i = 0; i < startOffset; i++) {
      result.push({ date: "", day: null });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const iso = date.toISOString().slice(0, 10);
      result.push({ date: iso, day: d });
    }

    return result;
  }, [year, month]);

  function eventsForDate(date: string) {
    return events.filter((e) => e.event_date === date);
  }

  return (
    <AppShell title="Operasyon Takvimi">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 premium-card p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="premium-title text-3xl capitalize">{monthName}</h2>
              <p className="premium-muted mt-2">
                Kiralama, teslim, iade, satış, tadilat ve SMS operasyonları.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-7 gap-3 text-center text-sm premium-muted">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-3">
            {days.map((item, index) => {
              const dayEvents = item.date ? eventsForDate(item.date) : [];

              return (
                <button
                  key={index}
                  onClick={() => item.date && setSelectedDate(item.date)}
                  className={`min-h-[135px] rounded-3xl border p-3 text-left transition ${
                    item.date
                      ? "bg-white/70 border-[#eadfce] hover:-translate-y-1 hover:shadow-xl"
                      : "bg-transparent border-transparent"
                  }`}
                >
                  {item.day && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#211b16]">{item.day}</span>
                        {dayEvents.length > 0 && (
                          <span className="rounded-full bg-[#b69463]/15 px-2 py-1 text-xs text-[#b69463]">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            className={`rounded-2xl px-3 py-2 text-xs ${
                              typeColors[event.event_type] || "bg-[#b69463] text-white"
                            }`}
                          >
                            <div className="font-semibold truncate">
                              {event.event_time ? event.event_time.slice(0, 5) : "--:--"} · {typeLabels[event.event_type] || event.event_type}
                            </div>
                            <div className="truncate opacity-90">{event.title}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="premium-card p-8">
          <h2 className="premium-title text-2xl">Gün Detayı</h2>

          {!selectedDate ? (
            <p className="premium-muted mt-4">Detay görmek için takvimden bir gün seç.</p>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="font-semibold text-[#211b16]">{selectedDate}</p>

              {eventsForDate(selectedDate).length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-8 text-center premium-muted">
                  Bu gün için işlem yok.
                </div>
              ) : (
                eventsForDate(selectedDate).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full rounded-3xl border border-[#eadfce] bg-white/70 p-5 text-left hover:shadow-lg transition"
                  >
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs ${
                        typeColors[event.event_type] || "bg-[#b69463] text-white"
                      }`}
                    >
                      {typeLabels[event.event_type] || event.event_type}
                    </span>

                    <h3 className="mt-3 font-semibold text-[#211b16]">{event.title}</h3>
                    <p className="mt-1 text-sm premium-muted">
                      {event.event_time ? event.event_time.slice(0, 5) : "Saat yok"}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl border border-[#eadfce]">
            <div className="flex items-start justify-between gap-5">
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs ${
                    typeColors[selectedEvent.event_type] || "bg-[#b69463] text-white"
                  }`}
                >
                  {typeLabels[selectedEvent.event_type] || selectedEvent.event_type}
                </span>

                <h2 className="mt-4 text-3xl font-semibold text-[#211b16]">
                  {selectedEvent.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-full bg-[#f5efe7] px-4 py-2 text-[#6d6256]"
              >
                Kapat
              </button>
            </div>

            <div className="mt-6 grid gap-4 text-[#6d6256]">
              <div className="rounded-2xl bg-[#f7f0e7] p-4">
                Tarih: {selectedEvent.event_date}
              </div>

              <div className="rounded-2xl bg-[#f7f0e7] p-4">
                Saat: {selectedEvent.event_time ? selectedEvent.event_time.slice(0, 5) : "Belirtilmedi"}
              </div>

              <div className="rounded-2xl bg-[#f7f0e7] p-4">
                SMS Durumu: {selectedEvent.sms_status || "bekliyor"}
              </div>

              {selectedEvent.description && (
                <div className="rounded-2xl bg-[#f7f0e7] p-4">
                  {selectedEvent.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
