"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { Copy, MessageSquareText, Phone, Send, Sparkles } from "lucide-react";

export default function SmsPage() {
  const [message, setMessage] = useState("Merhaba, MAUNA Couture randevunuz için sizi bekliyoruz.");
  const [phone, setPhone] = useState("");

  const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "90");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : "#";

  return (
    <AppShell title="SMS">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">
        <div className="relative overflow-hidden rounded-[1.7rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-5 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)] lg:rounded-[2rem] lg:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA SMS / WhatsApp</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] lg:text-5xl">Mesaj merkezi</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Müşteri mesajlarını hızlıca oluşturun ve WhatsApp üzerinden gönderin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="premium-card p-5 lg:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                <MessageSquareText size={21} />
              </div>
              <div>
                <h2 className="premium-title text-xl">Mesaj Alanı</h2>
                <p className="premium-muted text-sm">Telefon ve mesajı girin</p>
              </div>
            </div>

            <div className="grid gap-4">
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx xxx xx xx" />
              <textarea className="input min-h-52" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>

          <div className="premium-card p-5 lg:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                <Sparkles size={21} />
              </div>
              <div>
                <h2 className="premium-title text-xl">Önizleme</h2>
                <p className="premium-muted text-sm">Gönderime hazır</p>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-[#eadfce] bg-[#f7f0e7]/70 p-5 text-base font-semibold leading-8 text-[#211b16]">
              {message}
            </div>

            <div className="mt-5 grid gap-3">
              <button onClick={() => navigator.clipboard.writeText(message)} className="flex items-center justify-center gap-2 rounded-2xl border border-[#eadfce] bg-white px-4 py-4 text-sm font-black text-[#211b16]">
                <Copy size={18} /> Mesajı Kopyala
              </button>

              <a href={whatsappUrl} target="_blank" className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#b69463] to-[#d8bd84] px-4 py-4 text-sm font-black text-white">
                <Send size={18} /> WhatsApp Aç
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
