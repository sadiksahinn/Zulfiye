"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
  Home,
  Package,
  CalendarDays,
  ShoppingBag,
  Grid3X3,
} from "lucide-react";

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const menu = [
    ["Anasayfa", "/dashboard"],
    ["Satış", "/sales"],
    ["Müşteriler", "/customers"],
    ["Ürünler", "/products"],
    ["Kiralama", "/rentals"],
    ["İade", "/returns"],
    ["Takvim", "/calendar"],
    ["SMS", "/sms"],
    ["Muhasebe", "/accounting"],
    ["Raporlar", "/reports"],
    ["Ayarlar", "/settings"],
  ];

  const MenuList = () => (
    <div className="space-y-2">
      {menu.map(([name, href]) => (
        <a
          key={href}
          href={href}
          className="block rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/10"
        >
          {name}
        </a>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f7f0e7] pb-28 text-[#211b16] lg:pb-0">
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top) + 14px)",
          right: "14px",
          zIndex: 99999,
          display: "flex",
        }}
        className="h-14 items-center gap-2 rounded-2xl bg-[#211b16] px-5 text-white shadow-2xl lg:hidden"
      >
        <Menu size={22} />
        <span className="text-sm font-bold">Menü</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute bottom-3 left-3 top-3 w-[82vw] max-w-[320px] overflow-auto rounded-[1.5rem] bg-[#171411] p-5 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold tracking-[0.18em]">
                  MAUNA
                </div>
                <div className="text-xs tracking-[0.28em] text-[#d8be8d]">
                  COUTURE ERP
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/10 p-3"
              >
                <X size={20} />
              </button>
            </div>

            <MenuList />
          </aside>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1600px] gap-5 p-2 lg:p-6">
        <aside className="desktop-sidebar hidden w-[300px] shrink-0 rounded-[2rem] bg-[#171411] p-5 text-white shadow-2xl lg:block">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white p-2">
              <img
                src="/mauna-logo.png"
                alt="MAUNA"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <div className="text-2xl font-bold tracking-[0.18em]">
                MAUNA
              </div>
              <div className="text-xs tracking-[0.28em] text-[#d8be8d]">
                COUTURE ERP
              </div>
            </div>
          </div>

          <MenuList />
        </aside>

        <section className="min-w-0 flex-1 rounded-[1.3rem] border border-white/70 bg-white/50 shadow-xl backdrop-blur-xl lg:rounded-[2rem]">
          <header className="border-b border-white/70 px-4 pb-4 pt-20 lg:px-8 lg:py-7">
            <p className="text-[10px] tracking-[0.32em] text-[#b69463]">
              MAUNA COUTURE OPERATING SYSTEM
            </p>

            <h1 className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.04em] lg:text-5xl">
              {title}
            </h1>
          </header>

          <div className="p-3 lg:p-8">{children}</div>
        </section>
      </div>

      
    </main>
  );
}