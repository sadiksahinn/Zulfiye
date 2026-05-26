"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CalendarDays, Phone, Save, UserRound, Wallet } from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [rentals, setRentals] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [fittings, setFittings] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    instagram: "",
    wedding_date: "",
    notes: "",
  });

  async function load() {
    const [customerRes, rentalsRes, salesRes, fittingsRes] = await Promise.all([
      supabase.from("customers").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("rentals").select("*").eq("customer_id", params.id).order("created_at", { ascending: false }),
      supabase.from("sales").select("*").eq("customer_id", params.id).order("created_at", { ascending: false }),
      supabase.from("fittings").select("*").eq("customer_id", params.id).order("fitting_date", { ascending: false }),
    ]);

    if (customerRes.error) setMessage(customerRes.error.message);

    setCustomer(customerRes.data);

    if (customerRes.data) {
      setForm({
        full_name: customerRes.data.full_name || "",
        phone: customerRes.data.phone || "",
        instagram: customerRes.data.instagram || "",
        wedding_date: customerRes.data.wedding_date || "",
        notes: customerRes.data.notes || "",
      });
    }

    setRentals(rentalsRes.data || []);
    setSales(salesRes.data || []);
    setFittings(fittingsRes.data || []);
    setFittings(fittingsRes.data || []);
  }

  useEffect(() => {
    if (params.id) load();
  }, [params.id]);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function updateCustomer() {
    setMessage("");

    const { error } = await supabase
      .from("customers")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        instagram: form.instagram,
        wedding_date: form.wedding_date || null,
        notes: form.notes,
      })
      .eq("id", params.id);

    if (error) {
      setMessage(error.message || "Müşteri güncellenemedi.");
      return;
    }

    setMessage("Müşteri bilgileri güncellendi.");
    setEditing(false);
    await load();
  }

  const totals = useMemo(() => {
    const rentalRemaining = rentals.reduce((s, x) => s + Number(x.remaining_amount || 0), 0);
    const saleRemaining = sales.reduce((s, x) => s + Number(x.remaining_amount || 0), 0);
    return { remaining: rentalRemaining + saleRemaining };
  }, [rentals, sales]);

  if (!customer) {
    return (
      <AppShell title="Müşteri Kartı">
        <div className="premium-card p-8 text-sm font-black text-[#6d6256]">
          {message || "Müşteri yükleniyor..."}
        </div>
      </AppShell>
    );
  }

  const whatsappPhone = String(customer.phone || "").replace(/\D/g, "").replace(/^0/, "90");

  return (
    <AppShell title="Müşteri Kartı">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">
        <section className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">MAUNA Müşteri Operasyonu</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">{customer.full_name || "Müşteri"}</h1>
              <p className="mt-3 text-sm text-white/70">{customer.phone || "Telefon yok"}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="/customers" className="rounded-2xl bg-white/15 px-5 py-4 text-center text-sm font-black text-white">
                <ArrowLeft className="mr-2 inline" size={18} /> Listeye Dön
              </a>
              <button onClick={() => setEditing((value) => !value)} className="rounded-2xl bg-white px-5 py-4 text-center text-sm font-black text-[#211b16]">
                <Save className="mr-2 inline" size={18} /> {editing ? "Kapat" : "Düzenle"}
              </button>

              {whatsappPhone ? (
                <a href={`https://wa.me/${whatsappPhone}`} target="_blank" className="rounded-2xl bg-white px-5 py-4 text-center text-sm font-black text-[#211b16]">
                  WhatsApp Aç
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {message ? <div className="premium-card p-4 text-sm font-black text-[#6d6256]">{message}</div> : null}

        {editing ? (
          <section className="premium-card p-5 lg:p-6">
            <SectionTitle icon={<Save size={20} />} title="Müşteri Bilgilerini Düzenle" sub="Telefon, not ve tarih bilgilerini güncelle" />
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input className="input" placeholder="Ad Soyad" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
              <input className="input" placeholder="Telefon" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
              <input className="input" placeholder="Instagram" value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} />
              <input className="input" type="date" value={form.wedding_date} onChange={(e) => updateField("wedding_date", e.target.value)} />
              <textarea className="input min-h-28 md:col-span-2" placeholder="Notlar" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
            </div>

            <button onClick={updateCustomer} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#211b16] px-5 py-4 text-sm font-black text-white">
              <Save size={18} /> Müşteriyi Kaydet
            </button>
          </section>
        ) : null}

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric title="Prova" value={fittings.length} icon={<CalendarDays size={20} />} />
          <Metric title="Prova" value={fittings.length} icon={<CalendarDays size={20} />} />
          <Metric title="Kiralama" value={rentals.length} icon={<CalendarDays size={20} />} />
          <Metric title="Satış" value={sales.length} icon={<Wallet size={20} />} />
          <Metric title="Kalan" value={`${totals.remaining.toLocaleString("tr-TR")} TL`} icon={<Wallet size={20} />} danger={totals.remaining > 0} />
          <Metric title="Telefon" value={customer.phone || "-"} icon={<Phone size={20} />} />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[.85fr_1.15fr]">
          <div className="premium-card p-5 lg:p-6">
            <SectionTitle icon={<UserRound size={20} />} title="Müşteri Bilgileri" sub="Temel iletişim ve notlar" />

            <div className="mt-5 space-y-3">
              <Info label="Ad Soyad" value={customer.full_name || "-"} />
              <Info label="Telefon" value={customer.phone || "-"} />
              <Info label="Instagram" value={customer.instagram || "-"} />
              <Info label="Düğün/Kına Tarihi" value={customer.wedding_date || "-"} />
              <Info label="Not" value={customer.notes || "-"} />
            </div>
          </div>

          <div className="space-y-5">
            <History title="Prova Geçmişi" items={fittings} type="fitting" />
            <History title="Prova Geçmişi" items={fittings} type="fitting" />
            <History title="Kiralama Geçmişi" items={rentals} type="rental" />
            <History title="Satış Geçmişi" items={sales} type="sale" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ title, value, icon, danger = false }: any) {
  return (
    <div className={`premium-card p-4 ${danger ? "border-red-200" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7f72]">{title}</p>
          <h3 className={`mt-2 text-xl font-black tracking-[-0.04em] ${danger ? "text-red-700" : "text-[#211b16]"}`}>{value}</h3>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${danger ? "bg-red-100 text-red-600" : "bg-[#b69463]/15 text-[#b69463]"}`}>{icon}</div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, sub }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">{icon}</div>
      <div>
        <h2 className="premium-title text-xl">{title}</h2>
        <p className="premium-muted text-sm">{sub}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-white/60 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a7f72]">{label}</div>
      <div className="mt-1 text-sm font-black text-[#211b16]">{value}</div>
    </div>
  );
}

function History({ title, items, type }: any) {
  return (
    <div className="premium-card p-5 lg:p-6">
      <h2 className="premium-title text-xl">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-8 text-center text-sm font-bold text-[#8a7f72]">
            Kayıt yok.
          </div>
        ) : (
          items.slice(0, 8).map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-[#eadfce] bg-white/70 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-black text-[#211b16]">{item.product_name || item.title || "İşlem"}</h3>
                  <p className="mt-1 text-xs font-bold text-[#8a7f72]">
                    {type === "rental"
                      ? [item.delivery_date, item.return_date, item.status].filter(Boolean).join(" • ")
                      : type === "fitting"
                        ? [item.fitting_date, item.fitting_time, item.status].filter(Boolean).join(" • ")
                        : [item.sale_date, item.status].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <span className="rounded-2xl bg-[#f7f0e7] px-4 py-2 text-xs font-black text-[#211b16]">
                  {Number(item.total_amount || 0).toLocaleString("tr-TR")} TL
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
