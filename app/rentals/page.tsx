"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays, Search, UserPlus, X, ShoppingBag, ChevronRight, Package,
} from "lucide-react";

const dtCls = "w-full rounded-[0.875rem] border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";

function DateTimeRow({ dateKey, timeKey, form, set }: { dateKey: string; timeKey: string; form: any; set: (k: string, v: string) => void }) {
  const d = form[dateKey] as string;
  const t = form[timeKey] as string;
  return (
    <div className="flex min-w-0 gap-2">
      <div className="relative min-w-0 flex-1">
        {!d && <span className="pointer-events-none absolute inset-0 flex items-center px-4 text-sm text-[#c4b5a5]">gg / aa / yyyy</span>}
        <input className={dtCls} type="date" value={d} onChange={e => set(dateKey, e.target.value)} />
        {d && (
          <button type="button" onClick={() => set(dateKey, "")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#f0e8df] p-1 text-[#9d8b74] hover:bg-red-50 hover:text-red-500 transition">
            <X size={11} />
          </button>
        )}
      </div>
      <div className="relative w-[6.5rem] shrink-0">
        {!t && <span className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm text-[#c4b5a5]">--:--</span>}
        <input className="w-full rounded-[0.875rem] border border-[#eadfce] bg-white/80 px-3 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]"
          type="time" value={t} onChange={e => set(timeKey, e.target.value)} />
        {t && (
          <button type="button" onClick={() => set(timeKey, "")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#f0e8df] p-1 text-[#9d8b74] hover:bg-red-50 hover:text-red-500 transition">
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

type Product = {
  id: string;
  barcode: string;
  name: string;
  product_code: string | null;
  model_name: string | null;
  category: string;
  size: string | null;
  color: string | null;
  status: string;
  rental_price: number | null;
  image_url: string | null;
};

type Customer = { id: string; full_name: string; phone: string };

type BasketItem = {
  product: Product;
  price: number;
};

const CATEGORIES = ["Tümü", "Gelinlik", "Kınalık", "After Party", "Aksesuar", "Ayakkabı"];

const EMPTY_FORM = {
  deliveryDate: "", deliveryTime: "",
  eventDate: "",    eventTime: "",
  eventType: "Düğün",
  returnDate: "",   returnTime: "",
  depositAmount: "",
  notes: "",
};

const inputCls = "w-full rounded-full border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">{children}</label>;
}

export default function RentalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [quickCustomer, setQuickCustomer] = useState({ fullName: "", phone: "" });
  const [step, setStep] = useState<1 | 2>(1); // 1=müşteri+ürün, 2=tarih+ödeme

  async function loadData() {
    const [pr, cr] = await Promise.all([
      supabase.from("products").select("*").eq("status", "stokta").order("category"),
      supabase.from("customers").select("id,full_name,phone").order("full_name"),
    ]);
    setProducts((pr.data || []) as Product[]);
    setCustomers((cr.data || []) as Customer[]);
  }

  useEffect(() => { loadData(); }, []);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    return products.filter(p => {
      const catOk = activeCategory === "Tümü" || p.category === activeCategory;
      const searchOk = !q || [p.name, p.barcode, p.product_code, p.model_name, p.color]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [products, productSearch, activeCategory]);

  const customerResults = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q || selectedCustomer) return [];
    return customers.filter(c =>
      c.full_name.toLowerCase().includes(q) || c.phone.includes(q)
    ).slice(0, 6);
  }, [customers, customerSearch, selectedCustomer]);

  function addToBasket(p: Product) {
    if (basket.find(b => b.product.id === p.id)) return;
    setBasket(prev => [...prev, { product: p, price: p.rental_price ?? 0 }]);
  }

  function removeFromBasket(id: string) {
    setBasket(prev => prev.filter(b => b.product.id !== id));
  }

  function updatePrice(id: string, price: number) {
    setBasket(prev => prev.map(b => b.product.id === id ? { ...b, price } : b));
  }

  const total = basket.reduce((s, b) => s + b.price, 0);
  const deposit = Number(form.depositAmount || 0);
  const remaining = total - deposit;

  async function createQuickCustomer() {
    if (!quickCustomer.fullName || !quickCustomer.phone) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("customers")
      .insert({ full_name: quickCustomer.fullName, phone: quickCustomer.phone, created_by: user?.id })
      .select().single();
    if (error || !data) return;
    setSelectedCustomer(data as Customer);
    setCustomerSearch(data.full_name);
    setShowCustomerModal(false);
    setQuickCustomer({ fullName: "", phone: "" });
    loadData();
  }

  async function saveRental() {
    setMessage(null);
    if (!selectedCustomer) { setMessage({ text: "Müşteri seçimi zorunludur.", ok: false }); return; }
    if (basket.length === 0) { setMessage({ text: "En az bir ürün ekleyin.", ok: false }); return; }
    if (!form.deliveryDate || !form.returnDate) { setMessage({ text: "Teslim ve iade tarihi zorunludur.", ok: false }); return; }

    const { data: { user } } = await supabase.auth.getUser();

    const { data: rental, error } = await supabase.from("rentals").insert({
      customer_id:      selectedCustomer.id,
      product_id:       basket[0].product.id,
      rental_date:      new Date().toISOString().slice(0, 10),
      delivery_date:    form.deliveryDate,
      delivery_time:    form.deliveryTime || null,
      event_date:       form.eventDate || null,
      event_time:       form.eventTime || null,
      event_type:       form.eventType,
      return_date:      form.returnDate,
      return_time:      form.returnTime || null,
      total_amount:     total,
      deposit_amount:   deposit,
      remaining_amount: remaining,
      status:           "planlandi",
      notes:            form.notes,
      created_by:       user?.id,
    }).select().single();

    if (error || !rental) { setMessage({ text: "Kiralama kaydedilemedi.", ok: false }); return; }

    // rental_items kaydet
    await supabase.from("rental_items").insert(
      basket.map(b => ({ rental_id: rental.id, product_id: b.product.id, price: b.price }))
    );

    // Tüm ürünleri rezerve et
    await Promise.all(basket.map(b =>
      supabase.from("products").update({ status: "rezerve" }).eq("id", b.product.id)
    ));

    // Takvim olayları
    const baseTitle = `${selectedCustomer.full_name} - ${basket.map(b => b.product.category).join(", ")}`;
    const calEvents = [
      { title: `Teslim: ${baseTitle}`, event_type: "delivery", event_date: form.deliveryDate, event_time: form.deliveryTime || null },
      form.eventDate ? { title: `${form.eventType}: ${baseTitle}`, event_type: "rental", event_date: form.eventDate, event_time: form.eventTime || null } : null,
      { title: `İade: ${baseTitle}`, event_type: "return", event_date: form.returnDate, event_time: form.returnTime || null },
    ].filter(Boolean).map(e => ({ ...e, customer_id: selectedCustomer.id, rental_id: rental.id, created_by: user?.id }));

    await supabase.from("calendar_events").insert(calEvents as any[]);

    setMessage({ text: `Kiralama oluşturuldu! ${basket.length} ürün rezerve edildi.`, ok: true });
    setBasket([]);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setProductSearch("");
    setForm(EMPTY_FORM);
    setStep(1);
    loadData();
  }

  return (
    <AppShell title="Kiralama">
      <div className="space-y-5">

        {/* Header */}
        <div className="rounded-[2rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-5 text-white lg:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Kiralama</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Yeni Kiralama</h2>
          <p className="mt-1 text-sm text-white/60">Birden fazla ürünü tek siparişte kirala</p>
        </div>

        {/* Adım göstergesi */}
        <div className="flex gap-3">
          {[{ n: 1, label: "Müşteri & Ürünler" }, { n: 2, label: "Tarih & Ödeme" }].map(s => (
            <button
              key={s.n}
              onClick={() => setStep(s.n as 1 | 2)}
              className={`flex flex-1 items-center gap-2 rounded-full border px-4 py-3 text-sm font-black transition ${
                step === s.n
                  ? "border-[#b69463] bg-[#b69463]/10 text-[#b69463]"
                  : "border-[#eadfce] bg-white/60 text-[#9d8b74]"
              }`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                step === s.n ? "bg-[#b69463] text-white" : "bg-[#eadfce] text-[#9d8b74]"
              }`}>{s.n}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* ADIM 1: Müşteri + Ürünler */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* Sol: Müşteri + Ürün arama */}
            <div className="space-y-5">

              {/* Müşteri */}
              <div className="premium-card p-5">
                <Label>Müşteri</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      className={inputCls}
                      placeholder="İsim veya telefon ara..."
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomer(null); }}
                    />
                    {customerResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-2xl border border-[#eadfce] bg-white shadow-xl">
                        {customerResults.map(c => (
                          <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.full_name); }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f7f0e7] first:rounded-t-2xl last:rounded-b-2xl">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b69463]/15 text-[#b69463] font-black text-sm">
                              {c.full_name[0]}
                            </div>
                            <div>
                              <div className="text-sm font-black text-[#211b16]">{c.full_name}</div>
                              <div className="text-xs text-[#9d8b74]">{c.phone}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowCustomerModal(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#211b16] px-4 py-3 text-sm font-black text-white">
                    <UserPlus size={16} /> Yeni
                  </button>
                </div>
                {selectedCustomer && (
                  <div className="mt-3 flex items-center justify-between rounded-full bg-[#b69463]/10 px-4 py-3">
                    <div>
                      <div className="text-sm font-black text-[#211b16]">{selectedCustomer.full_name}</div>
                      <div className="text-xs text-[#9d8b74]">{selectedCustomer.phone}</div>
                    </div>
                    <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }}
                      className="rounded-xl bg-white/70 p-1.5 text-[#9d8b74]"><X size={14} /></button>
                  </div>
                )}
              </div>

              {/* Ürün arama */}
              <div className="premium-card p-5">
                <Label>Ürün Ekle</Label>
                <input className={inputCls + " mb-3"} placeholder="Barkod, model adı, renk..."
                  value={productSearch} onChange={e => setProductSearch(e.target.value)} />

                {/* Kategori sekmeleri */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                        activeCategory === cat
                          ? "bg-[#b69463] text-white shadow-sm"
                          : "bg-[#f7f0e7] text-[#7d6c58]"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Ürün listesi */}
                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {filteredProducts.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[#9d8b74]">Ürün bulunamadı</p>
                  ) : filteredProducts.map(p => {
                    const inBasket = basket.some(b => b.product.id === p.id);
                    return (
                      <button key={p.id} onClick={() => addToBasket(p)} disabled={inBasket}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          inBasket
                            ? "border-[#b69463]/30 bg-[#b69463]/8 opacity-60"
                            : "border-[#eadfce] bg-white/70 hover:border-[#b69463] hover:bg-[#b69463]/5"
                        }`}>
                        {p.image_url
                          ? <img src={p.image_url} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                          : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]"><Package size={18} /></div>
                        }
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-black text-[#211b16]">{p.name}</div>
                          <div className="text-xs text-[#9d8b74]">{[p.category, p.color, p.size].filter(Boolean).join(" · ")}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-black text-[#b69463]">{p.rental_price?.toLocaleString("tr-TR")} ₺</div>
                          {inBasket && <div className="text-[10px] text-[#b69463]">Sepette</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sağ: Sepet */}
            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <Label>Sepet</Label>
                <span className="rounded-full bg-[#b69463]/10 px-3 py-1 text-xs font-black text-[#b69463]">
                  {basket.length} ürün
                </span>
              </div>

              {basket.length === 0 ? (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#d9c9b5] py-12 text-center">
                  <ShoppingBag size={32} className="text-[#d9c9b5]" />
                  <p className="text-sm text-[#9d8b74]">Soldaki listeden ürün ekleyin</p>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {basket.map(({ product: p, price }) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/80 p-3">
                      {p.image_url
                        ? <img src={p.image_url} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                        : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]"><Package size={20} /></div>
                      }
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-[#211b16]">{p.name}</div>
                        <div className="text-xs text-[#9d8b74]">{[p.category, p.color, p.size].filter(Boolean).join(" · ")}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <input
                            type="number"
                            className="w-28 rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-sm font-black text-[#211b16] outline-none focus:border-[#b69463]"
                            value={price}
                            onChange={e => updatePrice(p.id, Number(e.target.value))}
                          />
                          <span className="text-xs text-[#9d8b74]">₺</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromBasket(p.id)}
                        className="shrink-0 rounded-xl bg-red-50 p-2 text-red-400 hover:bg-red-100">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {basket.length > 0 && (
                <div className="mt-4 space-y-2 rounded-2xl bg-[#f7f0e7] p-4">
                  {basket.map(({ product: p, price }) => (
                    <div key={p.id} className="flex justify-between text-sm">
                      <span className="text-[#6d6256]">{p.category} — {p.name}</span>
                      <span className="font-black text-[#211b16]">{price.toLocaleString("tr-TR")} ₺</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-[#eadfce] pt-2 text-base font-black">
                    <span className="text-[#211b16]">Toplam</span>
                    <span className="text-[#b69463]">{total.toLocaleString("tr-TR")} ₺</span>
                  </div>
                </div>
              )}

              {basket.length > 0 && selectedCustomer && (
                <button onClick={() => setStep(2)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 font-black text-white shadow-[0_18px_42px_rgba(182,148,99,.24)]">
                  Tarih & Ödeme <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ADIM 2: Tarih + Ödeme */}
        {step === 2 && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            <div className="premium-card p-5 lg:p-7">
              <Label>Teslim</Label>
              <div className="mb-5">
                <DateTimeRow dateKey="deliveryDate" timeKey="deliveryTime" form={form} set={set} />
              </div>

              <Label>Etkinlik</Label>
              <div className="mb-3">
                <DateTimeRow dateKey="eventDate" timeKey="eventTime" form={form} set={set} />
              </div>
              <select className={inputCls + " mb-5"} value={form.eventType} onChange={e => set("eventType", e.target.value)}>
                <option>Düğün</option><option>Kına</option><option>Nişan</option>
                <option>After Party</option><option>Çekim</option>
              </select>

              <Label>İade</Label>
              <div className="mb-5">
                <DateTimeRow dateKey="returnDate" timeKey="returnTime" form={form} set={set} />
              </div>

              <Label>Notlar</Label>
              <textarea className={inputCls + " min-h-[80px] resize-none"} placeholder="Kiralama notu..."
                value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>

            <div className="premium-card p-5 lg:p-7">
              <Label>Özet & Ödeme</Label>

              {/* Müşteri */}
              <div className="mb-4 rounded-2xl bg-[#f7f0e7] p-4">
                <p className="text-xs font-black text-[#9d8b74]">Müşteri</p>
                <p className="mt-1 font-black text-[#211b16]">{selectedCustomer?.full_name}</p>
                <p className="text-sm text-[#9d8b74]">{selectedCustomer?.phone}</p>
              </div>

              {/* Ürünler */}
              <div className="mb-4 space-y-2 rounded-2xl bg-[#f7f0e7] p-4">
                <p className="text-xs font-black text-[#9d8b74]">Ürünler ({basket.length})</p>
                {basket.map(({ product: p, price }) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-[#6d6256]">{p.category} — {p.name}</span>
                    <span className="font-black">{price.toLocaleString("tr-TR")} ₺</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-[#e4d9c9] pt-2 font-black">
                  <span>Toplam</span>
                  <span className="text-[#b69463]">{total.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>

              {/* Ödeme */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-[#9d8b74]">Kapora ₺</label>
                  <input className={inputCls + " mt-1"} type="number" min="0" placeholder="0"
                    value={form.depositAmount} onChange={e => set("depositAmount", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#9d8b74]">Kalan ₺</label>
                  <div className={inputCls + " mt-1 bg-[#f7f0e7] font-black text-[#b69463]"}>
                    {remaining.toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>

              {message && (
                <div className={`mb-4 rounded-2xl border p-4 text-sm font-bold ${
                  message.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"
                }`}>{message.text}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 rounded-full border border-[#eadfce] py-4 text-sm font-black text-[#6d6256]">
                  ← Geri
                </button>
                <button onClick={saveRental}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(182,148,99,.24)]">
                  <CalendarDays size={18} /> Kiralama Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hızlı müşteri modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
            <h2 className="text-2xl font-black text-[#211b16]">Hızlı Müşteri Ekle</h2>
            <div className="mt-5 space-y-3">
              <input className={inputCls} placeholder="Ad Soyad *"
                value={quickCustomer.fullName} onChange={e => setQuickCustomer(p => ({ ...p, fullName: e.target.value }))} />
              <input className={inputCls} placeholder="Telefon *"
                value={quickCustomer.phone} onChange={e => setQuickCustomer(p => ({ ...p, phone: e.target.value }))} />
              <button onClick={createQuickCustomer}
                className="w-full rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 font-black text-white">
                Ekle ve Seç
              </button>
              <button onClick={() => setShowCustomerModal(false)}
                className="w-full rounded-2xl border border-[#eadfce] py-3 text-sm font-black text-[#6d6256]">
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
