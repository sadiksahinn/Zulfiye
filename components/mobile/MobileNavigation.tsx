"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const publicPages = ["/", "/forgot-password", "/reset-password"];
  if (publicPages.includes(pathname)) return null;

  const links = [
    ["Anasayfa", "/dashboard"],
    ["Satış", "/sales"],
    ["Müşteriler", "/customers"],
    ["Ürünler", "/products"],
    ["Kiralama", "/rentals"],
    ["İade / Teslim", "/returns"],
    ["Takvim", "/calendar"],
    ["SMS", "/sms"],
    ["Muhasebe", "/accounting"],
    ["Raporlar", "/reports"],
    ["Ayarlar", "/settings"],
  ];

  return (
    <>
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
                <div className="text-xs tracking-[0.3em] text-[#d8be8d]">COUTURE ERP</div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl bg-white/10 p-3">
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-3">
              {links.map(([name, href]) => (
                <a key={href} href={href} className="rounded-2xl bg-white/10 px-4 py-4 font-bold text-white">
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
