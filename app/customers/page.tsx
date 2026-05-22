"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  full_name: string;
  phone: string;
  instagram: string | null;
  wedding_date: string | null;
  notes: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    instagram: "",
    weddingDate: "",
    address: "",
    measurements: "",
    notes: "",
  });

  const [message, setMessage] = useState("");

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function loadCustomers() {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    setCustomers((data || []) as Customer[]);
  }

  async function createCustomer() {
    setMessage("");

    if (!form.fullName || !form.phone) {
      setMessage("Ad soyad ve telefon zorunludur.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("customers").insert({
      full_name: form.fullName,
      phone: form.phone,
      instagram: form.instagram,
      wedding_date: form.weddingDate || null,
      address: form.address,
      measurements: form.measurements,
      notes: form.notes,
      created_by: userData.user?.id,
    });

    if (error) {
      setMessage("Müşteri kaydedilemedi.");
      return;
    }

    setMessage("Müşteri başarıyla eklendi.");
    setForm({
      fullName: "",
      phone: "",
      instagram: "",
      weddingDate: "",
      address: "",
      measurements: "",
      notes: "",
    });

    loadCustomers();
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <AppShell title="Müşteri Yönetimi">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">
            Yeni Müşteri Ekle
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <input className="input" placeholder="Ad soyad *" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
            <input className="input" placeholder="Telefon *" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <input className="input" placeholder="Instagram" value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} />
            <input className="input" type="date" value={form.weddingDate} onChange={(e) => updateField("weddingDate", e.target.value)} />
            <input className="input md:col-span-2" placeholder="Adres" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            <textarea className="input md:col-span-2 min-h-28" placeholder="Ölçü bilgileri" value={form.measurements} onChange={(e) => updateField("measurements", e.target.value)} />
            <textarea className="input md:col-span-2 min-h-28" placeholder="Notlar" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
          </div>

          {message && (
            <div className="mt-6 rounded-2xl bg-[#fbf7f1] border border-[#eadfce] p-4 text-[#6d6256]">
              {message}
            </div>
          )}

          <button
            onClick={createCustomer}
            className="mt-6 w-full rounded-2xl bg-[#b69463] py-4 text-white font-semibold"
          >
            Müşteri Ekle
          </button>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">
            Müşteri Listesi
          </h2>

          <div className="mt-6 space-y-4">
            {customers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-[#8b8177]">
                Henüz müşteri bulunmuyor.
              </div>
            ) : (
              customers.map((customer) => (
                <div key={customer.id} className="rounded-2xl border border-[#eadfce] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#1f1b16]">
                        {customer.full_name}
                      </h3>
                      <p className="text-sm text-[#8b8177] mt-1">
                        {customer.phone}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#fbf7f1] px-4 py-2 text-sm text-[#b69463]">
                      Müşteri
                    </span>
                  </div>

                  {customer.wedding_date && (
                    <p className="mt-3 text-sm text-[#6d6256]">
                      Düğün/Kına tarihi: {customer.wedding_date}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      
    </AppShell>
  );
}
