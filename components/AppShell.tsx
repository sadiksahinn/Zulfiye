"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CalendarDays,
  Settings,
} from "lucide-react";

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const menu = [
    {
      name: "Anasayfa",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Müşteri",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Ürün",
      href: "/products",
      icon: ShoppingBag,
    },
    {
      name: "Takvim",
      href: "/calendar",
      icon: CalendarDays,
    },
    {
      name: "Ayar",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f0e7] text-[#211b16]">
      <div className="mx-auto flex w-full max-w-[1700px] gap-6 p-0 lg:p-6">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-[300px] shrink-0 rounded-[2rem] bg-[#171411] p-5 text-white shadow-2xl">
          <div className="mb-8">
            <div className="text-3xl font-black tracking-[0.25em]">
              MAUNA
            </div>
            <div className="text-xs tracking-[0.3em] text-[#d8be8d]">
              COUTURE ERP
            </div>
          </div>

          <div className="space-y-2">
            {menu.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-4 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                {item.name}
              </a>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <section className="min-w-0 flex-1 rounded-none lg:rounded-[2rem] border border-white/70 bg-white/60 shadow-xl backdrop-blur-xl">
          
          <header className="px-5 pb-6 pt-10 lg:px-8 lg:pt-8">
            <p className="text-[10px] tracking-[0.32em] text-[#b69463]">
              MAUNA COUTURE OPERATING SYSTEM
            </p>

            <h1 className="mt-2 text-[30px] font-black tracking-[-0.05em] lg:text-5xl">
              {title}
            </h1>
          </header>

          <div className="p-3 pb-28 lg:p-8">
            {children}
          </div>
        </section>
      </div>

      {/* MOBILE TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-[99999] border-t border-[#eadfce] bg-white/95 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-3 text-[#7d6c58]"
              >
                <Icon size={22} strokeWidth={2.2} />
                <span className="text-[11px] font-semibold">
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </main>
  );
}