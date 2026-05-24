"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Package, RotateCcw, TrendingUp, Users, Wallet } from "lucide-react";

export default function ReportsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");

    const [p, c, r] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("rentals").select("*").order("created_at", { ascending: false }),
    ]);

    if (p.error || c.error || r.error) {
      setMessage(p.error?.message || c.error?.message || r.error?.message || "Rapor verisi alınamadı.");
    }

    setProducts(p.data || []);
    setCustomers(c.data || []);
    setRentals(r.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => {
    const total = rentals.reduce((s, x) => s + Number(x.total_amount || 0), 0);
    const paid = rentals.reduce((s, x) => s + Number(x.deposit_amount || x.paid_amount || 0), 0);
    const remaining = rentals.reduce((s, x) => s + Number(x.remaining_amount || 0), 0);

    const stock = products.filter((x) => x.status === "stokta").length;
    const rented = products.filter((x) => x.status === "kirada").length;
    const sold = products.filter((x) => x.status === "satildi").length;
    const delayed = rentals.filter((x) => x.status === "gecikti").length;
    const openReturns = rentals.filter((x) => ["aktif", "gecikti"].includes(x.status)).length;

    return { total, paid, remaining, stock, rented, sold, delayed, openReturns };
  }, [products, rentals]);

  return (
    <AppShell title="Raporlar">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)] lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Raporlama</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] lg:text-5xl">İşletme özeti</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Ürün, müşteri, kiralama, tahsilat ve iade performansını tek ekranda görün.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:max-w-xl">
            <Hero label="Ciro" value={money(metrics.total)} />
            <Hero label="Bekleyen" value={money(metrics.remaining)} />
          </div>
        </div>

        {message ? <div className="premium-card p-4 text-sm font-black text-[#6d6256]">{message}</div> : null}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
          <Card title="Ürün" value={products.length} sub={`${metrics.stock} stokta`} icon={<Package size={20} />} />
          <Card title="Müşteri" value={customers.length} sub="Kayıtlı" icon={<Users size={20} />} />
          <Card title="Kiralama" value={rentals.length} sub="Toplam" icon={<TrendingUp size={20} />} />
          <Card title="Kirada" value={metrics.rented} sub="Aktif" icon={<RotateCcw size={20} />} />
          <Card title="Satıldı" value={metrics.sold} sub="Ürün" icon={<Wallet size={20} />} />
          <Card title="Geciken" value={metrics.delayed} sub="Kontrol" icon={<AlertTriangle size={20} />} danger />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_.8fr]">
          <section className="premium-card p-6">
            <h2 className="premium-title text-2xl">Finans Özeti</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Mini title="Toplam Ciro" value={money(metrics.total)} />
              <Mini title="Alınan Ödeme" value={money(metrics.paid)} />
              <Mini title="Bekleyen Ödeme" value={money(metrics.remaining)} dark />
            </div>
          </section>

          <section className="premium-card p-6">
            <h2 className="premium-title text-2xl">Operasyon Durumu</h2>
            <div className="mt-5 space-y-3">
              <Row label="Stokta Ürün" value={metrics.stock} />
              <Row label="Kiradaki Ürün" value={metrics.rented} />
              <Row label="Açık İade" value={metrics.openReturns} danger={metrics.openReturns > 0} />
              <Row label="Geciken İade" value={metrics.delayed} danger={metrics.delayed > 0} />
            </div>
          </section>
        </div>

        <section className="premium-card p-6">
          <h2 className="premium-title text-2xl">Son Kiralamalar</h2>
          <div className="mt-5 space-y-3">
            {rentals.slice(0, 6).length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-sm font-bold text-[#8a7f72]">
                Henüz kiralama kaydı yok.
              </div>
            ) : (
              rentals.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-[1.35rem] border border-[#eadfce] bg-white/65 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="font-black text-[#211b16]">{item.product_name || "Ürün bilgisi yok"}</h3>
                      <p className="mt-1 text-xs font-bold text-[#8a7f72]">
                        {[item.customer_name, item.delivery_date, item.return_date, item.status].filter(Boolean).join(" • ") || "Kiralama detayı yok"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f7f0e7] px-4 py-3 text-sm font-black text-[#211b16]">
                      {money(item.total_amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function money(value: any) {
  return `${Number(value || 0).toLocaleString("tr-TR")} TL`;
}

function Hero({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function Card({ title, value, sub, icon, danger = false }: any) {
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

function Mini({ title, value, dark = false }: any) {
  return (
    <div className={`rounded-3xl border border-[#eadfce] p-5 ${dark ? "bg-[#211b16] text-white" : "bg-white/60"}`}>
      <p className={`text-sm font-bold ${dark ? "text-white/60" : "premium-muted"}`}>{title}</p>
      <h3 className={`mt-2 text-2xl font-black ${dark ? "text-white" : "text-[#211b16]"}`}>{value}</h3>
    </div>
  );
}

function Row({ label, value, danger = false }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white/60 px-4 py-3">
      <span className="text-sm font-bold text-[#6d6256]">{label}</span>
      <span className={`rounded-full px-3 py-1 text-sm font-black ${danger ? "bg-red-100 text-red-700" : "bg-[#f7f0e7] text-[#211b16]"}`}>{value}</span>
    </div>
  );
}
