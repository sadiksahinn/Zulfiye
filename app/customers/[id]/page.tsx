"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, CalendarDays, Camera, Edit2, Package,
  Phone, RotateCcw, Save, ShoppingBag, UserRound, Wallet, X,
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
  const [editing,  setEditing]  = useState(false);
  const [message,  setMessage]  = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState<any>({});

  async function load() {
    const [cr, rr, sr, fr] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).maybeSingle(),
      supabase.from("rentals").select("*, products(name,category,image_url,barcode)").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("sales").select("*, products(name,category,image_url)").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("fittings").select("*, products(name,category,image_url)").eq("customer_id", id).order("fitting_date", { ascending: false }),
    ]);
    setCustomer(cr.data);
    setRentals(rr.data || []);
    setSales(sr.data || []);
    setFittings(fr.data || []);
    if (cr.data) setForm(cr.data);
  }

  useEffect(() => { if (id) load(); }, [id]);

  async function save() {
    setMessage(null);
    const { error } = await supabase.from("customers").update({
      full_name:       form.full_name,
      phone:           form.phone,
      instagram:       form.instagram || null,
      photo_video:     form.photo_video || null,
      birth_date:      form.birth_date || null,
      engagement_date: form.engagement_date || null,
      engagement_time: form.engagement_time || null,
      wedding_date:    form.wedding_date || null,
      wedding_time:    form.wedding_time || null,
      waist:           form.waist ? Number(form.waist) : null,
      hip:             form.hip   ? Number(form.hip)   : null,
      bust:            form.bust  ? Number(form.bust)  : null,
      address:         form.address || null,
      notes:           form.notes || null,
      fitting_date_1:  form.fitting_date_1 || null,
      fitting_time_1:  form.fitting_time_1 || null,
      fitting_date_2:  form.fitting_date_2 || null,
      fitting_time_2:  form.fitting_time_2 || null,
      fitting_date_3:  form.fitting_date_3 || null,
      fitting_time_3:  form.fitting_time_3 || null,
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
              <div><label className="mb-1 block text-xs font-black text-[#6d6256]">Fotoğraf & Video</label>
                <select className={inputCls} value={form.photo_video || ""} onChange={e => setForm((p:any) => ({...p, photo_video: e.target.value}))}>
                  <option value="">Seçilmedi</option><option value="nar_film">Nar Film</option><option value="diger">Diğer</option>
                </select></div>

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
              {[["waist","Bel",55,120],["hip","Basen",75,145],["bust","Üst",70,130]].map(([k,l,min,max]) => (
                <div key={k as string}><label className="mb-1 block text-xs font-black text-[#6d6256]">{l as string}</label>
                  <select className={inputCls} value={form[k as string] || ""} onChange={e => setForm((p:any) => ({...p, [k as string]: e.target.value}))}>
                    <option value="">Seçin</option>
                    {Array.from({length:(max as number)-(min as number)+1},(_,i)=>(min as number)+i).map(v=><option key={v} value={v}>{v} cm</option>)}
                  </select></div>
              ))}

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
              {customer.photo_video && <InfoRow label="Fotoğraf/Video" value={PHOTO_VIDEO[customer.photo_video] || customer.photo_video} />}
              <InfoRow label="Doğum"     value={formatDate(customer.birth_date)} />
              <InfoRow label="Nişan"     value={customer.engagement_date ? `${formatDate(customer.engagement_date)}${customer.engagement_time ? ` · ${customer.engagement_time.slice(0,5)}` : ""}` : null} />
              <InfoRow label="Düğün"     value={customer.wedding_date ? `${formatDate(customer.wedding_date)}${customer.wedding_time ? ` · ${customer.wedding_time.slice(0,5)}` : ""}` : null} />
              <InfoRow label="Adres"     value={customer.address} />
              {customer.notes && <InfoRow label="Not" value={customer.notes} />}
            </div>

            {(customer.waist || customer.hip || customer.bust) && (
              <>
                <h3 className="mt-5 mb-3 text-sm font-black uppercase tracking-[0.15em] text-[#b69463]">Ölçüler</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[["Bel","waist"],["Basen","hip"],["Üst","bust"]].map(([l,k]) => (
                    <div key={k} className="rounded-2xl bg-[#f7f0e7] p-3 text-center">
                      <div className="text-[10px] font-black text-[#9d8b74]">{l}</div>
                      <div className="mt-1 text-xl font-black text-[#211b16]">{customer[k] ? `${customer[k]} cm` : "—"}</div>
                    </div>
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
          </div>
        </div>
      </div>
    </AppShell>
  );
}
