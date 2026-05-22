"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = [
    { name: "Anasayfa", href: "/dashboard", icon: "✦" },
    { name: "Hızlı Satış", href: "/sales", icon: "◆" },
    { name: "Çalışanlar", href: "/staff", icon: "◇" },
    { name: "Müşteriler", href: "/customers", icon: "✧" },
    { name: "Ürün Yönetimi", href: "/products", icon: "◈" },
    { name: "Kiralama", href: "/rentals", icon: "⬖" },
    { name: "İade / Teslim", href: "/returns", icon: "↺" },
    { name: "Provalar", href: "/fittings", icon: "❖" },
    { name: "Takvim", href: "/calendar", icon: "◌" },
    { name: "SMS Modülü", href: "/sms", icon: "✉" },
    { name: "Muhasebe", href: "/accounting", icon: "◍" },
    { name: "Raporlar", href: "/reports", icon: "☷" },
    { name: "Ayarlar", href: "/settings", icon: "⚙" },
  ];

  const Sidebar = () => (
    <aside className="h-full w-[310px] shrink-0 rounded-[2.2rem] border border-white/60 bg-[#171411]/95 text-white shadow-[0_30px_100px_rgba(20,14,8,0.35)] backdrop-blur-2xl flex flex-col overflow-hidden">
      <div className="relative p-7 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,167,111,0.32),transparent_45%)]" />

        <div className="relative flex items-center gap-4">
          <div className="h-16 w-16 rounded-[1.4rem] bg-white p-3 shadow-[0_20px_50px_rgba(255,255,255,0.15)]">
            <img src="/mauna-logo.png" alt="MAUNA" className="h-full w-full object-contain" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-[0.18em]">MAUNA</h1>
            <p className="mt-1 text-xs tracking-[0.32em] uppercase text-[#d8be8d]">
              Couture ERP
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 overflow-auto">
        {menu.map((item, index) => (
          <a
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-200 ${
              index === 0
                ? "bg-gradient-to-r from-[#b69463] to-[#e1c792] text-white shadow-[0_18px_60px_rgba(182,148,99,0.38)] ring-1 ring-white/20"
                : "text-zinc-300 hover:bg-white/10 hover:text-white hover:translate-x-1"
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#e7c98c] group-hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
              {item.icon}
            </span>
            <span className="text-[15px] font-semibold tracking-[0.02em]">
              {item.name}
            </span>
          </a>
        ))}
      </nav>

      <div className="p-5">
        <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-5 shadow-inner">
          <p className="text-xs tracking-[0.25em] uppercase text-zinc-500">Aktif Kullanıcı</p>
          <h3 className="mt-3 text-xl font-semibold">Sadık Şahin</h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-[#b69463]/20 px-3 py-1 text-xs text-[#e7c98c]">
              Admin
            </span>
            <span className="text-xs text-zinc-500">Merkez</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f0e7] text-[#211b16]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_85%_5%,rgba(199,164,106,0.22),transparent_24%),radial-gradient(circle_at_70%_90%,rgba(255,255,255,0.8),transparent_30%)]" />
        <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-[#d9c09a]/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-white/70 blur-3xl" />
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-5 top-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#211b16] text-white shadow-2xl lg:hidden"
      >
        <Menu size={24} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-4 top-4 bottom-4">
            <Sidebar />
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#211b16] shadow-xl"
          >
            <X size={22} />
          </button>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen p-4 lg:p-6 gap-6">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <section className="flex-1 overflow-auto rounded-[2.2rem] border border-white/70 bg-white/45 shadow-[0_30px_100px_rgba(118,93,60,0.14)] backdrop-blur-2xl">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/55 backdrop-blur-2xl px-6 lg:px-10 py-6 pt-24 lg:pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs tracking-[0.45em] uppercase text-[#b69463]">
                  MAUNA Couture Operating System
                </p>
                <h1 className="mt-3 text-4xl lg:text-5xl font-semibold tracking-[-0.04em] text-[#211b16]">
                  {title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[#e5d7c3] bg-white/75 px-5 py-3 text-sm text-[#7a6d5e] shadow-sm">
                  Merkez Şube
                </div>
                <div className="rounded-2xl bg-[#211b16] px-5 py-3 text-sm text-white shadow-xl">
                  Güvenli Oturum
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
