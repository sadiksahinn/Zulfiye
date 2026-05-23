"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { RotateCcw } from "lucide-react";

export default function ReturnsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await supabase
      .from("rentals")
      .select("*")
      .order("created_at", { ascending: false });

    setRentals(data || []);
  }

  async function completeReturn(rental: any) {
    setMessage("");

    const { error } = await supabase
      .from("rentals")
      .update({ status: "iade_alindi", return_completed_at: new Date().toISOString() })
      .eq("id", rental.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (rental.product_id) {
      await supabase.from("products").update({ status: "stokta" }).eq("id", rental.product_id);
    }

    setMessage("İade alındı, ürün stoğa döndü.");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell title="İade">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-7 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)]">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA İade Yönetimi</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">İade operasyonları</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">Kiradaki ürünleri takip edin, iade alınca ürünü otomatik stoğa döndürün.</p>
        </div>

        {message && <div className="premium-card p-4 text-sm font-bold text-[#6d6256]">{message}</div>}

        <div className="premium-card p-6">
          <h2 className="premium-title text-2xl">İade Bekleyenler</h2>

          <div className="mt-5 space-y-3">
            {rentals.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center premium-muted">Kayıt bulunmuyor.</div>
            ) : (
              rentals.map((rental) => (
                <div key={rental.id} className="rounded-[1.4rem] border border-[#eadfce] bg-white/65 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="font-black text-[#211b16]">{rental.product_name || `Kiralama #${String(rental.id).slice(0, 8)}`}</h3>
                      <p className="mt-1 text-sm font-bold text-[#8a7f72]">
                        {rental.customer_name || "Müşteri bilgisi yok"} • İade: {rental.return_date || "-"} • {rental.status || "aktif"}
                      </p>
                    </div>

                    <button
                      onClick={() => completeReturn(rental)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#211b16] px-5 py-3 text-sm font-black text-white"
                    >
                      <RotateCcw size={17} /> İade Al
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
