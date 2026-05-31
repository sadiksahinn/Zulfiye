"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { Camera, CalendarDays, Search, UserRound } from "lucide-react";

type Customer = {
  id: string;
  full_name: string;
  phone: string;
  instagram: string | null;
  wedding_date: string | null;
  notes: string | null;
  created_at: string | null;
};

const EMPTY_FORM = {
  fullName: "", phone: "", instagram: "",
  photoVideo: "",
  birthDate: "",
  engagementDate: "", engagementTime: "",
  weddingDate: "",    weddingTime: "",
  waist: "", hip: "", bust: "",
  address: "", notes: "",
  fittingDate1: "", fittingTime1: "",
  fittingDate2: "", fittingTime2: "",
  fittingDate3: "", fittingTime3: "",
};

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

const WAIST_VALUES = range(55, 120);
const HIP_VALUES   = range(75, 145);
const BUST_VALUES  = range(70, 130);

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-full mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#b69463]">
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black text-[#6d6256]">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-full border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";
const selectCls = inputCls + " appearance-none";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.full_name, c.phone, c.instagram, c.wedding_date, c.notes]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [customers, search]);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function loadCustomers() {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers((data || []) as Customer[]);
  }

  async function createCustomer() {
    setMessage("");
    if (!form.fullName.trim() || !form.phone.trim()) {
      setMessage("Ad soyad ve telefon zorunludur.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("customers").insert({
      full_name:       form.fullName.trim(),
      phone:           form.phone.trim(),
      instagram:       form.instagram || null,
      photo_video:     form.photoVideo || null,
      birth_date:      form.birthDate || null,
      engagement_date: form.engagementDate || null,
      engagement_time: form.engagementTime || null,
      wedding_date:    form.weddingDate || null,
      wedding_time:    form.weddingTime || null,
      waist:           form.waist ? Number(form.waist) : null,
      hip:             form.hip   ? Number(form.hip)   : null,
      bust:            form.bust  ? Number(form.bust)  : null,
      address:         form.address || null,
      notes:           form.notes || null,
      fitting_date_1:  form.fittingDate1 || null,
      fitting_time_1:  form.fittingTime1 || null,
      fitting_date_2:  form.fittingDate2 || null,
      fitting_time_2:  form.fittingTime2 || null,
      fitting_date_3:  form.fittingDate3 || null,
      fitting_time_3:  form.fittingTime3 || null,
      created_by:      user?.id,
    });
    if (error) { setMessage("Müşteri kaydedilemedi."); return; }
    setMessage("Müşteri başarıyla eklendi.");
    setForm(EMPTY_FORM);
    loadCustomers();
  }

  useEffect(() => { loadCustomers(); }, []);

  return (
    <AppShell title="Müşteriler">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* FORM */}
        <div className="premium-card p-5 lg:p-8">
          <h2 className="text-2xl font-black text-[#1f1b16]">Yeni Müşteri Ekle</h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Temel bilgiler */}
            <SectionTitle>Temel Bilgiler</SectionTitle>

            <Field label="Ad Soyad *">
              <input className={inputCls} placeholder="Adı ve soyadı" value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)} />
            </Field>

            <Field label="Telefon *">
              <input className={inputCls} placeholder="05XX XXX XX XX" value={form.phone}
                onChange={(e) => set("phone", e.target.value)} />
            </Field>

            <Field label="Instagram">
              <input className={inputCls} placeholder="@kullanici" value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)} />
            </Field>

            <Field label="Fotoğraf & Video Çekimi">
              <select className={selectCls} value={form.photoVideo} onChange={(e) => set("photoVideo", e.target.value)}>
                <option value="">Seçilmedi</option>
                <option value="nar_film">Nar Film</option>
                <option value="diger">Diğer</option>
              </select>
            </Field>

            {/* Tarihler */}
            <SectionTitle>Tarihler</SectionTitle>

            <Field label="Doğum Tarihi">
              <input className={inputCls} type="date" value={form.birthDate}
                onChange={(e) => set("birthDate", e.target.value)} />
            </Field>

            <Field label="Nişan Tarihi & Saati">
              <div className="flex gap-2">
                <input className={inputCls} type="date" value={form.engagementDate}
                  onChange={(e) => set("engagementDate", e.target.value)} />
                <input className={inputCls + " w-32 shrink-0"} type="time" value={form.engagementTime}
                  onChange={(e) => set("engagementTime", e.target.value)} />
              </div>
            </Field>

            <Field label="Düğün Tarihi & Saati">
              <div className="flex gap-2">
                <input className={inputCls} type="date" value={form.weddingDate}
                  onChange={(e) => set("weddingDate", e.target.value)} />
                <input className={inputCls + " w-32 shrink-0"} type="time" value={form.weddingTime}
                  onChange={(e) => set("weddingTime", e.target.value)} />
              </div>
            </Field>

            {/* Ölçüler */}
            <SectionTitle>Ölçü Bilgileri (cm)</SectionTitle>

            <Field label="Bel">
              <select className={selectCls} value={form.waist} onChange={(e) => set("waist", e.target.value)}>
                <option value="">Seçin</option>
                {WAIST_VALUES.map((v) => <option key={v} value={v}>{v} cm</option>)}
              </select>
            </Field>

            <Field label="Basen">
              <select className={selectCls} value={form.hip} onChange={(e) => set("hip", e.target.value)}>
                <option value="">Seçin</option>
                {HIP_VALUES.map((v) => <option key={v} value={v}>{v} cm</option>)}
              </select>
            </Field>

            <Field label="Üst (Göğüs)">
              <select className={selectCls} value={form.bust} onChange={(e) => set("bust", e.target.value)}>
                <option value="">Seçin</option>
                {BUST_VALUES.map((v) => <option key={v} value={v}>{v} cm</option>)}
              </select>
            </Field>

            {/* Adres & Notlar */}
            <SectionTitle>Adres & Notlar</SectionTitle>

            <Field label="Adres">
              <input className={inputCls + " md:col-span-2"} placeholder="Adres" value={form.address}
                onChange={(e) => set("address", e.target.value)} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Notlar">
                <textarea className={inputCls + " min-h-[90px] resize-none"} placeholder="Müşteri notları..."
                  value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </Field>
            </div>

            {/* Prova tarihleri */}
            <SectionTitle>Prova Tarihleri</SectionTitle>

            {[1, 2, 3].map((n) => (
              <Field key={n} label={`Prova ${n} Tarihi & Saati`}>
                <div className="flex gap-2">
                  <input className={inputCls} type="date"
                    value={(form as any)[`fittingDate${n}`]}
                    onChange={(e) => set(`fittingDate${n}`, e.target.value)} />
                  <input className={inputCls + " w-32 shrink-0"} type="time"
                    value={(form as any)[`fittingTime${n}`]}
                    onChange={(e) => set(`fittingTime${n}`, e.target.value)} />
                </div>
              </Field>
            ))}

          </div>

          {message && (
            <div className={`mt-5 rounded-2xl border p-4 text-sm font-bold ${
              message.includes("başarıyla")
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-[#eadfce] bg-[#fbf7f1] text-[#6d6256]"
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={createCustomer}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 font-black text-white shadow-[0_18px_42px_rgba(182,148,99,.24)]"
          >
            Müşteri Ekle
          </button>
        </div>

        {/* LİSTE */}
        <div className="premium-card p-5 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#1f1b16]">Müşteri Listesi</h2>
              <p className="premium-muted mt-1 text-sm">{customers.length} kayıtlı müşteri</p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-[#eadfce] bg-white/70 px-4 py-3 lg:min-w-[260px]">
              <Search size={18} className="text-[#b69463]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Müşteri ara..." className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-[#8b8177]">
                Henüz müşteri bulunmuyor.
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <div key={c.id} className="rounded-2xl border border-[#eadfce] bg-white/70 p-4 transition hover:bg-white/90">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#b69463]/15 text-[#b69463]">
                        <UserRound size={19} />
                      </div>
                      <div>
                        <h3 className="font-black text-[#1f1b16]">{c.full_name}</h3>
                        <p className="mt-0.5 text-sm text-[#8b8177]">
                          {[c.phone, c.instagram].filter(Boolean).join(" • ")}
                        </p>
                        {c.wedding_date && (
                          <p className="mt-1 text-xs font-bold text-[#b69463]">
                            Düğün: {new Date(c.wedding_date).toLocaleDateString("tr-TR")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link href={`/customers/${c.id}`}
                      className="shrink-0 rounded-full bg-[#211b16] px-4 py-2 text-xs font-black text-white">
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
