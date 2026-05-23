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

"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  CalendarDays,
  CreditCard,
  Package,
  Plus,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
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

  const quickActions = [
    { title: "Ürün Ekle", href: "/products", icon: <Plus size={18} /> },
    { title: "Kiralama", href: "/rentals", icon: <ShoppingBag size={18} /> },
    { title: "İade Al", href: "/returns", icon: <RotateCcw size={18} /> },
    { title: "Müşteri", href: "/customers", icon: <Users size={18} /> },
    { title: "Takvim", href: "/calendar", icon: <CalendarDays size={18} /> },
    { title: "Ödeme", href: "/accounting", icon: <CreditCard size={18} /> },
  ];

  return (
    <AppShell title="Anasayfa">
      <div className="space-y-4 lg:space-y-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          <StatCard mobileTitle="Ürün" desktopTitle="Toplam Ürün" value={stats.products} icon={<Package size={20} />} />
          <StatCard mobileTitle="Müşteri" desktopTitle="Toplam Müşteri" value={stats.customers} icon={<Users size={20} />} />
          <StatCard mobileTitle="Kiralama" desktopTitle="Aktif Kiralama" value={stats.rentals} icon={<TrendingUp size={20} />} />
          <StatCard mobileTitle="Prova" desktopTitle="Prova Kaydı" value={stats.fittings} icon={<CalendarDays size={20} />} />
        </div>

        <div className="premium-card p-4 lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="premium-title text-lg">Hızlı İşlemler</h2>
              <p className="premium-muted text-xs">Tek ekrandan işlem başlat</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#eadfce] bg-white/70 px-2 py-3 text-center text-xs font-black text-[#6d6256] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b69463]/15 text-[#b69463]">
                  {item.icon}
                </span>
                {item.title}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 lg:gap-6">
          <div className="premium-card p-4 lg:p-8 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="premium-title text-lg lg:text-2xl">
                  <span className="lg:hidden">Haftalık Gelir</span>
                  <span className="hidden lg:inline">Haftalık Gelir Grafiği</span>
                </h2>
                <p className="premium-muted mt-1 text-xs lg:mt-2 lg:text-base">
                  Canlı rapor bağlantısı sonraki aşamada bağlanacak.
                </p>
              </div>
            </div>

            <div className="mt-4 h-[160px] min-h-[160px] w-full min-w-0 lg:mt-8 lg:h-[280px] lg:min-h-[280px]">
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gelir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b69463" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#b69463" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="gelir" stroke="#b69463" fill="url(#gelir)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="premium-card p-4 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463] lg:h-12 lg:w-12">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="premium-title text-lg lg:text-2xl">
                  <span className="lg:hidden">Bildirimler</span>
                  <span className="hidden lg:inline">Bildirim Merkezi</span>
                </h2>
                <p className="premium-muted text-xs lg:text-sm">Bugünün operasyonları</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 lg:mt-6 lg:space-y-4">
              {[
                "Bugünkü prova kayıtları kontrol edilecek.",
                "İade tarihi yaklaşan ürünler burada görünecek.",
                "Kalan ödeme hatırlatmaları burada listelenecek.",
                "NetGSM entegrasyonu sonrası SMS akışı aktif olacak.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[#eadfce] bg-white/60 p-3 text-xs text-[#6d6256] lg:p-4 lg:text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-2 lg:gap-6">
          {[
            { mobile: "Provalar", desktop: "Bugünkü Provalar" },
            { mobile: "Teslimler", desktop: "Bugün Teslim Edilecekler" },
            { mobile: "İadeler", desktop: "Bugün İade Alınacaklar" },
            { mobile: "Ödemeler", desktop: "Bekleyen Ödemeler" },
          ].map((item) => (
            <div key={item.desktop} className="premium-card p-4 lg:p-8">
              <h3 className="premium-title text-base lg:text-2xl">
                <span className="lg:hidden">{item.mobile}</span>
                <span className="hidden lg:inline">{item.desktop}</span>
              </h3>
              <div className="mt-3 rounded-2xl border border-dashed border-[#d9c9b5] p-4 text-center text-xs premium-muted lg:mt-6 lg:rounded-3xl lg:p-10 lg:text-base">
                <span className="lg:hidden">Kayıt yok</span>
                <span className="hidden lg:inline">Henüz kayıt bulunmuyor.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  mobileTitle,
  desktopTitle,
  value,
  icon,
}: {
  mobileTitle: string;
  desktopTitle: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="premium-card p-4 transition hover:-translate-y-1 lg:p-7">
      <div className="flex items-center justify-between gap-2">
        <p className="premium-muted text-xs font-semibold lg:text-base">
          <span className="lg:hidden">{mobileTitle}</span>
          <span className="hidden lg:inline">{desktopTitle}</span>
        </p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b69463]/15 text-[#b69463] lg:h-12 lg:w-12 lg:rounded-2xl">
          {icon}
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-semibold text-[#211b16] lg:mt-6 lg:text-5xl">{value}</h2>
    </div>
  );
}