"use client";

import React from "react";

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
    ["Personel", "/staff"],
    ["Ayarlar", "/settings"],
  ];

  return (
    <main className="min-h-screen bg-[#f7f0e7] text-[#211b16]">
      <div className="mx-auto flex w-full max-w-[1700px] gap-6 p-0 lg:p-6">
        <aside className="hidden w-[300px] shrink-0 rounded-[2rem] bg-[#171411] p-5 text-white shadow-2xl lg:block">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <img src="/mauna-logo.png" alt="MAUNA" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-[0.18em]">MAUNA</div>
              <div className="text-xs tracking-[0.28em] text-[#d8be8d]">COUTURE v1</div>
            </div>
          </div>

          <div className="space-y-2">
            {menu.map(([name, href]) => (
              <a
                key={href}
                href={href}
                className="block rounded-2xl px-4 py-3.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                {name}
              </a>
            ))}
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
