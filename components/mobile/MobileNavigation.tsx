"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Activity,
  CalendarDays,
  Home,
  LogOut,
  Menu,
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

  return (
    <>
      {/* Bottom pill nav */}
      <div className="fixed bottom-3 left-3 right-3 z-[99998] flex items-center justify-around rounded-full border border-white/10 bg-[#141210]/97 px-2 py-2 shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur-2xl lg:hidden">
        {mainLinks.slice(0, 5).map(({ name, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <a
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2.5 text-[9px] font-black transition-all duration-200 ${
                active
                  ? "bg-gradient-to-br from-[#b69463] to-[#d8bd84] text-white shadow-[0_4px_16px_rgba(182,148,99,.40)]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <Icon size={17} strokeWidth={2.3} />
              <span className="leading-none">{name}</span>
            </a>
          );
        })}
      </div>

      {/* Menu button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-[99999] flex items-center gap-2 rounded-full bg-[#141210] px-4 py-3 text-white shadow-[0_8px_24px_rgba(0,0,0,.30)] lg:hidden"
      >
        <Menu size={20} strokeWidth={2.5} />
        <span className="text-sm font-black">Menü</span>
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-3 right-3 top-3 w-[82vw] max-w-[340px] overflow-y-auto rounded-[2rem] bg-[#141210] p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xl font-black tracking-[0.22em]">MAUNA</div>
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
              {mainLinks.map(({ name, href, Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <a
                    key={href}
                    href={href}
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

              {role !== "staff" ? (
                <>
                  <p className="px-3 pb-1 pt-4 text-[9px] font-black uppercase tracking-[0.28em] text-[#5a4f42]">
                    Yönetim
                  </p>
                  {adminLinks.map(([name, href]) => (
                    <a
                      key={href}
                      href={href}
                      className="block rounded-full px-4 py-3 font-bold text-white/55 transition hover:bg-white/8 hover:text-white/80"
                    >
                      {name}
                    </a>
                  ))}
                </>
              ) : null}
            </div>

            {/* User section */}
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
