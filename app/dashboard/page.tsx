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
      </div>
    </AppShell>
  );
}

function StatCard({ mobileTitle, desktopTitle, value, icon }: {
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
