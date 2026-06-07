"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Copy, MessageSquareText, Send } from "lucide-react";

const templates = [
  { title: "Prova Hatırlatma", message: "Merhaba {musteri}, Zülfiye Canbolat Gelinlik prova randevunuz için sizi bekliyoruz. Güzel günler dileriz." },
  { title: "Teslim Hazır", message: "Merhaba {musteri}, ürününüz teslim için hazırdır. Detaylı bilgi için bizimle iletişime geçebilirsiniz. Zülfiye Canbolat Gelinlik" },
  { title: "İade Hatırlatma", message: "Merhaba {musteri}, kiraladığınız ürünün iade tarihi yaklaşmıştır. Gecikme yaşanmaması için bilginize sunarız. Zülfiye Canbolat Gelinlik" },
  { title: "Kalan Ödeme", message: "Merhaba {musteri}, kalan ödemeniz bulunmaktadır. Teslim öncesi ödemenizi tamamlamanızı rica ederiz. Zülfiye Canbolat Gelinlik" },
  { title: "Randevu Teyit", message: "Merhaba {musteri}, Zülfiye Canbolat Gelinlik randevunuz başarıyla oluşturulmuştur. Sizi bekliyoruz." },
  { title: "Teşekkür & Yorum", message: "Merhaba {musteri}, Zülfiye Canbolat Gelinlik'u tercih ettiğiniz için teşekkür ederiz. Güzel günler dileriz! Yorumunuz için: g.page/zulfiyecouture" },
];

export default function SmsPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(templates[0].message);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers(data || []);
  }

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);
  const renderedMessage = message.replaceAll("{musteri}", selectedCustomerData?.full_name || "Değerli müşterimiz");

  const cleanPhone = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("90")) return digits;
    if (digits.startsWith("0")) return `90${digits.slice(1)}`;
    if (digits.length === 10) return `90${digits}`;
    return digits;
  }, [phone]);

  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(renderedMessage)}` : "#";

  async function copyMessage() {
    await navigator.clipboard.writeText(renderedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function sendNetgsmSMS() {
    if (!cleanPhone || cleanPhone.length < 10) {
      setSendResult({ ok: false, text: "Geçerli bir telefon numarası girin." });
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, message: renderedMessage }),
      });
      const data = await res.json();
      setSendResult(data.success ? { ok: true, text: "SMS başarıyla gönderildi!" } : { ok: false, text: data.error || "SMS gönderilemedi." });
    } catch {
      setSendResult({ ok: false, text: "Bağlantı hatası." });
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell title="SMS / WhatsApp">
      <div className="space-y-5 pb-24 lg:pb-0">
        <div className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">ZÜLFİYE CANBOLAT Mesaj Merkezi</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">SMS / WhatsApp</h1>
          <p className="mt-2 text-sm text-white/70">Hazır şablonlarla müşteri mesajlarını hızlıca oluşturun ve gönderin.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <div className="premium-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b69463]/15 text-[#b69463]">
                <MessageSquareText size={20} />
              </div>
              <div>
                <h2 className="premium-title text-2xl">Hazır Şablonlar</h2>
                <p className="premium-muted text-sm">Tek tıkla mesaj seç</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {templates.map((item) => (
                <button key={item.title} onClick={() => setMessage(item.message)} className={`rounded-2xl border p-4 text-left transition ${message === item.message ? "border-[#b69463] bg-[#b69463]/10" : "border-[#eadfce] bg-white/70"}`}>
                  <div className="text-sm font-black text-[#211b16]">{item.title}</div>
                  <div className="mt-1 text-xs font-bold leading-5 text-[#8a7f72] line-clamp-2">{item.message}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="premium-card p-6">
            <h2 className="premium-title text-2xl">Mesaj Oluştur</h2>
            <div className="mt-6 grid gap-4">
              <select className="input" value={selectedCustomer} onChange={(e) => { const id = e.target.value; setSelectedCustomer(id); const c = customers.find((c) => c.id === id); if (c?.phone) setPhone(c.phone); }}>
                <option value="">Müşteri Seç</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
              <input className="input" placeholder="Telefon: 05xx xxx xx xx" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <textarea className="input min-h-40" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <div className="mt-5 rounded-3xl bg-[#f7f0e7] p-5 text-sm font-semibold leading-7 text-[#211b16]">
              {renderedMessage}
            </div>

            {sendResult && (
              <div className={`mt-4 flex items-center gap-2 rounded-2xl p-4 text-sm font-bold ${sendResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {sendResult.ok && <CheckCircle size={16} />}
                {sendResult.text}
              </div>
            )}

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <button onClick={copyMessage} className="rounded-full border border-[#eadfce] bg-white px-4 py-4 font-black text-[#211b16]">
                <Copy className="mr-2 inline" size={18} />
                {copied ? "Kopyalandı" : "Kopyala"}
              </button>
              <a href={whatsappUrl} target="_blank" className="rounded-full bg-green-600 px-4 py-4 text-center font-black text-white">
                <Send className="mr-2 inline" size={18} />WhatsApp
              </a>
              <button onClick={sendNetgsmSMS} disabled={sending} className="rounded-full bg-[#211b16] px-4 py-4 font-black text-white disabled:opacity-50">
                {sending ? "Gönderiliyor..." : "SMS Gönder"}
              </button>
            </div>
            <p className="mt-3 text-xs font-bold text-[#8a7f72]">
              SMS için .env.local dosyasına NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_MSGHEADER ekleyin.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
