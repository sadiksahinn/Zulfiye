"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CalendarDays, Phone, UserRound, Wallet } from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [rentals, setRentals] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const [customerRes, rentalsRes, salesRes] = await Promise.all([
      supabase.from("customers").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("rentals").select("*").eq("customer_id", params.id).order("created_at", { ascending: false }),
      supabase.from("sales").select("*").eq("customer_id", params.id).order("created_at", { ascending: false }),
    ]);

    if (customerRes.error) setMessage(customerRes.error.message);

    setCustomer(customerRes.data);
    setRentals(rentalsRes.data || []);
    setSales(salesRes.data || []);
  }

  useEffect(() => {
    if (params.id) load();
  }, [params.id]);

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
              {whatsappPhone ? (
                <a href={`https://wa.me/${whatsappPhone}`} target="_blank" className="rounded-2xl bg-white px-5 py-4 text-center text-sm font-black text-[#211b16]">
                  WhatsApp Aç
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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
