"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Copy, Send } from "lucide-react";

export default function SmsPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("Merhaba, MAUNA Couture randevunuz için sizi bekliyoruz.");

  const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "90");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : "#";

  return (
    <AppShell title="SMS / WhatsApp">
      <div className="space-y-5 pb-24 lg:pb-0">
        <div className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Mesaj Merkezi</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">SMS / WhatsApp</h1>
          <p className="mt-2 text-sm text-white/70">Müşteri mesajlarını hızlıca oluştur ve gönder.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="premium-card p-6">
            <h2 className="premium-title text-2xl">Mesaj Oluştur</h2>
            <div className="mt-6 grid gap-4">
              <input className="input" placeholder="Telefon: 05xx xxx xx xx" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <textarea className="input min-h-52" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>

          <div className="premium-card p-6">
            <h2 className="premium-title text-2xl">Önizleme</h2>
            <div className="mt-6 rounded-3xl bg-[#f7f0e7] p-5 text-sm font-semibold leading-7 text-[#211b16]">
              {message}
            </div>

            <div className="mt-6 grid gap-3">
              <button onClick={() => navigator.clipboard.writeText(message)} className="rounded-2xl border border-[#eadfce] bg-white px-4 py-4 font-black text-[#211b16]">
                <Copy className="mr-2 inline" size={18} /> Kopyala
              </button>

              <a href={whatsappUrl} target="_blank" className="rounded-2xl bg-[#211b16] px-4 py-4 text-center font-black text-white">
                <Send className="mr-2 inline" size={18} /> WhatsApp Aç
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
