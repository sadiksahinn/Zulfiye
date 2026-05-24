"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      setProduct(data);
      setLoading(false);
    }

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  if (loading) {
    return (
      <AppShell title="Ürün Detayı">
        <div className="premium-card p-8">
          Yükleniyor...
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell title="Ürün Detayı">
        <div className="premium-card p-8">
          Ürün bulunamadı.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Ürün Detayı">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="premium-card p-6">
          {product.image_url ? (
            <img
              src={product.image_url}
              className="w-full rounded-3xl object-cover"
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-20 text-center text-[#8b8177]">
              Görsel yok
            </div>
          )}
        </div>

        <div className="premium-card p-8">
          <h1 className="text-4xl font-black text-[#211b16]">
            {product.name}
          </h1>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Info title="Barkod" value={product.barcode} />
            <Info title="Durum" value={product.status} />
            <Info title="Beden" value={product.size} />
            <Info title="Renk" value={product.color} />
            <Info
              title="Satış"
              value={
                product.sale_price
                  ? `${Number(product.sale_price).toLocaleString("tr-TR")} TL`
                  : "-"
              }
            />
            <Info
              title="Kiralama"
              value={
                product.rental_price
                  ? `${Number(product.rental_price).toLocaleString("tr-TR")} TL`
                  : "-"
              }
            />
          </div>

          <a
            href="/products"
            className="mt-6 flex items-center justify-center rounded-2xl bg-[#211b16] py-4 text-white font-black"
          >
            Ürün Listesine Dön
          </a>
        </div>
      </div>
    </AppShell>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfce] p-4">
      <div className="text-sm text-[#8b8177]">
        {title}
      </div>

      <div className="mt-2 font-semibold text-[#211b16]">
        {value || "-"}
      </div>
    </div>
  );
}