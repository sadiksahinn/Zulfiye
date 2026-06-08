"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, Copy, FileText, Link2, Plus, Send, Trash2, X } from "lucide-react";

const DEFAULT_CONTRACT = `Sayın {musteri},

Zülfiye Canbolat Gelinlik ile yapmış olduğunuz kiralamaya ait sözleşme koşulları aşağıda belirtilmiştir:

1. Kiralanan ürün, belirlenen etkinlik tarihinde iade edilecektir.
2. Kıyafete verilen hasarlardan kiracı sorumludur.
3. Kapora iadesi yapılmamaktadır.
4. Teslimatta kalan ödeme tahsil edilecektir.

Bu sözleşmeyi onaylayarak yukarıdaki koşulları kabul etmiş sayılırsınız.

Zülfiye Canbolat Gelinlik`;

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ customer_id: "", title: "Kira Sözleşmesi", content: DEFAULT_CONTRACT });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [cr, cus] = await Promise.all([
      supabase.from("contracts").select("*, customers(full_name, phone)").order("created_at", { ascending: false }),
      supabase.from("customers").select("id, full_name, phone").order("full_name"),
    ]);
    setContracts(cr.data || []);
    setCustomers(cus.data || []);
    setLoading(false);
  }

  async function createContract() {
    if (!form.customer_id) return;
    setSaving(true);
    const cust = customers.find(c => c.id === form.customer_id);
    const content = form.content.replace("{musteri}", cust?.full_name || "Müşteri");
    const { data } = await supabase.from("contracts").insert({
      customer_id: form.customer_id,
      title: form.title,
      content,
      status: "beklemede",
    }).select().maybeSingle();
    setSaving(false);
    if (data) {
      setShowNew(false);
      setForm({ customer_id: "", title: "Kira Sözleşmesi", content: DEFAULT_CONTRACT });
      load();
    }
  }

  async function deleteContract(id: string) {
    if (!confirm("Bu sözleşmeyi silmek istediğinize emin misiniz?")) return;
    setDeleting(id);
    await supabase.from("contracts").delete().eq("id", id);
    setDeleting(null);
    load();
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}/contracts/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function sendWhatsApp(contract: any) {
    const phone = contract.customers?.phone;
    if (!phone) return;
    const digits = String(phone).replace(/\D/g, "");
    const clean = digits.startsWith("90") ? digits : digits.startsWith("0") ? `90${digits.slice(1)}` : `90${digits}`;
    const url = `${window.location.origin}/contracts/${contract.id}`;
    const msg = `Merhaba ${contract.customers?.full_name}, Zülfiye Canbolat Gelinlik sözleşmenizi incelemek ve onaylamak için lütfen aşağıdaki bağlantıya tıklayın:\n\n${url}\n\nSMS ile kimliğiniz doğrulanacak ve sözleşme onaylanacaktır.`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const pending = contracts.filter(c => c.status !== "onaylandi");
  const approved = contracts.filter(c => c.status === "onaylandi");

  return (
    <AppShell title="Sözleşmeler">
      <div className="space-y-5 pb-24 lg:pb-0">

        {/* Hero */}
        <div className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">Dijital İmza Sistemi</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Sözleşmeler</h1>
          <p className="mt-2 text-sm text-white/70">Müşteri SMS'i ile onaylanan hukuken geçerli sözleşmeler (5070 Sayılı Kanun)</p>
        </div>

        {/* Yeni sözleşme butonu */}
        <button
          onClick={() => setShowNew(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 text-base font-black text-white shadow-lg"
        >
          <Plus size={20} /> Yeni Sözleşme Oluştur
        </button>

        {/* Yeni form modal */}
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#211b16]">Yeni Sözleşme</h2>
                <button onClick={() => setShowNew(false)} className="rounded-full p-2 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <select
                  className="input"
                  value={form.customer_id}
                  onChange={e => {
                    const cust = customers.find(c => c.id === e.target.value);
                    setForm(f => ({ ...f, customer_id: e.target.value, content: DEFAULT_CONTRACT.replace("{musteri}", cust?.full_name || "{musteri}") }));
                  }}
                >
                  <option value="">Müşteri Seç *</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} {c.phone ? `· ${c.phone}` : ""}</option>)}
                </select>

                <input
                  className="input"
                  placeholder="Başlık (ör: Kira Sözleşmesi)"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />

                <textarea
                  className="input min-h-64 text-sm leading-6"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                />
              </div>

              <button
                onClick={createContract}
                disabled={saving || !form.customer_id}
                className="w-full rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 font-black text-white disabled:opacity-50"
              >
                {saving ? "Oluşturuluyor…" : "✓ Sözleşme Oluştur"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-[#b69463] font-black animate-pulse">Yükleniyor…</div>
        ) : (
          <>
            {/* Bekleyen */}
            {pending.length > 0 && (
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463]">Bekleyen ({pending.length})</div>
                {pending.map(c => (
                  <ContractCard key={c.id} contract={c} onCopy={copyLink} onWA={sendWhatsApp} onDelete={deleteContract} copiedId={copiedId} deleting={deleting} />
                ))}
              </div>
            )}

            {/* Onaylanan */}
            {approved.length > 0 && (
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Onaylanan ({approved.length})</div>
                {approved.map(c => (
                  <ContractCard key={c.id} contract={c} onCopy={copyLink} onWA={sendWhatsApp} onDelete={deleteContract} copiedId={copiedId} deleting={deleting} />
                ))}
              </div>
            )}

            {contracts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#eadfce] p-12 text-center">
                <FileText size={32} className="mx-auto mb-3 text-[#d8bd84]" />
                <p className="font-black text-[#211b16]">Henüz sözleşme yok</p>
                <p className="text-sm text-[#9d8b74]">İlk sözleşmeyi oluşturmak için yukarıdaki butona tıklayın.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function ContractCard({ contract: c, onCopy, onWA, onDelete, copiedId, deleting }: any) {
  const approved = c.status === "onaylandi";
  return (
    <div className={`rounded-2xl border p-5 ${approved ? "border-emerald-200 bg-emerald-50/50" : "border-[#eadfce] bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-[#211b16]">{c.customers?.full_name}</span>
            {approved ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                <CheckCircle size={10} /> Onaylandı
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                <Clock size={10} /> Bekliyor
              </span>
            )}
          </div>
          <div className="mt-0.5 text-sm text-[#9d8b74]">{c.title}</div>
          {approved && c.signed_at && (
            <div className="mt-1 text-xs text-emerald-600">
              {new Date(c.signed_at).toLocaleString("tr-TR")} · IP: {c.signed_ip}
            </div>
          )}
          {!approved && (
            <div className="mt-1 text-xs text-[#9d8b74]">
              {new Date(c.created_at).toLocaleDateString("tr-TR")}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(c.id)} disabled={deleting === c.id} className="shrink-0 rounded-full p-1.5 text-[#c9a888] hover:bg-red-50 hover:text-red-500 transition">
          <Trash2 size={15} />
        </button>
      </div>

      {!approved && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onCopy(c.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#eadfce] bg-white py-2.5 text-sm font-black text-[#211b16] transition hover:bg-[#f7f0e7]"
          >
            {copiedId === c.id ? <><Copy size={14} /> Kopyalandı!</> : <><Link2 size={14} /> Linki Kopyala</>}
          </button>
          <button
            onClick={() => onWA(c)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 py-2.5 text-sm font-black text-white transition hover:bg-green-700"
          >
            <Send size={14} /> WhatsApp'tan Gönder
          </button>
        </div>
      )}
    </div>
  );
}
