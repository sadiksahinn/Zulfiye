"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { ChevronRight, Package, ShoppingBag, UserPlus, X } from "lucide-react";

type Product = {
  id: string; barcode: string; name: string; category: string;
  product_code: string | null; model_name: string | null;
  size: string | null; color: string | null; status: string;
  sale_price: number | null; image_url: string | null;
};
type Customer = { id: string; full_name: string; phone: string };
type BasketItem = { product: Product; price: number };

const CATEGORIES = ["Tümü", "Gelinlik", "Kınalık", "After Party", "Aksesuar", "Ayakkabı"];

const inputCls = "w-full rounded-full border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ paymentType: "Nakit", paidAmount: "", notes: "" });
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [quickCustomer, setQuickCustomer] = useState({ fullName: "", phone: "" });

  async function loadData() {
    const [pr, cr] = await Promise.all([
      supabase.from("products").select("*").neq("status", "satildi").order("category"),
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
      const searchOk = !q || [p.name, p.barcode, p.product_code, p.model_name, p.color].filter(Boolean).join(" ").toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [products, productSearch, activeCategory]);

  const customerResults = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q || selectedCustomer) return [];
    return customers.filter(c => c.full_name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 6);
  }, [customers, customerSearch, selectedCustomer]);

  function addToBasket(p: Product) {
    if (basket.find(b => b.product.id === p.id)) return;
    setBasket(prev => [...prev, { product: p, price: p.sale_price ?? 0 }]);
  }
  function removeFromBasket(id: string) { setBasket(prev => prev.filter(b => b.product.id !== id)); }
  function updatePrice(id: string, price: number) { setBasket(prev => prev.map(b => b.product.id === id ? { ...b, price } : b)); }

  const total = basket.reduce((s, b) => s + b.price, 0);
  const paid = Number(form.paidAmount || 0);
  const remaining = Math.max(total - paid, 0);

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

  async function createSale() {
    setMessage(null);
    if (!selectedCustomer) { setMessage({ text: "Müşteri seçimi zorunludur.", ok: false }); return; }
    if (basket.length === 0) { setMessage({ text: "En az bir ürün ekleyin.", ok: false }); return; }

    const { data: { user } } = await supabase.auth.getUser();

    const { data: sale, error } = await supabase.from("sales").insert({
      product_id:       basket[0].product.id,
      customer_id:      selectedCustomer.id,
      sale_date:        new Date().toISOString().slice(0, 10),
      total_amount:     total,
      paid_amount:      paid,
      remaining_amount: remaining,
      payment_type:     form.paymentType,
      status:           "tamamlandi",
      notes:            form.notes,
      created_by:       user?.id,
    }).select().single();

    if (error || !sale) { setMessage({ text: "Satış kaydedilemedi.", ok: false }); return; }

    // sale_items
    await supabase.from("sale_items").insert(
      basket.map(b => ({ sale_id: sale.id, product_id: b.product.id, price: b.price }))
    );

    // Tüm ürünleri satıldı yap
    await Promise.all(basket.map(b =>
      supabase.from("products").update({ status: "satildi" }).eq("id", b.product.id)
    ));

    // Takvim
    await supabase.from("calendar_events").insert({
      customer_id: selectedCustomer.id, sale_id: sale.id,
      title: `Satış: ${selectedCustomer.full_name} — ${basket.map(b => b.product.category).join(", ")}`,
      event_type: "sale",
      event_date: new Date().toISOString().slice(0, 10),
      created_by: user?.id,
    });

    setMessage({ text: `Satış tamamlandı! ${basket.length} ürün satıldı olarak işaretlendi.`, ok: true });
    setBasket([]); setSelectedCustomer(null); setCustomerSearch(""); setProductSearch("");
    setForm({ paymentType: "Nakit", paidAmount: "", notes: "" });
    setStep(1);
    loadData();
  }

  return (
    <AppShell title="Satış">
      <div className="space-y-5">
        <div className="rounded-[2rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-5 text-white lg:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">ZÜLFİYE CANBOLAT Satış</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Yeni Satış</h2>
          <p className="mt-1 text-sm text-white/60">Birden fazla ürünü tek siparişte sat</p>
        </div>

        {/* Adım göstergesi */}
        <div className="flex gap-3">
          {[{ n: 1, label: "Müşteri & Ürünler" }, { n: 2, label: "Ödeme & Tamamla" }].map(s => (
            <button key={s.n} onClick={() => setStep(s.n as 1 | 2)}
              className={`flex flex-1 items-center gap-2 rounded-full border px-4 py-3 text-sm font-black transition ${
                step === s.n ? "border-[#b69463] bg-[#b69463]/10 text-[#b69463]" : "border-[#eadfce] bg-white/60 text-[#9d8b74]"
              }`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                step === s.n ? "bg-[#b69463] text-white" : "bg-[#eadfce] text-[#9d8b74]"
              }`}>{s.n}</span>
              {s.label}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* Sol: Müşteri + Ürünler */}
            <div className="space-y-5">
              <div className="premium-card p-5">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Müşteri</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input className={inputCls} placeholder="İsim veya telefon ara..."
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomer(null); }} />
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

              <div className="premium-card p-5">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Ürün Ekle</p>
                <input className={inputCls + " mb-3"} placeholder="Barkod, model, renk..."
                  value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-black transition ${activeCategory === cat ? "bg-[#b69463] text-white" : "bg-[#f7f0e7] text-[#7d6c58]"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {filteredProducts.length === 0
                    ? <p className="py-8 text-center text-sm text-[#9d8b74]">Ürün bulunamadı</p>
                    : filteredProducts.map(p => {
                        const inBasket = basket.some(b => b.product.id === p.id);
                        return (
                          <button key={p.id} onClick={() => addToBasket(p)} disabled={inBasket}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${inBasket ? "border-[#b69463]/30 bg-[#b69463]/8 opacity-60" : "border-[#eadfce] bg-white/70 hover:border-[#b69463]"}`}>
                            {p.image_url
                              ? <img src={p.image_url} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                              : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]"><Package size={18} /></div>
                            }
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-black text-[#211b16]">{p.name}</div>
                              <div className="text-xs text-[#9d8b74]">{[p.category, p.color, p.size].filter(Boolean).join(" · ")}</div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-sm font-black text-[#b69463]">{p.sale_price?.toLocaleString("tr-TR")} ₺</div>
                              {inBasket && <div className="text-[10px] text-[#b69463]">Sepette</div>}
                            </div>
                          </button>
                        );
                      })
                  }
                </div>
              </div>
            </div>

            {/* Sağ: Sepet */}
            <div className="premium-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Sepet</p>
                <span className="rounded-full bg-[#b69463]/10 px-3 py-1 text-xs font-black text-[#b69463]">{basket.length} ürün</span>
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
                          <input type="number" className="w-28 rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-sm font-black outline-none focus:border-[#b69463]"
                            value={price} onChange={e => updatePrice(p.id, Number(e.target.value))} />
                          <span className="text-xs text-[#9d8b74]">₺</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromBasket(p.id)}
                        className="shrink-0 rounded-xl bg-red-50 p-2 text-red-400 hover:bg-red-100"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}

              {basket.length > 0 && (
                <div className="mt-4 space-y-1.5 rounded-2xl bg-[#f7f0e7] p-4">
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
              )}

              {basket.length > 0 && selectedCustomer && (
                <button onClick={() => setStep(2)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 font-black text-white shadow-[0_18px_42px_rgba(182,148,99,.24)]">
                  Ödeme <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="premium-card p-5 lg:p-7">
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Ödeme Bilgileri</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#9d8b74]">Ödeme Yöntemi</label>
                  <select className={inputCls + " mt-1"} value={form.paymentType} onChange={e => set("paymentType", e.target.value)}>
                    <option>Nakit</option><option>Kredi Kartı</option><option>Havale</option><option>Kapora</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#9d8b74]">Ödenen Tutar ₺</label>
                  <input className={inputCls + " mt-1"} type="number" min="0" placeholder="0"
                    value={form.paidAmount} onChange={e => set("paidAmount", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#9d8b74]">Notlar</label>
                  <textarea className={inputCls + " mt-1 min-h-[80px] resize-none"} placeholder="Satış notu..."
                    value={form.notes} onChange={e => set("notes", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="premium-card p-5 lg:p-7">
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">Özet</p>

              <div className="mb-4 rounded-2xl bg-[#f7f0e7] p-4">
                <p className="text-xs font-black text-[#9d8b74]">Müşteri</p>
                <p className="mt-1 font-black text-[#211b16]">{selectedCustomer?.full_name}</p>
                <p className="text-sm text-[#9d8b74]">{selectedCustomer?.phone}</p>
              </div>

              <div className="mb-4 space-y-1.5 rounded-2xl bg-[#f7f0e7] p-4">
                <p className="text-xs font-black text-[#9d8b74]">Ürünler ({basket.length})</p>
                {basket.map(({ product: p, price }) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-[#6d6256]">{p.category} — {p.name}</span>
                    <span className="font-black">{price.toLocaleString("tr-TR")} ₺</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-[#e4d9c9] pt-2 font-black">
                  <span>Toplam</span><span className="text-[#b69463]">{total.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6d6256]">Ödenen</span><span className="font-black text-green-600">{paid.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6d6256]">Kalan</span><span className="font-black text-red-500">{remaining.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>

              {message && (
                <div className={`mb-4 rounded-2xl border p-4 text-sm font-bold ${message.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"}`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 rounded-full border border-[#eadfce] py-4 text-sm font-black text-[#6d6256]">← Geri</button>
                <button onClick={createSale}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(182,148,99,.24)]">
                  <ShoppingBag size={18} /> Satışı Tamamla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
            <h2 className="text-2xl font-black text-[#211b16]">Hızlı Müşteri Ekle</h2>
            <div className="mt-5 space-y-3">
              <input className={inputCls} placeholder="Ad Soyad *" value={quickCustomer.fullName} onChange={e => setQuickCustomer(p => ({ ...p, fullName: e.target.value }))} />
              <input className={inputCls} placeholder="Telefon *" value={quickCustomer.phone} onChange={e => setQuickCustomer(p => ({ ...p, phone: e.target.value }))} />
              <button onClick={createQuickCustomer} className="w-full rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 font-black text-white">Ekle ve Seç</button>
              <button onClick={() => setShowCustomerModal(false)} className="w-full rounded-2xl border border-[#eadfce] py-3 text-sm font-black text-[#6d6256]">Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
