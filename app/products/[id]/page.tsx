"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib
cat > 'app/products/[id]/page.tsx' <<'EOF'
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function loadProduct() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      setProduct(data);
    }

    if (params.id) loadProduct();
  }, [params.id]);

  if (!product) {
    return (
      <AppShell title="Ürün Detayı">
        <div className="premium-card p-8">Yükleniyor...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Ürün Detayı">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="premium-card p-6">
          {product.image_url && (
            <img src={product.image_url} className="w-full rounded-3xl object-cover" />
          )}
        </div>

        <div className="premium-card p-8">
          <h1 className="text-4xl font-black text-[#211b16]">{product.name}</h1>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Info title="Barkod" value={product.barcode} />
            <Info title="Durum" value={product.status} />
            <Info title="Beden" value={product.size} />
            <Info title="Renk" value={product.color} />
            <Info title="Satış" value={`₺${product.sale_price || 0}`} />
            <Info title="Kiralama" value={`₺${product.rental_price || 0}`} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eadfce] p-4">
      <div className="text-sm text-[#8b8177]">{title}</div>
      <div className="mt-2 font-semibold text-[#211b16]">{value || "-"}</div>
    </div>
  );
}
