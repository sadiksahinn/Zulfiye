"use client";

import { useEffect, useMemo, useState } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";

type Product = {
  id: string; barcode: string; name: string; category: string; status: string;
  size: string | null; color: string | null; model_name: string | null;
  sale_price: number | null; rental_price: number | null; image_url: string | null;
};

const CATEGORIES = ["Gelinlik", "Kınalık", "After Party", "Aksesuar", "Ayakkabı"];

const CAT_CODE: Record<string, string> = {
  "Gelinlik": "GL", "Kınalık": "KN", "After Party": "AP", "Aksesuar": "AK", "Ayakkabı": "AY",
};

const STATUS_LABELS: Record<string, string> = {
  stokta: "Stokta", rezerve: "Rezerve", planlandi: "Planlandı", kirada: "Kirada",
  provada: "Provada", tadilatta: "Tadilatta", temizlemede: "Temizlemede", satildi: "Satıldı",
};

const EMPTY_FORM = {
  name: "", category: "Gelinlik", modelName: "", productCode: "",
  size: "", color: "", operationType: "kiralama_satis",
  purchasePrice: "", salePrice: "", rentalPrice: "", notes: "",
};

const inputCls = "w-full rounded-full border border-[#eadfce] bg-white/80 px-4 py-3 text-sm font-semibold text-[#211b16] outline-none focus:border-[#b69463]";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  function selectImage(file: File | null) {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data || []) as Product[]);
  }

  async function createProduct() {
    setMessage(null);
    if (!form.name || !image) { setMessage({ text: "Ürün adı ve fotoğraf zorunludur.", ok: false }); return; }
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const catCode = CAT_CODE[form.category] || "GL";

    const { data: barcodeData, error: barcodeError } = await supabase.rpc("generate_mauna_barcode", { p_category_code: catCode });
    if (barcodeError || !barcodeData) { setMessage({ text: "Barkod oluşturulamadı.", ok: false }); setLoading(false); return; }

    const newBarcode = barcodeData as string;
    const fileExt = image.name.split(".").pop();
    const filePath = `${newBarcode}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, image, { upsert: true });
    if (uploadError) { setMessage({ text: "Fotoğraf yüklenemedi.", ok: false }); setLoading(false); return; }

    const { data: imgData } = supabase.storage.from("product-images").getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("products").insert({
      barcode: newBarcode, product_code: form.productCode, name: form.name,
      category: form.category, operation_type: form.operationType,
      size: form.size, color: form.color, model_name: form.modelName,
      purchase_price: Number(form.purchasePrice || 0),
      sale_price: Number(form.salePrice || 0),
      rental_price: Number(form.rentalPrice || 0),
      status: "stokta", image_url: imgData.publicUrl,
      notes: form.notes, created_by: userData.user?.id,
    });

    if (insertError) { setMessage({ text: "Ürün kaydedilemedi.", ok: false }); setLoading(false); return; }

    setBarcode(newBarcode);
    setMessage({ text: "Ürün başarıyla eklendi.", ok: true });
    setLoading(false);
    loadProducts();
  }

  const filteredProducts = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = [p.name, p.barcode, p.model_name, p.color, p.size].filter(Boolean).join(" ").toLowerCase().includes(q);
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  }), [products, search, filterCategory, filterStatus]);

  useEffect(() => { loadProducts(); }, []);

  return (
    <AppShell title="Ürün Yönetimi">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Form */}
        <div className="premium-card p-6 lg:p-8">
          <h2 className="text-2xl font-black text-[#1f1b16]">Yeni Ürün Ekle</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className={inputCls + " md:col-span-2"} placeholder="Ürün adı *" value={form.name} onChange={e => set("name", e.target.value)} />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-[#6d6256]">Kategori</label>
              <select className={inputCls} value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-[#6d6256]">İşlem Türü</label>
              <select className={inputCls} value={form.operationType} onChange={e => set("operationType", e.target.value)}>
                <option value="kiralama_satis">Kiralama + Satış</option>
                <option value="kiralama">Sadece Kiralama</option>
                <option value="satis">Sadece Satış</option>
              </select>
            </div>

            <input className={inputCls} placeholder="Model adı" value={form.modelName} onChange={e => set("modelName", e.target.value)} />
            <input className={inputCls} placeholder="Ürün kodu" value={form.productCode} onChange={e => set("productCode", e.target.value)} />
            <input className={inputCls} placeholder="Beden" value={form.size} onChange={e => set("size", e.target.value)} />
            <input className={inputCls} placeholder="Renk" value={form.color} onChange={e => set("color", e.target.value)} />
            <input className={inputCls} type="number" min="0" placeholder="Alış fiyatı ₺" value={form.purchasePrice} onChange={e => set("purchasePrice", e.target.value)} />
            <input className={inputCls} type="number" min="0" placeholder="Satış fiyatı ₺" value={form.salePrice} onChange={e => set("salePrice", e.target.value)} />
            <input className={inputCls + " md:col-span-2"} type="number" min="0" placeholder="Kiralama fiyatı ₺" value={form.rentalPrice} onChange={e => set("rentalPrice", e.target.value)} />
            <textarea className={inputCls + " md:col-span-2 min-h-20 resize-none"} placeholder="Notlar" value={form.notes} onChange={e => set("notes", e.target.value)} />

            <label className="md:col-span-2 cursor-pointer rounded-3xl border border-dashed border-[#d9c9b5] bg-white/50 p-5">
              <input type="file" accept="image/*" className="hidden" onChange={e => selectImage(e.target.files?.[0] || null)} />
              {preview
                ? <img src={preview} className="h-56 w-full rounded-2xl object-cover" />
                : <div className="flex flex-col items-center gap-2 py-6 text-center text-[#9d8b74]">
                    <Package size={28} className="text-[#d9c9b5]" />
                    <span className="text-sm font-bold">Ürün fotoğrafı yükle *</span>
                  </div>
              }
            </label>
          </div>

          {message && (
            <div className={`mt-4 rounded-2xl border p-4 text-sm font-bold ${message.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"}`}>
              {message.text}
            </div>
          )}

          <button onClick={createProduct} disabled={loading}
            className="mt-5 w-full rounded-full bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-4 font-black text-white shadow-[0_18px_42px_rgba(182,148,99,.24)] disabled:opacity-60">
            {loading ? "Ekleniyor..." : "Ürün Ekle — Barkod & QR Oluştur"}
          </button>
        </div>

        {/* Etiket */}
        <div className="premium-card p-6 lg:p-8">
          <h2 className="text-2xl font-black text-[#1f1b16]">Baskıya Hazır Etiket</h2>
          {barcode ? (
            <div className="mt-6">
              <div className="rounded-3xl border border-[#eadfce] bg-white p-6">
                {preview && <img src={preview} className="mb-5 h-52 w-full rounded-2xl object-cover" />}
                <div className="text-center">
                  <p className="text-xs tracking-[0.3em] text-[#b69463]">MAUNA COUTURE</p>
                  <h3 className="mt-2 text-xl font-black text-[#1f1b16]">{form.name}</h3>
                  <p className="mt-1 text-sm text-[#8b8177]">{form.category} · {form.modelName || "-"} · {form.size || "-"} · {form.color || "-"}</p>
                  <div className="mt-5 flex items-center justify-center gap-6">
                    <Barcode value={barcode} height={60} fontSize={12} />
                    <QRCodeSVG value={barcode} size={96} />
                  </div>
                  <p className="mt-3 font-black text-[#1f1b16]">{barcode}</p>
                </div>
              </div>
              <button onClick={() => window.print()} className="mt-5 w-full rounded-2xl bg-[#1f1b16] py-4 font-black text-white">
                Etiketi Yazdır
              </button>
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#d9c9b5] py-16 text-center text-[#9d8b74]">
              <Package size={32} className="text-[#d9c9b5]" />
              <p className="text-sm font-bold">Ürün eklenince barkod ve QR oluşacak</p>
            </div>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="premium-card mt-8 p-6 lg:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#1f1b16]">Ürün Listesi</h2>
            <p className="mt-1 text-sm text-[#8b8177]">{filteredProducts.length} / {products.length} ürün</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input className={inputCls} placeholder="Ara: isim, barkod, model..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className={inputCls} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">Tüm kategoriler</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className={inputCls} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Tüm durumlar</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Kategori sekmeleri */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterCategory("all")}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black ${filterCategory === "all" ? "bg-[#211b16] text-white" : "bg-[#f7f0e7] text-[#7d6c58]"}`}>
            Tümü
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCategory(c)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black ${filterCategory === c ? "bg-[#b69463] text-white" : "bg-[#f7f0e7] text-[#7d6c58]"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-3 rounded-3xl border border-dashed border-[#d9c9b5] py-12 text-center text-[#9d8b74]">Ürün bulunamadı.</div>
          ) : filteredProducts.map(p => (
            <div key={p.id} className="overflow-hidden rounded-[1.7rem] border border-[#eadfce] bg-white/70 shadow-lg">
              {p.image_url
                ? <img src={p.image_url} className="h-56 w-full object-cover" />
                : <div className="flex h-56 items-center justify-center bg-[#f5efe7] text-[#9d8b74]"><Package size={40} /></div>
              }
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded-lg bg-[#b69463]/10 px-2 py-0.5 text-[10px] font-black text-[#b69463]">{p.category}</span>
                    <h3 className="mt-1 text-lg font-black text-[#211b16]">{p.name}</h3>
                    <p className="text-sm text-[#8b8177]">{p.model_name || "-"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                    p.status === "stokta" ? "bg-green-100 text-green-700" :
                    p.status === "satildi" ? "bg-red-100 text-red-600" :
                    "bg-amber-100 text-amber-700"
                  }`}>{STATUS_LABELS[p.status] || p.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-white p-2.5"><p className="text-xs text-[#9d8b74]">Beden</p><p className="font-black">{p.size || "-"}</p></div>
                  <div className="rounded-xl bg-white p-2.5"><p className="text-xs text-[#9d8b74]">Renk</p><p className="font-black">{p.color || "-"}</p></div>
                  <div className="rounded-xl bg-white p-2.5"><p className="text-xs text-[#9d8b74]">Satış</p><p className="font-black">{(p.sale_price || 0).toLocaleString("tr-TR")} ₺</p></div>
                  <div className="rounded-xl bg-white p-2.5"><p className="text-xs text-[#9d8b74]">Kiralama</p><p className="font-black">{(p.rental_price || 0).toLocaleString("tr-TR")} ₺</p></div>
                </div>
                <a href={`/products/${p.id}`} className="mt-4 block rounded-full bg-[#211b16] py-3 text-center text-sm font-black text-white">Ürün Detayı</a>
                <div className="mt-4 rounded-xl bg-white p-3 text-center">
                  <Barcode value={p.barcode} height={40} fontSize={10} />
                  <p className="mt-1 text-xs font-black">{p.barcode}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
