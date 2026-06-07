"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfileCompletePage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    duty: "",
    pinCode: "",
    emergencyNote: "",
  });

  const [message, setMessage] = useState("");

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveProfile() {
    setMessage("");

    if (!form.fullName || !form.phone || !form.duty || !form.pinCode) {
      setMessage("Ad soyad, telefon, görev ve PIN zorunludur.");
      return;
    }

    const { data } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName,
        phone: form.phone,
        duty: form.duty,
        pin_code: form.pinCode,
        emergency_note: form.emergencyNote,
        profile_completed: true,
      })
      .eq("id", data.user?.id);

    if (error) {
      setMessage("Profil kaydedilemedi.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[#f5efe7] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-10 shadow-xl border border-[#eadfce]">
        <p className="uppercase tracking-[0.3em] text-[#b69463] text-sm">
          Zülfiye Canbolat Gelinlik ERP
        </p>

        <h1 className="mt-4 text-4xl font-semibold text-[#1f1b16]">
          Profil Bilgilerini Tamamla
        </h1>

        <p className="mt-3 text-[#8b8177]">
          İşlem sorumluluğu için personel bilgileri zorunludur.
        </p>

        <div className="mt-8 grid gap-4">
          <input className="input" placeholder="Ad Soyad *" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
          <input className="input" placeholder="Telefon *" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          <input className="input" placeholder="Görev *" value={form.duty} onChange={(e) => updateField("duty", e.target.value)} />
          <input className="input" placeholder="4 haneli PIN *" value={form.pinCode} onChange={(e) => updateField("pinCode", e.target.value)} />
          <textarea className="input min-h-28" placeholder="Acil durum / not" value={form.emergencyNote} onChange={(e) => updateField("emergencyNote", e.target.value)} />
        </div>

        {message && (
          <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {message}
          </div>
        )}

        <button onClick={saveProfile} className="mt-6 w-full rounded-full bg-[#b69463] py-4 text-white font-semibold">
          Profili Tamamla
        </button>
      </div>
    </main>
  );
}
