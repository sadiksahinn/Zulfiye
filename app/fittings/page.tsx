import AppShell from "@/components/AppShell";

export default function FittingsPage() {
  return (
    <AppShell title="Provalar">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Prova Oluştur</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="Müşteri" />
            <input className="input" placeholder="Ürün / Barkod" />
            <input className="input" type="date" />
            <input className="input" type="time" />
            <textarea className="input md:col-span-2 min-h-28" placeholder="Ölçü ve tadilat notu" />
          </div>
          <button className="mt-6 w-full rounded-2xl bg-[#b69463] py-4 text-white font-semibold">
            Prova Kaydet
          </button>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Bugünkü Provalar</h2>
          <div className="mt-6 rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-[#8b8177]">
            Bugünkü provalar burada listelenecek.
          </div>
        </div>
      </div>

      
    </AppShell>
  );
}
