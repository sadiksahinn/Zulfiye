"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Clock, Package, Search, UserRound } from "lucide-react";

type Fitting = {
  id: string;
  customer_id: string;
  product_id: string | null;
  fitting_date: string;
  fitting_time: string | null;
  status: string;
  measurement_notes: string | null;
  alteration_notes: string | null;
  customers?: { full_name: string; phone: string };
  products?: { name: string; category: string; color: string | null; size: string | null; image_url: string | null };
};

const CATEGORIES = ["Tümü", "Gelinlik", "Kınalık", "After Party", "Aksesuar", "Ayakkabı"];

const STATUS_OPTIONS = [
  { key: "bekliyor",       label: "Bekliyor",        cls: "bg-amber-50 border-amber-200 text-amber-700" },
  { key: "geldi",          label: "Geldi",            cls: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "tamamlandi",     label: "Tamamlandı",       cls: "bg-green-50 border-green-200 text-green-700" },
  { key: "teslime_hazir",  label: "Teslime Hazır",    cls: "bg-purple-50 border-purple-200 text-purple-700" },
];

const inputCls = "w-full rounded-full border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function FittingsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts]   = useState<any[]>([]);
  const [fittings, setFittings]   = useState<Fitting[]>([]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch,  setProductSearch]  = useState("");
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedProduct,  setSelectedProduct]  = useState<any>(null);

  const [form, setForm] = useState({
    fittingDate: new Date().toISOString().slice(0, 10),
    fittingTime: "",
    measurementNotes: "",
    alterationNotes: "",
  });

  const [listFilter, setListFilter] = useState<"upcoming" | "today" | "all">("upcoming");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    const [c, p, f] = await Promise.all([
      supabase.from("customers").select("id,full_name,phone").order("full_name"),
      supabase.from("products").select("id,name,category,color,size,image_url,barcode").order("category"),
      supabase.from("fittings")
        .select("*, customers(full_name,phone), products(name,category,color,size,image_url)")
        .order("fitting_date", { ascending: true }),
    ]);
    setCustomers(c.data || []);
    setProducts(p.data || []);
    setFittings((f.data || []) as Fitting[]);
  }

  useEffect(() => { load(); }, []);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  const customerResults = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q || selectedCustomer) return [];
    return customers.filter(c => [c.full_name, c.phone].join(" ").toLowerCase().includes(q)).slice(0, 6);
  }, [customers, customerSearch, selectedCustomer]);

  const productResults = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    return products.filter(p => {
      const catOk = activeCategory === "Tümü" || p.category === activeCategory;
      const searchOk = !q || [p.name, p.barcode, p.color, p.size].filter(Boolean).join(" ").toLowerCase().includes(q);
      return catOk && searchOk;
    }).slice(0, 10);
  }, [products, productSearch, activeCategory]);

  const today = new Date().toISOString().slice(0, 10);

  const visibleFittings = useMemo(() => fittings.filter(f => {
    if (listFilter === "today")    return f.fitting_date === today;
    if (listFilter === "upcoming") return f.fitting_date >= today;
    return true;
  }), [fittings, listFilter, today]);

  async function createFitting() {
    setMessage(null);
    if (!selectedCustomer || !form.fittingDate) {
      setMessage({ text: "Müşteri ve prova tarihi zorunludur.", ok: false });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("fittings").insert({
      customer_id:       selectedCustomer.id,
      product_id:        selectedProduct?.id || null,
      fitting_date:      form.fittingDate,
      fitting_time:      form.fittingTime || null,
      status:            "bekliyor",
      measurement_notes: form.measurementNotes || null,
      alteration_notes:  form.alterationNotes || null,
      created_by:        user?.id,
    });

    if (error) { setMessage({ text: "Prova kaydedilemedi.", ok: false }); return; }

    await supabase.from("calendar_events").insert({
      customer_id: selectedCustomer.id,
      product_id:  selectedProduct?.id || null,
      title:       `Prova: ${selectedCustomer.full_name}${selectedProduct ? ` — ${selectedProduct.name}` : ""}`,
      event_type:  "fitting",
      event_date:  form.fittingDate,
      event_time:  form.fittingTime || null,
      description: selectedProduct ? `${selectedProduct.category} — ${selectedProduct.name}` : "Ürün belirtilmedi",
      created_by:  user?.id,
    });

    setMessage({ text: "Prova kaydedildi ve takvime işlendi.", ok: true });
    setCustomerSearch(""); setProductSearch("");
    setSelectedCustomer(null); setSelectedProduct(null);
    setForm({ fittingDate: new Date().toISOString().slice(0, 10), fittingTime: "", measurementNotes: "", alterationNotes: "" });
    load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("fittings").update({ status }).eq("id", id);
    load();
  }

  return (
    <AppShell title="Provalar">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">

        {/* Header */}
        <div className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">MAUNA Prova Takibi</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Prova Merkezi</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">Prova randevularını oluşturun ve takip edin.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_.9fr]">

          {/* FORM */}
          <div className="premium-card p-5 lg:p-7">
            <h2 className="text-2xl font-black text-[#1f1b16]">Prova Oluştur</h2>

            <div className="mt-5 space-y-4">

              {/* Müşteri */}
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Müşteri *</label>
                <div className="relative">
                  <div className="flex items-center gap-3 rounded-full border border-[#eadfce] bg-white/70 px-4 py-3">
                    <Search size={16} className="shrink-0 text-[#b69463]" />
                    <input value={customerSearch} placeholder="Ad soyad veya telefon"
                      onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomer(null); }}
                      className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]" />
                  </div>
                  {customerResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-2xl border border-[#eadfce] bg-white shadow-xl">
                      {customerResults.map(c => (
                        <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.full_name); }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f7f0e7] first:rounded-t-2xl last:rounded-b-2xl">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b69463]/15 font-black text-sm text-[#b69463]">{c.full_name[0]}</div>
                          <div>
                            <div className="text-sm font-black text-[#211b16]">{c.full_name}</div>
                            <div className="text-xs text-[#9d8b74]">{c.phone}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCustomer && (
                  <div className="mt-2 flex items-center gap-3 rounded-full bg-[#b69463]/10 px-4 py-2.5">
                    <UserRound size={16} className="text-[#b69463]" />
                    <span className="text-sm font-black text-[#211b16]">{selectedCustomer.full_name}</span>
                    <span className="text-xs text-[#9d8b74]">{selectedCustomer.phone}</span>
                  </div>
                )}
              </div>

              {/* Ürün */}
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Ürün (opsiyonel)</label>

                {/* Kategori sekmeleri */}
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-black transition ${activeCategory === cat ? "bg-[#b69463] text-white" : "bg-[#f7f0e7] text-[#7d6c58]"}`}>
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 rounded-full border border-[#eadfce] bg-white/70 px-4 py-3">
                  <Search size={16} className="shrink-0 text-[#b69463]" />
                  <input value={productSearch} placeholder="Ürün adı, barkod, renk..."
                    onChange={e => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                    className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]" />
                </div>

                {productResults.length > 0 && !selectedProduct && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-2xl border border-[#eadfce] bg-white/90 shadow-lg">
                    {productResults.map(p => (
                      <button key={p.id} onClick={() => { setSelectedProduct(p); setProductSearch(`${p.name} ${p.color || ""}`); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f7f0e7]">
                        {p.image_url
                          ? <img src={p.image_url} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                          : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]"><Package size={16} /></div>
                        }
                        <div>
                          <span className="text-[10px] font-black text-[#b69463]">{p.category}</span>
                          <div className="text-sm font-black text-[#211b16]">{p.name}</div>
                          <div className="text-xs text-[#9d8b74]">{[p.color, p.size].filter(Boolean).join(" · ")}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedProduct && (
                  <div className="mt-2 flex items-center gap-3 rounded-full bg-[#b69463]/10 px-4 py-2.5">
                    <Package size={16} className="text-[#b69463]" />
                    <div>
                      <span className="text-[10px] font-black text-[#b69463]">{selectedProduct.category}</span>
                      <span className="ml-2 text-sm font-black text-[#211b16]">{selectedProduct.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tarih & Saat */}
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Prova Tarihi & Saati *</label>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} type="date" value={form.fittingDate} onChange={e => set("fittingDate", e.target.value)} />
                  <input className={inputCls} type="time" value={form.fittingTime} onChange={e => set("fittingTime", e.target.value)} />
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Ölçü / Prova Notu</label>
                <textarea className={inputCls + " min-h-[80px] resize-none"} placeholder="Ölçü bilgileri, uyum notları..."
                  value={form.measurementNotes} onChange={e => set("measurementNotes", e.target.value)} />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Tadilat / Terzi Notu</label>
                <textarea className={inputCls + " min-h-[80px] resize-none"} placeholder="Tadilat talimatları, terzi notları..."
                  value={form.alterationNotes} onChange={e => set("alterationNotes", e.target.value)} />
              </div>

              {message && (
                <div className={`rounded-2xl border p-4 text-sm font-bold ${message.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"}`}>
                  {message.text}
                </div>
              )}

              <button onClick={createFitting}
                className="w-full rounded-full bg-[#211b16] py-4 font-black text-white">
                Prova Kaydet ve Takvime İşle
              </button>
            </div>
          </div>

          {/* LİSTE */}
          <div className="premium-card p-5 lg:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#1f1b16]">Prova Listesi</h2>
              <span className="rounded-full bg-[#b69463]/10 px-3 py-1 text-xs font-black text-[#b69463]">{visibleFittings.length} randevu</span>
            </div>

            {/* Filtre */}
            <div className="mt-4 flex gap-2">
              {[["upcoming", "Yaklaşan"], ["today", "Bugün"], ["all", "Tümü"]].map(([k, l]) => (
                <button key={k} onClick={() => setListFilter(k as any)}
                  className={`flex-1 rounded-2xl py-2.5 text-xs font-black ${listFilter === k ? "bg-[#211b16] text-white" : "border border-[#eadfce] bg-white/70 text-[#6d6256]"}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
              {visibleFittings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#d9c9b5] py-10 text-center text-sm font-bold text-[#8a7f72]">
                  Prova randevusu bulunmuyor.
                </div>
              ) : visibleFittings.map(item => {
                const statusCfg = STATUS_OPTIONS.find(s => s.key === item.status) || STATUS_OPTIONS[0];
                return (
                  <div key={item.id} className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
                    {/* Müşteri + ürün */}
                    <div className="flex items-start gap-3">
                      {item.products?.image_url
                        ? <img src={item.products.image_url} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                        : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]"><Package size={20} /></div>
                      }
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black ${statusCfg.cls}`}>{statusCfg.label}</span>
                          {item.products?.category && (
                            <span className="rounded-lg bg-[#b69463]/10 px-2 py-0.5 text-[10px] font-black text-[#b69463]">{item.products.category}</span>
                          )}
                        </div>
                        <p className="mt-1 font-black text-[#211b16]">{item.customers?.full_name || "—"}</p>
                        {item.products && (
                          <p className="text-xs text-[#9d8b74]">{item.products.name} {[item.products.color, item.products.size].filter(Boolean).join(" · ")}</p>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-xs text-[#9d8b74]">
                          <span className="flex items-center gap-1"><CalendarDays size={11} />{formatDate(item.fitting_date)}</span>
                          {item.fitting_time && <span className="flex items-center gap-1"><Clock size={11} />{item.fitting_time.slice(0, 5)}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Notlar */}
                    {(item.measurement_notes || item.alteration_notes) && (
                      <div className="mt-3 rounded-xl bg-[#f7f0e7] px-3 py-2 text-xs text-[#6d6256]">
                        {item.measurement_notes && <p><span className="font-black">Ölçü:</span> {item.measurement_notes}</p>}
                        {item.alteration_notes && <p className="mt-0.5"><span className="font-black">Tadilat:</span> {item.alteration_notes}</p>}
                      </div>
                    )}

                    {/* Durum butonları */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map(s => (
                        <button key={s.key} onClick={() => updateStatus(item.id, s.key)}
                          className={`rounded-xl py-2.5 text-xs font-black border transition ${item.status === s.key ? "bg-[#211b16] text-white border-[#211b16]" : `${s.cls} hover:opacity-80`}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
