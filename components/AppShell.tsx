"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Home,
  LogOut,
  MessageSquareText,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const operationMenu = [
    { name: "Bugün", href: "/today", icon: Home },
    { name: "Takvim", href: "/calendar", icon: CalendarDays },
    { name: "Kiralama", href: "/rentals", icon: CalendarDays },
    { name: "Satış", href: "/sales", icon: ShoppingBag },
    { name: "Müşteriler", href: "/customers", icon: Users },
    { name: "Ürünler", href: "/products", icon: Package },
    { name: "İade / Teslim", href: "/returns", icon: RotateCcw },
  ];

  const managementMenu = [
    { name: "Yönetim", href: "/dashboard", icon: BarChart3 },
    { name: "Muhasebe", href: "/accounting", icon: CreditCard },
    { name: "Raporlar", href: "/reports", icon: BarChart3 },
    { name: "SMS", href: "/sms", icon: MessageSquareText },
    { name: "Personel", href: "/staff", icon: UserRound },
    { name: "Ayarlar", href: "/settings", icon: Settings },
  ];

  const userEmail =
    typeof user === "object" && user && "email" in user
      ? String(user.email)
      : "Kullanıcı";

  return (
    <main className="min-h-screen bg-[#f7f0e7] text-[#211b16]">
      <div className="mx-auto flex w-full max-w-[1700px] gap-6 p-0 lg:p-6">
        <aside className="hidden min-h-[calc(100vh-3rem)] w-[330px] shrink-0 flex-col rounded-[2rem] border border-white/10 bg-[#171411] p-5 font-sans text-white shadow-[0_28px_90px_rgba(33,27,22,.28)] lg:flex">
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-white p-2 shadow-[0_18px_45px_rgba(0,0,0,.22)]">
              <img src="/mauna-logo.png" alt="MAUNA" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-[0.18em]">MAUNA</div>
              <div className="text-xs tracking-[0.28em] text-[#d8be8d]">COUTURE v1</div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto pr-1">
            <div className="mb-4">
              <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#d8be8d]">
                Günlük Operasyon
              </div>

              <div className="space-y-2">
                {operationMenu.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-4 rounded-[1.15rem] px-4 py-3.5 text-[16px] font-black tracking-[-0.015em] transition ${
                        active
                          ? "bg-gradient-to-r from-[#b69463] to-[#d8bd84] text-white shadow-[0_18px_38px_rgba(182,148,99,.26)]"
                          : "text-zinc-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-[0.95rem] transition ${
                          active ? "bg-white/20 text-white" : "bg-white/8 text-[#d8be8d] group-hover:bg-white/12"
                        }`}
                      >
                        <Icon size={20} strokeWidth={2.35} />
                      </span>
                      <span className="leading-none">{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#d8be8d]">
                Yönetim Paneli
              </div>

              <div className="space-y-2">
                {managementMenu.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-4 rounded-[1.15rem] px-4 py-3.5 text-[16px] font-black tracking-[-0.015em] transition ${
                        active
                          ? "bg-gradient-to-r from-[#b69463] to-[#d8bd84] text-white shadow-[0_18px_38px_rgba(182,148,99,.26)]"
                          : "text-zinc-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-[0.95rem] transition ${
                          active ? "bg-white/20 text-white" : "bg-white/8 text-[#8f7a58] group-hover:bg-white/12"
                        }`}
                      >
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <span className="leading-none">{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4 shadow-inner">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#d8be8d]">
              Kullanıcı Bilgilerim
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b69463] to-[#d8bd84] font-black text-white">
                {userEmail.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black text-white">Aktif Kullanıcı</div>
                <div className="truncate text-xs text-zinc-400">{userEmail}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-zinc-100 transition hover:bg-white/15"
            >
              <LogOut size={17} />
              Çıkış Yap
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 rounded-none border border-white/70 bg-white/60 shadow-xl backdrop-blur-xl lg:rounded-[2rem]">
          <header className="px-5 pb-6 pt-10 lg:px-8 lg:pt-8">
            <p className="text-[10px] tracking-[0.32em] text-[#b69463]">
              MAUNA COUTURE OPERATING SYSTEM
            </p>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.05em] lg:text-5xl">
              {title}
            </h1>
          </header>

          <div className="p-3 pb-28 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
