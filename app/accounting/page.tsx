import AppShell from "@/components/AppShell";

export default function AccountingPage() {
  return (
    <AppShell title="Muhasebe">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {["Gelir Ekle", "Gider Ekle", "Kasa Özeti"].map((title) => (
          <div key={title} className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
            <h2 className="text-2xl font-semibold text-[#1f1b16]">{title}</h2>
            <div className="mt-6 grid gap-4">
              <input className="input" placeholder="Başlık" />
              <input className="input" type="number" inputMode="decimal" min="0" placeholder="Tutar ₺" />
              <input className="input" type="date" />
              <button className="rounded-2xl bg-[#b69463] py-4 text-white font-semibold">Kaydet</button>
            </div>
          </div>
        ))}
      </div>

      
    </AppShell>
  );
}
