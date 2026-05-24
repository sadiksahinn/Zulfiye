"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";

export default function TodayPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  async function load() {
    const [rentalsRes, customersRes] = await Promise.all([
      supabase.from("rentals").select("*").order("delivery_date", { ascending: true }),
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
    ]);

    setRentals(rentalsRes.data || []);
    setCustomers(customersRes.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const deliveries = rentals.filter((x) => x.delivery_date === today);
    const returns = rentals.filter((x) => x.return_date === today);
    const delayed = rentals.filter((x) => x.status === "gecikti");
    const remaining = rentals.filter((x) => Number(x.remaining_amount || 0) > 0);

    return { deliveries, returns, delayed, remaining };
  }, [rentals, today]);

  const customerResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    return customers.filter((c) =>
      [c.full_name, c.phone, c.instagram]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    ).slice(0, 6);
  }, [customers, search]);

  const todayFlow = useMemo(() => {
    const deliveryItems = stats.deliveries.map((x) => ({ ...x, flowType: "Teslim", flowTime: x.delivery_time || "Saat yok" }));
    const returnItems = stats.returns.map((x) => ({ ...x, flowType: "İade", flowTime: x.return_time || "Saat yok" }));
    return [...deliveryItems, ...returnItems].sort((a, b) => String(a.flowTime).localeCompare(String(b.flowTime)));
  }, [stats]);

  return (
    <AppShell title="Bugün">
      <div className="space-y-5 pb-24 lg:space-y-7 lg:pb-0">
        <section className="relative overflow-hidden rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)]">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">MAUNA Personel Ekranı</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Bugün ne var?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Prova, teslim, iade ve müşteri aramalarını tek ekrandan takip edin.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Hero label="Teslim" value={stats.deliveries.length} />
            <Hero label="İade" value={stats.returns.length} />
            <Hero label="Geciken" value={stats.delayed.length} danger />
            <Hero label="Ödeme" value={stats.remaining.length} />
          </div>
        </section>

        <section className="premium-card p-5 lg:p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/75 px-4 py-4 shadow-inner">
            <Search size={20} className="text-[#b69463]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Müşteri adı, telefon veya Instagram ara..."
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]"
            />
          </div>

          {customerResults.length > 0 && (
            <div className="mt-4 grid gap-3">
              {customerResults.map((customer) => (
                <div key={customer.id} className="rounded-2xl border border-[#eadfce] bg-white/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-black text-[#211b16]">{customer.full_name}</h3>
                      <p className="mt-1 text-xs font-bold text-[#8a7f72]">
                        {[customer.phone, customer.instagram].filter(Boolean).join(" • ") || "Detay yok"}
                      </p>
                    </div>
                    <Link href="/customers" className="rounded-2xl bg-[#211b16] px-4 py-3 text-center text-xs font-black text-white">
                      Müşteri Kartına Git
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div className="premium-card p-5 lg:p-6">
            <SectionTitle icon={<Clock size={20} />} title="Günlük Akış" sub="Bugünkü teslim ve iadeler" />

            <div className="mt-5 space-y-3">
              {todayFlow.length === 0 ? (
                <Empty text="Bugün için teslim veya iade görünmüyor." />
              ) : (
                todayFlow.map((item) => (
                  <FlowCard key={`${item.id}-${item.flowType}`} item={item} />
                ))
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="premium-card p-5 lg:p-6">
              <SectionTitle icon={<AlertTriangle size={20} />} title="Kritik Uyarılar" sub="Geciken ve ödeme bekleyen işlemler" />

              <div className="mt-5 space-y-3">
                {stats.delayed.slice(0, 3).map((item) => (
                  <Warning key={item.id} title="Geciken İade" text={`${item.customer_name || "Müşteri"} • ${item.product_name || "Ürün"}`} />
                ))}

                {stats.remaining.slice(0, 3).map((item) => (
                  <Warning key={`pay-${item.id}`} title="Kalan Ödeme" text={`${item.customer_name || "Müşteri"} • ${Number(item.remaining_amount || 0).toLocaleString("tr-TR")} TL`} />
                ))}

                {stats.delayed.length === 0 && stats.remaining.length === 0 && (
                  <Empty text="Kritik uyarı yok." compact />
                )}
              </div>
            </div>

            <div className="premium-card p-5 lg:p-6">
              <SectionTitle icon={<Package size={20} />} title="Hızlı İşlemler" sub="Personelin en çok kullanacağı alanlar" />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Quick href="/rentals" title="Kiralama" icon={<CalendarDays size={18} />} />
                <Quick href="/sales" title="Satış" icon={<ShoppingBag size={18} />} />
                <Quick href="/returns" title="İade Al" icon={<RotateCcw size={18} />} />
                <Quick href="/customers" title="Müşteri" icon={<UserRound size={18} />} />
                <Quick href="/products" title="Ürün Ara" icon={<Package size={18} />} />
                <Quick href="/calendar" title="Takvim" icon={<CalendarDays size={18} />} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Hero({ label, value, danger = false }: any) {
  return (
    <div className={`rounded-2xl p-4 text-center backdrop-blur-xl ${danger ? "bg-red-500/20" : "bg-white/10"}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function SectionTitle({ icon, title, sub }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">{icon}</div>
      <div>
        <h2 className="premium-title text-xl">{title}</h2>
        <p className="premium-muted text-sm">{sub}</p>
      </div>
    </div>
  );
}

function FlowCard({ item }: any) {
  const isReturn = item.flowType === "İade";
  return (
    <div className="rounded-[1.35rem] border border-[#eadfce] bg-white/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isReturn ? "bg-red-100 text-red-700" : "bg-[#b69463]/15 text-[#b69463]"}`}>
            {isReturn ? <RotateCcw size={20} /> : <Package size={20} />}
          </div>
          <div>
            <h3 className="font-black text-[#211b16]">{item.flowTime} — {item.flowType}</h3>
            <p className="mt-1 text-xs font-bold text-[#8a7f72]">
              {[item.customer_name, item.product_name].filter(Boolean).join(" • ") || "Detay yok"}
            </p>
          </div>
        </div>

        <span className="rounded-2xl bg-[#f7f0e7] px-4 py-2 text-xs font-black text-[#211b16]">
          {item.status || "aktif"}
        </span>
      </div>
    </div>
  );
}

function Warning({ title, text }: any) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-red-700">{title}</div>
      <div className="mt-1 text-sm font-bold text-[#211b16]">{text}</div>
    </div>
  );
}

function Quick({ href, title, icon }: any) {
  return (
    <Link href={href} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-[#eadfce] bg-white/70 p-3 text-center text-sm font-black text-[#211b16]">
      <span className="text-[#b69463]">{icon}</span>
      {title}
    </Link>
  );
}

function Empty({ text, compact = false }: any) {
  return (
    <div className={`rounded-3xl border border-dashed border-[#d9c9b5] text-center text-sm font-bold text-[#8a7f72] ${compact ? "p-6" : "p-10"}`}>
      {text}
    </div>
  );
}
