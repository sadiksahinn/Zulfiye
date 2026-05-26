"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Clock, Search, UserRound } from "lucide-react";

export default function FittingsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [fittings, setFittings] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    fittingDate: new Date().toISOString().slice(0, 10),
    fittingTime: "",
    fittingNote: "",
    tailorNote: "",
  });

  async function load() {
    const [c, p, f] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("fittings").select("*").order("fitting_date", { ascending: true }),
    ]);

    setCustomers(c.data || []);
    setProducts(p.data || []);
    setFittings(f.data || []);
  }

  useEffect(() => { load(); }, []);

  const customerResults = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return [];
    return customers.filter((c) => [c.full_name, c.phone].filter(Boolean).join(" ").toLowerCase().includes(q)).slice(0, 5);
  }, [customers, customerSearch]);

  const productResults = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return [];
    return products.filter((p) => [p.name, p.barcode, p.model_name, p.color, p.size].filter(Boolean).join(" ").toLowerCase().includes(q)).slice(0, 5);
  }, [products, productSearch]);

  async function createFitting() {
    setMessage("");

    if (!selectedCustomer || !form.fittingDate) {
      setMessage("Müşteri ve prova tarihi zorunludur.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("fittings").insert({
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.full_name,
      product_id: selectedProduct?.id || null,
      product_name: selectedProduct?.name || productSearch || null,
      fitting_date: form.fittingDate,
      fitting_time: form.fittingTime || null,
      status: "bekliyor",
      fitting_note: form.fittingNote,
      tailor_note: form.tailorNote,
      created_by: userData.user?.id,
    });

    if (error) {
      setMessage(error.message || "Prova kaydedilemedi.");
      return;
    }

    await supabase.from("calendar_events").insert({
      customer_id: selectedCustomer.id,
      product_id: selectedProduct?.id || null,
      title: `Prova: ${selectedCustomer.full_name}`,
      event_type: "fitting",
      event_date: form.fittingDate,
      event_time: form.fittingTime || null,
      description: `${selectedProduct?.name || productSearch || "Ürün belirtilmedi"} için prova.`,
      created_by: userData.user?.id,
    });

    setMessage("Prova kaydedildi ve takvime işlendi.");
    setCustomerSearch("");
    setProductSearch("");
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setForm({ fittingDate: new Date().toISOString().slice(0, 10), fittingTime: "", fittingNote: "", tailorNote: "" });
    load();
  }

  async function updateFittingStatus(id: string, status: string) {
    setMessage("");

    const { error } = await supabase
      .from("fittings")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(error.message || "Prova durumu güncellenemedi.");
      return;
    }

    setMessage("Prova durumu güncellendi.");
    load();
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayFittings = fittings.filter((x) => x.fitting_date === today);

  return (
    <AppShell title="Provalar">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">
        <section className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">MAUNA Prova Takibi</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Prova Merkezi</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">Prova randevularını oluşturun, takvime işleyin ve günlük akışta takip edin.</p>
        </section>

        {message ? <div className="premium-card p-4 text-sm font-black text-[#6d6256]">{message}</div> : null}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_.85fr]">
          <section className="premium-card p-5 lg:p-7">
            <h2 className="premium-title text-2xl">Prova Oluştur</h2>

            <div className="mt-6 grid gap-4">
              <SearchField label="Müşteri Ara" value={customerSearch} onChange={(value: string) => { setCustomerSearch(value); setSelectedCustomer(null); }} placeholder="Ad soyad veya telefon" />

              {customerResults.length > 0 && !selectedCustomer && (
                <ResultList>
                  {customerResults.map((c) => (
                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.full_name); }} className="w-full rounded-2xl p-4 text-left hover:bg-[#f7f0e7]">
                      <div className="font-black text-[#211b16]">{c.full_name}</div>
                      <div className="text-xs font-bold text-[#8a7f72]">{c.phone || "Telefon yok"}</div>
                    </button>
                  ))}
                </ResultList>
              )}

              <SearchField label="Ürün / Barkod Ara" value={productSearch} onChange={(value: string) => { setProductSearch(value); setSelectedProduct(null); }} placeholder="Ürün adı, barkod, model" />

              {productResults.length > 0 && !selectedProduct && (
                <ResultList>
                  {productResults.map((p) => (
                    <button key={p.id} onClick={() => { setSelectedProduct(p); setProductSearch(`${p.name} ${p.color || ""} ${p.size || ""}`); }} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-[#f7f0e7]">
                      {p.image_url ? <img src={p.image_url} className="h-14 w-14 rounded-xl object-cover" alt="" /> : <div className="h-14 w-14 rounded-xl bg-[#f7f0e7]" />}
                      <div>
                        <div className="font-black text-[#211b16]">{p.name}</div>
                        <div className="text-xs font-bold text-[#8a7f72]">{p.barcode || p.model_name || "-"}</div>
                      </div>
                    </button>
                  ))}
                </ResultList>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input className="input" type="date" value={form.fittingDate} onChange={(e) => setForm((p) => ({ ...p, fittingDate: e.target.value }))} />
                <input className="input" type="time" value={form.fittingTime} onChange={(e) => setForm((p) => ({ ...p, fittingTime: e.target.value }))} />
              </div>

              <textarea className="input min-h-24" placeholder="Ölçü / prova notu" value={form.fittingNote} onChange={(e) => setForm((p) => ({ ...p, fittingNote: e.target.value }))} />
              <textarea className="input min-h-24" placeholder="Tadilat / terzi notu" value={form.tailorNote} onChange={(e) => setForm((p) => ({ ...p, tailorNote: e.target.value }))} />
            </div>

            <button onClick={createFitting} className="mt-6 w-full rounded-2xl bg-[#211b16] py-4 font-black text-white">
              Prova Kaydet ve Takvime İşle
            </button>
          </section>

          <section className="premium-card p-5 lg:p-7">
            <h2 className="premium-title text-2xl">Bugünkü Provalar</h2>

            <div className="mt-5 space-y-3">
              {todayFittings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-sm font-bold text-[#8a7f72]">Bugün prova görünmüyor.</div>
              ) : (
                todayFittings.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[#eadfce] bg-white/70 p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                          <UserRound size={19} />
                        </div>
                        <div>
                          <h3 className="font-black text-[#211b16]">{item.customer_name || "Müşteri"}</h3>
                          <p className="text-xs font-bold text-[#8a7f72]">{item.fitting_time || "Saat yok"} • {item.product_name || "Ürün belirtilmedi"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {["bekliyor", "geldi", "tamamlandi", "teslime_hazir"].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateFittingStatus(item.id, status)}
                            className={`rounded-2xl px-3 py-3 text-xs font-black ${
                              item.status === status
                                ? "bg-[#211b16] text-white"
                                : "border border-[#eadfce] bg-white text-[#6d6256]"
                            }`}
                          >
                            {statusText(status)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function SearchField({ label, value, onChange, placeholder }: any) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#8a7f72]">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-4 shadow-inner">
        <Search size={18} className="text-[#b69463]" />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]" />
      </div>
    </label>
  );
}

function ResultList({ children }: any) {
  return <div className="rounded-3xl border border-[#eadfce] bg-white/80 p-3 shadow-sm">{children}</div>;
}


function statusText(status: string) {
  if (status === "bekliyor") return "Bekliyor";
  if (status === "geldi") return "Geldi";
  if (status === "tamamlandi") return "Tamamlandı";
  if (status === "teslime_hazir") return "Teslime Hazır";
  return status;
}
