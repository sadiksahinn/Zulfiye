"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, UserRound, LockKeyhole, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    setMessage("");

    if (!fullName.trim() || !email.trim() || !password) {
      setMessage("Ad soyad, e-posta ve şifre zorunludur.");
      return;
    }

    if (password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);

    const confirmUrl = typeof window !== "undefined"
      ? `${window.location.origin}/auth/confirm`
      : undefined;

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: confirmUrl,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Kayıt oluşturuldu. E-posta doğrulaması açıksa gelen kutunuzu kontrol edin; değilse giriş yapabilirsiniz.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f0e7] px-5 py-8 text-[#211b16]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.96),transparent_38%),linear-gradient(135deg,#fbf7ef_0%,#f4eadc_100%)]" />

      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_40px_110px_rgba(118,93,60,.18)] backdrop-blur-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b69463]/15 text-[#b69463]">
            <UserPlus size={24} />
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-[-0.05em] text-[#211b16]">
            Kayıt Ol
          </h1>

          <p className="mt-3 text-sm font-semibold leading-6 text-[#6d6256]">
            Zülfiye Canbolat Gelinlik yönetim sistemi için yeni hesap oluşturun.
          </p>

          <div className="mt-7 grid gap-4">
            <Field icon={<UserRound size={18} />} placeholder="Ad Soyad" value={fullName} onChange={setFullName} />
            <Field icon={<Mail size={18} />} placeholder="E-posta" value={email} onChange={setEmail} type="email" />
            <Field icon={<LockKeyhole size={18} />} placeholder="Şifre" value={password} onChange={setPassword} type="password" />
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-[#eadfce] bg-[#f7f0e7] p-4 text-sm font-bold text-[#6d6256]">
              {message}
            </div>
          )}

          <button
            onClick={register}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[#211b16] py-4 font-black text-white disabled:opacity-60"
          >
            {loading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
          </button>

          <Link href="/" className="mt-5 block text-center text-sm font-bold text-[#b69463]">
            Giriş ekranına dön
          </Link>
        </div>
      </section>
    </main>
  );
}

function Field({ icon, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-[#eadfce] bg-white/75 px-4 py-4 shadow-inner">
      <span className="text-[#9d8b74]">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]"
      />
    </div>
  );
}
