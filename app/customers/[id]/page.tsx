"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, CalendarDays, Camera, Edit2, MessageCircle, Package,
  Phone, RotateCcw, Save, Scissors, ShoppingBag, Sparkles, UserRound, Wallet, X,
} from "lucide-react";

const inputCls = "w-full rounded-full border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-full border border-[#eadfce] bg-white/60 px-4 py-3">
      <span className="text-xs font-black uppercase tracking-[0.15em] text-[#9d8b74]">{label}</span>
      <span className="text-right text-sm font-black text-[#211b16]">{value || "—"}</span>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  bekliyor: "Bekliyor", geldi: "Geldi", tamamlandi: "Tamamlandı",
  teslime_hazir: "Teslime Hazır", aktif: "Aktif", planlandi: "Planlandı",
  tamamlandi_rental: "Tamamlandı", gecikti: "Gecikti",
};

const PHOTO_VIDEO: Record<string, string> = {
  nar_film: "Nar Film", diger: "Diğer",
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [rentals,  setRentals]  = useState<any[]>([]);
  const [sales,    setSales]    = useState<any[]>([]);
  const [fittings, setFittings] = useState<any[]>([]);
  const [beauty,   setBeauty]   = useState<any[]>([]);
  const [notes,      setNotes]      = useState<any[]>([]);
  const [newNote,    setNewNote]    = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [alterations,    setAlterations]    = useState<any[]>([]);
  const [showAltForm,    setShowAltForm]    = useState(false);
  const [altForm,        setAltForm]        = useState({ description: "", tailor: "", due_date: "", notes: "" });
  const [savingAlt,      setSavingAlt]      = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [message,  setMessage]  = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState<any>({});

  async function load() {
    const [cr, rr, sr, fr, br, nr, ar] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).maybeSingle(),
      supabase.from("rentals").select("*, products(name,category,image_url,barcode)").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("sales").select("*, products(name,category,image_url)").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("fittings").select("*, products(name,category,image_url)").eq("customer_id", id).order("fitting_date", { ascending: false }),
      supabase.from("beauty_appointments").select("*").eq("customer_id", id).order("appointment_date", { ascending: false }),
      supabase.from("customer_notes").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("alterations").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    ]);
    setCustomer(cr.data);
    setRentals(rr.data || []);
    setSales(sr.data || []);
    setFittings(fr.data || []);
    setBeauty(br.data || []);
    setNotes(nr.data || []);
    setAlterations(ar.data || []);
    if (cr.data) setForm(cr.data);
  }

  async function saveAlteration() {
    if (!altForm.description.trim()) return;
    setSavingAlt(true);
    await supabase.from("alterations").insert({ customer_id: id, ...altForm, due_date: altForm.due_date || null });
    setSavingAlt(false);
    setAltForm({ description: "", tailor: "", due_date: "", notes: "" });
    setShowAltForm(false);
    load();
  }

  async function toggleAltStatus(altId: string, current: string) {
    const next = current === "tamamlandi" ? "bekliyor" : "tamamlandi";
    await supabase.from("alterations").update({ status: next, updated_at: new Date().toISOString() }).eq("id", altId);
    setAlterations(prev => prev.map(a => a.id === altId ? { ...a, status: next } : a));
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setSavingNote(true);
    await supabase.from("customer_notes").insert({ customer_id: id, note: newNote.trim() });
    setNewNote("");
    setSavingNote(false);
    load();
  }

  async function deleteNote(noteId: string) {
    await supabase.from("customer_notes").delete().eq("id", noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }

  useEffect(() => { if (id) load(); }, [id]);

  async function save() {
    setMessage(null);
    const { error } = await supabase.from("customers").update({
      full_name:          form.full_name,
      phone:              form.phone,
      instagram:          form.instagram || null,
      photo_video:        form.photo_video || null,
      photo_video_date:   form.photo_video === "var" ? (form.photo_video_date || null) : null,
      photo_video_dress:  form.photo_video === "var" ? !!form.photo_video_dress : false,
      photo_video_makeup: form.photo_video === "var" ? !!form.photo_video_makeup : false,
      birth_date:         form.birth_date || null,
      engagement_date:    form.engagement_date || null,
      engagement_time:    form.engagement_time || null,
      wedding_date:       form.wedding_date || null,
      wedding_time:       form.wedding_time || null,
      waist:              form.waist ? Number(form.waist) : null,
      hip:                form.hip   ? Number(form.hip)   : null,
      bust:               form.bust  ? Number(form.bust)  : null,
      address:            form.address || null,
      notes:              form.notes          || null,
      meas_height:        form.meas_height    ? Number(form.meas_height)    : null,
      meas_shoulder:      form.meas_shoulder  ? Number(form.meas_shoulder)  : null,
      meas_arm:           form.meas_arm       ? Number(form.meas_arm)       : null,
      meas_notes:         form.meas_notes     || null,
      fitting_date_1:     form.fitting_date_1 || null,
      fitting_time_1:     form.fitting_time_1 || null,
      fitting_date_2:     form.fitting_date_2 || null,
      fitting_time_2:     form.fitting_time_2 || null,
      fitting_date_3:     form.fitting_date_3 || null,
      fitting_time_3:     form.fitting_time_3 || null,
    }).eq("id", id);
    if (error) { setMessage({ text: "Güncellenemedi.", ok: false }); return; }
    setMessage({ text: "Müşteri güncellendi.", ok: true });
    setEditing(false);
    load();
  }

  const totals = useMemo(() => {
    const remaining = [...rentals, ...sales].reduce((s, x) => s + Number(x.remaining_amount || 0), 0);
    const total     = [...rentals, ...sales].reduce((s, x) => s + Number(x.total_amount    || 0), 0);
    return { remaining, total };
  }, [rentals, sales]);

  const wa = customer ? String(customer.phone || "").replace(/\D/g,"").replace(/^0/,"90") : "";

  if (!customer) return (
    <AppShell title="Müşteri Kartı">
      <div className="flex items-center justify-center py-20 text-sm font-bold text-[#9d8b74]">Yükleniyor...</div>
    </AppShell>
  );

  return (
    <AppShell title="Müşteri Kartı">
      <div className="space-y-5 pb-24 lg:pb-0">

        {/* Header */}
        <section className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">Müşteri Kartı</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">{customer.full_name}</h1>
              <p className="mt-1 text-sm text-white/70">{customer.phone}</p>
              {customer.wedding_date && (
                <p className="mt-1 text-sm text-[#d8bd84]">💒 Düğün: {formatDate(customer.wedding_date)}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/customers" className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-black text-white">
                <ArrowLeft size={16} /> Listeye Dön
              </a>
              <button onClick={() => setEditing(v => !v)}
                className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#211b16]">
                {editing ? <><X size={16} /> Kapat</> : <><Edit2 size={16} /> Düzenle</>}
              </button>
              {wa && (
                <a href={`https://wa.me/${wa}`} target="_blank"
                  className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-black text-white">
                  <Phone size={16} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Özet kartlar */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            { label: "Kiralama", value: rentals.length, icon: <CalendarDays size={18} />, danger: false },
            { label: "Satış",    value: sales.length,   icon: <ShoppingBag size={18} />,  danger: false },
            { label: "Prova",    value: fittings.length, icon: <UserRound size={18} />,   danger: false },
            { label: "Borç",     value: `${totals.remaining.toLocaleString("tr-TR")} ₺`, icon: <Wallet size={18} />, danger: totals.remaining > 0 },
          ].map(m => (
            <div key={m.label} className={`premium-card p-4 ${m.danger ? "border-red-200" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-[#9d8b74]">{m.label}</p>
                  <p className={`mt-1.5 text-2xl font-black ${m.danger ? "text-red-600" : "text-[#211b16]"}`}>{m.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${m.danger ? "bg-red-100 text-red-600" : "bg-[#b69463]/15 text-[#b69463]"}`}>{m.icon}</div>
              </div>
            </div>
          ))}
        </section>

        {message && (
          <div className={`rounded-2xl border p-4 text-sm font-bold ${message.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"}`}>
            {message.text}
          </div>
        )}

        {/* Düzenleme formu */}
        {editing && (
          <section className="premium-card p-5 lg:p-7">
            <h2 className="mb-5 text-xl font-black text-[#1f1b16]">Müşteri Bilgilerini Düzenle</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-xs font-black text-[#6d6256]">Ad Soyad *</label>
                <input className={inputCls} value={form.full_name || ""} onChange={e => setForm((p:any) => ({...p, full_name: e.target.value}))} /></div>
              <div><label className="mb-1 block text-xs font-black text-[#6d6256]">Telefon *</label>
                <input className={inputCls} value={form.phone || ""} onChange={e => setForm((p:any) => ({...p, phone: e.target.value}))} /></div>
              <div><label className="mb-1 block text-xs font-black text-[#6d6256]">Instagram</label>
                <input className={inputCls} value={form.instagram || ""} onChange={e => setForm((p:any) => ({...p, instagram: e.target.value}))} /></div>
              <div className="col-span-full">
                <label className="mb-2 block text-xs font-black text-[#6d6256]">Fotoğraf & Video Çekimi</label>
                <div className="flex gap-2 mb-2">
                  {["yok","var"].map((v) => (
                    <button key={v} type="button" onClick={() => setForm((p:any) => ({...p, photo_video: v}))}
                      className={`flex-1 rounded-full border py-2.5 text-sm font-black transition ${
                        form.photo_video === v
                          ? v === "var" ? "border-[#b69463] bg-[#b69463] text-white" : "border-[#c4b5a5] bg-[#f5ede2] text-[#6d6256]"
                          : "border-[#eadfce] text-[#9d8b74] hover:border-[#b69463]"
                      }`}>
                      {v === "var" ? "📷 Var" : "Yok"}
                    </button>
                  ))}
                </div>
                {form.photo_video === "var" && (
                  <div className="space-y-2 rounded-2xl border border-[#eadfce] bg-[#faf6f0] p-4">
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463]">Çekim Tarihi</label>
                      <input className={inputCls} type="date" value={form.photo_video_date || ""}
                        onChange={e => setForm((p:any) => ({...p, photo_video_date: e.target.value}))} />
                    </div>
                    <div className="flex gap-3">
                      <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-full border border-[#eadfce] bg-white px-4 py-3">
                        <input type="checkbox" checked={!!form.photo_video_dress}
                          onChange={e => setForm((p:any) => ({...p, photo_video_dress: e.target.checked}))}
                          className="h-4 w-4 accent-[#b69463]" />
                        <span className="text-sm font-bold text-[#211b16]">Gelinlik verilecek</span>
                      </label>
                      <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-full border border-[#eadfce] bg-white px-4 py-3">
                        <input type="checkbox" checked={!!form.photo_video_makeup}
                          onChange={e => setForm((p:any) => ({...p, photo_video_makeup: e.target.checked}))}
                          className="h-4 w-4 accent-[#b69463]" />
                        <span className="text-sm font-bold text-[#211b16]">Makyaj yapılacak</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <p className="col-span-full text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463]">Tarihler</p>
              <div><label className="mb-1 block text-xs font-black text-[#6d6256]">Doğum Tarihi</label>
                <input className={inputCls} type="date" value={form.birth_date || ""} onChange={e => setForm((p:any) => ({...p, birth_date: e.target.value}))} /></div>
              <div><label className="mb-1 block text-xs font-black text-[#6d6256]">Nişan Tarihi & Saati</label>
                <div className="flex gap-2">
                  <input className={inputCls} type="date" value={form.engagement_date || ""} onChange={e => setForm((p:any) => ({...p, engagement_date: e.target.value}))} />
                  <input className={inputCls + " w-32 shrink-0"} type="time" value={form.engagement_time || ""} onChange={e => setForm((p:any) => ({...p, engagement_time: e.target.value}))} />
                </div></div>
              <div><label className="mb-1 block text-xs font-black text-[#6d6256]">Düğün Tarihi & Saati</label>
                <div className="flex gap-2">
                  <input className={inputCls} type="date" value={form.wedding_date || ""} onChange={e => setForm((p:any) => ({...p, wedding_date: e.target.value}))} />
                  <input className={inputCls + " w-32 shrink-0"} type="time" value={form.wedding_time || ""} onChange={e => setForm((p:any) => ({...p, wedding_time: e.target.value}))} />
                </div></div>

              <p className="col-span-full text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463]">Ölçüler (cm)</p>
              {[["waist","Bel",55,120],["hip","Basen",75,145],["bust","Üst / Göğüs",70,130],["meas_height","Boy",140,195],["meas_shoulder","Omuz",30,60],["meas_arm","Kol Uzunluğu",45,80]].map(([k,l,min,max]) => (
                <div key={k as string}><label className="mb-1 block text-xs font-black text-[#6d6256]">{l as string}</label>
                  <select className={inputCls} value={form[k as string] || ""} onChange={e => setForm((p:any) => ({...p, [k as string]: e.target.value}))}>
                    <option value="">Seçin</option>
                    {Array.from({length:(max as number)-(min as number)+1},(_,i)=>(min as number)+i).map(v=><option key={v} value={v}>{v} cm</option>)}
                  </select></div>
              ))}
              <div className="col-span-full"><label className="mb-1 block text-xs font-black text-[#6d6256]">Ölçü Notları</label>
                <textarea className={inputCls + " min-h-[60px] resize-none"} value={form.meas_notes || ""} onChange={e => setForm((p:any) => ({...p, meas_notes: e.target.value}))} placeholder="Özel durum, tadilat notu..." /></div>

              <p className="col-span-full text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463]">Prova Tarihleri</p>
              {[1,2,3].map(n => (
                <div key={n}><label className="mb-1 block text-xs font-black text-[#6d6256]">Prova {n}</label>
                  <div className="flex gap-2">
                    <input className={inputCls} type="date" value={form[`fitting_date_${n}`] || ""} onChange={e => setForm((p:any) => ({...p, [`fitting_date_${n}`]: e.target.value}))} />
                    <input className={inputCls + " w-32 shrink-0"} type="time" value={form[`fitting_time_${n}`] || ""} onChange={e => setForm((p:any) => ({...p, [`fitting_time_${n}`]: e.target.value}))} />
                  </div></div>
              ))}

              <div className="col-span-full"><label className="mb-1 block text-xs font-black text-[#6d6256]">Adres</label>
                <input className={inputCls} value={form.address || ""} onChange={e => setForm((p:any) => ({...p, address: e.target.value}))} /></div>
              <div className="col-span-full"><label className="mb-1 block text-xs font-black text-[#6d6256]">Notlar</label>
                <textarea className={inputCls + " min-h-[80px] resize-none"} value={form.notes || ""} onChange={e => setForm((p:any) => ({...p, notes: e.target.value}))} /></div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setEditing(false)} className="flex-1 rounded-2xl border border-[#eadfce] py-3 text-sm font-black text-[#6d6256]">Vazgeç</button>
              <button onClick={save} className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-[#211b16] py-3 text-sm font-black text-white">
                <Save size={16} /> Kaydet
              </button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* Müşteri bilgileri */}
          <section className="premium-card p-5">
            <h2 className="mb-4 text-xl font-black text-[#1f1b16]">Müşteri Bilgileri</h2>
            <div className="space-y-2">
              <InfoRow label="Telefon"   value={customer.phone} />
              <InfoRow label="Instagram" value={customer.instagram} />
              {customer.photo_video === "var" ? (
                <div className="rounded-2xl border border-[#eadfce] bg-[#faf6f0] p-4 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b69463]">📷 Fotoğraf & Video Çekimi</div>
                  {customer.photo_video_date && (
                    <div className="text-sm font-bold text-[#211b16]">Çekim: {formatDate(customer.photo_video_date)}</div>
                  )}
                  <div className="flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${customer.photo_video_dress ? "bg-emerald-100 text-emerald-700" : "bg-[#f0e8df] text-[#9d8b74]"}`}>
                      {customer.photo_video_dress ? "✓ Gelinlik verilecek" : "Gelinlik yok"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${customer.photo_video_makeup ? "bg-pink-100 text-pink-700" : "bg-[#f0e8df] text-[#9d8b74]"}`}>
                      {customer.photo_video_makeup ? "✓ Makyaj yapılacak" : "Makyaj yok"}
                    </span>
                  </div>
                </div>
              ) : customer.photo_video === "yok" ? (
                <InfoRow label="Fotoğraf/Video" value="Yok" />
              ) : null}
              <InfoRow label="Doğum"     value={formatDate(customer.birth_date)} />
              <InfoRow label="Nişan"     value={customer.engagement_date ? `${formatDate(customer.engagement_date)}${customer.engagement_time ? ` · ${customer.engagement_time.slice(0,5)}` : ""}` : null} />
              <InfoRow label="Düğün"     value={customer.wedding_date ? `${formatDate(customer.wedding_date)}${customer.wedding_time ? ` · ${customer.wedding_time.slice(0,5)}` : ""}` : null} />
              <InfoRow label="Adres"     value={customer.address} />
              {customer.notes && <InfoRow label="Not" value={customer.notes} />}
            </div>

            {(customer.waist || customer.hip || customer.bust || customer.meas_height || customer.meas_shoulder || customer.meas_arm) && (
              <>
                <h3 className="mt-5 mb-3 text-sm font-black uppercase tracking-[0.15em] text-[#b69463]">Ölçüler</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[["Boy","meas_height"],["Göğüs","bust"],["Bel","waist"],["Basen","hip"],["Omuz","meas_shoulder"],["Kol","meas_arm"]].map(([l,k]) => (
                    customer[k] ? <div key={k} className="rounded-2xl bg-[#f7f0e7] p-3 text-center">
                      <div className="text-[10px] font-black text-[#9d8b74]">{l}</div>
                      <div className="mt-1 text-xl font-black text-[#211b16]">{customer[k]} cm</div>
                    </div> : null
                  ))}
                </div>
              </>
            )}

            {(customer.fitting_date_1 || customer.fitting_date_2 || customer.fitting_date_3) && (
              <>
                <h3 className="mt-5 mb-3 text-sm font-black uppercase tracking-[0.15em] text-[#b69463]">Prova Tarihleri</h3>
                <div className="space-y-2">
                  {[1,2,3].map(n => customer[`fitting_date_${n}`] ? (
                    <InfoRow key={n} label={`Prova ${n}`}
                      value={`${formatDate(customer[`fitting_date_${n}`])}${customer[`fitting_time_${n}`] ? ` · ${customer[`fitting_time_${n}`].slice(0,5)}` : ""}`} />
                  ) : null)}
                </div>
              </>
            )}
          </section>

          {/* Geçmiş */}
          <div className="space-y-5">

            {/* Kiralamalar */}
            <section className="premium-card p-5">
              <h2 className="mb-4 text-xl font-black text-[#1f1b16]">Kiralama Geçmişi ({rentals.length})</h2>
              {rentals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-6 text-center text-sm text-[#9d8b74]">Kiralama yok</div>
              ) : rentals.map(r => (
                <div key={r.id} className="mb-2 flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 p-3">
                  {r.products?.image_url
                    ? <img src={r.products.image_url} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]"><Package size={16} /></div>
                  }
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[#211b16]">{r.products?.name || "Ürün"}</div>
                    <div className="text-xs text-[#9d8b74]">{formatDate(r.delivery_date)} → {formatDate(r.return_date)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-black text-[#211b16]">{Number(r.total_amount||0).toLocaleString("tr-TR")} ₺</div>
                    {Number(r.remaining_amount||0) > 0 && <div className="text-xs text-red-600">{Number(r.remaining_amount).toLocaleString("tr-TR")} ₺ kalan</div>}
                  </div>
                </div>
              ))}
            </section>

            {/* Satışlar */}
            <section className="premium-card p-5">
              <h2 className="mb-4 text-xl font-black text-[#1f1b16]">Satış Geçmişi ({sales.length})</h2>
              {sales.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-6 text-center text-sm text-[#9d8b74]">Satış yok</div>
              ) : sales.map(s => (
                <div key={s.id} className="mb-2 flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 p-3">
                  {s.products?.image_url
                    ? <img src={s.products.image_url} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]"><ShoppingBag size={16} /></div>
                  }
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[#211b16]">{s.products?.name || "Ürün"}</div>
                    <div className="text-xs text-[#9d8b74]">{formatDate(s.sale_date)} · {s.payment_type}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-black text-[#211b16]">{Number(s.total_amount||0).toLocaleString("tr-TR")} ₺</div>
                    {Number(s.remaining_amount||0) > 0 && <div className="text-xs text-red-600">{Number(s.remaining_amount).toLocaleString("tr-TR")} ₺ kalan</div>}
                  </div>
                </div>
              ))}
            </section>

            {/* Provalar */}
            <section className="premium-card p-5">
              <h2 className="mb-4 text-xl font-black text-[#1f1b16]">Prova Geçmişi ({fittings.length})</h2>
              {fittings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-6 text-center text-sm text-[#9d8b74]">Prova yok</div>
              ) : fittings.map(f => (
                <div key={f.id} className="mb-2 rounded-2xl border border-[#eadfce] bg-white/70 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-[#211b16]">{f.products?.name || "Ürün belirtilmedi"}</div>
                      <div className="text-xs text-[#9d8b74]">{formatDate(f.fitting_date)}{f.fitting_time ? ` · ${f.fitting_time.slice(0,5)}` : ""}</div>
                    </div>
                    <span className={`rounded-xl px-3 py-1 text-xs font-black ${
                      f.status === "tamamlandi" ? "bg-green-100 text-green-700" :
                      f.status === "geldi" ? "bg-blue-100 text-blue-700" :
                      f.status === "teslime_hazir" ? "bg-purple-100 text-purple-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>{STATUS_LABELS[f.status] || f.status}</span>
                  </div>
                  {f.measurement_notes && <p className="mt-2 text-xs text-[#9d8b74]">Ölçü: {f.measurement_notes}</p>}
                  {f.alteration_notes && <p className="text-xs text-[#9d8b74]">Tadilat: {f.alteration_notes}</p>}
                </div>
              ))}
            </section>

            {/* Kuaför & Makyaj */}
            <section className="premium-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-[#1f1b16]">Kuaför & Makyaj ({beauty.length})</h2>
                <a href="/beauty"
                  className="rounded-full bg-[#b69463]/15 px-3 py-1.5 text-xs font-black text-[#b69463] hover:bg-[#b69463]/25 transition">
                  + Rezervasyon
                </a>
              </div>
              {beauty.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-6 text-center text-sm text-[#9d8b74]">
                  Kuaför & makyaj rezervasyonu yok
                </div>
              ) : beauty.map(b => (
                <div key={b.id} className="mb-2 rounded-2xl border border-[#eadfce] bg-white/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                        <Scissors size={15} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#211b16]">{b.service_type}</div>
                        <div className="text-xs text-[#9d8b74]">
                          {b.appointment_date ? formatDate(b.appointment_date) : "Tarih belirtilmedi"}
                          {b.appointment_time ? ` · ${b.appointment_time.slice(0,5)}` : ""}
                        </div>
                        {b.event_date && (
                          <div className="text-xs text-[#b69463]">Etkinlik: {formatDate(b.event_date)}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`rounded-xl px-2.5 py-1 text-[10px] font-black ${
                        b.status === "tamamlandi" ? "bg-emerald-100 text-emerald-700" :
                        b.status === "iptal" ? "bg-red-100 text-red-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>{b.status === "tamamlandi" ? "Tamamlandı" : b.status === "iptal" ? "İptal" : "Rezerve"}</span>
                      {Number(b.remaining_amount || 0) > 0 && (
                        <div className="mt-1 text-xs text-red-600">{Number(b.remaining_amount).toLocaleString("tr-TR")} ₺ kalan</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Tadilat Takibi */}
            <section className="premium-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">✂️</span>
                <h2 className="text-xl font-black text-[#1f1b16]">Tadilat Takibi</h2>
                <span className="ml-auto rounded-full bg-[#f5ede2] px-2.5 py-0.5 text-xs font-black text-[#b69463]">{alterations.length}</span>
                <button onClick={() => setShowAltForm(v => !v)}
                  className="rounded-full bg-[#b69463] px-3 py-1.5 text-xs font-black text-white hover:bg-[#a07d4f] transition">
                  + Ekle
                </button>
              </div>

              {showAltForm && (
                <div className="mb-4 space-y-3 rounded-2xl border border-[#eadfce] bg-[#faf6f0] p-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.15em] text-[#b69463]">Tadilat Açıklaması *</label>
                    <input value={altForm.description} onChange={e => setAltForm(p => ({...p, description: e.target.value}))}
                      placeholder="Bel alma, kol kısaltma..." className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.15em] text-[#b69463]">Terzi</label>
                      <input value={altForm.tailor} onChange={e => setAltForm(p => ({...p, tailor: e.target.value}))}
                        placeholder="Terzi adı" className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.15em] text-[#b69463]">Teslim Tarihi</label>
                      <input type="date" value={altForm.due_date} onChange={e => setAltForm(p => ({...p, due_date: e.target.value}))}
                        className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.15em] text-[#b69463]">Not</label>
                    <input value={altForm.notes} onChange={e => setAltForm(p => ({...p, notes: e.target.value}))}
                      placeholder="Ek detay..." className={inputCls} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAltForm(false)}
                      className="flex-1 rounded-full border border-[#eadfce] py-2 text-sm font-black text-[#9d8b74]">Vazgeç</button>
                    <button onClick={saveAlteration} disabled={savingAlt || !altForm.description.trim()}
                      className="flex-1 rounded-full bg-[#211b16] py-2 text-sm font-black text-white disabled:opacity-40">
                      {savingAlt ? "Kaydediliyor…" : "Kaydet"}
                    </button>
                  </div>
                </div>
              )}

              {alterations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-5 text-center text-sm text-[#9d8b74]">Tadilat kaydı yok</div>
              ) : (
                <div className="space-y-2">
                  {alterations.map(a => (
                    <div key={a.id} className={`flex items-start gap-3 rounded-2xl border p-3 transition ${a.status === "tamamlandi" ? "border-emerald-200 bg-emerald-50" : "border-[#eadfce] bg-white/70"}`}>
                      <button onClick={() => toggleAltStatus(a.id, a.status)}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${a.status === "tamamlandi" ? "border-emerald-500 bg-emerald-500 text-white" : "border-[#b69463]"}`}>
                        {a.status === "tamamlandi" && <span className="text-[10px]">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black ${a.status === "tamamlandi" ? "text-emerald-700 line-through" : "text-[#211b16]"}`}>{a.description}</p>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] text-[#9d8b74]">
                          {a.tailor && <span>✂️ {a.tailor}</span>}
                          {a.due_date && <span>📅 {formatDate(a.due_date)}</span>}
                          {a.notes && <span>· {a.notes}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Müşteri Notları / Timeline */}
            <section className="premium-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-[#b69463]" />
                <h2 className="text-xl font-black text-[#1f1b16]">Notlar & Tarihçe</h2>
                <span className="ml-auto rounded-full bg-[#f5ede2] px-2.5 py-0.5 text-xs font-black text-[#b69463]">{notes.length}</span>
              </div>

              {/* Not ekle */}
              <div className="mb-4 flex gap-2">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); }}}
                  placeholder="Not ekle… (Enter ile kaydet)"
                  rows={2}
                  className="flex-1 resize-none rounded-2xl border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]"
                />
                <button
                  onClick={addNote}
                  disabled={savingNote || !newNote.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full bg-[#b69463] text-white disabled:opacity-40 hover:bg-[#a07d4f] transition">
                  <Save size={16} />
                </button>
              </div>

              {/* Notlar listesi */}
              {notes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-5 text-center text-sm text-[#9d8b74]">
                  Henüz not eklenmedi
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map(n => (
                    <div key={n.id} className="group flex gap-3 rounded-2xl border border-[#eadfce] bg-white/70 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b69463]/15 text-[#b69463]">
                        <MessageCircle size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#211b16] whitespace-pre-wrap">{n.note}</p>
                        <p className="mt-1 text-[10px] text-[#9d8b74]">
                          {new Date(n.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="hidden group-hover:flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
