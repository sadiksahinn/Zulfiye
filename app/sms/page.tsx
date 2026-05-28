"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { Copy, MessageSquareText, Send } from "lucide-react";

const templates = [
  "Merhaba, MAUNA Couture randevunuz için sizi bekliyoruz.",
  "Merhaba, ürününüz teslim için hazırdır. Detaylı bilgi için bizimle iletişime geçebilirsiniz.",
  "Merhaba, kiraladığınız ürünün iade tarihi yaklaşmıştır. Gecikme yaşanmaması için bilginize sunarız.",
  "Merhaba, kalan ödemeniz bulunmaktadır. Teslim öncesi ödemenizi tamamlamanızı rica ederiz.",
];

export default function SmsPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(templates[0].message);
  const [copied, setCopied] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    setCustomers(data || []);
  }

  const cleanPhone = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("90")) return digits;
    if (digits.startsWith("0")) return `90${digits.slice(1)}`;
    if (digits.length === 10) return `90${digits}`;
    return digits;
  }, [phone]);

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : "#";

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <AppShell title="SMS / WhatsApp">
      <div className="space-y-5 pb-24 lg:pb-0">
        <div className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Mesaj Merkezi</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">SMS / WhatsApp</h1>
          <p className="mt-2 text-sm text-white/70">Hazır şablonlarla müşteri mesajlarını hızlıca oluşturun.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <div className="premium-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                <MessageSquareText size={20} />
              </div>
              <div>
                <h2 className="premium-title text-2xl">Hazır Şablonlar</h2>
                <p className="premium-muted text-sm">Tek tıkla mesaj seç</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {templates.map((item) => (
                <button
                  key={item.title}
                  onClick={() => setMessage(item.message)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    message === item.message
                      ? "border-[#b69463] bg-[#b69463]/10 text-[#211b16]"
                      : "border-[#eadfce] bg-white/70 text-[#6d6256]"
                  }`}
                >
                  <div className="text-sm font-black text-[#211b16]">{item.title}</div>
                  <div className="mt-1 text-xs font-bold leading-5 text-[#8a7f72]">{item.message}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="premium-card p-6">
            <h2 className="premium-title text-2xl">Mesaj Oluştur</h2>

            <div className="mt-6 grid gap-4">

              <select
                className="input"
                value={selectedCustomer}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedCustomer(id);

                  const customer = customers.find((c) => c.id === id);

                  if (customer?.phone) {
                    setPhone(customer.phone);
                  }
                }}
              >
                <option value="">Müşteri Seç</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name}
                  </option>
                ))}
              </select>

              <input
                className="input"
                placeholder="Telefon: 05xx xxx xx xx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <textarea
                className="input min-h-52"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="mt-6 rounded-3xl bg-[#f7f0e7] p-5 text-sm font-semibold leading-7 text-[#211b16]">
              {message}
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              <button
                onClick={copyMessage}
                className="rounded-2xl border border-[#eadfce] bg-white px-4 py-4 font-black text-[#211b16]"
              >
                <Copy className="mr-2 inline" size={18} /> {copied ? "Kopyalandı" : "Kopyala"}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                className="rounded-2xl bg-[#211b16] px-4 py-4 text-center font-black text-white"
              >
                <Send className="mr-2 inline" size={18} /> WhatsApp Aç
              </a>
            </div>

            <p className="mt-4 text-xs font-bold text-[#8a7f72]">
              Formatlanan numara: {cleanPhone || "Telefon girilmedi"}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
