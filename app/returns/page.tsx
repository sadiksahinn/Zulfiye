"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  barcode: string;
  name: string;
  color: string | null;
  size: string | null;
  status: string;
  image_url: string | null;
};

type Rental = {
  id: string;
  product_id: string;
  customer_id: string;
  delivery_date: string | null;
  return_date: string | null;
  total_amount: number | null;
  deposit_amount: number | null;
  remaining_amount: number | null;
  status: string;
  customers?: {
    full_name: string;
    phone: string;
  };
  products?: Product;
};

export default function ReturnsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [returnStatus, setReturnStatus] = useState("stokta");
  const [note, setNote] = useState("");
  const [penalty, setPenalty] = useState("");
  const [message, setMessage] = useState("");

  async function loadRentals() {
    const { data } = await supabase
      .from("rentals")
      .select("*, customers(full_name, phone), products(*)")
      .in("status", ["aktif", "rezerve"])
      .order("return_date", { ascending: true });

    setRentals((data || []) as Rental[]);
  }

  useEffect(() => {
    loadRentals();
  }, []);

  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rentals;

    return rentals.filter((r) => {
      return (
        r.products?.barcode?.toLowerCase().includes(q) ||
        r.products?.name?.toLowerCase().includes(q) ||
        r.customers?.full_name?.toLowerCase().includes(q) ||
        r.customers?.phone?.includes(q)
      );
    });
  }, [rentals, search]);

  async function completeReturn() {
    setMessage("");

    if (!selectedRental || !selectedRental.products) {
      setMessage("Önce kiralama seçmelisin.");
      return;
    }

    if ((returnStatus === "hasarli" || returnStatus === "tadilatta") && !note) {
      setMessage("Hasarlı veya tadilat durumunda not zorunludur.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const productStatus =
      returnStatus === "stokta"
        ? "stokta"
        : returnStatus === "temizlemede"
        ? "temizlemede"
        : returnStatus === "tadilatta"
        ? "tadilatta"
        : returnStatus === "hasarli"
        ? "hasarli"
        : "stokta";

    await supabase
      .from("rentals")
      .update({
        status: "tamamlandi",
        notes: note || selectedRental.status,
      })
      .eq("id", selectedRental.id);

    await supabase
      .from("products")
      .update({
        status: productStatus,
      })
      .eq("id", selectedRental.product_id);

    if (returnStatus === "hasarli") {
      await supabase.from("damage_reports").insert({
        product_id: selectedRental.product_id,
        customer_id: selectedRental.customer_id,
        rental_id: selectedRental.id,
        damage_type: "İade Hasarı",
        description: note,
        penalty_amount: Number(penalty || 0),
        created_by: userData.user?.id,
      });
    }

    if (returnStatus === "temizlemede") {
      await supabase.from("cleaning_records").insert({
        product_id: selectedRental.product_id,
        status: "bekliyor",
        sent_date: new Date().toISOString().slice(0, 10),
        note,
        created_by: userData.user?.id,
      });

      await supabase.from("calendar_events").insert({
        product_id: selectedRental.product_id,
        customer_id: selectedRental.customer_id,
        rental_id: selectedRental.id,
        title: `Kuru temizleme: ${selectedRental.products.name}`,
        event_type: "cleaning",
        event_date: new Date().toISOString().slice(0, 10),
        event_time: new Date().toTimeString().slice(0, 5),
        description: note || "Ürün kuru temizlemeye yönlendirildi.",
        created_by: userData.user?.id,
      });
    }

    if (returnStatus === "tadilatta") {
      await supabase.from("alteration_records").insert({
        product_id: selectedRental.product_id,
        customer_id: selectedRental.customer_id,
        title: "İade sonrası tadilat",
        description: note,
        status: "bekliyor",
        created_by: userData.user?.id,
      });

      await supabase.from("calendar_events").insert({
        product_id: selectedRental.product_id,
        customer_id: selectedRental.customer_id,
        rental_id: selectedRental.id,
        title: `Tadilat: ${selectedRental.products.name}`,
        event_type: "alteration",
        event_date: new Date().toISOString().slice(0, 10),
        event_time: new Date().toTimeString().slice(0, 5),
        description: note,
        created_by: userData.user?.id,
      });
    }

    await supabase.from("product_logs").insert({
      product_id: selectedRental.product_id,
      action: "İade alındı",
      old_status: selectedRental.products.status,
      new_status: productStatus,
      note: note || "Ürün iade alındı.",
      created_by: userData.user?.id,
    });

    setMessage("İade işlemi tamamlandı.");
    setSelectedRental(null);
    setNote("");
    setPenalty("");
    setReturnStatus("stokta");
    loadRentals();
  }

  return (
    <AppShell title="İade / Teslim Operasyonu">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 premium-card p-8">
          <h2 className="premium-title text-2xl">Aktif Kiralama Ara</h2>

          <input
            className="input mt-6"
            placeholder="Barkod, ürün adı, müşteri adı veya telefon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="mt-6 space-y-4">
            {results.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center premium-muted">
                Aktif kiralama bulunamadı.
              </div>
            ) : (
              results.map((rental) => (
                <button
                  key={rental.id}
                  onClick={() => setSelectedRental(rental)}
                  className="w-full rounded-3xl border border-[#eadfce] bg-white/70 p-5 text-left hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-5">
                    {rental.products?.image_url && (
                      <img
                        src={rental.products.image_url}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#211b16]">
                        {rental.products?.name} {rental.products?.color || ""} {rental.products?.size || ""}
                      </h3>

                      <p className="text-sm premium-muted mt-1">
                        {rental.products?.barcode}
                      </p>

                      <p className="text-sm premium-muted mt-1">
                        Müşteri: {rental.customers?.full_name} • İade: {rental.return_date || "-"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="premium-card p-8">
          <h2 className="premium-title text-2xl">İade İşlemi</h2>

          {selectedRental && selectedRental.products ? (
            <div className="mt-6">
              {selectedRental.products.image_url && (
                <img
                  src={selectedRental.products.image_url}
                  className="h-72 w-full rounded-3xl object-cover"
                />
              )}

              <h3 className="mt-5 text-2xl font-semibold text-[#211b16]">
                {selectedRental.products.name}
              </h3>

              <p className="mt-2 premium-muted">
                {selectedRental.customers?.full_name} • {selectedRental.products.barcode}
              </p>

              <div className="mt-6 grid gap-4">
                <select
                  className="input"
                  value={returnStatus}
                  onChange={(e) => setReturnStatus(e.target.value)}
                >
                  <option value="stokta">Sorunsuz geldi → Stokta</option>
                  <option value="temizlemede">Kuru temizlemeye gidecek</option>
                  <option value="tadilatta">Tadilata gidecek</option>
                  <option value="hasarli">Hasarlı geldi</option>
                </select>

                <textarea
                  className="input min-h-28"
                  placeholder="İade notu / hasar / eksik parça"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                {returnStatus === "hasarli" && (
                  <div className="money-input-wrapper">
                    <input
                      className="input money-input"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      placeholder="Ceza / hasar bedeli"
                      value={penalty}
                      onChange={(e) => setPenalty(e.target.value)}
                    />
                    <span className="money-badge">₺</span>
                  </div>
                )}

                <button onClick={completeReturn} className="premium-button py-4">
                  İadeyi Tamamla
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center premium-muted">
              İade almak için soldan aktif kiralama seç.
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-2xl bg-white/70 border border-[#eadfce] p-4 text-[#6d6256]">
              {message}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
