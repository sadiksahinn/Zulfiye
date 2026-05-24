"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function register() {
    setMessage("");

    if (!fullName || !email || !password) {
      setMessage("Ad soyad, e-posta ve şifre zorunludur.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Kayıt oluşturuldu. Giriş yapabilirsiniz.");
  }

  return (
    <main className="min-h-screen bg-[#f6efe5] flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
        <h1 className="text-4xl font-black text-[#211b16]">Kayıt Ol</h1>
        <p className="mt-2 text-sm font-semibold text-[#7a6f63]">
          MAUNA paneli için yeni hesap oluştur.
        </p>

        <div className="mt-8 grid gap-4">
          <input className="input" placeholder="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {message && (
          <div className="mt-5 rounded-2xl bg-[#f7f0e7] p-4 text-sm font-bold text-[#6d6256]">
            {message}
          </div>
        )}

        <button onClick={register} className="mt-6 w-full rounded-2xl bg-[#211b16] py-4 font-black text-white">
          Hesap Oluştur
        </button>

        <Link href="/" className="mt-5 block text-center text-sm font-bold text-[#b69463]">
          Giriş ekranına dön
        </Link>
      </div>
    </main>
  );
}
