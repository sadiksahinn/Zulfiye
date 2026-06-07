"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Activity,
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
  const router = useRouter();
  const { user, role, loading, logout } = useAuth();

  const operationMenu = [
    { name: "Bugün", href: "/today", icon: Home },
    { name: "Takvim", href: "/calendar", icon: CalendarDays },
    { name: "Kiralama", href: "/rentals", icon: CalendarDays },
    { name: "Provalar", href: "/fittings", icon: UserRound },
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
    ...(role === "super_admin" ? [{ name: "Aktivite", href: "/logs", icon: Activity }] : []),
  ];

  const userEmail =
    typeof user === "object" && user && "email" in user
      ? String(user.email)
      : "Kullanıcı";

  const adminOnlyRoutes = ["/dashboard", "/accounting", "/reports", "/staff", "/settings"];

  useEffect(() => {
    if (loading) return;
    if (role === "staff" && adminOnlyRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      router.replace("/today");
    }
  }, [pathname, role, router, loading]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f0e7] text-[#211b16]">
        <div className="rounded-[2rem] border border-[#eadfce] bg-white/80 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#171411] px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-[#d8be8d]">
            ZÜLFİYE CANBOLAT
          </div>
          <div className="mt-4 text-2xl font-black tracking-tight">Yetki kontrol ediliyor…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f0e7] text-[#211b16]">
      <div className="mx-auto flex w-full max-w-[1700px] gap-5 p-0 lg:p-5">

        {/* Desktop Sidebar */}
        <aside className="desktop-sidebar hidden min-h-[calc(100vh-2.5rem)] w-[300px] shrink-0 flex-col rounded-[2rem] bg-[#141210] p-5 font-sans text-white shadow-[0_32px_80px_rgba(0,0,0,.30)] lg:flex">

          {/* Logo */}
          <div className="mb-6 flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#c9a84c] to-[#e2c97e] shadow-[0_12px_30px_rgba(201,168,76,.35)]">
              <span className="text-xl font-black tracking-widest text-white" style={{ fontFamily: "var(--font-cormorant), serif" }}>ZC</span>
            </div>
            <div>
              <div className="text-xl font-black tracking-[0.12em]">ZÜLFİYE CANBOLAT</div>
              <div className="text-[10px] tracking-[0.28em] text-[#c9a84c]">GELİNLİK</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto space-y-6 pr-0.5">

            <div>
              <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.30em] text-[#5a4f42]">
                Günlük Operasyon
              </div>
              <div className="space-y-0.5">
                {operationMenu.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-full px-4 py-3 text-[14px] font-bold tracking-[-0.01em] transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-[#b69463] to-[#d8bd84] text-white shadow-[0_8px_24px_rgba(182,148,99,.30)]"
                          : "text-zinc-300 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                          active ? "bg-white/25 text-white" : "text-[#9d8a72] group-hover:text-white"
                        }`}
                      >
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <span>{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {role !== "staff" ? (
              <div>
                <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.30em] text-[#5a4f42]">
                  Yönetim Paneli
                </div>
                <div className="space-y-0.5">
                  {managementMenu.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-full px-4 py-3 text-[14px] font-bold tracking-[-0.01em] transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-[#b69463] to-[#d8bd84] text-white shadow-[0_8px_24px_rgba(182,148,99,.30)]"
                            : "text-zinc-500 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                            active ? "bg-white/25 text-white" : "text-[#6a5c48] group-hover:text-white"
                          }`}
                        >
                          <Icon size={20} strokeWidth={2.2} />
                        </span>
                        <span>{item.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </nav>

          {/* User Card */}
          <div className="mt-5 rounded-[1.5rem] bg-white/[0.05] p-4 ring-1 ring-white/8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#b69463] to-[#d8bd84] text-sm font-black text-white shadow-[0_4px_12px_rgba(182,148,99,.35)]">
                {userEmail.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black text-white">
                  {role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : "Personel"}
                </div>
                <div className="truncate text-[11px] text-zinc-500">{userEmail}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white/8 px-4 py-2.5 text-sm font-bold text-zinc-300 ring-1 ring-white/10 transition-all hover:bg-white/14 hover:text-white"
            >
              <LogOut size={15} />
              Çıkış Yap
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1 rounded-none border border-[#ede4d8]/60 bg-white/65 shadow-xl shadow-amber-900/5 backdrop-blur-2xl lg:rounded-[2rem]">
          <header className="px-5 pb-5 pt-8 lg:px-8 lg:pt-8">
            <div className="inline-flex items-center rounded-full bg-[#171411] px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.28em] text-[#c4a96e]">
              ZÜLFİYE CANBOLAT GELİNLİK
            </div>
            <h1 className="mt-3 text-[28px] font-black tracking-[-0.045em] text-[#211b16] lg:text-5xl">
              {title}
            </h1>
          </header>
          <div className="p-4 pb-28 lg:p-8">{children}</div>
        </section>

      </div>
    </main>
  );
}
