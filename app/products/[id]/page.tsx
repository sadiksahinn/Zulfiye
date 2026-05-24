"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { Package, Search, ShoppingBag, UserRound, Wallet } from "lucide-react";

type Product = {
  id: string;
  name?: string | null;
  barcode?: string | null;
  product_code?: string | null;
  model_name?: string | null;
  size?: string | null;
  color?: string | null;
  status?: string | null;
  sale_price?: number | null;
  image_url?: string | null;
};

type Customer = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
};

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ saleDate: new Date().toISOString().slice(0, 10), totalAmount: "", paidAmount: "", notes: "" });

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
    const q = productSearch.trim().toLowerCase();
    if (!q) return [];

    return products.filter((product) =>
      [product.name, product.barcode, product.product_code, product.model_name, product.size, product.color]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, productSearch]);

  const customerResults = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return [];

    return customers.filter((customer) =>
      [customer.full_name, customer.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [customers, customerSearch]);

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function createSale() {
    setMessage("");

    if (!selectedProduct || !selectedCustomer) {
      setMessage("Satış için ürün ve müşteri seçimi zorunludur.");
      return;
    }

    const total = Number(form.totalAmount || selectedProduct.sale_price || 0);
    const paid = Number(form.paidAmount || 0);
    const remaining = Math.max(total - paid, 0);
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("sales").insert({
      product_id: selectedProduct.id,
      customer_id: selectedCustomer.id,
      sale_date: form.saleDate,
      total_amount: total,
      paid_amount: paid,
      remaining_amount: remaining,
      status: remaining > 0 ? "kismi_odendi" : "odendi",
      notes: form.notes,
      created_by: userData.user?.id,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    await supabase.from("products").update({ status: "satildi" }).eq("id", selectedProduct.id);
    setMessage("Satış oluşturuldu ve ürün satıldı olarak işaretlendi.");
    setSelectedProduct(null);
    setSelectedCustomer(null);
    setProductSearch("");
    setCustomerSearch("");
    setForm({ saleDate: new Date().toISOString().slice(0, 10), totalAmount: "", paidAmount: "", notes: "" });
    await loadData();
  }

  const total = Number(form.totalAmount || selectedProduct?.sale_price || 0);
  const paid = Number(form.paidAmount || 0);
  const remaining = Math.max(total - paid, 0);

  return (
    <AppShell title="Satış">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">
        <div className="relative overflow-hidden rounded-[1.7rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-5 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)] lg:rounded-[2rem] lg:p-7">
          <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Satış Operasyonu</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] lg:text-5xl">Satış merkezi</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Ürün satışı oluşturun, müşteri kaydıyla eşleştirin ve ödemeyi takip edin.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:min-w-[330px]">
              <HeaderPill label="Toplam" value={formatMoney(total)} />
              <HeaderPill label="Kalan" value={formatMoney(remaining)} />
            </div>
          </div>
        </div>

        {message ? <div className="premium-card p-4 text-sm font-black text-[#6d6256]">{message}</div> : null}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_.75fr]">
          <section className="premium-card p-5 lg:p-7">
            <SectionTitle icon={<ShoppingBag size={21} />} title="Satış Oluştur" sub="Ürün, müşteri ve ödeme bilgileri" />

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SearchBox
                label="Ürün Ara"
                icon={<Package size={18} />}
                value={productSearch}
                onChange={(value) => {
                  setProductSearch(value);
                  setSelectedProduct(null);
                }}
                placeholder="Barkod / ürün adı / model"
              />

              <SearchBox
                label="Müşteri Ara"
                icon={<UserRound size={18} />}
                value={customerSearch}
                onChange={(value) => {
                  setCustomerSearch(value);
                  setSelectedCustomer(null);
                }}
                placeholder="Müşteri adı veya telefon"
              />
            </div>

            {productResults.length > 0 && !selectedProduct ? (
              <ResultList>
                {productResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductSearch(`${product.name || "Ürün"} ${product.color || ""} ${product.size || ""}`);
                      updateForm("totalAmount", String(product.sale_price || ""));
                    }}
                    className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition hover:bg-[#f7f0e7]"
                  >
                    {product.image_url ? <img src={product.image_url} className="h-16 w-16 rounded-xl object-cover" alt="" /> : <div className="h-16 w-16 rounded-xl bg-[#f7f0e7]" />}
                    <div>
                      <div className="font-black text-[#211b16]">{product.name || "Ürün"}</div>
                      <div className="text-xs font-bold text-[#8a7f72]">{product.barcode || product.product_code || product.id}</div>
                    </div>
                  </button>
                ))}
              </ResultList>
            ) : null}

            {customerResults.length > 0 && !selectedCustomer ? (
              <ResultList>
                {customerResults.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setCustomerSearch(customer.full_name || "Müşteri");
                    }}
                    className="w-full rounded-2xl p-4 text-left transition hover:bg-[#f7f0e7]"
                  >
                    <div className="font-black text-[#211b16]">{customer.full_name || "Müşteri"}</div>
                    <div className="text-xs font-bold text-[#8a7f72]">{customer.phone || "Telefon yok"}</div>
                  </button>
                ))}
              </ResultList>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <input className="input" type="date" value={form.saleDate} onChange={(event) => updateForm("saleDate", event.target.value)} />
              <input className="input" type="number" inputMode="decimal" min="0" placeholder="Toplam tutar ₺" value={form.totalAmount} onChange={(event) => updateForm("totalAmount", event.target.value)} />
              <input className="input" type="number" inputMode="decimal" min="0" placeholder="Alınan ödeme ₺" value={form.paidAmount} onChange={(event) => updateForm("paidAmount", event.target.value)} />
              <div className="rounded-2xl border border-[#eadfce] bg-[#f7f0e7]/70 px-4 py-4 text-sm font-black text-[#211b16]">Kalan: {formatMoney(remaining)}</div>
              <textarea className="input min-h-28 lg:col-span-2" placeholder="Satış notu" value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} />
            </div>

            <button onClick={createSale} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#211b16] px-5 py-4 text-sm font-black text-white transition active:scale-[0.98]">
              <ShoppingBag size={18} /> Satışı Kaydet
            </button>
          </section>

          <aside className="space-y-5">
            <div className="premium-card p-5 lg:p-6">
              <SectionTitle icon={<Package size={21} />} title="Ürün Teyidi" sub="Seçilen ürün bilgisi" />
              {selectedProduct ? (
                <div className="mt-5">
                  {selectedProduct.image_url ? <img src={selectedProduct.image_url} className="h-72 w-full rounded-3xl object-cover" alt="" /> : null}
                  <h3 className="mt-5 text-2xl font-black text-[#211b16]">{selectedProduct.name || "Ürün"}</h3>
                  <p className="premium-muted mt-2 text-sm">{selectedProduct.barcode || selectedProduct.product_code || selectedProduct.id}</p>
                </div>
              ) : (
                <Empty text="Ürün seçilince burada görünecek." />
              )}
            </div>

            <div className="premium-card p-5 lg:p-6">
              <SectionTitle icon={<Wallet size={21} />} title="Ödeme Özeti" sub="Satış tahsilat durumu" />
              <div className="mt-5 grid gap-3">
                <MoneyRow label="Toplam" value={formatMoney(total)} />
                <MoneyRow label="Alınan" value={formatMoney(paid)} />
                <MoneyRow label="Kalan" value={formatMoney(remaining)} dark />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function formatMoney(value?: number | null) {
  return `${Number(value || 0).toLocaleString("tr-TR")} TL`;
}

function HeaderPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xl">
      <div className="text-xs font-black uppercase tracking-[0.22em] text-white/50">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
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

function SearchBox({ label, icon, value, onChange, placeholder }: { label: string; icon: React.ReactNode; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#8a7f72]">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-3">
        <span className="text-[#b69463]">{icon}</span>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]" />
      </div>
    </label>
  );
}

function ResultList({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 rounded-3xl border border-[#eadfce] bg-white/80 p-3 shadow-sm">{children}</div>;
}

function MoneyRow({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${dark ? "bg-[#211b16] text-white" : "bg-[#f7f0e7] text-[#211b16]"}`}>
      <span className={`text-sm font-bold ${dark ? "text-white/60" : "text-[#6d6256]"}`}>{label}</span>
      <span className="text-sm font-black">{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="mt-5 rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-sm font-bold text-[#8a7f72]">{text}</div>;
}