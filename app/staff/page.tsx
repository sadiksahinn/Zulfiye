import AppShell from "@/components/AppShell";

export default function StaffPage() {
  return (
    <AppShell title="Çalışanlar">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Yeni Personel</h2>
          <div className="mt-6 grid gap-4">
            <input className="input" placeholder="Ad Soyad" />
            <input className="input" placeholder="E-posta" />
            <input className="input" placeholder="Telefon" />
            <select className="input">
              <option>Personel</option>
              <option>Admin</option>
              <option>Muhasebe</option>
              <option>Prova Personeli</option>
              <option>Stok Personeli</option>
            </select>
            <button className="rounded-2xl bg-[#b69463] py-4 text-white font-semibold">Personel Ekle</button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Personel Listesi</h2>
          <div className="mt-6 rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-[#8b8177]">
            Personeller burada listelenecek.
          </div>
        </div>
      </div>

      
    </AppShell>
  );
}
