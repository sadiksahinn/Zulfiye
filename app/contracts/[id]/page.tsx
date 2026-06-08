"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, FileText, Lock, ShieldCheck } from "lucide-react";

export default function ContractSignPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"view" | "otp" | "done" | "error">("view");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null); // sadece test için

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("contracts")
        .select("*, customers(full_name, phone)")
        .eq("id", id)
        .maybeSingle();
      setContract(data);
      setLoading(false);
      if (data?.status === "onaylandi") setStep("done");
    }
    if (id) load();
  }, [id]);

  async function sendOtp() {
    setSending(true);
    setMsg("");
    const res = await fetch("/api/contracts/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId: id }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) { setMsg(data.error || "Hata oluştu"); return; }
    if (data.otp) setDevOtp(data.otp); // SMS yokken test modu
    setStep("otp");
    setMsg(data.smsSent ? "SMS gönderildi." : "Kod oluşturuldu (SMS ayarları eksik, test modu).");
  }

  async function verifyOtp() {
    if (otp.length !== 6) { setMsg("6 haneli kodu girin."); return; }
    setVerifying(true);
    setMsg("");
    const res = await fetch("/api/contracts/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId: id, otp }),
    });
    const data = await res.json();
    setVerifying(false);
    if (!res.ok) { setMsg(data.error || "Hata oluştu"); return; }
    setStep("done");
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf6f0]">
      <div className="text-[#b69463] text-sm font-black animate-pulse">Yükleniyor…</div>
    </div>
  );

  if (!contract) return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf6f0]">
      <div className="text-center">
        <div className="text-4xl mb-3">❌</div>
        <div className="font-black text-[#211b16]">Sözleşme bulunamadı</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf6f0] px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* Başlık */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#b69463] to-[#d8bd84]">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-[#211b16]">Zülfiye Canbolat Gelinlik</h1>
          <p className="text-sm text-[#9d8b74]">{contract.title}</p>
        </div>

        {/* Onaylandı durumu */}
        {step === "done" && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
            <h2 className="text-xl font-black text-emerald-700">Sözleşme Onaylandı</h2>
            <p className="mt-2 text-sm text-emerald-600">
              {contract.customers?.full_name} tarafından onaylanmıştır.
            </p>
            {contract.signed_at && (
              <p className="mt-1 text-xs text-emerald-500">
                {new Date(contract.signed_at).toLocaleString("tr-TR")}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700">
              <ShieldCheck size={14} /> Dijital imza kaydedildi · Hukuken geçerli
            </div>
          </div>
        )}

        {/* Sözleşme metni */}
        {step !== "done" && (
          <>
            <div className="mb-5 rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-[#eadfce] pb-4">
                <Lock size={16} className="text-[#b69463]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#b69463]">Sözleşme İçeriği</span>
              </div>
              <div className="prose prose-sm max-w-none text-[#3d332a] whitespace-pre-wrap text-sm leading-7 font-medium">
                {contract.content}
              </div>
            </div>

            {/* Müşteri bilgisi */}
            <div className="mb-5 rounded-2xl border border-[#eadfce] bg-white/80 px-5 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463] mb-2">Taraflar</div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6d6256]">Müşteri:</span>
                <span className="font-black text-[#211b16]">{contract.customers?.full_name}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-[#6d6256]">Firma:</span>
                <span className="font-black text-[#211b16]">Zülfiye Canbolat Gelinlik</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#9d8b74]">
                <Clock size={12} /> Bu sözleşmeyi onaylamak için SMS kodu talep edin
              </div>
            </div>

            {/* OTP adımı */}
            {step === "view" && (
              <button onClick={sendOtp} disabled={sending}
                className="w-full rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 text-base font-black text-white shadow-lg disabled:opacity-60">
                {sending ? "SMS Gönderiliyor…" : "📱 SMS Kodu ile Onayla"}
              </button>
            )}

            {step === "otp" && (
              <div className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm space-y-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">📱</div>
                  <h3 className="font-black text-[#211b16]">SMS Kodunuzu Girin</h3>
                  <p className="text-sm text-[#9d8b74]">
                    {contract.customers?.phone} numarasına 6 haneli kod gönderildi
                  </p>
                  {devOtp && (
                    <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
                      Test modu — Kod: {devOtp}
                    </p>
                  )}
                </div>
                <input
                  type="number" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.slice(0, 6))}
                  placeholder="123456"
                  className="w-full rounded-2xl border-2 border-[#eadfce] bg-white px-4 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-[#b69463]"
                />
                <button onClick={verifyOtp} disabled={verifying || otp.length !== 6}
                  className="w-full rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 text-base font-black text-white shadow-lg disabled:opacity-60">
                  {verifying ? "Doğrulanıyor…" : "✓ Sözleşmeyi Onayla"}
                </button>
                <button onClick={sendOtp} disabled={sending}
                  className="w-full rounded-full border border-[#eadfce] py-3 text-sm font-black text-[#9d8b74]">
                  {sending ? "Gönderiliyor…" : "Kodu Yeniden Gönder"}
                </button>
              </div>
            )}

            {msg && (
              <div className={`mt-3 rounded-2xl px-4 py-3 text-sm font-bold text-center ${msg.includes("Hata") || msg.includes("hatalı") || msg.includes("süres") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                {msg}
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9d8b74]">
              <ShieldCheck size={12} /> SMS ile onay hukuken geçerli dijital imza sayılır (5070 Sayılı Kanun)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
