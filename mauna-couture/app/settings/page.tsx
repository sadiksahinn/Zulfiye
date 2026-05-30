import AppShell from "@/components/AppShell";

export default function SettingsPage() {
  return (
    <AppShell title="Ayarlar">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Firma / Şube Ayarları</h2>
          <div className="mt-6 grid gap-4">
            <input className="input" defaultValue="MAUNA Couture" placeholder="Firma adı" />
            <input className="input" defaultValue="Merkez" placeholder="Şube adı" />
            <input className="input" placeholder="Telefon" />
            <input className="input" placeholder="Adres" />
            <button className="rounded-2xl bg-[#b69463] py-4 text-white font-semibold">Kaydet</button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Yetki Ayarları</h2>
          <div className="mt-6 space-y-4">
            {["Admin her şeyi görür", "Personel sadece kendi işlemlerini görür", "Kasa personelden gizlenir", "Her işlem kullanıcı adına loglanır"].map((x) => (
              <div key={x} className="rounded-2xl border border-[#eadfce] p-5 text-[#6d6256]">
                {x}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Barkod / QR Ayarları</h2>
          <div className="mt-6 space-y-4 text-[#6d6256]">
            <div className="rounded-2xl border border-[#eadfce] p-5">Barkod Tipi: CODE128</div>
            <div className="rounded-2xl border border-[#eadfce] p-5">QR Kod: Aktif</div>
            <div className="rounded-2xl border border-[#eadfce] p-5">Etiket: Ürün adı + barkod + QR + fotoğraf</div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">SMS / Hatırlatma Ayarları</h2>
          <div className="mt-6 space-y-4 text-[#6d6256]">
            <div className="rounded-2xl border border-[#eadfce] p-5">NetGSM entegrasyonu: Sonraki aşama</div>
            <div className="rounded-2xl border border-[#eadfce] p-5">Prova hatırlatma: 1 gün önce</div>
            <div className="rounded-2xl border border-[#eadfce] p-5">İade hatırlatma: Aynı gün sabah</div>
            <div className="rounded-2xl border border-[#eadfce] p-5">Kalan ödeme hatırlatma: Teslimden önce</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
