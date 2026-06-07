"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, ArrowRight, CalendarDays, Package, Plus, ShoppingBag, Users, Wallet } from "lucide-react";

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

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const revenue = rentals.reduce((s, x) => s + Number(x.total_amount || 0), 0);
    const remaining = rentals.reduce((s, x) => s + Number(x.remaining_amount || 0), 0);
    const stock = products.filter((x) => x.status === "stokta").length;
    const rented = products.filter((x) => x.status === "kirada").length;
    const delayed = rentals.filter((x) => x.status === "gecikti").length;
    const todayDeliveries = rentals.filter((x) => x.delivery_date === today).length;
    const todayReturns = rentals.filter((x) => x.return_date === today).length;
    return { revenue, remaining, stock, rented, delayed, todayDeliveries, todayReturns };
  }, [products, rentals]);

  const progress = products.length ? Math.round((stats.rented / products.length) * 100) : 0;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-5 pb-24 lg:space-y-7 lg:pb-0">
        <section className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)]">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">ZÜLFİYE CANBOLAT Operasyon</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Bugünün özeti</h1>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <HeroMini label="Ciro" value={`${stats.revenue.toLocaleString("tr-TR")} TL`} />
            <HeroMini label="Bekleyen" value={`${stats.remaining.toLocaleString("tr-TR")} TL`} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-6">
          <Metric title="Bugün Teslim" value={stats.todayDeliveries} sub="Teslim edilecek" icon={<CalendarDays size={20} />} />
          <Metric title="Bugün İade" value={stats.todayReturns} sub="Geri alınacak" icon={<CalendarDays size={20} />} />
          <Metric title="Ürün" value={products.length} sub={`${stats.stock} stokta`} icon={<Package size={20} />} />
          <Metric title="Müşteri" value={customers.length} sub="Kayıtlı" icon={<Users size={20} />} />
          <Metric title="Kirada" value={stats.rented} sub="Aktif" icon={<ShoppingBag size={20} />} />
          <Metric title="Geciken" value={stats.delayed} sub="Kontrol" icon={<AlertTriangle size={20} />} danger />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <div className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="premium-title text-xl">Hızlı erişim</h2>
                <p className="premium-muted mt-1 text-sm">Sık kullanılan işlemler</p>
              </div>
              <Plus className="text-[#b69463]" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Quick href="/rentals" title="Kiralama" icon={<CalendarDays size={18} />} />
              <Quick href="/returns" title="İade Al" icon={<AlertTriangle size={18} />} />
              <Quick href="/sales" title="Satış" icon={<ShoppingBag size={18} />} />
              <Quick href="/calendar" title="Takvim" icon={<CalendarDays size={18} />} />
              <Quick href="/products" title="Ürünler" icon={<Package size={18} />} />
              <Quick href="/customers" title="Müşteri" icon={<Users size={18} />} />
            </div>
          </div>

          <div className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="premium-title text-xl">Operasyon durumu</h2>
                <p className="premium-muted mt-1 text-sm">Stok / kiralama dengesi</p>
              </div>
              <span className="rounded-full bg-[#f7f0e7] px-4 py-2 text-sm font-black text-[#211b16]">%{progress}</span>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#eadfce]">
              <div className="h-full rounded-full bg-[#b69463]" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Status label="Stokta" value={stats.stock} />
              <Status label="Kirada" value={stats.rented} />
              <Status label="Geciken" value={stats.delayed} danger />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <div className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="premium-title text-xl">Son hareketler</h2>
                <p className="premium-muted mt-1 text-sm">Son kiralama kayıtları</p>
              </div>
              <Link href="/rentals" className="flex items-center gap-1 text-sm font-black text-[#b69463]">Tümü <ArrowRight size={16} /></Link>
            </div>

            <div className="mt-5 space-y-3">
              {rentals.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-[1.35rem] border border-[#eadfce] bg-white/65 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-[#211b16]">{item.customer_name || "Müşteri"}</h3>
                      <p className="mt-1 text-xs font-bold text-[#8a7f72]">{item.product_name || "Ürün"} • {item.return_date || "-"}</p>
                    </div>
                    <div className="rounded-2xl bg-[#f7f0e7] px-3 py-2 text-xs font-black text-[#211b16]">
                      {Number(item.total_amount || 0).toLocaleString("tr-TR")} TL
                    </div>
                  </div>
                </div>
              ))}
              {rentals.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-8 text-center text-sm font-bold text-[#8a7f72]">Henüz hareket yok.</div>
              )}
            </div>
          </div>

          <div className="premium-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b69463]/15 text-[#b69463]">
                <Wallet size={20} />
              </div>
              <div>
                <h2 className="premium-title text-xl">Tahsilat</h2>
                <p className="premium-muted text-sm">Bekleyen ödeme</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.4rem] bg-[#211b16] p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Bekleyen Toplam</p>
              <h3 className="mt-2 text-3xl font-black tracking-[-0.04em]">{stats.remaining.toLocaleString("tr-TR")} TL</h3>
            </div>

            <Link href="/accounting" className="mt-4 flex items-center justify-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-4 text-sm font-black text-[#211b16]">
              Muhasebeye Git <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function HeroMini({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function Metric({ title, value, sub, icon, danger = false }: any) {
  return (
    <div className={`premium-card p-4 ${danger ? "border-red-200" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7f72]">{title}</p>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#211b16]">{value}</h3>
          <p className={`mt-1 text-xs font-bold ${danger ? "text-red-600" : "text-[#8a7f72]"}`}>{sub}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${danger ? "bg-red-100 text-red-600" : "bg-[#b69463]/15 text-[#b69463]"}`}>{icon}</div>
      </div>
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

function Status({ label, value, danger = false }: any) {
  return (
    <div className="rounded-2xl bg-[#f7f0e7] p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7f72]">{label}</div>
      <div className={`mt-2 text-2xl font-black ${danger ? "text-red-700" : "text-[#211b16]"}`}>{value}</div>
    </div>
  );
}
