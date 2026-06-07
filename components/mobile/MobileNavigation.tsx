"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Activity,
  CalendarDays,
  Home,
  LogOut,
  MoreHorizontal,
  Package,
  RotateCcw,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role, logout, user } = useAuth();
  const userEmail = typeof user === "object" && user && "email" in user ? String(user.email) : "";

  const publicPages = ["/", "/forgot-password", "/reset-password", "/register", "/auth/confirm"];
  if (publicPages.includes(pathname)) return null;

  const mainLinks: { name: string; href: string; Icon: React.ElementType }[] = [
    { name: "Bugün",    href: "/today",     Icon: Home },
    { name: "Kiralama", href: "/rentals",   Icon: CalendarDays },
    { name: "Satış",    href: "/sales",     Icon: ShoppingBag },
    { name: "Müşteri",  href: "/customers", Icon: UserRound },
  ];

  const allLinks: { name: string; href: string; Icon: React.ElementType }[] = [
    { name: "Bugün",    href: "/today",     Icon: Home },
    { name: "Kiralama", href: "/rentals",   Icon: CalendarDays },
    { name: "Satış",    href: "/sales",     Icon: ShoppingBag },
    { name: "Takvim",   href: "/calendar",  Icon: CalendarDays },
    { name: "Müşteri",  href: "/customers", Icon: UserRound },
    { name: "Provalar", href: "/fittings",  Icon: UserRound },
    { name: "Ürünler",  href: "/products",  Icon: Package },
    { name: "İade",     href: "/returns",   Icon: RotateCcw },
  ];

  const adminLinks = [
    ["Yönetim", "/dashboard"],
    ["Muhasebe", "/accounting"],
    ["Raporlar", "/reports"],
    ["SMS", "/sms"],
    ["Ayarlar", "/settings"],
    ...(role === "super_admin" ? [["Aktivite Günlüğü", "/logs"]] : []),
  ];

  const isMenuActive = open || !mainLinks.some(l => pathname === l.href || pathname.startsWith(`${l.href}/`));

  return (
    <>
      {/* ── Magic Navigation Bar ── */}
      <div className="fixed bottom-3 left-3 right-3 z-[99998] h-[88px] lg:hidden">

        {/* Bar background */}
        <div className="absolute bottom-0 inset-x-0 h-[64px] rounded-[2rem] bg-[#0f0d0b]/95 shadow-[0_20px_60px_rgba(0,0,0,.40),0_4px_16px_rgba(0,0,0,.25)] backdrop-blur-2xl" />

        {/* Items */}
        <div className="absolute inset-0 flex items-end justify-around px-3 pb-2">

          {mainLinks.map(({ name, href, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <a key={href} href={href} className="flex flex-col items-center gap-1">
                {/* Floating icon circle */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-all"
                  style={{
                    transform: active ? "translateY(-22px)" : "translateY(0px)",
                    transitionDuration: "400ms",
                    transitionTimingFunction: active
                      ? "cubic-bezier(0.34,1.56,0.64,1)"
                      : "cubic-bezier(0.4,0,0.2,1)",
                    background: active
                      ? "linear-gradient(135deg, #b69463, #d8bd84)"
                      : "transparent",
                    boxShadow: active
                      ? "0 8px 28px rgba(182,148,99,.55), 0 2px 8px rgba(182,148,99,.3)"
                      : "none",
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={2.2}
                    style={{
                      color: active ? "#fff" : "rgba(255,255,255,0.38)",
                      transition: "color 300ms ease",
                    }}
                  />
                </div>
                {/* Label */}
                <span
                  className="text-[11px] font-black leading-none transition-all duration-300"
                  style={{
                    color: active ? "#d8bd84" : "rgba(255,255,255,0.32)",
                    marginTop: active ? "-14px" : "0px",
                  }}
                >
                  {name}
                </span>
              </a>
            );
          })}

          {/* Menü butonu */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full transition-all"
              style={{
                transform: isMenuActive && !mainLinks.some(l => pathname === l.href || pathname.startsWith(`${l.href}/`)) ? "translateY(-22px)" : "translateY(0px)",
                transitionDuration: "400ms",
                transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                background: open ? "linear-gradient(135deg, #b69463, #d8bd84)" : "transparent",
                boxShadow: open ? "0 8px 28px rgba(182,148,99,.55)" : "none",
              }}
            >
              <MoreHorizontal
                size={19}
                strokeWidth={2.3}
                style={{ color: open ? "#fff" : "rgba(255,255,255,0.38)", transition: "color 300ms" }}
              />
            </div>
            <span
              className="text-[11px] font-black leading-none"
              style={{ color: open ? "#d8bd84" : "rgba(255,255,255,0.32)" }}
            >
              Menü
            </span>
          </button>

        </div>
      </div>

      {/* ── Drawer ── */}
      {open && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-3 right-3 top-3 w-[82vw] max-w-[340px] overflow-y-auto rounded-[2rem] bg-[#0f0d0b] p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xl font-black tracking-[0.22em]">ZÜLFİYE CANBOLAT</div>
                <div className="text-[10px] tracking-[0.30em] text-[#c4a96e]">COUTURE OPERATION</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/16"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <p className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.28em] text-[#5a4f42]">
                Personel İşlemleri
              </p>
              {allLinks.map(({ name, href, Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-full px-4 py-3 font-bold transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#b69463] to-[#d8bd84] text-white shadow-[0_4px_16px_rgba(182,148,99,.30)]"
                        : "text-white/75 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-white" : "text-[#9d8a72]"} />
                    {name}
                  </a>
                );
              })}

              {role !== "staff" && (
                <>
                  <p className="px-3 pb-1 pt-4 text-[9px] font-black uppercase tracking-[0.28em] text-[#5a4f42]">
                    Yönetim
                  </p>
                  {adminLinks.map(([name, href]) => (
                    <a
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="block rounded-full px-4 py-3 font-bold text-white/55 transition hover:bg-white/8 hover:text-white/80"
                    >
                      {name}
                    </a>
                  ))}
                </>
              )}
            </div>

            {/* User */}
            <div className="mt-5 rounded-[1.5rem] bg-white/[0.05] p-4 ring-1 ring-white/8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#b69463] to-[#d8bd84] text-sm font-black text-white">
                  {userEmail.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white">
                    {role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : "Personel"}
                  </div>
                  <div className="truncate text-[11px] text-zinc-500">{userEmail}</div>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white/8 px-4 py-2.5 text-sm font-bold text-zinc-300 ring-1 ring-white/10 transition hover:bg-white/14 hover:text-white"
              >
                <LogOut size={15} />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
