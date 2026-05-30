"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { CreditCard, Search, ShoppingBag, TrendingUp, Wallet } from "lucide-react";

type Transaction = {
  id: string;
  type: "rental" | "sale";
  customer_name?: string | null;
  product_name?: string | null;
  total_amount?: number | null;
  deposit_amount?: number | null;
  paid_amount?: number | null;
  remaining_amount?: number | null;
  status?: string | null;
  delivery_date?: string | null;
  return_date?: string | null;
  sale_date?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export default function AccountingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "rental" | "sale">("all");

  async function loadAccounting() {
    setLoading(true);
    setMessage("");

    const [rentalsRes, salesRes] = await Promise.all([
      supabase.from("rentals").select("*").order("created_at", { ascending: false }),
      supabase.from("sales").select("*").order("created_at", { ascending: false }),
    ]);

    if (rentalsRes.error || salesRes.error) {
      setMessage(rentalsRes.error?.message || salesRes.error?.message || "Veri alınamadı.");
      setLoading(false);
      return;
    }

    const rentals: Transaction[] = (rentalsRes.data || []).map((r) => ({ ...r, type: "rental" as const }));
    const sales: Transaction[] = (salesRes.data || []).map((s) => ({ ...s, type: "sale" as const, deposit_amount: s.paid_amount }));

    const all = [...rentals, ...sales].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    setTransactions(all);
    setLoading(false);
  }

  useEffect(() => { loadAccounting(); }, []);

  const filtered = useMemo(() => {
    let list = transactions;
    if (tab !== "all") list = list.filter((t) => t.type === tab);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      [item.customer_name, item.product_name, item.status, item.delivery_date, item.return_date, item.sale_date, item.notes]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [transactions, search, tab]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        const total = Number(item.total_amount || 0);
        const paid = Number(item.deposit_amount || item.paid_amount || 0);
        const remaining = Number(item.remaining_amount ?? Math.max(total - paid, 0));
        const isRental = item.type === "rental";
        acc.total += total;
        acc.paid += paid;
        acc.remaining += remaining;
        if (isRental) acc.rentalTotal += total;
        else acc.saleTotal += total;
        return acc;
      },
      { total: 0, paid: 0, remaining: 0, rentalTotal: 0, saleTotal: 0 }
    );
  }, [transactions]);

  return (
    <AppShell title="Muhasebe">
      <div className="space-y-5 lg:space-y-8">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-[#211b16] via-[#2b231c] to-[#b69463] p-5 text-white shadow-[0_18px_55px_rgba(33,27,22,.16)] lg:rounded-[2rem] lg:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Muhasebe</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] lg:text-4xl">Ödeme ve tahsilat merkezi</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Kiralama ve satış gelirleri, tahsilatlar ve kalan bakiyeler.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:max-w-sm">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Kiralama Cirosu</div>
              <div className="mt-1 text-lg font-black">{formatMoney(totals.rentalTotal)}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Satış Cirosu</div>
              <div className="mt-1 text-lg font-black">{formatMoney(totals.saleTotal)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
          <StatCard title="Toplam Ciro" value={formatMoney(totals.total)} icon={<TrendingUp size={21} />} />
          <StatCard title="Tahsilat" value={formatMoney(totals.paid)} icon={<CreditCard size={21} />} />
          <StatCard title="Bekleyen" value={formatMoney(totals.remaining)} icon={<Wallet size={21} />} dark />
        </div>

        <section className="premium-card p-4 lg:p-7">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="premium-title text-xl">Tahsilat Listesi</h2>
              <p className="premium-muted text-sm">Kiralama ve satış bazlı ödeme takibi</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-3 lg:min-w-[340px]">
              <Search size={18} className="text-[#b69463]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Müşteri, ürün veya tarih ara..." className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]" />
            </div>
          </div>

          <div className="mb-5 flex gap-2">
            {(["all", "rental", "sale"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-xs font-black transition ${tab === t ? "bg-[#211b16] text-white" : "border border-[#eadfce] bg-white text-[#6d6256]"}`}>
                {t === "all" ? "Tümü" : t === "rental" ? "Kiralama" : "Satış"}
              </button>
            ))}
          </div>

          {message ? <div className="rounded-2xl border border-[#eadfce] bg-white/70 p-4 text-sm font-bold text-[#6d6256]">{message}</div> : null}

          <div className="space-y-3">
            {loading ? (
              <EmptyState text="Muhasebe kayıtları yükleniyor..." />
            ) : filtered.length === 0 ? (
              <EmptyState text="Kayıt bulunamadı." />
            ) : (
              filtered.map((item) => {
                const total = Number(item.total_amount || 0);
                const paid = Number(item.deposit_amount || item.paid_amount || 0);
                const remaining = Number(item.remaining_amount ?? Math.max(total - paid, 0));
                const isSale = item.type === "sale";

                return (
                  <div key={`${item.type}-${item.id}`} className="rounded-[1.4rem] border border-[#eadfce] bg-white/65 p-4 shadow-sm transition hover:bg-white/85">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isSale ? "bg-green-100 text-green-700" : "bg-[#b69463]/15 text-[#b69463]"}`}>
                          {isSale ? <ShoppingBag size={18} /> : <CreditCard size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-[#211b16]">{item.customer_name || "Müşteri bilgisi yok"}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${isSale ? "bg-green-100 text-green-700" : "bg-[#b69463]/15 text-[#b69463]"}`}>
                              {isSale ? "Satış" : "Kiralama"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-bold text-[#8a7f72]">
                            {[item.product_name, item.sale_date || item.delivery_date, item.return_date].filter(Boolean).join(" • ") || "Detay yok"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-right lg:min-w-[360px]">
                        <MoneyBox label="Toplam" value={total} />
                        <MoneyBox label="Alınan" value={paid} />
                        <MoneyBox label="Kalan" value={remaining} highlight />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("tr-TR")} TL`;
}

function StatCard({ title, value, icon, dark = false }: { title: string; value: string; icon: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`premium-card p-5 transition hover:-translate-y-0.5 lg:p-7 ${dark ? "bg-[#211b16] text-white" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={`text-sm font-bold ${dark ? "text-white/60" : "premium-muted"}`}>{title}</p>
          <h3 className={`mt-3 text-2xl font-black tracking-[-0.04em] lg:text-3xl ${dark ? "text-white" : "text-[#211b16]"}`}>{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? "bg-white/10 text-[#d8bd84]" : "bg-[#b69463]/15 text-[#b69463]"}`}>{icon}</div>
      </div>
    </div>
  );
}

function MoneyBox({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl px-3 py-2 ${highlight ? "bg-[#211b16] text-white" : "bg-[#f7f0e7] text-[#211b16]"}`}>
      <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${highlight ? "text-white/60" : "text-[#8a7f72]"}`}>{label}</div>
      <div className="mt-1 text-xs font-black lg:text-sm">{formatMoney(value)}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[1.4rem] border border-dashed border-[#d9c9b5] bg-white/45 p-10 text-center text-sm font-bold text-[#8a7f72]">{text}</div>;
}
