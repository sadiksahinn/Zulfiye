"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [firmName, setFirmName] = useState("MAUNA Couture");
  const [branchName, setBranchName] = useState("Merkez");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [smsUser, setSmsUser] = useState("");
  const [smsPass, setSmsPass] = useState("");
  const [smsHeader, setSmsHeader] = useState("");
  const [smsProva, setSmsProva] = useState(true);
  const [smsIade, setSmsIade] = useState(true);
  const [smsOdeme, setSmsOdeme] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("settings")
          .select("*")
          .eq("key", "general")
          .maybeSingle();
        if (data?.value) {
          const v = data.value;
          setFirmName(v.firmName ?? "MAUNA Couture");
          setBranchName(v.branchName ?? "Merkez");
          setPhone(v.phone ?? "");
          setAddress(v.address ?? "");
          setSmsUser(v.smsUser ?? "");
          setSmsPass(v.smsPass ?? "");
          setSmsHeader(v.smsHeader ?? "");
          setSmsProva(v.smsProva ?? true);
          setSmsIade(v.smsIade ?? true);
          setSmsOdeme(v.smsOdeme ?? true);
        }
      } catch (e) {
        console.error("Ayarlar yuklenemedi:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const value = {
      firmName, branchName, phone, address,
      smsUser, smsPass, smsHeader,
      smsProva, smsIade, smsOdeme,
    };
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "general", value }, { onConflict: "key" });
      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error("Kayit hatasi:", e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Ayarlar">
        <div className="flex h-40 items-center justify-center text-sm font-bold text-[#8a7f72]">
          Ayarlar yukleniyor...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Ayarlar">
      <div className="space-y-6 pb-24 lg:pb-0">

        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-black text-[#1f1b16]">Firma / Sube Bilgileri</h2>
          <p className="mt-1 text-sm text-[#8a7f72]">Sistem genelinde gorunen isim ve iletisim bilgileri</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Firma Adi">
              <input className="input" value={firmName} onChange={(e) => setFirmName(e.target.value)} placeholder="MAUNA Couture" />
            </Field>
            <Field label="Sube Adi">
              <input className="input" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="Merkez" />
            </Field>
            <Field label="Telefon">
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx xxx xx xx" />
            </Field>
            <Field label="Adres">
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adres" />
            </Field>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-black text-[#1f1b16]">SMS / NetGSM Ayarlari</h2>
          <p className="mt-1 text-sm text-[#8a7f72]">NetGSM API bilgilerini girin, hatirlatma SMSleri otomatik gonderilir</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="NetGSM Kullanici Adi">
              <input className="input" value={smsUser} onChange={(e) => setSmsUser(e.target.value)} placeholder="8500xxxxxxx" />
            </Field>
            <Field label="NetGSM Sifre">
              <input className="input" type="password" value={smsPass} onChange={(e) => setSmsPass(e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="SMS Basligi (Originator)">
              <input className="input" value={smsHeader} onChange={(e) => setSmsHeader(e.target.value)} placeholder="MAUNACOUTURE" />
            </Field>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-[#8a7f72]">Otomatik SMS Gonder</p>
            <Toggle label="Prova hatirlatmasi (1 gun once)" checked={smsProva} onChange={setSmsProva} />
            <Toggle label="Iade hatirlatmasi (ayni gun sabah)" checked={smsIade} onChange={setSmsIade} />
            <Toggle label="Bekleyen odeme hatirlatmasi" checked={smsOdeme} onChange={setSmsOdeme} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-[#211b16] px-8 py-4 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-sm font-black text-green-600">
              <CheckCircle2 size={17} />
              Kaydedildi
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-[#8a7f72]">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#eadfce] bg-[#faf7f3] px-5 py-4">
      <span className="text-sm font-bold text-[#211b16]">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[#b69463]" : "bg-[#d9c9b5]"}`}
      >
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </div>
    </label>
  );
}
