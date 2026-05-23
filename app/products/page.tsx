"use client";

import { useEffect, useMemo, useState } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  status: string;
  size: string | null;
  color: string | null;
  model_name: string | null;
  sale_price: number | null;
  rental_price: number | null;
  image_url: string | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [form, setForm] = useState({
    name: "",
    category: "GL",
    modelName: "",
    productCode: "",
    size: "",
    color: "",
    operationType: "kiralama_satis",
    purchasePrice: "",
    salePrice: "",
    rentalPrice: "",
    notes: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectImage(file: File | null) {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts((data || []) as Product[]);
  }

  async function createProduct() {
    setMessage("");

    if (!form.name || !image) {
      setMessage("Ürün adı ve fotoğraf zorunludur.");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    const { data: barcodeData, error: barcodeError } = await supabase.rpc(
      "generate_mauna_barcode",
      { p_category_code: form.category }
    );

    if (barcodeError || !barcodeData) {
      setMessage("Barkod oluşturulamadı.");
      setLoading(false);
      return;
    }

    const newBarcode = barcodeData as string;
    const fileExt = image.name.split(".").pop();
    const filePath = `${newBarcode}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, image, { upsert: true });

    if (uploadError) {
      setMessage("Fotoğraf yüklenemedi. Storage policy gerekebilir.");
      setLoading(false);
      return;
    }

    const { data: imageUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("products").insert({
      barcode: newBarcode,
      product_code: form.productCode,
      name: form.name,
      category: form.category,
      operation_type: form.operationType,
      size: form.size,
      color: form.color,
      model_name: form.modelName,
      purchase_price: Number(form.purchasePrice || 0),
      sale_price: Number(form.salePrice || 0),
      rental_price: Number(form.rentalPrice || 0),
      status: "stokta",
      image_url: imageUrlData.publicUrl,
      notes: form.notes,
      created_by: userData.user?.id,
    });

    if (insertError) {
      setMessage("Ürün kaydedilemedi.");
      setLoading(false);
      return;
    }

    setBarcode(newBarcode);
    setMessage("Ürün başarıyla eklendi.");
    setLoading(false);
    loadProducts();
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();

      const matchesSearch =
        p.name?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.model_name?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q) ||
        p.size?.toLowerCase().includes(q);

      const matchesCategory =
        filterCategory === "all" || p.category === filterCategory;

      const matchesStatus =
        filterStatus === "all" || p.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, filterCategory, filterStatus]);

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <AppShell title="Ürün Yönetimi">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="premium-card p-8">
          <h2 className="premium-title text-2xl">Yeni Ürün Ekle</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <input className="input md:col-span-2" placeholder="Ürün adı *" value={form.name} onChange={(e) => updateField("name", e.target.value)} />

            <select className="input" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
              <option value="GL">Gelinlik</option>
              <option value="KN">Kına Kıyafeti</option>
              <option value="NS">Nişanlık</option>
              <option value="AB">Abiye</option>
              <option value="AK">Aksesuar</option>
            </select>

            <select className="input" value={form.operationType} onChange={(e) => updateField("operationType", e.target.value)}>
              <option value="kiralama_satis">Kiralama + Satış</option>
              <option value="kiralama">Sadece Kiralama</option>
              <option value="satis">Sadece Satış</option>
            </select>

            <input className="input" placeholder="Model adı" value={form.modelName} onChange={(e) => updateField("modelName", e.target.value)} />
            <input className="input" placeholder="Model / ürün kodu" value={form.productCode} onChange={(e) => updateField("productCode", e.target.value)} />
            <input className="input" placeholder="Beden" value={form.size} onChange={(e) => updateField("size", e.target.value)} />
            <input className="input" placeholder="Renk" value={form.color} onChange={(e) => updateField("color", e.target.value)} />
            <input className="input" type="number" inputMode="decimal" min="0" placeholder="Alış fiyatı ₺" value={form.purchasePrice} onChange={(e) => updateField("purchasePrice", e.target.value)} />
            <input className="input" type="number" inputMode="decimal" min="0" placeholder="Satış fiyatı ₺" value={form.salePrice} onChange={(e) => updateField("salePrice", e.target.value)} />
            <input className="input" type="number" inputMode="decimal" min="0" placeholder="Kiralama fiyatı ₺" value={form.rentalPrice} onChange={(e) => updateField("rentalPrice", e.target.value)} />

            <textarea className="input md:col-span-2 min-h-28" placeholder="Notlar" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />

            <label className="md:col-span-2 rounded-3xl border border-dashed border-[#d9c9b5] p-6 cursor-pointer bg-white/50">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => selectImage(e.target.files?.[0] || null)} />
              {preview ? (
                <img src={preview} className="h-64 w-full object-cover rounded-2xl" />
              ) : (
                <div className="text-center premium-muted">
                  Ürün fotoğrafı yükle *
                  <br />
                  <span className="text-xs">Fotoğraf zorunludur.</span>
                </div>
              )}
            </label>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl bg-white/70 border border-[#eadfce] p-4 text-[#6d6256]">
              {message}
            </div>
          )}

          <button
            onClick={createProduct}
            disabled={loading}
            className="premium-button mt-6 w-full py-4 disabled:opacity-60"
          >
            {loading ? "Ürün ekleniyor..." : "Ürün Ekle — Barkod ve QR Oluştur"}
          </button>
        </div>

        <div className="premium-card p-8">
          <h2 className="premium-title text-2xl">Baskıya Hazır Etiket</h2>

          {barcode ? (
            <div className="mt-8">
              <div className="bg-white border border-[#eadfce] rounded-3xl p-6">
                {preview && <img src={preview} className="h-56 w-full object-cover rounded-2xl mb-5" />}

                <div className="text-center">
                  <p className="text-xs tracking-[0.3em] text-[#b69463]">MAUNA COUTURE</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#1f1b16]">{form.name}</h3>
                  <p className="mt-1 text-sm text-[#8b8177]">
                    {form.modelName || "Model"} • {form.size || "Beden"} • {form.color || "Renk"}
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-6">
                    <Barcode value={barcode} height={60} fontSize={12} />
                    <QRCodeSVG value={barcode} size={96} />
                  </div>

                  <p className="mt-4 font-semibold text-[#1f1b16]">{barcode}</p>
                </div>
              </div>

              <button onClick={() => window.print()} className="mt-6 w-full rounded-2xl bg-[#1f1b16] py-4 text-white font-semibold">
                Etiketi Yazdır
              </button>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-[#d9c9b5] p-12 text-center premium-muted">
              Ürün eklenince barkod ve QR etiketi burada oluşacak.
            </div>
          )}
        </div>
      </div>

      <div className="premium-card p-8 mt-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <h2 className="premium-title text-2xl">Ürün Listesi</h2>
            <p className="premium-muted mt-2">Fotoğraflı ürün teyidi, barkod ve filtreleme.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="input" placeholder="Ara: isim, barkod, model..." value={search} onChange={(e) => setSearch(e.target.value)} />

            <select className="input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">Tüm kategoriler</option>
              <option value="GL">Gelinlik</option>
              <option value="KN">Kına</option>
              <option value="NS">Nişanlık</option>
              <option value="AB">Abiye</option>
              <option value="AK">Aksesuar</option>
            </select>

            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tüm durumlar</option>
              <option value="stokta">Stokta</option>
              <option value="kirada">Kirada</option>
              <option value="provada">Provada</option>
              <option value="tadilatta">Tadilatta</option>
              <option value="temizlemede">Temizlemede</option>
              <option value="satildi">Satıldı</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-dashed border-[#d9c9b5] p-12 text-center premium-muted">
              Ürün bulunamadı.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="rounded-[1.7rem] border border-[#eadfce] bg-white/70 overflow-hidden shadow-lg">
                {product.image_url ? (
                  <img src={product.image_url} className="h-64 w-full object-cover" />
                ) : (
                  <div className="h-64 bg-[#f5efe7] flex items-center justify-center premium-muted">
                    Fotoğraf yok
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[#211b16]">{product.name}</h3>
                      <p className="mt-1 text-sm premium-muted">{product.model_name || "Model yok"}</p>
                    </div>

                    <span className="rounded-full bg-[#b69463]/15 px-3 py-1 text-xs text-[#b69463]">
                      {product.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="premium-muted">Beden</p>
                      <p className="font-semibold">{product.size || "-"}</p>
                    </div>

                    <div className="rounded-2xl bg-white p-3">
                      <p className="premium-muted">Renk</p>
                      <p className="font-semibold">{product.color || "-"}</p>
                    </div>

                    <div className="rounded-2xl bg-white p-3">
                      <p className="premium-muted">Satış</p>
                      <p className="font-semibold">₺{product.sale_price || 0}</p>
                    </div>

                    <div className="rounded-2xl bg-white p-3">
                      <p className="premium-muted">Kiralama</p>
                      <p className="font-semibold">₺{product.rental_price || 0}</p>
                    </div>
                  </div>

                  <a
                    href={`/products/${product.id}`}
                    className="mt-5 block rounded-2xl bg-[#211b16] py-3 text-center text-white font-semibold"
                  >
                    Ürün Detayı
                  </a>

                  <div className="mt-5 rounded-2xl bg-white p-4 text-center">
                    <Barcode value={product.barcode} height={45} fontSize={10} />
                    <p className="mt-2 text-xs font-semibold">{product.barcode}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
