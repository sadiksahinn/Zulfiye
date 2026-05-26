"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, CalendarDays, Copy, Hash, PackageCheck, Palette, Ruler, Save, ShieldCheck, Sparkles, Tag } from "lucide-react";

type Product = {
  id: string;
  barcode?: string | null;
  name?: string | null;
  product_code?: string | null;
  model_name?: string | null;
  category?: string | null;
  operation_type?: string | null;
  size?: string | null;
  color?: string | null;
  purchase_price?: number | null;
  sale_price?: number | null;
  rental_price?: number | null;
  status?: string | null;
  image_url?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [fittings, setFittings] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    model_name: "",
    category: "",
    size: "",
    color: "",
    sale_price: "",
    rental_price: "",
    status: "",
    notes: "",
  });

  async function loadProduct() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setProduct(null);
      setLoading(false);
      return;
    }

    const productData = (data || null) as Product | null;
    setProduct(productData);

    if (productData) {
      setEditForm({
        name: productData.name || "",
        model_name: productData.model_name || "",
        category: productData.category || "",
        size: productData.size || "",
        color: productData.color || "",
        sale_price: String(productData.sale_price || ""),
        rental_price: String(productData.rental_price || ""),
        status: productData.status || "stokta",
        notes: productData.notes || "",
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (params.id) loadProduct();
  }, [params.id]);

  async function copyCode() {
    if (!product?.barcode) return;
    await navigator.clipboard.writeText(product.barcode);
    setMessage("Barkod kopyalandı.");
    setTimeout(() => setMessage(""), 1500);
  }

  function updateEditField(key: string, value: string) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  async function updateProduct() {
    if (!product) return;

    setMessage("");

    const { error } = await supabase
      .from("products")
      .update({
        name: editForm.name,
        model_name: editForm.model_name,
        category: editForm.category,
        size: editForm.size,
        color: editForm.color,
        sale_price: Number(editForm.sale_price || 0),
        rental_price: Number(editForm.rental_price || 0),
        status: editForm.status,
        notes: editForm.notes,
      })
      .eq("id", product.id);

    if (error) {
      setMessage(error.message || "Ürün güncellenemedi.");
      return;
    }

    setMessage("Ürün bilgileri güncellendi.");
    setEditing(false);
    await loadProduct();
  }

  if (loading) {
    return (
      <AppShell title="Ürün Detayı">
        <div className="premium-card p-8 text-sm font-black text-[#6d6256]">Yükleniyor...</div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell title="Ürün Detayı">
        <div className="premium-card p-8">
          <h1 className="text-2xl font-black text-[#211b16]">Ürün bulunamadı.</h1>
          {message ? <p className="premium-muted mt-3 text-sm">{message}</p> : null}
          <a href="/products" className="mt-6 inline-flex rounded-2xl bg-[#211b16] px-6 py-3 text-sm font-black text-white">
            Ürün Listesine Dön
          </a>
        </div>
      </AppShell>
    );
  }

  const title = product.name || product.model_name || "Ürün Detayı";
  const code = product.barcode || product.product_code || product.id;

  return (
    <AppShell title="Ürün Detayı">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white shadow-[0_24px_70px_rgba(33,27,22,.16)] lg:p-8">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">MAUNA Ürün Kartı</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] lg:text-5xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Ürün bilgileri, barkod/QR, fiyatlar ve durum bilgisi.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-[#211b16]">
                <Save size={18} /> {editing ? "Düzenlemeyi Kapat" : "Ürünü Düzenle"}
              </button>

              <a href="/products" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-4 text-sm font-black text-white">
                <ArrowLeft size={18} /> Listeye Dön
              </a>
            </div>
          </div>
        </div>

        {message ? <div className="premium-card p-4 text-sm font-black text-[#6d6256]">{message}</div> : null}

        {editing ? (
          <div className="premium-card p-5 lg:p-7">
            <h2 className="premium-title text-2xl">Ürün Bilgilerini Düzenle</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input className="input md:col-span-2" placeholder="Ürün adı" value={editForm.name} onChange={(e) => updateEditField("name", e.target.value)} />
              <input className="input" placeholder="Model adı" value={editForm.model_name} onChange={(e) => updateEditField("model_name", e.target.value)} />
              <input className="input" placeholder="Kategori" value={editForm.category} onChange={(e) => updateEditField("category", e.target.value)} />
              <input className="input" placeholder="Beden" value={editForm.size} onChange={(e) => updateEditField("size", e.target.value)} />
              <input className="input" placeholder="Renk" value={editForm.color} onChange={(e) => updateEditField("color", e.target.value)} />
              <input className="input" type="number" inputMode="decimal" min="0" placeholder="Satış fiyatı" value={editForm.sale_price} onChange={(e) => updateEditField("sale_price", e.target.value)} />
              <input className="input" type="number" inputMode="decimal" min="0" placeholder="Kiralama fiyatı" value={editForm.rental_price} onChange={(e) => updateEditField("rental_price", e.target.value)} />
              <select className="input md:col-span-2" value={editForm.status} onChange={(e) => updateEditField("status", e.target.value)}>
                <option value="stokta">Stokta</option>
                <option value="kirada">Kirada</option>
                <option value="provada">Provada</option>
                <option value="tadilatta">Tadilatta</option>
                <option value="temizlemede">Temizlemede</option>
                <option value="satildi">Satıldı</option>
              </select>
              <textarea className="input md:col-span-2 min-h-28" placeholder="Notlar" value={editForm.notes} onChange={(e) => updateEditField("notes", e.target.value)} />
            </div>

            <button onClick={updateProduct} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#211b16] px-5 py-4 text-sm font-black text-white">
              <Save size={18} /> Değişiklikleri Kaydet
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_.75fr]">
          <section className="premium-card p-5 lg:p-7">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[.95fr_1fr]">
              <div className="overflow-hidden rounded-[1.6rem] border border-[#eadfce] bg-[#f7f0e7]">
                {product.image_url ? (
                  <img src={product.image_url} alt={title} className="h-[380px] w-full object-cover lg:h-[560px]" />
                ) : (
                  <div className="flex h-[380px] items-center justify-center text-[#8b8177] lg:h-[560px]">Ürün görseli yok</div>
                )}
              </div>

              <div>
                <h2 className="text-3xl font-black tracking-[-0.05em] text-[#211b16]">{title}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-xl bg-[#f7f0e7] px-3 py-2 text-xs font-black text-[#211b16]">{code}</span>
                  <span className="rounded-xl bg-green-100 px-3 py-2 text-xs font-black text-green-700">{statusText(product.status)}</span>
                </div>

                <div className="mt-6 divide-y divide-[#eadfce]">
                  <DetailRow icon={<Tag size={16} />} title="Kategori" value={product.category || "-"} />
                  <DetailRow icon={<Sparkles size={16} />} title="Model" value={product.model_name || "-"} />
                  <DetailRow icon={<Ruler size={16} />} title="Beden" value={product.size || "-"} />
                  <DetailRow icon={<Palette size={16} />} title="Renk" value={product.color || "-"} />
                  <DetailRow icon={<PackageCheck size={16} />} title="Kiralama Fiyatı" value={formatMoney(product.rental_price)} />
                  <DetailRow icon={<MoneyIcon />} title="Satış Fiyatı" value={formatMoney(product.sale_price)} />
                  <DetailRow icon={<ShieldCheck size={16} />} title="Durum" value={statusText(product.status)} />
                  <DetailRow icon={<CalendarDays size={16} />} title="Eklenme" value={formatDate(product.created_at)} />
                  <DetailRow icon={<Hash size={16} />} title="Ürün ID" value={product.id} />
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="premium-card p-5 lg:p-6">
              <h2 className="premium-title text-xl">QR / Barkod</h2>
              <p className="premium-muted mt-2 text-sm">Ürün etiketi ve hızlı erişim kodu.</p>

              <div className="mt-6 flex justify-center rounded-[1.4rem] bg-white p-5">
                <QRCodeSVG value={code} size={170} />
              </div>

              <div className="mt-5 flex overflow-hidden rounded-2xl border border-[#eadfce] bg-[#f7f0e7]">
                <div className="flex-1 px-4 py-3 text-sm font-black text-[#211b16]">{code}</div>
                <button onClick={copyCode} className="border-l border-[#eadfce] px-4 text-[#b69463]">
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div className="premium-card p-5 lg:p-6">
              <h2 className="premium-title text-xl">Notlar</h2>
              <p className="mt-4 text-sm font-semibold leading-6 text-[#6d6256]">
                {product.notes || "Bu ürün için not girilmemiş."}
              </p>
            </div>

            <div className="premium-card p-5 lg:p-6">
              <h2 className="premium-title text-xl">Hızlı İşlem</h2>
              <div className="mt-5 grid gap-3">
                <a href={`/rentals?product=${product.id}`} className="rounded-2xl bg-[#211b16] px-4 py-4 text-center text-sm font-black text-white">
                  Kiralama Oluştur
                </a>
                <a href={`/sales?product=${product.id}`} className="rounded-2xl border border-[#eadfce] bg-white px-4 py-4 text-center text-sm font-black text-[#211b16]">
                  Satış Oluştur
                </a>
              </div>
            </div>
          </aside>
        </div>

        <section className="premium-card p-5 lg:p-6">
          <h2 className="premium-title text-xl">Prova Geçmişi</h2>
          <p className="premium-muted mt-2 text-sm">Bu ürüne ait son prova kayıtları.</p>

          <div className="mt-5 space-y-3">
            {fittings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-8 text-center text-sm font-bold text-[#8a7f72]">
                Bu ürün için prova kaydı yok.
              </div>
            ) : (
              fittings.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#eadfce] bg-white/70 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-black text-[#211b16]">{item.customer_name || "Müşteri"}</h3>
                      <p className="mt-1 text-xs font-bold text-[#8a7f72]">
                        {[item.fitting_date, item.fitting_time, item.status].filter(Boolean).join(" • ") || "Prova detayı yok"}
                      </p>
                    </div>
                    <span className="rounded-2xl bg-[#f7f0e7] px-4 py-2 text-xs font-black text-[#211b16]">
                      {fittingStatusText(item.status || "bekliyor")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function formatMoney(value?: number | null) {
  if (!value) return "-";
  return `${Number(value).toLocaleString("tr-TR")} TL`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

function statusText(value?: string | null) {
  if (!value) return "Durum yok";
  if (value === "stokta") return "Stokta";
  if (value === "kirada") return "Kirada";
  if (value === "satildi") return "Satıldı";
  return value;
}

function MoneyIcon() {
  return <span className="text-sm font-black">₺</span>;
}

function DetailRow({ icon, title, value }: { icon: React.ReactNode; title: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-3 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7f0e7] text-[#b69463]">{icon}</div>
      <div className="text-sm font-bold text-[#6d6256]">{title}</div>
      <div className="text-right text-sm font-black text-[#211b16]">{value || "-"}</div>
    </div>
  );
}


function fittingStatusText(status: string) {
  if (status === "bekliyor") return "Bekliyor";
  if (status === "geldi") return "Geldi";
  if (status === "tamamlandi") return "Tamamlandı";
  if (status === "teslime_hazir") return "Teslime Hazır";
  return status || "-";
}
