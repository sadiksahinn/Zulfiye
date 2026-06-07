"use client";

import { useEffect, useState } from "react";

export default function ZulfiyeLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1350);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1),transparent_60%),linear-gradient(135deg,#ffffff,#fdf8ee)]" />

      <div className="relative flex flex-col items-center">
        <div className="flex h-48 w-48 items-center justify-center rounded-full bg-white shadow-[0_35px_100px_rgba(201,168,76,.20)]">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-[#e8d89a] bg-white">
            <div className="text-center" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              <div className="text-3xl font-light tracking-[0.15em] text-[#1a1a1a]">ZC</div>
            </div>
          </div>
        </div>

        <div className="mt-7 text-center" style={{ fontFamily: "var(--font-cormorant), serif" }}>
          <div className="text-[1.6rem] font-light tracking-[0.3em] text-[#1a1a1a]">
            ZÜLFİYE CANBOLAT
          </div>
          <div className="mt-0.5 text-sm font-light tracking-[0.55em] text-[#c9a84c]">
            GELİNLİK
          </div>
        </div>
      </div>
    </div>
  );
}
