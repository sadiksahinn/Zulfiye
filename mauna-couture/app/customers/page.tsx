"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { Search, UserRound } from "lucide-react";

type Customer = {
  id: string;
  full_name: string;
  phone: string;
  instagram: string | null;
  wedding_date: string | null;
  notes: string | null;
  created_at: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ fullName: "", phone: "", instagram: "", weddingDate: "", address: "", measurements: "", notes: "" });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.full_name, c.phone, c.instagram, c.wedding_date, c.notes].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [customers, search]);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function loadCustomers() {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers((data || []) as Customer[]);
  }

  async function createCustomer() {
    setMessage("");
    if (!form.fullName || !form.phone) { setMessage("Ad soyad ve telefon zorunludur."); return; }
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("customers").insert({
      full_name: form.fullName, phone: form.phone, instagram: form.instagram,
      wedding_date: form.weddingDate || null, address: form.address,
      measurements: form.measurements, notes: form.notes, created_by: userData.user?.id,
    });
    if (error) { setMessage("Müşteri kaydedilemedi."); return; }
    setMessage("Müşteri başarıyla eklendi.");
    setForm({ fullName: "", phone: "", instagram: "", weddingDate: "", address: "", measurements: "", notes: "" });
    loadCustomers();
  }

  useEffect(() => { loadCustomers(); }, []);

  return (
    <AppShell title="Müşteriler">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="premium-card p-5 lg:p-8">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Yeni Müşteri Ekle</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <input className="input" placeholder="Ad soyad *" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
            <input className="input" placeholder="Telefon *" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <input className="input" placeholder="Instagram" value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} />
            <input className="input" type="date" value={form.weddingDate} onChange={(e) => updateField("weddingDate", e.target.value)} />
            <input className="input md:col-span-2" placeholder="Adres" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            <textarea className="input md:col-span-2 min-h-28" placeholder="Ölçü bilgileri" value={form.measurements} onChange={(e) => updateField("measurements", e.target.value)} />
            <textarea className="input md:col-span-2 min-h-28" placeholder="Notlar" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
          </div>
          {message && <div className="mt-6 rounded-2xl bg-[#fbf7f1] border border-[#eadfce] p-4 text-[#6d6256]">{message}</div>}
          <button onClick={createCustomer} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 text-white font-black shadow-[0_18px_42px_rgba(182,148,99,.24)]">
            Müşteri Ekle
          </button>
        </div>

        <div className="premium-card p-5 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#1f1b16]">Müşteri Listesi</h2>
              <p className="premium-muted mt-2 text-sm">{customers.length} kayıtlı müşteri</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-3 lg:min-w-[300px]">
              <Search size={18} className="text-[#b69463]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Müşteri ara..." className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-[#8b8177]">Henüz müşteri bulunmuyor.</div>
            ) : (
              filteredCustomers.map((customer) => (
                <div key={customer.id} className="rounded-2xl border border-[#eadfce] bg-white/70 p-4 transition hover:bg-white/90">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                        <UserRound size={19} />
                      </div>
                      <div>
                        <h3 className="font-black text-[#1f1b16]">{customer.full_name}</h3>
                        <p className="text-sm text-[#8b8177] mt-0.5">
                          {[customer.phone, customer.instagram].filter(Boolean).join(" • ")}
                        </p>
                        {customer.wedding_date && (
                          <p className="mt-1 text-xs font-bold text-[#b69463]">Düğün: {customer.wedding_date}</p>
                        )}
                      </div>
                    </div>
                    <Link href={`/customers/${customer.id}`} className="shrink-0 rounded-2xl bg-[#211b16] px-4 py-2 text-xs font-black text-white">
                      Karta Git
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
