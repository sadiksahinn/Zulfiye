import AppShell from "@/components/AppShell";

export default function ReportsPage() {
  return (
    <AppShell title="Raporlar">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Günlük Rapor", "Haftalık Rapor", "Aylık Rapor", "Personel Raporu", "Ürün Raporu", "Kiralama Raporu"].map((title) => (
          <div key={title} className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
            <h2 className="text-2xl font-semibold text-[#1f1b16]">{title}</h2>
            <p className="mt-4 text-[#8b8177]">Rapor detayları burada gösterilecek.</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
