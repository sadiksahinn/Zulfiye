"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);

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
        style={{
          position: "fixed",
          right: "16px",
          top: "16px",
          zIndex: 2147483647,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#171411",
          color: "white",
          borderRadius: "18px",
          padding: "14px 18px",
          boxShadow: "0 18px 50px rgba(0,0,0,.35)",
          border: "1px solid rgba(255,255,255,.16)",
        }}
      >
        <Menu size={22} />
        <span style={{ fontSize: 14, fontWeight: 800 }}>Menü</span>
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483647,
            background: "rgba(0,0,0,.45)",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              bottom: 12,
              width: "82vw",
              maxWidth: 340,
              background: "#171411",
              borderRadius: 26,
              padding: 20,
              color: "white",
              overflowY: "auto",
              boxShadow: "0 25px 90px rgba(0,0,0,.45)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 4 }}>MAUNA</div>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#d8be8d" }}>COUTURE ERP</div>
              </div>

              <button
                onClick={() => setOpen(false)}
                style={{ background: "rgba(255,255,255,.12)", borderRadius: 14, padding: 12 }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {links.map(([name, href]) => (
                <a
                  key={href}
                  href={href}
                  style={{
                    display: "block",
                    color: "white",
                    textDecoration: "none",
                    background: "rgba(255,255,255,.08)",
                    padding: "15px 16px",
                    borderRadius: 18,
                    fontWeight: 800,
                  }}
                >
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
