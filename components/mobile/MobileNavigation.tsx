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

  const mainLinks = [
    ["Bugün", "/today", Home],
    ["Takvim", "/calendar", CalendarDays],
    ["Kiralama", "/rentals", CalendarDays],
    ["Prova", "/fittings", UserRound],
    ["Müşteri", "/customers", UserRound],
    ["Ürünler", "/products", Package],
    ["İade", "/returns", RotateCcw],
    ["Satış", "/sales", ShoppingBag],
  ] as const;

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
      <div className="fixed bottom-3 left-3 right-3 z-[99998] grid grid-cols-5 gap-2 rounded-[1.7rem] border border-white/20 bg-[#171411]/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden">
        {mainLinks.slice(0, 5).map(([name, href, Icon]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <a
              key={href}
              href={href}
              className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-black ${
                active ? "bg-gradient-to-r from-[#b69463] to-[#d8bd84] text-white" : "text-white/70"
              }`}
            >
              <Icon size={18} />
              {name}
            </a>
          );
        })}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-[99999] flex items-center gap-2 rounded-2xl bg-[#171411] px-5 py-4 text-white shadow-2xl lg:hidden"
      >
        <Menu size={22} />
        <span className="text-sm font-bold">Menü</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[99999] bg-black/45">
          <div className="absolute bottom-3 right-3 top-3 w-[82vw] max-w-[340px] overflow-y-auto rounded-[1.7rem] bg-[#171411] p-5 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black tracking-[0.25em]">MAUNA</div>
                <div className="text-xs tracking-[0.3em] text-[#d8be8d]">COUTURE OPERATION</div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl bg-white/10 p-3">
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8be8d]">
                Personel İşlemleri
              </p>
              {mainLinks.map(([name, href, Icon]) => (
                <a key={href} href={href} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4 font-bold text-white">
                  <Icon size={18} className="text-[#d8be8d]" />
                  {name}
                </a>
              ))}

              {role !== "staff" ? (
                <>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-[#d8be8d]">
                    Yönetim
                  </p>
                  {adminLinks.map(([name, href]) => (
                    <a key={href} href={href} className="rounded-2xl bg-white/[0.06] px-4 py-4 font-bold text-white/85">
                      {name}
                    </a>
                  ))}
                </>
              ) : null}
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#b69463] to-[#d8bd84] font-black text-white">
                  {userEmail.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white">
                    {role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : "Personel"}
                  </div>
                  <div className="truncate text-[11px] text-zinc-400">{userEmail}</div>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white"
              >
                <LogOut size={16} />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
