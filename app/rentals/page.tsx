"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Search, ShieldCheck, Sparkles, UserPlus } from "lucide-react";

type Product = {
  id: string;
  barcode: string;
  name: string;
  product_code: string | null;
  model_name: string | null;
  size: string | null;
  color: string | null;
  status: string;
  rental_price: number | null;
  image_url: string | null;
};

type Customer = {
  id: string;
  full_name: string;
  phone: string;
};

export default function RentalsPage() {
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
    deliveryDate: "",
    deliveryTime: "",
    eventDate: "",
    eventTime: "",
    eventType: "Düğün",
    returnDate: "",
    returnTime: "",
    totalAmount: "",
    depositAmount: "",
    notes: "",
  });

  function updateForm(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function loadData() {
    const [productsRes, customersRes] = await Promise.all([
      supabase.from("products").select("*").eq("status", "stokta").order("created_at", { ascending: false }),
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

  async function createRental() {
    setMessage("");

    if (!selectedProduct || !selectedCustomer) {
      setMessage("Ürün ve müşteri seçimi zorunludur.");
      return;
    }

    if (!form.deliveryDate || !form.returnDate) {
      setMessage("Teslim ve iade tarihi zorunludur.");
      return;
    }

    if (selectedProduct.status === "satildi") {
      setMessage("Bu ürün satılmıştır. Kiralama yapılamaz.");
      return;
    }

    const { data: conflicts } = await supabase
      .from("rentals")
      .select("*")
      .eq("product_id", selectedProduct.id)
      .in("status", ["aktif", "rezerve"])
      .lte("delivery_date", form.returnDate)
      .gte("return_date", form.deliveryDate);

    if (conflicts && conflicts.length > 0) {
      setMessage("Bu ürün seçilen tarih aralığında zaten kiralanmış veya rezerve edilmiş.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const total = Number(form.totalAmount || selectedProduct.rental_price || 0);
    const deposit = Number(form.depositAmount || 0);
    const remaining = total - deposit;

    const { data: rental, error } = await supabase
      .from("rentals")
      .insert({
        product_id: selectedProduct.id,
        customer_id: selectedCustomer.id,
        rental_date: new Date().toISOString().slice(0, 10),
        delivery_date: form.deliveryDate,
        delivery_time: form.deliveryTime || null,
        event_date: form.eventDate || null,
        event_time: form.eventTime || null,
        event_type: form.eventType,
        return_date: form.returnDate,
        return_time: form.returnTime || null,
        total_amount: total,
        deposit_amount: deposit,
        remaining_amount: remaining,
        status: "aktif",
        notes: form.notes,
        created_by: userData.user?.id,
      })
      .select()
      .single();

    if (error) {
      setMessage("Kiralama kaydedilemedi.");
      return;
    }

    await supabase.from("products").update({ status: "kirada" }).eq("id", selectedProduct.id);

    const baseTitle = `${selectedProduct.name} ${selectedProduct.color || ""} ${selectedProduct.size || ""} - ${selectedCustomer.full_name}`;

    await supabase.from("calendar_events").insert([
      {
        product_id: selectedProduct.id,
        customer_id: selectedCustomer.id,
        rental_id: rental.id,
        title: `Teslim: ${baseTitle}`,
        event_type: "delivery",
        event_date: form.deliveryDate,
        event_time: form.deliveryTime || null,
        description: `Ürün teslim edilecek. Barkod: ${selectedProduct.barcode}`,
        created_by: userData.user?.id,
      },
      form.eventDate
        ? {
            product_id: selectedProduct.id,
            customer_id: selectedCustomer.id,
            rental_id: rental.id,
            title: `${form.eventType}: ${baseTitle}`,
            event_type: "rental",
            event_date: form.eventDate,
            event_time: form.eventTime || null,
            description: `Etkinlik günü. Ürün müşteride olacak.`,
            created_by: userData.user?.id,
          }
        : null,
      {
        product_id: selectedProduct.id,
        customer_id: selectedCustomer.id,
        rental_id: rental.id,
        title: `İade: ${baseTitle}`,
        event_type: "return",
        event_date: form.returnDate,
        event_time: form.returnTime || null,
        description: `Ürün en geç bu tarihte iade alınacak.`,
        created_by: userData.user?.id,
      },
    ].filter((event): event is NonNullable<typeof event> => event !== null));

    setMessage("Kiralama oluşturuldu, ürün kirada durumuna alındı ve takvime işlendi.");
    setSelectedProduct(null);
    setSelectedCustomer(null);
    setProductSearch("");
    setCustomerSearch("");
    setForm({
      deliveryDate: "",
      deliveryTime: "",
      eventDate: "",
      eventTime: "",
      eventType: "Düğün",
      returnDate: "",
      returnTime: "",
      totalAmount: "",
      depositAmount: "",
      notes: "",
    });
    loadData();
  }

  return (
    <AppShell title="Kiralama">
      <div className="space-y-5 lg:space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-5 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)] lg:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Kiralama Yönetimi</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] lg:text-4xl">Kiralama operasyonları</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Ürün, müşteri, teslim, iade ve ödeme akışını tek ekrandan yönetin.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 premium-card p-5 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
              <Sparkles size={21} />
            </div>
            <div>
              <h2 className="premium-title text-2xl">Kiralama Oluştur</h2>
              <p className="premium-muted mt-1 text-sm">Ürün ve müşteri eşleştir, takvime otomatik işle.</p>
            </div>
          </div>

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
                        updateForm("totalAmount", String(p.rental_price || ""));
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
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#b69463] to-[#d8bd84] px-5 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(182,148,99,.20)] transition hover:scale-[1.01]"
                >
                  <UserPlus size={18} /> Yeni Müşteri
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

            <input className="input" type="date" value={form.deliveryDate} onChange={(e) => updateForm("deliveryDate", e.target.value)} />
            <input className="input" type="time" value={form.deliveryTime} onChange={(e) => updateForm("deliveryTime", e.target.value)} />
            <input className="input" type="date" value={form.eventDate} onChange={(e) => updateForm("eventDate", e.target.value)} />
            <input className="input" type="time" value={form.eventTime} onChange={(e) => updateForm("eventTime", e.target.value)} />

            <select className="input" value={form.eventType} onChange={(e) => updateForm("eventType", e.target.value)}>
              <option>Düğün</option>
              <option>Kına</option>
              <option>Nişan</option>
              <option>After Party</option>
              <option>Çekim</option>
            </select>

            <input className="input" type="number" inputMode="decimal" min="0" placeholder="Toplam tutar ₺" value={form.totalAmount} onChange={(e) => updateForm("totalAmount", e.target.value)} />
            <input className="input" type="number" inputMode="decimal" min="0" placeholder="Kapora ₺" value={form.depositAmount} onChange={(e) => updateForm("depositAmount", e.target.value)} />
            <input className="input" type="date" value={form.returnDate} onChange={(e) => updateForm("returnDate", e.target.value)} />
            <input className="input" type="time" value={form.returnTime} onChange={(e) => updateForm("returnTime", e.target.value)} />
            <textarea className="input md:col-span-2 min-h-28" placeholder="Not" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
          </div>

          {message && <div className="mt-6 rounded-2xl bg-white/70 border border-[#eadfce] p-4 text-[#6d6256]">{message}</div>}

          <button onClick={createRental} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(182,148,99,.24)] transition hover:scale-[1.01]">
            <CalendarDays size={18} />
            Kiralama Kaydet ve Takvime İşle
          </button>
        </div>

        <div className="premium-card p-5 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h2 className="premium-title text-2xl">Ürün Teyidi</h2>
              <p className="premium-muted mt-1 text-sm">Seçilen ürün bilgileri</p>
            </div>
          </div>

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
