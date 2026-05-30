"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle, CalendarDays, Clock, Package,
  RotateCcw, Search, ShoppingBag, UserRound,
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function whatsappLink(phone: string, message: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  const clean = digits.startsWith("90") ? digits : digits.startsWith("0") ? `90${digits.slice(1)}` : digits.length === 10 ? `90${digits}` : digits;
  if (!clean) return "";
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export default function TodayPage() {
  const [rentals,  setRentals]  = useState<any[]>([]);
  const [fittings, setFittings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products,  setProducts]  = useState<any[]>([]);
  const [sales,     setSales]     = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  async function load() {
    setLoading(true);
    const [rr, fr, cr, pr, sr] = await Promise.all([
      supabase.from("rentals")
        .select("*, customers(id,full_name,phone), products(id,name,category,image_url)")
        .order("delivery_date", { ascending: true }),
      supabase.from("fittings")
        .select("*, customers(id,full_name,phone), products(id,name,category,image_url)")
        .order("fitting_date", { ascending: true }),
      supabase.from("customers").select("id,full_name,phone,instagram").order("full_name"),
      supabase.from("products").select("id,name,barcode,category,color,size,image_url,status").order("name"),
      supabase.from("sales").select("*, customers(full_name)").order("created_at", { ascending: false }),
    ]);
    setRentals(rr.data || []);
    setFittings(fr.data || []);
    setCustomers(cr.data || []);
    setProducts(pr.data || []);
    setSales(sr.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const fittingsToday  = fittings.filter(x => x.fitting_date === today);
    const readyFittings  = fittings.filter(x => x.status === "teslime_hazir");
    const deliveries     = rentals.filter(x => x.delivery_date === today);
    const returns        = rentals.filter(x => x.return_date === today);
    const overdue        = rentals.filter(x => x.return_date < today && !["tamamlandi","iptal"].includes(x.status));
    const unpaid         = rentals.filter(x => Number(x.remaining_amount || 0) > 0);
    return { fittingsToday, readyFittings, deliveries, returns, overdue, unpaid };
  }, [rentals, fittings, today]);

  const todayFlow = useMemo(() => {
    const items = [
      ...stats.fittingsToday.map(x => ({ ...x, flowType: "Prova",  flowTime: x.fitting_time  || "00:00" })),
      ...stats.deliveries.map(x  => ({ ...x, flowType: "Teslim", flowTime: x.delivery_time || "00:00" })),
      ...stats.returns.map(x     => ({ ...x, flowType: "İade",   flowTime: x.return_time   || "00:00" })),
    ];
    return items.sort((a, b) => a.flowTime.localeCompare(b.flowTime));
  }, [stats]);

  async function completeDelivery(item: any) {
    await supabase.from("rentals").update({ status: "aktif" }).eq("id", item.id);
    if (item.product_id) await supabase.from("products").update({ status: "kirada" }).eq("id", item.product_id);
    load();
  }

  async function completeReturn(item: any) {
    await supabase.from("rentals").update({ status: "tamamlandi" }).eq("id", item.id);
    if (item.product_id) await supabase.from("products").update({ status: "stokta" }).eq("id", item.product_id);
    load();
  }

  const q = search.trim().toLowerCase();
  const customerResults = useMemo(() => {
    if (!q) return [];
    return customers.filter(c =>
      [c.full_name, c.phone, c.instagram].filter(Boolean).join(" ").toLowerCase().includes(q)
    ).slice(0, 5).map(c => {
      const cRentals = rentals.filter(r => r.customer_id === c.id);
      const cSales   = sales.filter(s => s.customer_id === c.id);
      const remaining = [...cRentals, ...cSales].reduce((s, x) => s + Number(x.remaining_amount || 0), 0);
      return { ...c, remaining, operationCount: cRentals.length + cSales.length };
    });
  }, [q, customers, rentals, sales]);

  const productResults = useMemo(() => {
    if (!q) return [];
    return products.filter(p =>
      [p.name, p.barcode, p.category, p.color, p.size].filter(Boolean).join(" ").toLowerCase().includes(q)
    ).slice(0, 5);
  }, [q, products]);

  return (
    <AppShell title="Bugün">
      <div className="space-y-5 pb-24 lg:space-y-7 lg:pb-0">

        {/* Header */}
        <section className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">MAUNA Personel</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Bugün ne var?</h1>
          <p className="mt-2 text-sm text-white/70">{formatDate(today)} — Tüm operasyonlar tek ekranda</p>
          <div className="mt-5 grid grid-cols-3 gap-2 lg:grid-cols-6">
            {[
              ["Prova", stats.fittingsToday.length, false],
              ["Teslim", stats.deliveries.length, false],
              ["İade", stats.returns.length, false],
              ["Geciken", stats.overdue.length, true],
              ["Hazır", stats.readyFittings.length, false],
              ["Ödeme", stats.unpaid.length, stats.unpaid.length > 0],
            ].map(([label, value, danger]) => (
              <div key={label as string} className={`rounded-2xl p-3 text-center ${danger ? "bg-red-500/30" : "bg-white/10"}`}>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">{label}</div>
                <div className="mt-1 text-2xl font-black text-white">{value as number}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Arama */}
        <section className="premium-card p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/75 px-4 py-3">
            <Search size={18} className="text-[#b69463]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Müşteri adı, telefon, ürün veya barkod ara..."
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]" />
          </div>

          {(customerResults.length > 0 || productResults.length > 0) && (
            <div className="mt-3 space-y-2">
              {customerResults.map(c => (
                <div key={c.id} className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-[#211b16]">{c.full_name}</div>
                      <div className="mt-0.5 text-xs text-[#9d8b74]">{c.phone}</div>
                      <div className="mt-2 flex gap-2">
                        <span className="rounded-full bg-[#f7f0e7] px-3 py-1 text-[11px] font-black text-[#6d6256]">{c.operationCount} işlem</span>
                        {c.remaining > 0 && <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-black text-red-700">{c.remaining.toLocaleString("tr-TR")} ₺ borç</span>}
                      </div>
                    </div>
                    <Link href={`/customers/${c.id}`} className="shrink-0 rounded-2xl bg-[#211b16] px-4 py-2 text-xs font-black text-white">Kart</Link>
                  </div>
                </div>
              ))}
              {productResults.map(p => (
                <div key={p.id} className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
                  <div className="flex items-center gap-3">
                    {p.image_url
                      ? <img src={p.image_url} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]"><Package size={18} /></div>
                    }
                    <div className="flex-1">
                      <div className="font-black text-[#211b16]">{p.name}</div>
                      <div className="text-xs text-[#9d8b74]">{[p.category, p.color, p.size, p.barcode].filter(Boolean).join(" · ")}</div>
                    </div>
                    <span className={`shrink-0 rounded-xl px-3 py-1 text-xs font-black ${p.status === "stokta" ? "bg-green-100 text-green-700" : p.status === "satildi" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_.8fr]">

          {/* Günlük akış */}
          <section className="premium-card p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]"><Clock size={20} /></div>
              <div>
                <h2 className="text-xl font-black text-[#1f1b16]">Günlük Akış</h2>
                <p className="text-sm text-[#8b8177]">Bugünkü prova, teslim ve iadeler</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#f7f0e7]" />)}
                </div>
              ) : todayFlow.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-sm font-bold text-[#8a7f72]">
                  Bugün için planlanmış işlem yok 🎉
                </div>
              ) : todayFlow.map(item => {
                const isReturn  = item.flowType === "İade";
                const isFitting = item.flowType === "Prova";
                const customerName = item.customers?.full_name || "—";
                const phone        = item.customers?.phone || "";
                const productName  = item.products?.name || "—";
                const productImg   = item.products?.image_url;

                const waMsg = isFitting
                  ? `Merhaba ${customerName}, MAUNA Couture prova randevunuz bugün saat ${item.fitting_time?.slice(0,5) || ""} olarak planlanmıştır. Sizi bekliyoruz.`
                  : isReturn
                  ? `Merhaba ${customerName}, MAUNA Couture'dan kiraladığınız ${productName} için iade tarihiniz bugündür.`
                  : `Merhaba ${customerName}, ${productName} tesliminiz bugün planlanmıştır. MAUNA Couture olarak sizi bekliyoruz.`;

                return (
                  <div key={`${item.id}-${item.flowType}`} className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
                    <div className="flex items-start gap-3">
                      {productImg
                        ? <img src={productImg} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                        : <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${isReturn ? "bg-red-100 text-red-600" : isFitting ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                            {isReturn ? <RotateCcw size={20} /> : isFitting ? <UserRound size={20} /> : <Package size={20} />}
                          </div>
                      }
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${isReturn ? "bg-red-100 text-red-700" : isFitting ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                            {item.flowType}
                          </span>
                          <span className="text-xs font-black text-[#9d8b74]">{item.flowTime?.slice(0,5)}</span>
                        </div>
                        <div className="mt-1 font-black text-[#211b16]">{customerName}</div>
                        <div className="text-xs text-[#9d8b74]">{productName}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.customer_id && (
                            <Link href={`/customers/${item.customer_id}`} className="rounded-xl bg-[#211b16] px-3 py-1.5 text-xs font-black text-white">Müşteri</Link>
                          )}
                          {phone && (
                            <a href={whatsappLink(phone, waMsg)} target="_blank" className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-black text-white">WhatsApp</a>
                          )}
                          {item.flowType === "Teslim" && (
                            <button onClick={() => completeDelivery(item)} className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white">Teslim Edildi ✓</button>
                          )}
                          {item.flowType === "İade" && (
                            <button onClick={() => completeReturn(item)} className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-black text-white">İadeyi Al ✓</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Sağ panel */}
          <div className="space-y-5">

            {/* Kritik uyarılar */}
            <section className="premium-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600"><AlertTriangle size={20} /></div>
                <div>
                  <h2 className="text-xl font-black text-[#1f1b16]">Kritik Uyarılar</h2>
                  <p className="text-sm text-[#8b8177]">Geciken ve bekleyen işlemler</p>
                </div>
              </div>

              <div className="space-y-2">
                {stats.overdue.length === 0 && stats.unpaid.length === 0 && stats.readyFittings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-6 text-center text-sm font-bold text-[#8a7f72]">Kritik uyarı yok ✓</div>
                ) : null}

                {stats.overdue.map(item => (
                  <div key={item.id} className="rounded-2xl border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide text-red-700">Geciken İade</div>
                        <div className="text-sm font-black text-[#211b16]">{item.customers?.full_name || "—"}</div>
                        <div className="text-xs text-red-600">{item.products?.name} · İade: {formatDate(item.return_date)}</div>
                      </div>
                      {item.customers?.phone && (
                        <a href={whatsappLink(item.customers.phone, `Merhaba ${item.customers.full_name}, MAUNA Couture kiraladığınız ${item.products?.name || "ürün"} için iade tarihiniz geçmiştir. Lütfen en kısa sürede iade yapınız.`)}
                          target="_blank" className="shrink-0 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-black text-white">WA</a>
                      )}
                    </div>
                  </div>
                ))}

                {stats.readyFittings.map(item => (
                  <div key={item.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                    <div className="text-[10px] font-black uppercase tracking-wide text-amber-700">Teslime Hazır Prova</div>
                    <div className="text-sm font-black text-[#211b16]">{item.customers?.full_name || "—"}</div>
                    <div className="text-xs text-amber-600">{item.products?.name || "Ürün belirtilmedi"}</div>
                  </div>
                ))}

                {stats.unpaid.slice(0, 4).map(item => (
                  <div key={item.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide text-orange-700">Kalan Ödeme</div>
                        <div className="text-sm font-black text-[#211b16]">{item.customers?.full_name || "—"}</div>
                        <div className="text-xs text-orange-600">{Number(item.remaining_amount).toLocaleString("tr-TR")} ₺</div>
                      </div>
                      {item.customers?.phone && (
                        <a href={whatsappLink(item.customers.phone, `Merhaba ${item.customers?.full_name}, MAUNA Couture işleminiz için kalan ödemeniz ${Number(item.remaining_amount).toLocaleString("tr-TR")} ₺'dir.`)}
                          target="_blank" className="shrink-0 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-black text-white">WA</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Hızlı işlemler */}
            <section className="premium-card p-5">
              <h2 className="mb-4 text-xl font-black text-[#1f1b16]">Hızlı İşlemler</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/rentals",   label: "Kiralama",  icon: <CalendarDays size={18} /> },
                  { href: "/sales",     label: "Satış",     icon: <ShoppingBag size={18} /> },
                  { href: "/returns",   label: "İade Al",   icon: <RotateCcw size={18} /> },
                  { href: "/customers", label: "Müşteri",   icon: <UserRound size={18} /> },
                  { href: "/fittings",  label: "Prova",     icon: <UserRound size={18} /> },
                  { href: "/products",  label: "Ürünler",   icon: <Package size={18} /> },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#eadfce] bg-white/70 text-center text-xs font-black text-[#211b16] hover:bg-white/90">
                    <span className="text-[#b69463]">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
