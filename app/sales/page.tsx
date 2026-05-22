"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  barcode: string;
  name: string;
  product_code: string | null;
  model_name: string | null;
  size: string | null;
  color: string | null;
  status: string;
  sale_price: number | null;
  image_url: string | null;
};

type Customer = {
  id: string;
  full_name: string;
  phone: string;
};

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [message, setMessage] = useState("");

  const [quickCustomer, setQuickCustomer] = useState({
    fullName: "",
    phone: "",
  });

  const [form, setForm] = useState({
    totalAmount: "",
    paidAmount: "",
    paymentType: "Nakit",
    notes: "",
  });

  function updateForm(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function loadData() {
    const [productsRes, customersRes] = await Promise.all([
      supabase.from("products").select("*").neq("status", "satildi").order("created_at", { ascending: false }),
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
    ]);

    setProducts((productsRes.data || []) as Product[]);
    setCustomers((customersRes.data || []) as Customer[]);
  }

  useEffect(() => {
    loadData();
  }, []);

  const productResults = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return [];

    return products.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.product_code?.toLowerCase().includes(q) ||
        p.model_name?.toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  const customerResults = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return [];

    return customers.filter((c) => {
      return c.full_name?.toLowerCase().includes(q) || c.phone?.includes(q);
    });
  }, [customers, customerSearch]);

  async function createQuickCustomer() {
    if (!quickCustomer.fullName || !quickCustomer.phone) {
      setMessage("Müşteri adı ve telefon zorunludur.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("customers")
      .insert({
        full_name: quickCustomer.fullName,
        phone: quickCustomer.phone,
        created_by: userData.user?.id,
      })
      .select()
      .single();

    if (error) {
      setMessage("Müşteri eklenemedi.");
      return;
    }

    setSelectedCustomer(data as Customer);
    setCustomerSearch(data.full_name);
    setShowCustomerModal(false);
    setQuickCustomer({ fullName: "", phone: "" });
    loadData();
  }

  async function createSale() {
    setMessage("");

    if (!selectedProduct || !selectedCustomer) {
      setMessage("Ürün ve müşteri seçimi zorunludur.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const total = Number(form.totalAmount || selectedProduct.sale_price || 0);
    const paid = Number(form.paidAmount || 0);
    const remaining = total - paid;

    const { data: sale, error } = await supabase
      .from("sales")
      .insert({
        product_id: selectedProduct.id,
        customer_id: selectedCustomer.id,
        sale_date: new Date().toISOString().slice(0, 10),
        total_amount: total,
        paid_amount: paid,
        remaining_amount: remaining,
        payment_type: form.paymentType,
        status: "tamamlandi",
        notes: form.notes,
        created_by: userData.user?.id,
      })
      .select()
      .single();

    if (error) {
      setMessage("Satış kaydedilemedi.");
      return;
    }

    await supabase.from("products").update({ status: "satildi" }).eq("id", selectedProduct.id);

    const baseTitle = `${selectedProduct.name} ${selectedProduct.color || ""} ${selectedProduct.size || ""} - ${selectedCustomer.full_name}`;

    await supabase.from("calendar_events").insert({
      product_id: selectedProduct.id,
      customer_id: selectedCustomer.id,
      sale_id: sale.id,
      title: `Satış: ${baseTitle}`,
      event_type: "sale",
      event_date: new Date().toISOString().slice(0, 10),
      event_time: new Date().toTimeString().slice(0, 5),
      description: `Ürün satıldı. Barkod: ${selectedProduct.barcode}. Satış sonrası kiralama takvimi kapanır.`,
      created_by: userData.user?.id,
    });

    setMessage("Satış tamamlandı. Ürün satıldı durumuna alındı.");
    loadData();
  }

  return (
    <AppShell title="Hızlı Satış">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 premium-card p-8">
          <h2 className="premium-title text-2xl">Satış Oluştur</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-sm premium-muted">Ürün Ara</label>
              <input
                className="input mt-2"
                placeholder="Barkod / QR / ürün adı / model adı"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setSelectedProduct(null);
                }}
              />

              {productResults.length > 0 && !selectedProduct && (
                <div className="mt-3 rounded-3xl border border-[#eadfce] bg-white/80 p-3 space-y-2">
                  {productResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setProductSearch(`${p.name} ${p.color || ""} ${p.size || ""}`);
                        updateForm("totalAmount", String(p.sale_price || ""));
                      }}
                      className="w-full flex items-center gap-4 rounded-2xl p-3 hover:bg-[#f7f0e7] text-left"
                    >
                      {p.image_url && <img src={p.image_url} className="h-16 w-16 rounded-xl object-cover" />}
                      <div>
                        <div className="font-semibold text-[#211b16]">
                          {p.name} {p.color || ""} {p.size || ""}
                        </div>
                        <div className="text-sm premium-muted">{p.barcode}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm premium-muted">Müşteri Ara</label>
                  <input
                    className="input mt-2"
                    placeholder="Müşteri adı veya telefon"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomer(null);
                    }}
                  />
                </div>

                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="premium-button px-5 py-4"
                >
                  + Yeni Müşteri
                </button>
              </div>

              {customerResults.length > 0 && !selectedCustomer && (
                <div className="mt-3 rounded-3xl border border-[#eadfce] bg-white/80 p-3 space-y-2">
                  {customerResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch(c.full_name);
                      }}
                      className="w-full rounded-2xl p-4 hover:bg-[#f7f0e7] text-left"
                    >
                      <div className="font-semibold text-[#211b16]">{c.full_name}</div>
                      <div className="text-sm premium-muted">{c.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input className="input" type="number" inputMode="decimal" min="0" placeholder="Satış tutarı ₺" value={form.totalAmount} onChange={(e) => updateForm("totalAmount", e.target.value)} />
            <input className="input" type="number" inputMode="decimal" min="0" placeholder="Ödenen tutar ₺" value={form.paidAmount} onChange={(e) => updateForm("paidAmount", e.target.value)} />

            <select className="input" value={form.paymentType} onChange={(e) => updateForm("paymentType", e.target.value)}>
              <option>Nakit</option>
              <option>Kredi Kartı</option>
              <option>Havale</option>
              <option>Kapora</option>
            </select>

            <textarea className="input md:col-span-2 min-h-28" placeholder="Not" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
          </div>

          {message && <div className="mt-6 rounded-2xl bg-white/70 border border-[#eadfce] p-4 text-[#6d6256]">{message}</div>}

          <button onClick={createSale} className="premium-button mt-6 w-full py-4">
            Satışı Tamamla ve Ürünü Satıldı Yap
          </button>
        </div>

        <div className="premium-card p-8">
          <h2 className="premium-title text-2xl">Ürün Teyidi</h2>

          {selectedProduct ? (
            <div className="mt-6">
              {selectedProduct.image_url && <img src={selectedProduct.image_url} className="h-80 w-full rounded-3xl object-cover" />}
              <h3 className="mt-5 text-2xl font-semibold text-[#211b16]">
                {selectedProduct.name} {selectedProduct.color || ""} {selectedProduct.size || ""}
              </h3>
              <p className="mt-2 premium-muted">{selectedProduct.barcode}</p>
              <p className="mt-4 rounded-2xl bg-white/70 p-4 text-[#6d6256]">
                Durum: {selectedProduct.status}
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center premium-muted">
              Ürün seçilince fotoğraf ve detaylar burada görünecek.
            </div>
          )}
        </div>
      </div>

      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
            <h2 className="text-3xl font-semibold text-[#211b16]">Hızlı Müşteri Ekle</h2>
            <div className="mt-6 grid gap-4">
              <input className="input" placeholder="Ad Soyad" value={quickCustomer.fullName} onChange={(e) => setQuickCustomer((p) => ({ ...p, fullName: e.target.value }))} />
              <input className="input" placeholder="Telefon" value={quickCustomer.phone} onChange={(e) => setQuickCustomer((p) => ({ ...p, phone: e.target.value }))} />
              <button onClick={createQuickCustomer} className="premium-button py-4">Ekle ve Seç</button>
              <button onClick={() => setShowCustomerModal(false)} className="rounded-2xl border border-[#eadfce] py-4">Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
