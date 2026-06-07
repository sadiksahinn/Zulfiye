"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { safeInsert } from "@/lib/offlineQueue";
import {
  CalendarDays, ChevronRight, Search, Scissors, Sparkles, UserPlus, X, Check,
  Phone, Trash2, Edit3,
} from "lucide-react";

/* ─── helpers ─── */
const inputCls =
  "w-full rounded-full border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";
const dtCls =
  "w-full rounded-[0.875rem] border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-[#b69463]">
      {children}
    </label>
  );
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMoney(n: any) {
  return Number(n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 0 }) + " ₺";
}

function whatsappLink(phone: string, msg: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  const clean = digits.startsWith("90")
    ? digits
    : digits.startsWith("0")
    ? `90${digits.slice(1)}`
    : digits.length === 10
    ? `90${digits}`
    : digits;
  if (!clean) return "";
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

/* ─── types ─── */
type Customer = { id: string; full_name: string; phone: string };

const SERVICES = ["Kuaför", "Makyaj", "Kuaför + Makyaj"];
const EVENT_TYPES = ["Düğün", "Nişan", "Kına", "Sünnet", "Mezuniyet", "Diğer"];
const STATUSES = ["rezerve", "tamamlandi", "iptal"];

const STATUS_LABELS: Record<string, string> = {
  rezerve: "Rezerve",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

const STATUS_COLORS: Record<string, string> = {
  rezerve: "bg-amber-50 text-amber-700 border-amber-200",
  tamamlandi: "bg-emerald-50 text-emerald-700 border-emerald-200",
  iptal: "bg-red-50 text-red-500 border-red-200",
};

const EMPTY_FORM = {
  service_type: "Kuaför + Makyaj",
  appointment_date: "",
  appointment_time: "",
  event_date: "",
  event_time: "",
  event_date_2: "",
  event_time_2: "",
  event_date_3: "",
  event_time_3: "",
  event_type: "Düğün",
  price: "",
  deposit_amount: "",
  paid_amount: "",
  status: "rezerve",
  notes: "",
};

function DateTimeRow({
  dateKey, timeKey, form, set,
}: {
  dateKey: string; timeKey: string; form: any;
  set: (k: string, v: string) => void;
}) {
  const d = form[dateKey] as string;
  const t = form[timeKey] as string;
  return (
    <div className="flex min-w-0 gap-2">
      <div className="relative min-w-0 flex-1">
        {!d && (
          <span className="pointer-events-none absolute inset-0 flex items-center px-4 text-sm text-[#c4b5a5]">
            gg / aa / yyyy
          </span>
        )}
        <input className={dtCls} type="date" value={d} onChange={(e) => set(dateKey, e.target.value)} />
        {d && (
          <button type="button" onClick={() => set(dateKey, "")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#f0e8df] p-1 text-[#9d8b74] hover:bg-red-50 hover:text-red-500 transition">
            <X size={11} />
          </button>
        )}
      </div>
      <div className="relative w-[6.5rem] shrink-0">
        {!t && (
          <span className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm text-[#c4b5a5]">
            --:--
          </span>
        )}
        <input
          className="w-full rounded-[0.875rem] border border-[#eadfce] bg-white/80 px-3 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]"
          type="time" value={t} onChange={(e) => set(timeKey, e.target.value)}
        />
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

/* ─── main ─── */
export default function BeautyPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [savingCust, setSavingCust] = useState(false);

  const [filterStatus, setFilterStatus] = useState("tümü");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  /* load */
  async function load() {
    setLoading(true);
    const [ar, cr] = await Promise.all([
      supabase
        .from("beauty_appointments")
        .select("*, customers(id,full_name,phone)")
        .order("appointment_date", { ascending: true }),
      supabase.from("customers").select("id,full_name,phone").order("full_name"),
    ]);
    setAppointments(ar.data || []);
    setCustomers(cr.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  /* form helpers */
  function setF(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setSelectedCustomer(null);
    setCustomerSearch("");
    setEditId(null);
    setShowNewCustomer(false);
    setNewCustName("");
    setNewCustPhone("");
    setShowForm(true);
  }

  async function saveNewCustomer() {
    if (!newCustName.trim() || !newCustPhone.trim()) return;
    setSavingCust(true);
    const name = newCustName.trim();
    const phone = newCustPhone.trim();
    const { error } = await supabase.from("customers")
      .insert({ full_name: name, phone });
    setSavingCust(false);
    if (error) { alert("Müşteri kaydedilemedi: " + error.message); return; }
    // Eklenen müşteriyi listeden çek
    const { data: found } = await supabase.from("customers")
      .select("id,full_name,phone")
      .eq("full_name", name).eq("phone", phone)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    const newC = found || { id: crypto.randomUUID(), full_name: name, phone };
    setCustomers((prev) => [newC, ...prev]);
    setSelectedCustomer(newC);
    setCustomerSearch(newC.full_name);
    setShowDropdown(false);
    setShowNewCustomer(false);
    setNewCustName("");
    setNewCustPhone("");
  }

  function openEdit(a: any) {
    setForm({
      service_type: a.service_type || "Kuaför + Makyaj",
      appointment_date: a.appointment_date || "",
      appointment_time: a.appointment_time?.slice(0, 5) || "",
      event_date: a.event_date || "",
      event_time: a.event_time?.slice(0, 5) || "",
      event_date_2: a.event_date_2 || "",
      event_time_2: a.event_time_2?.slice(0, 5) || "",
      event_date_3: a.event_date_3 || "",
      event_time_3: a.event_time_3?.slice(0, 5) || "",
      event_type: a.event_type || "Düğün",
      price: String(a.price || ""),
      deposit_amount: String(a.deposit_amount || ""),
      paid_amount: String(a.paid_amount || ""),
      status: a.status || "rezerve",
      notes: a.notes || "",
    });
    setSelectedCustomer(a.customers || null);
    setCustomerSearch(a.customers?.full_name || "");
    setEditId(a.id);
    setShowForm(true);
  }

  async function save() {
    if (!selectedCustomer) { alert("Lütfen müşteri seçin."); return; }
    setSaving(true);
    const payload = {
      customer_id: selectedCustomer.id,
      service_type: form.service_type,
      appointment_date: form.appointment_date || null,
      appointment_time: form.appointment_time || null,
      event_date: form.event_date || null,
      event_time: form.event_time || null,
      event_date_2: form.event_date_2 || null,
      event_time_2: form.event_time_2 || null,
      event_date_3: form.event_date_3 || null,
      event_time_3: form.event_time_3 || null,
      event_type: form.event_type,
      price: Number(form.price) || 0,
      deposit_amount: Number(form.deposit_amount) || 0,
      paid_amount: Number(form.paid_amount) || 0,
      status: form.status,
      notes: form.notes,
      updated_at: new Date().toISOString(),
    };
    if (editId) {
      await supabase.from("beauty_appointments").update(payload).eq("id", editId);
      setSaving(false);
      setShowForm(false);
      load();
    } else {
      const { ok, offline } = await safeInsert(
        "beauty_appointments", payload,
        `Kuaför/Makyaj: ${selectedCustomer?.full_name}`
      );
      setSaving(false);
      if (!ok) return;
      setShowForm(false);
      if (!offline) load();
    }
  }

  async function deleteAppt(id: string) {
    if (!confirm("Bu rezervasyonu silmek istediğinize emin misiniz?")) return;
    await supabase.from("beauty_appointments").delete().eq("id", id);
    load();
  }

  async function quickStatus(id: string, status: string) {
    await supabase.from("beauty_appointments").update({ status }).eq("id", id);
    load();
  }

  /* filtered */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      if (filterStatus !== "tümü" && a.status !== filterStatus) return false;
      if (q) {
        const name = a.customers?.full_name?.toLowerCase() || "";
        const phone = a.customers?.phone || "";
        const svc = a.service_type?.toLowerCase() || "";
        if (!name.includes(q) && !phone.includes(q) && !svc.includes(q)) return false;
      }
      return true;
    });
  }, [appointments, filterStatus, search]);

  /* customer search dropdown */
  const customerResults = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
    ).slice(0, 6);
  }, [customerSearch, customers]);

  /* stats */
  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => ({
    total: appointments.length,
    today: appointments.filter((a) => a.appointment_date === today).length,
    active: appointments.filter((a) => a.status === "rezerve").length,
    revenue: appointments.reduce((s, a) => s + Number(a.paid_amount || 0), 0),
    remaining: appointments.reduce((s, a) => s + Number(a.remaining_amount || 0), 0),
  }), [appointments, today]);

  return (
    <AppShell title="Kuaför & Makyaj">
      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "Toplam Rezervasyon", value: stats.total, icon: CalendarDays },
          { label: "Bugün", value: stats.today, icon: Scissors },
          { label: "Aktif Rezerve", value: stats.active, icon: Sparkles },
          { label: "Tahsilat", value: formatMoney(stats.revenue), icon: Check },
          { label: "Kalan", value: formatMoney(stats.remaining), icon: X },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[1.5rem] border border-[#eadfce] bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463]">
              <Icon size={13} /> {label}
            </div>
            <div className="mt-2 text-2xl font-black text-[#211b16]">{value}</div>
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-[#eadfce] bg-white/80 px-4 py-2.5 min-w-[200px]">
          <Search size={16} className="text-[#b69463]" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Müşteri, telefon, hizmet..."
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </div>

        <div className="flex gap-1.5 rounded-full border border-[#eadfce] bg-white/80 p-1">
          {["tümü", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-black transition-all ${
                filterStatus === s
                  ? "bg-[#b69463] text-white shadow"
                  : "text-[#6d6256] hover:bg-[#f5ede2]"
              }`}>
              {s === "tümü" ? "Tümü" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <button onClick={openNew}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] px-5 py-2.5 text-sm font-black text-white shadow-md">
          <UserPlus size={16} /> Yeni Rezervasyon
        </button>
      </div>

      {/* list */}
      {loading ? (
        <div className="py-16 text-center text-sm font-bold text-[#b69463]">Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm font-bold text-[#b69463]">Rezervasyon bulunamadı.</div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((a) => {
            const remaining = Number(a.remaining_amount || 0);
            const wp = a.customers?.phone
              ? whatsappLink(
                  a.customers.phone,
                  `Merhaba ${a.customers.full_name}, ${a.appointment_date ? formatDate(a.appointment_date) : ""} tarihli ${a.service_type} rezervasyonunuz hakkında bilgi vermek istedik.`
                )
              : "";
            return (
              <div key={a.id}
                className="relative rounded-[1.75rem] border border-[#eadfce] bg-white/80 p-5 shadow-sm transition hover:shadow-md">
                {/* header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-[#211b16]">
                        {a.customers?.full_name || "—"}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${STATUS_COLORS[a.status] || ""}`}>
                        {STATUS_LABELS[a.status] || a.status}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-[#b69463]">
                      {a.service_type === "Kuaför" && <Scissors size={13} />}
                      {a.service_type === "Makyaj" && <Sparkles size={13} />}
                      {a.service_type === "Kuaför + Makyaj" && <><Scissors size={13} /><Sparkles size={13} /></>}
                      {a.service_type}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {wp && (
                      <a href={wp} target="_blank" rel="noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition">
                        <Phone size={14} />
                      </a>
                    )}
                    <button onClick={() => openEdit(a)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5ede2] text-[#b69463] hover:bg-[#eadfce] transition">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deleteAppt(a.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* dates */}
                <div className="mt-3 space-y-1.5 text-[11px] font-semibold text-[#7d6c58]">
                  <div className="rounded-xl bg-[#faf6f0] p-2.5">
                    <div className="font-black uppercase tracking-wider text-[#b69463]">Randevu</div>
                    <div className="mt-0.5">
                      {a.appointment_date ? formatDate(a.appointment_date) : "—"}
                      {a.appointment_time ? ` • ${a.appointment_time.slice(0, 5)}` : ""}
                    </div>
                  </div>
                  {[
                    { label: "1. Gün", date: a.event_date, time: a.event_time, type: a.event_type },
                    { label: "2. Gün", date: a.event_date_2, time: a.event_time_2, type: null },
                    { label: "3. Gün", date: a.event_date_3, time: a.event_time_3, type: null },
                  ].filter(e => e.date).map((e, i) => (
                    <div key={i} className="rounded-xl bg-[#faf6f0] p-2.5">
                      <div className="font-black uppercase tracking-wider text-[#b69463]">
                        Etkinlik {e.label}
                      </div>
                      <div className="mt-0.5">
                        {formatDate(e.date)}
                        {e.time ? ` • ${e.time.slice(0, 5)}` : ""}
                        {e.type ? ` • ${e.type}` : ""}
                      </div>
                    </div>
                  ))}
                </div>

                {/* payment */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#faf6f0] px-4 py-2.5">
                  <div className="text-[11px]">
                    <span className="font-black text-[#b69463]">Toplam</span>{" "}
                    <span className="font-black text-[#211b16]">{formatMoney(a.price)}</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="font-black text-emerald-600">Ödendi</span>{" "}
                    <span className="font-bold">{formatMoney(a.paid_amount)}</span>
                  </div>
                  <div className="text-[11px]">
                    <span className={`font-black ${remaining > 0 ? "text-red-500" : "text-emerald-600"}`}>
                      Kalan
                    </span>{" "}
                    <span className="font-bold">{formatMoney(remaining)}</span>
                  </div>
                </div>

                {/* notes */}
                {a.notes && (
                  <p className="mt-2 text-xs text-[#9d8b74] italic">"{a.notes}"</p>
                )}

                {/* quick status */}
                {a.status === "rezerve" && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => quickStatus(a.id, "tamamlandi")}
                      className="flex-1 rounded-full bg-emerald-50 py-2 text-[11px] font-black text-emerald-700 hover:bg-emerald-100 transition">
                      ✓ Tamamlandı
                    </button>
                    <button onClick={() => quickStatus(a.id, "iptal")}
                      className="flex-1 rounded-full bg-red-50 py-2 text-[11px] font-black text-red-500 hover:bg-red-100 transition">
                      ✗ İptal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm lg:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl lg:rounded-[2rem]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211b16]">
                {editId ? "Rezervasyonu Düzenle" : "Yeni Rezervasyon"}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ede2] text-[#b69463]">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              {/* customer */}
              <div className="relative">
                <Label>Müşteri *</Label>
                <div className="flex items-center gap-2 rounded-full border border-[#eadfce] bg-white/80 px-4 py-3">
                  <Search size={16} className="text-[#b69463]" />
                  <input
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomer(null);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Müşteri ara..."
                    className="w-full bg-transparent text-sm font-semibold outline-none"
                  />
                  {selectedCustomer && (
                    <span className="rounded-full bg-[#b69463] px-2 py-0.5 text-[10px] font-black text-white">✓</span>
                  )}
                </div>
                {showDropdown && customerResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-xl">
                    {customerResults.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch(c.full_name);
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#faf6f0] transition">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b69463] text-xs font-black text-white">
                          {c.full_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#211b16]">{c.full_name}</div>
                          <div className="text-xs text-[#9d8b74]">{c.phone}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Yeni müşteri ekle butonu */}
                {!selectedCustomer && (
                  <button type="button" onClick={() => setShowNewCustomer((v) => !v)}
                    className="mt-2 flex w-full items-center gap-2 rounded-full border border-dashed border-[#b69463] px-4 py-2.5 text-sm font-black text-[#b69463] hover:bg-[#faf6f0] transition">
                    <UserPlus size={15} /> Yeni Müşteri Ekle
                  </button>
                )}

                {showNewCustomer && (
                  <div className="mt-2 rounded-2xl border border-[#eadfce] bg-[#faf6f0] p-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463]">Hızlı Müşteri Kaydı</p>
                    <input
                      value={newCustName} onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="Ad Soyad *"
                      className="w-full rounded-full border border-[#eadfce] bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#b69463]"
                    />
                    <input
                      value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="Telefon *"
                      className="w-full rounded-full border border-[#eadfce] bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#b69463]"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowNewCustomer(false)}
                        className="flex-1 rounded-full border border-[#eadfce] py-2 text-sm font-black text-[#9d8b74]">
                        Vazgeç
                      </button>
                      <button type="button" onClick={saveNewCustomer} disabled={savingCust || !newCustName.trim() || !newCustPhone.trim()}
                        className="flex-1 rounded-full bg-[#b69463] py-2 text-sm font-black text-white disabled:opacity-50">
                        {savingCust ? "Kaydediliyor…" : "Kaydet & Seç"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* service type */}
              <div>
                <Label>Hizmet Türü</Label>
                <div className="flex gap-2 flex-wrap">
                  {SERVICES.map((s) => (
                    <button key={s} type="button" onClick={() => setF("service_type", s)}
                      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-black transition ${
                        form.service_type === s
                          ? "border-[#b69463] bg-[#b69463] text-white"
                          : "border-[#eadfce] text-[#6d6256] hover:border-[#b69463]"
                      }`}>
                      {s === "Kuaför" && <Scissors size={13} />}
                      {s === "Makyaj" && <Sparkles size={13} />}
                      {s === "Kuaför + Makyaj" && <><Scissors size={13} /><Sparkles size={13} /></>}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* appointment date */}
              <div>
                <Label>Randevu Tarihi & Saati</Label>
                <DateTimeRow dateKey="appointment_date" timeKey="appointment_time" form={form} set={setF} />
              </div>

              {/* event dates */}
              <div className="space-y-2">
                <Label>Etkinlik Tarihleri & Saatleri</Label>
                <div>
                  <p className="mb-1 text-[10px] font-black text-[#9d8b74] uppercase tracking-wider">1. Gün</p>
                  <DateTimeRow dateKey="event_date" timeKey="event_time" form={form} set={setF} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black text-[#9d8b74] uppercase tracking-wider">2. Gün</p>
                  <DateTimeRow dateKey="event_date_2" timeKey="event_time_2" form={form} set={setF} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black text-[#9d8b74] uppercase tracking-wider">3. Gün</p>
                  <DateTimeRow dateKey="event_date_3" timeKey="event_time_3" form={form} set={setF} />
                </div>
              </div>

              {/* event type */}
              <div>
                <Label>Etkinlik Türü</Label>
                <select value={form.event_type} onChange={(e) => setF("event_type", e.target.value)}
                  className={inputCls + " appearance-none"}>
                  {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* price */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Toplam Ücret ₺</Label>
                    <input type="number" value={form.price}
                      onChange={(e) => {
                        setF("price", e.target.value);
                      }}
                      placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <Label>Kapora ₺</Label>
                    <input type="number" value={form.deposit_amount}
                      onChange={(e) => {
                        setF("deposit_amount", e.target.value);
                        // Kapora girilince paid_amount'ı güncelle
                        setForm((p) => ({ ...p, deposit_amount: e.target.value, paid_amount: e.target.value }));
                      }}
                      placeholder="0" className={inputCls} />
                  </div>
                </div>

                {/* Canlı özet */}
                {(Number(form.price) > 0 || Number(form.deposit_amount) > 0) && (
                  <div className="rounded-2xl bg-[#faf6f0] border border-[#eadfce] p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-[#7d6c58]">Toplam Ücret</span>
                      <span className="font-black text-[#211b16]">{Number(form.price || 0).toLocaleString("tr-TR")} ₺</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-[#7d6c58]">Kapora</span>
                      <span className="font-black text-emerald-600">− {Number(form.deposit_amount || 0).toLocaleString("tr-TR")} ₺</span>
                    </div>
                    <div className="border-t border-[#eadfce] pt-2 flex justify-between">
                      <span className="font-black text-[#7d6c58]">Kalan Ödeme</span>
                      <span className={`text-lg font-black ${(Number(form.price || 0) - Number(form.paid_amount || 0)) > 0 ? "text-red-500" : "text-emerald-600"}`}>
                        {Math.max(0, Number(form.price || 0) - Number(form.paid_amount || 0)).toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Toplam Ödenen ₺ (kapora + sonraki ödemeler)</Label>
                  <input type="number" value={form.paid_amount}
                    onChange={(e) => setF("paid_amount", e.target.value)}
                    placeholder="0" className={inputCls} />
                  <p className="mt-1 text-[11px] text-[#9d8b74] pl-2">Kapora alındığında otomatik dolar. Ek ödeme gelirse buraya toplam yazın.</p>
                </div>
              </div>

              {/* status */}
              <div>
                <Label>Durum</Label>
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => setF("status", s)}
                      className={`flex-1 rounded-full border py-2 text-xs font-black transition ${
                        form.status === s
                          ? "border-[#b69463] bg-[#b69463] text-white"
                          : "border-[#eadfce] text-[#6d6256] hover:border-[#b69463]"
                      }`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* notes */}
              <div>
                <Label>Notlar</Label>
                <textarea value={form.notes} onChange={(e) => setF("notes", e.target.value)}
                  rows={3} placeholder="Saç stili tercihi, cilt notu vb."
                  className="w-full rounded-[1.2rem] border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463] resize-none" />
              </div>
            </div>

            <button onClick={save} disabled={saving}
              className="mt-5 flex w-full items-center justify-between rounded-[1.35rem] bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-3.5 pl-6 pr-4 text-base font-black text-white shadow-md disabled:opacity-60">
              <span>{saving ? "Kaydediliyor…" : editId ? "Güncelle" : "Rezervasyonu Kaydet"}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
