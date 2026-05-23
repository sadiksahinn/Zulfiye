"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  CalendarClock,
  Package,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);

  async function load() {
    const [p, c, r] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("rentals").select("*").order("created_at", { ascending: false }),
    ]);

    setProducts(p.data || []);
    setCustomers(c.data || []);
    setRentals(r.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const revenue = rentals.reduce(
      (acc, item) => acc + Number(item.total_amount || 0),
      0
    );

    const remaining = rentals.reduce(
      (acc, item) => acc + Number(item.remaining_amount || 0),
      0
    );

    return {
      revenue,
      remaining,
      rented: products.filter((x) => x.status === "kirada").length,
      stock: products.filter((x) => x.status === "stokta").length,
      delayed: rentals.filter((x) => x.status === "gecikti").length,
    };
  }, [products, rentals]);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">

        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)] lg:p-8">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">
                MAUNA OPERASYON
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] lg:text-6xl">
                Yönetim Paneli
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Kiralama, müşteri, tahsilat ve operasyon süreçlerini canlı takip edin.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
              <MiniCard
                label="Toplam Ciro"
                value={`${stats.revenue.toLocaleString("tr-TR")} TL`}
              />

              <MiniCard
                label="Bekleyen"
                value={`${stats.remaining.toLocaleString("tr-TR")} TL`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          <Card
            title="Toplam Ürün"
            value={products.length}
            sub={`${stats.stock} stokta`}
            icon={<Package size={22} />}
          />

          <Card
            title="Müşteri"
            value={customers.length}
            sub="Kayıtlı müşteri"
            icon={<Users size={22} />}
          />

          <Card
            title="Kiradaki"
            value={stats.rented}
            sub="Aktif operasyon"
            icon={<TrendingUp size={22} />}
          />

          <Card
            title="Geciken"
            value={stats.delayed}
            sub="İade bekleniyor"
            icon={<AlertTriangle size={22} />}
            danger
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_.85fr]">

          <div className="premium-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                <CalendarClock size={20} />
              </div>

              <div>
                <h2 className="premium-title text-2xl">
                  Son Kiralamalar
                </h2>

                <p className="premium-muted text-sm">
                  Güncel operasyon hareketleri
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {rentals.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[#eadfce] bg-white/60 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-[#211b16]">
                        {item.customer_name || "Müşteri"}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-[#8a7f72]">
                        {item.delivery_date} • {item.return_date}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f7f0e7] px-4 py-3 text-sm font-black text-[#211b16]">
                      {Number(item.total_amount || 0).toLocaleString("tr-TR")} TL
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-6">
            <h2 className="premium-title text-2xl">
              Operasyon Durumu
            </h2>

            <div className="mt-6 space-y-4">

              <StatusRow
                label="Stokta Ürün"
                value={stats.stock}
              />

              <StatusRow
                label="Kiradaki Ürün"
                value={stats.rented}
              />

              <StatusRow
                label="Bekleyen Tahsilat"
                value={`${stats.remaining.toLocaleString("tr-TR")} TL`}
              />

              <StatusRow
                label="Geciken İade"
                value={stats.delayed}
                danger
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, value, sub, icon, danger = false }: any) {
  return (
    <div className={`premium-card p-6 ${danger ? "border-red-200" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="premium-muted text-sm">{title}</p>

          <h3 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#211b16]">
            {value}
          </h3>

          <p className={`mt-2 text-xs font-bold ${danger ? "text-red-600" : "text-[#8a7f72]"}`}>
            {sub}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${danger ? "bg-red-100 text-red-600" : "bg-[#b69463]/15 text-[#b69463]"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
        {label}
      </div>

      <div className="mt-2 text-sm font-black text-white">
        {value}
      </div>
    </div>
  );
}

function StatusRow({ label, value, danger = false }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white/60 px-4 py-4">
      <span className="text-sm font-bold text-[#6d6256]">
        {label}
      </span>

      <span className={`rounded-full px-3 py-1 text-sm font-black ${danger ? "bg-red-100 text-red-700" : "bg-[#f7f0e7] text-[#211b16]"}`}>
        {value}
      </span>
    </div>
  );
}
