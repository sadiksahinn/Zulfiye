"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { Package, TrendingUp, Users, Wallet } from "lucide-react";

export default function ReportsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);

  async function load() {
    const [p, c, r] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("rentals").select("*"),
    ]);

    setProducts(p.data || []);
    setCustomers(c.data || []);
    setRentals(r.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    return rentals.reduce(
      (acc, item) => {
        const total = Number(item.total_amount || 0);
        const paid = Number(item.deposit_amount || 0);
        const remaining = Number(item.remaining_amount ?? Math.max(total - paid, 0));
        acc.total += total;
        acc.paid += paid;
        acc.remaining += remaining;
        return acc;
      },
      { total: 0, paid: 0, remaining: 0 }
    );
  }, [rentals]);

  return (
    <AppShell title="Raporlar">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-7 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)]">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Raporlama</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">İşletme özeti</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">Ürün, müşteri, kiralama ve tahsilat performansını tek ekranda görün.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Card title="Ürün" value={products.length} icon={<Package size={22} />} />
          <Card title="Müşteri" value={customers.length} icon={<Users size={22} />} />
          <Card title="Kiralama" value={rentals.length} icon={<TrendingUp size={22} />} />
          <Card title="Kalan" value={`${totals.remaining.toLocaleString("tr-TR")} TL`} icon={<Wallet size={22} />} dark />
        </div>

        <div className="premium-card p-6">
          <h2 className="premium-title text-2xl">Finans Özeti</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Mini title="Toplam Ciro" value={`${totals.total.toLocaleString("tr-TR")} TL`} />
            <Mini title="Alınan Ödeme" value={`${totals.paid.toLocaleString("tr-TR")} TL`} />
            <Mini title="Bekleyen Ödeme" value={`${totals.remaining.toLocaleString("tr-TR")} TL`} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, value, icon, dark = false }: any) {
  return (
    <div className={`premium-card p-6 ${dark ? "bg-[#211b16] text-white" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={dark ? "text-white/60" : "premium-muted"}>{title}</p>
          <h3 className={`mt-3 text-3xl font-black ${dark ? "text-white" : "text-[#211b16]"}`}>{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? "bg-white/10 text-[#d8bd84]" : "bg-[#b69463]/15 text-[#b69463]"}`}>{icon}</div>
      </div>
    </div>
  );
}

function Mini({ title, value }: any) {
  return (
    <div className="rounded-3xl border border-[#eadfce] bg-white/60 p-5">
      <p className="premium-muted text-sm">{title}</p>
      <h3 className="mt-2 text-2xl font-black text-[#211b16]">{value}</h3>
    </div>
  );
}
