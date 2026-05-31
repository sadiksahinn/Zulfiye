"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function MaunaLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1350);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#f7f0e7]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.95),transparent_35%),linear-gradient(135deg,#f7f0e7,#efe3d2)]" />

      <div className="relative flex flex-col items-center">
        <div className="mauna-loader-ring flex h-48 w-48 items-center justify-center rounded-full bg-white shadow-[0_35px_100px_rgba(118,93,60,.25)]">
          <div className="mauna-loader-logo flex h-36 w-36 items-center justify-center rounded-full border border-[#eadfce] bg-white">
            <Image
              src="/mauna-logo.png"
              alt="MAUNA"
              width={116}
              height={116}
              priority
              className="object-contain"
            />
          </div>
        </div>

        <div className="mauna-loader-badge mt-7 text-center" style={{ fontFamily: "var(--font-cormorant), serif" }}>
          <div className="text-[2rem] font-light tracking-[0.45em] text-[#211b16]">
            MAUNA
          </div>
          <div className="mt-0.5 text-sm font-light tracking-[0.55em] text-[#b69463]">
            COUTURE
          </div>
        </div>
      </div>
    </div>
  );
}
