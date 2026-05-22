"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";

const templates = [
  {
    title: "Kiralama Bilgilendirme",
    type: "kiralama",
    message:
      "Merhaba {musteri}, MAUNA Couture’dan kiraladığınız {urun} modeli {teslim_tarihi} saat {teslim_saati}’te teslim edilecektir. En geç {iade_tarihi} saat {iade_saati}’e kadar iade edilmesi gerekmektedir. Bilginize.",
  },
  {
    title: "Prova Hatırlatma",
    type: "prova",
    message:
      "Merhaba {musteri}, MAUNA Couture prova randevunuz {prova_tarihi} saat {prova_saati} olarak planlanmıştır. Sizi bekliyoruz.",
  },
  {
    title: "İade Hatırlatma",
    type: "iade",
    message:
      "Merhaba {musteri}, MAUNA Couture’dan kiraladığınız {urun} ürününün iade tarihi {iade_tarihi} saat {iade_saati}’tir. Gecikme yaşanmaması için bilginize sunarız.",
  },
  {
    title: "Kalan Ödeme Hatırlatma",
    type: "odeme",
    message:
      "Merhaba {musteri}, MAUNA Couture işleminiz için kalan ödeme tutarınız {kalan_tutar} TL’dir. Teslim öncesi ödemenizi tamamlamanızı rica ederiz.",
  },
  {
    title: "Ürün Teslim Hazır",
    type: "teslim",
    message:
      "Merhaba {musteri}, {urun} ürününüz MAUNA Couture’da teslim için hazırdır. Teslim tarihiniz {teslim_tarihi} saat {teslim_saati}’tir.",
  },
];

export default function SmsPage() {
  const [selected, setSelected] = useState(templates[0]);
  const [customerName, setCustomerName] = useState("Ayşe Hanım");
  const [productName, setProductName] = useState("AHU Beyaz 38 Gelinlik");
  const [deliveryDate, setDeliveryDate] = useState("12.06.2026");
  const [deliveryTime, setDeliveryTime] = useState("14:00");
  const [returnDate, setReturnDate] = useState("16.06.2026");
  const [returnTime, setReturnTime] = useState("12:00");
  const [remainingAmount, setRemainingAmount] = useState("15.000");

  function renderMessage(message: string) {
    return message
      .replaceAll("{musteri}", customerName)
      .replaceAll("{urun}", productName)
      .replaceAll("{teslim_tarihi}", deliveryDate)
      .replaceAll("{teslim_saati}", deliveryTime)
      .replaceAll("{iade_tarihi}", returnDate)
      .replaceAll("{iade_saati}", returnTime)
      .replaceAll("{prova_tarihi}", deliveryDate)
      .replaceAll("{prova_saati}", deliveryTime)
      .replaceAll("{kalan_tutar}", remainingAmount);
  }

  const preview = renderMessage(selected.message);

  return (
    <AppShell title="SMS Şablon Merkezi">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="premium-card p-8">
          <h2 className="premium-title text-2xl">Hazır Şablonlar</h2>
          <p className="premium-muted mt-2">
            Kiralama, prova, iade ve ödeme bilgilendirmeleri.
          </p>

          <div className="mt-6 space-y-3">
            {templates.map((template) => (
              <button
                key={template.type}
                onClick={() => setSelected(template)}
                className={`w-full rounded-3xl border p-5 text-left transition ${
                  selected.type === template.type
                    ? "border-[#b69463] bg-[#b69463]/10"
                    : "border-[#eadfce] bg-white/60 hover:bg-white"
                }`}
              >
                <h3 className="font-semibold text-[#211b16]">
                  {template.title}
                </h3>
                <p className="mt-1 text-sm premium-muted">{template.type}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="premium-card p-8">
          <h2 className="premium-title text-2xl">Değişken Test Alanı</h2>
          <p className="premium-muted mt-2">
            Sistem bu alanları kiralama/satış/prova kayıtlarından otomatik dolduracak.
          </p>

          <div className="mt-6 grid gap-4">
            <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Müşteri adı" />
            <input className="input" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ürün adı" />
            <input className="input" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} placeholder="Teslim tarihi" />
            <input className="input" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="Teslim saati" />
            <input className="input" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} placeholder="İade tarihi" />
            <input className="input" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} placeholder="İade saati" />

            <div className="money-input-wrapper">
              <input
                className="input money-input"
                type="number"
                inputMode="decimal"
                min="0"
                value={remainingAmount.replaceAll(".", "")}
                onChange={(e) => setRemainingAmount(e.target.value)}
                placeholder="Kalan ödeme"
              />
              <span className="money-badge">₺</span>
            </div>
          </div>
        </div>

        <div className="premium-card p-8">
          <h2 className="premium-title text-2xl">SMS Önizleme</h2>
          <p className="premium-muted mt-2">
            NetGSM bağlandığında bu mesaj tek tıkla gönderilecek.
          </p>

          <div className="mt-6 rounded-[2rem] border border-[#eadfce] bg-white/80 p-6">
            <p className="text-sm leading-7 text-[#211b16]">
              {preview}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(preview)}
              className="premium-button py-4"
            >
              Mesajı Kopyala
            </button>

            <button className="rounded-2xl border border-[#eadfce] bg-white/70 py-4 font-semibold text-[#6d6256]">
              NetGSM Entegrasyonu Bekliyor
            </button>
          </div>

          <div className="mt-6 rounded-3xl bg-[#f7f0e7] p-5 text-sm text-[#6d6256]">
            Otomasyon planı: prova 1 gün önce, teslim sabahı, iade sabahı ve kalan ödeme için otomatik SMS.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
