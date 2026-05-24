"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Package,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sparkles,
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
    { title: "Ürün Ekle", href: "/products", icon: <Plus size={18} />, note: "Stok" },
    { title: "Kiralama", href: "/rentals", icon: <ShoppingBag size={18} />, note: "Teslim" },
    { title: "İade Al", href: "/returns", icon: <RotateCcw size={18} />, note: "Kontrol" },
    { title: "Müşteri", href: "/customers", icon: <Users size={18} />, note: "Kart" },
    { title: "Takvim", href: "/calendar", icon: <CalendarDays size={18} />, note: "Plan" },
    { title: "Ödeme", href: "/accounting", icon: <CreditCard size={18} />, note: "Tahsilat" },
  ];

  const todayFocus = [
    { title: "Teslim kontrolü", desc: "Bugünkü teslim ve kiralama akışı" },
    { title: "Ödeme takibi", desc: "Bekleyen tahsilat ve kalan ödemeler" },
    { title: "Prova planı", desc: "Gün içindeki prova randevuları" },
  ];

  return (
    <AppShell title="Anasayfa">
      <div className="space-y-4 lg:space-y-10">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-[#211b16] via-[#2b231c] to-[#b69463] p-4 text-white shadow-[0_18px_55px_rgba(33,27,22,.16)] lg:hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.32em] text-[#d8bd84]">Bugünün Özeti</p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.04em]">Kontrol paneli hazır</h2>
          <p className="mt-2 text-xs leading-5 text-white/70">İşlemlere hızlıca başlayın, günlük akışı tek ekrandan takip edin.</p>
        </div>

        <div className="hidden overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.18)] lg:block">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">Bugünün Özeti</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Operasyon kontrol paneli hazır</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Ürün, müşteri, kiralama, prova ve ödeme akışlarını tek ekrandan takip edin.
              </p>
            </div>

            <div className="grid min-w-[390px] grid-cols-3 gap-3">
              <a href="/products" className="group rounded-2xl bg-white/10 p-4 text-center text-sm font-black backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15">Ürün Ekle</a>
              <a href="/rentals" className="group rounded-2xl bg-white/10 p-4 text-center text-sm font-black backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15">Kiralama</a>
              <a href="/accounting" className="group rounded-2xl bg-white/10 p-4 text-center text-sm font-black backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15">Ödeme Al</a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            {todayFocus.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white/[0.08] p-4 backdrop-blur-xl">
                <div className="text-sm font-black text-white">{item.title}</div>
                <div className="mt-1 text-xs leading-5 text-white/60">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6 dashboard-fade-in">
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
                className="group flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#eadfce] bg-white/75 px-2 py-3 text-center text-xs font-black text-[#6d6256] shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5 hover:bg-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b69463]/15 text-[#b69463]">
                  {item.icon}
                </span>
                <span>{item.title}</span>
                <span className="text-[9px] font-bold text-[#b69463] opacity-80">{item.note}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="hidden grid-cols-6 gap-4 lg:grid dashboard-fade-in">
          {quickActions.map((item) => (
            <a
              key={`desktop-${item.href}`}
              href={item.href}
              className="group rounded-[1.6rem] border border-white/70 bg-white/58 p-5 shadow-[0_18px_45px_rgba(118,93,60,.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/75"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/12 text-[#b69463] transition group-hover:bg-[#b69463] group-hover:text-white">
                  {item.icon}
                </span>
                <span className="rounded-full bg-[#f7f0e7] px-3 py-1 text-[10px] font-black text-[#b69463]">{item.note}</span>
              </div>
              <div className="mt-4 text-base font-black text-[#211b16]">{item.title}</div>
              <div className="mt-1 text-xs font-semibold text-[#8a7f72]">İşleme hızlıca geç</div>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6 dashboard-fade-in">
          <div className="premium-card relative overflow-hidden p-4 lg:p-8">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#b69463]/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="premium-title text-lg lg:text-2xl">Premium Akış</h2>
                <p className="premium-muted text-xs lg:text-sm">Sistem hazır</p>
              </div>
            </div>
            <p className="premium-muted relative mt-4 text-xs leading-5 lg:text-sm">
              Satış, kiralama, iade ve ödeme süreçleri için ana kontrol ekranı hazırlandı.
            </p>
          </div>

          <div className="premium-card p-4 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="premium-title text-lg lg:text-2xl">Sistem Durumu</h2>
                <p className="premium-muted text-xs lg:text-sm">Aktif ve stabil</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-[#eadfce] bg-white/65 p-4 text-sm font-bold text-[#6d6256]">
              Giriş, dashboard ve mobil menü çalışıyor.
            </div>
          </div>

          <div className="premium-card p-4 lg:p-8">
            <h2 className="premium-title text-lg lg:text-2xl">Sıradaki Adım</h2>
            <p className="premium-muted mt-2 text-xs leading-5 lg:text-sm">
              Ürün ekleme, müşteri kartı ve kiralama oluşturma ekranları gerçek veri akışına bağlanacak.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6 dashboard-fade-in">
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

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 lg:gap-6">
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6 dashboard-fade-in">
          <div className="premium-card overflow-hidden p-4 lg:col-span-2 lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="premium-title text-lg lg:text-2xl">Operasyon Akışı</h2>
                <p className="premium-muted mt-1 text-xs lg:text-sm">Günün kritik takip başlıkları</p>
              </div>
              <span className="rounded-full bg-[#b69463]/10 px-3 py-1 text-[11px] font-black text-[#b69463]">Canlı Takip</span>
            </div>

            <div className="mt-5 grid gap-2 lg:grid-cols-3 lg:gap-3">
              {[
                "Yeni ürün girişleri",
                "Kiralama teslimleri",
                "Ödeme hatırlatmaları",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[#eadfce] bg-white/65 p-4 text-sm font-bold text-[#6d6256] shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card relative overflow-hidden p-4 lg:p-8">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#b69463]/10 blur-2xl" />
            <h2 className="premium-title relative text-lg lg:text-2xl">Hızlı Not</h2>
            <p className="premium-muted relative mt-2 text-xs leading-5 lg:text-sm">
              Bir sonraki aşamada buraya günlük yapılacaklar, ödeme notları ve müşteri hatırlatmaları bağlanacak.
            </p>
            <a href="/calendar" className="relative mt-5 flex items-center justify-center rounded-2xl bg-[#211b16] px-4 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(33,27,22,.18)] transition hover:scale-[1.01]">
              Takvimi Aç
            </a>
          </div>
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
