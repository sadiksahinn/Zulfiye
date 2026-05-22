"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { Bell, CalendarDays, Package, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    rentals: 0,
    fittings: 0,
  });

  const chartData = [
    { name: "Pzt", gelir: 0 },
    { name: "Sal", gelir: 0 },
    { name: "Çar", gelir: 0 },
    { name: "Per", gelir: 0 },
    { name: "Cum", gelir: 0 },
    { name: "Cmt", gelir: 0 },
    { name: "Paz", gelir: 0 },
  ];

  async function loadStats() {
    const [products, customers, rentals, fittings] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("rentals").select("*", { count: "exact", head: true }),
      supabase.from("fittings").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      products: products.count || 0,
      customers: customers.count || 0,
      rentals: rentals.count || 0,
      fittings: fittings.count || 0,
    });
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AppShell title="Anasayfa">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Toplam Ürün" value={stats.products} icon={<Package />} />
        <StatCard title="Toplam Müşteri" value={stats.customers} icon={<Users />} />
        <StatCard title="Aktif Kiralama" value={stats.rentals} icon={<TrendingUp />} />
        <StatCard title="Prova Kaydı" value={stats.fittings} icon={<CalendarDays />} />
      </div>

      <div className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 premium-card p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="premium-title text-2xl">Haftalık Gelir Grafiği</h2>
              <p className="premium-muted mt-2">Canlı rapor bağlantısı sonraki aşamada bağlanacak.</p>
            </div>
          </div>

          <div className="mt-8 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gelir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b69463" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#b69463" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="gelir" stroke="#b69463" fill="url(#gelir)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#b69463]/15 text-[#b69463] flex items-center justify-center">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="premium-title text-2xl">Bildirim Merkezi</h2>
              <p className="premium-muted text-sm">Bugünün operasyonları</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              "Bugünkü prova kayıtları kontrol edilecek.",
              "İade tarihi yaklaşan ürünler burada görünecek.",
              "Kalan ödeme hatırlatmaları burada listelenecek.",
              "NetGSM entegrasyonu sonrası SMS akışı aktif olacak.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#eadfce] bg-white/60 p-4 text-sm text-[#6d6256]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {["Bugünkü Provalar", "Bugün Teslim Edilecekler", "Bugün İade Alınacaklar", "Bekleyen Ödemeler"].map((title) => (
          <div key={title} className="premium-card p-8">
            <h3 className="premium-title text-2xl">{title}</h3>
            <div className="mt-6 rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center premium-muted">
              Henüz kayıt bulunmuyor.
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="premium-card p-7 group hover:-translate-y-1 transition">
      <div className="flex items-center justify-between">
        <p className="premium-muted">{title}</p>
        <div className="h-12 w-12 rounded-2xl bg-[#b69463]/15 text-[#b69463] flex items-center justify-center">
          {icon}
        </div>
      </div>

      <h2 className="mt-6 text-5xl font-semibold text-[#211b16]">{value}</h2>
    </div>
  );
}
