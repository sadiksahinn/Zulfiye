"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, CheckCircle2, RotateCcw, Search } from "lucide-react";

type Rental = {
  id: string;
  delivery_date?: string | null;
  return_date?: string | null;
  status?: string | null;
  total_amount?: number | null;
  remaining_amount?: number | null;
  customer_name?: string | null;
  product_name?: string | null;
  product_id?: string | null;
};

export default function ReturnsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("rentals")
      .select("*")
      .in("status", ["aktif", "gecikti"])
      .order("return_date", { ascending: true });

    setRentals((data || []) as Rental[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return rentals.filter((r) =>
      [
        r.customer_name,
        r.product_name,
        r.return_date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rentals, search]);

  async function completeReturn(rental: Rental) {
    setMessage("");
    setProcessingId(rental.id);

    const { error } = await supabase
      .from("rentals")
      .update({
        status: "tamamlandi",
      })
      .eq("id", rental.id);

    if (error) {
      setMessage("İade tamamlanamadı.");
      setProcessingId(null);
      return;
    }

    if (rental.product_id) {
      const { error: productError } = await supabase
        .from("products")
        .update({
          status: "stokta",
        })
        .eq("id", rental.product_id);

      if (productError) {
        setMessage("İade alındı fakat ürün stoğa döndürülemedi.");
        setProcessingId(null);
        load();
        return;
      }
    }

    setMessage("İade başarıyla tamamlandı, ürün stoğa döndü.");
    setProcessingId(null);
    load();
  }

  const delayedCount = rentals.filter((x) => x.status === "gecikti").length;

  return (
    <AppShell title="İadeler">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">

        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)] lg:p-8">

          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">
                MAUNA İade Merkezi
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] lg:text-5xl">
                Ürün İadeleri
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Aktif kiralamaları takip edin ve iadeleri yönetin.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                  Aktif
                </div>

                <div className="mt-2 text-sm font-black text-white">
                  {rentals.length} işlem
                </div>
              </div>

              <div className="rounded-2xl bg-red-500/20 p-4 backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-100">
                  Geciken
                </div>

                <div className="mt-2 text-sm font-black text-white">
                  {delayedCount} ürün
                </div>
              </div>
            </div>
          </div>
        </div>

        {message ? (
          <div className="premium-card p-4 text-sm font-black text-[#6d6256]">
            {message}
          </div>
        ) : null}

        <div className="premium-card p-6">

          <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-4">
            <Search size={18} className="text-[#b69463]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Müşteri, ürün veya tarih ara"
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#9f9386]"
            />
          </div>

          <div className="mt-6 space-y-4">

            {loading ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-12 text-center text-sm font-bold text-[#8a7f72]">
                İade kayıtları yükleniyor...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-12 text-center text-sm font-bold text-[#8a7f72]">
                Aktif iade bulunamadı.
              </div>
            ) : (
              filtered.map((rental) => (
                <div
                  key={rental.id}
                  className="rounded-[1.7rem] border border-[#eadfce] bg-white/70 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                      <div className="flex items-center gap-2">

                        <div className={`rounded-full px-3 py-1 text-xs font-black ${
                          rental.status === "gecikti"
                            ? "bg-red-100 text-red-700"
                            : "bg-[#f7f0e7] text-[#211b16]"
                        }`}>
                          {rental.status}
                        </div>

                        {rental.status === "gecikti" ? (
                          <AlertTriangle size={16} className="text-red-600" />
                        ) : null}
                      </div>

                      <h3 className="mt-4 text-2xl font-black text-[#211b16]">
                        {rental.product_name || "Ürün"}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-[#8a7f72]">
                        {rental.customer_name || "Müşteri"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">

                        <Info
                          label="Teslim"
                          value={rental.delivery_date || "-"}
                        />

                        <Info
                          label="İade"
                          value={rental.return_date || "-"}
                        />

                        <Info
                          label="Kalan"
                          value={`${Number(rental.remaining_amount || 0).toLocaleString("tr-TR")} TL`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => completeReturn(rental)}
                      disabled={processingId === rental.id}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#211b16] px-6 py-4 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-60"
                    >
                      <CheckCircle2 size={18} />
                      {processingId === rental.id ? "İşleniyor..." : "İadeyi Tamamla"}
                    </button>
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

function Info({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-[#f7f0e7] px-4 py-3">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a7f72]">
        {label}
      </div>

      <div className="mt-1 text-sm font-black text-[#211b16]">
        {value}
      </div>
    </div>
  );
}
